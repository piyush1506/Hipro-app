/**
 * Unified status synchronisation for the Hipro operations pipeline.
 *
 * The same piece of work can be described by three entities:
 *
 *   ServiceRequest  -> inspection request raised by a customer (BOQ source)
 *   Quotation       -> commercial BOQ raised against a request
 *   DirectBooking   -> instant / on-demand visit
 *
 * A quotation always belongs to exactly one request (hard FK), therefore the
 * request <-> quotation link is authoritative and is the only link that is
 * written back automatically. A direct booking has no FK to a request, so the
 * link is resolved explicitly when the booking carries a request reference and
 * otherwise heuristically (same customer + same sub-service + same city +
 * still-open request). Heuristic writes are limited to terminal states so the
 * inspection pipeline is never corrupted by a false positive.
 */

/** Quotation status -> ServiceRequest status */
const QUOTATION_TO_REQUEST_STATUS = {
  PENDING: 'QUOTED',
  SENT: 'QUOTED',
  QUOTED: 'QUOTED',
  ACCEPTED: 'ACCEPTED',
  // A rejected BOQ must not close the request. It goes back into the
  // "Needs BOQ" queue so the admin desk can re-quote it.
  REJECTED: 'SUBMITTED',
};

/** Direct booking status -> ServiceRequest status (terminal states only) */
const BOOKING_TO_REQUEST_STATUS = {
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

const TERMINAL_REQUEST_STATUSES = ['COMPLETED', 'CANCELLED'];

/** How far back a direct booking may look for an open inspection request */
const LINK_LOOKBACK_DAYS = 30;

function normalize(value) {
  return String(value || '').trim().toUpperCase();
}

/**
 * Maps a quotation status to the status its request should carry.
 * Returns null when the quotation status does not change the request.
 */
function resolveRequestStatusFromQuotation(quotationStatus) {
  return QUOTATION_TO_REQUEST_STATUS[normalize(quotationStatus)] || null;
}

/**
 * Maps a direct booking status to the status its request should carry.
 * Returns null when the booking status must not be propagated.
 */
function resolveRequestStatusFromBooking(bookingStatus) {
  return BOOKING_TO_REQUEST_STATUS[normalize(bookingStatus)] || null;
}

function isTerminalRequestStatus(status) {
  return TERMINAL_REQUEST_STATUSES.includes(normalize(status));
}

/**
 * Resolves the inspection request that a direct booking belongs to.
 *
 * 1. Explicit link - the booking payload carries the request id / number.
 * 2. Heuristic link - same customer phone, same sub-service, same city,
 *    request still open and raised within the last LINK_LOOKBACK_DAYS.
 *
 * @returns {Promise<object|null>} the linked ServiceRequest (without relations)
 */
async function findLinkedRequestForBooking(prisma, booking) {
  if (!booking) return null;

  // 1) Explicit reference carried by the booking (notes / custom answers).
  const explicitRef = [
    booking.notes,
    typeof booking.customFieldAnswers === 'string'
      ? booking.customFieldAnswers
      : JSON.stringify(booking.customFieldAnswers || ''),
  ].filter(Boolean).join(' ');

  const explicitMatch = explicitRef.match(/REQ-[A-Za-z0-9-]+/i);
  if (explicitMatch) {
    const byNumber = await prisma.serviceRequest.findFirst({
      where: { requestNumber: explicitMatch[0] },
    });
    if (byNumber) return byNumber;
  }

  // 2) Heuristic link.
  if (!booking.customerPhone || !booking.subServiceId) return null;

  const lookback = new Date(Date.now() - LINK_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);

  const candidates = await prisma.serviceRequest.findMany({
    where: {
      subServiceId: booking.subServiceId,
      status: { notIn: TERMINAL_REQUEST_STATUSES },
      created_at: { gte: lookback },
      user: { phoneNumber: booking.customerPhone },
    },
    orderBy: { created_at: 'desc' },
    take: 5,
  });

  if (candidates.length === 0) return null;

  const city = normalize(booking.city);
  if (city) {
    const cityMatch = candidates.find((req) =>
      normalize(req.location).includes(city) || normalize(req.addressline).includes(city)
    );
    if (cityMatch) return cityMatch;
  }

  return candidates[0];
}

/**
 * Propagates a quotation decision to its request.
 *
 * @returns {Promise<{request:object, previousStatus:string, targetStatus:string}|null>}
 */
async function syncRequestStatusFromQuotation(prisma, quotation, { actor = 'SYSTEM' } = {}) {
  const targetStatus = resolveRequestStatusFromQuotation(quotation?.status);
  if (!targetStatus || !quotation?.requestId) return null;

  const existing = await prisma.serviceRequest.findUnique({
    where: { id: quotation.requestId },
    select: { id: true, requestNumber: true, status: true },
  });

  if (!existing) return null;

  // Never reopen a request that already reached a terminal state.
  if (isTerminalRequestStatus(existing.status)) return null;

  const updated = await prisma.serviceRequest.update({
    where: { id: existing.id },
    data: { status: targetStatus },
    select: { id: true, requestNumber: true, status: true },
  });

  return {
    request: updated,
    previousStatus: existing.status,
    targetStatus,
    actor,
  };
}

/**
 * Propagates a direct booking status to the inspection request it belongs to.
 *
 * @returns {Promise<{request:object, previousStatus:string, targetStatus:string}|null>}
 */
async function syncRequestStatusFromBooking(prisma, booking, { actor = 'SYSTEM' } = {}) {
  const targetStatus = resolveRequestStatusFromBooking(booking?.status);
  if (!targetStatus) return null;

  const linked = await findLinkedRequestForBooking(prisma, booking);
  if (!linked) return null;

  if (isTerminalRequestStatus(linked.status)) return null;

  const updated = await prisma.serviceRequest.update({
    where: { id: linked.id },
    data: { status: targetStatus },
    select: { id: true, requestNumber: true, status: true },
  });

  return {
    request: updated,
    previousStatus: linked.status,
    targetStatus,
    actor,
  };
}

/**
 * Broadcasts a synchronised status change to the admin desk and the customer.
 */
function emitStatusSync(io, { quotation = null, request = null, booking = null, action = 'STATUS_SYNCED' } = {}) {
  if (!io) return;

  if (quotation) {
    const payload = {
      id: quotation.id,
      quoteNumber: quotation.quoteNumber,
      status: quotation.status,
      requestId: quotation.requestId,
      action,
    };
    io.to('admin_room').emit('quotation_updated', payload);
    if (quotation.request?.userId) {
      io.to(`user_${quotation.request.userId}`).emit('quotation_updated', payload);
    }
  }

  if (request) {
    io.to('admin_room').emit('request_updated', {
      id: request.id,
      requestNumber: request.requestNumber,
      status: request.status,
      action,
    });
  }

  if (booking) {
    io.to('admin_room').emit('direct_booking_updated', {
      action,
      booking,
    });

    if (request) {
      io.to('admin_room').emit('booking_status_synced', {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        requestId: request.id,
        requestNumber: request.requestNumber,
        status: request.status,
        bookingStatus: booking.status,
        action,
      });
    }
  }
}

module.exports = {
  QUOTATION_TO_REQUEST_STATUS,
  BOOKING_TO_REQUEST_STATUS,
  TERMINAL_REQUEST_STATUSES,
  resolveRequestStatusFromQuotation,
  resolveRequestStatusFromBooking,
  isTerminalRequestStatus,
  findLinkedRequestForBooking,
  syncRequestStatusFromQuotation,
  syncRequestStatusFromBooking,
  emitStatusSync,
};
