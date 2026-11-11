const prisma = require('../prisma');

function generateRFQNumber() {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RFQ-${dateStr}-${rand}`;
}

/**
 * Purchase Person sends RFQ to one or multiple Material Vendors
 * OR Civil Engineer sends RFQ to Labor Vendors
 */
async function sendRFQ(req, res) {
  try {
    const {
      type, // "MATERIAL" | "LABOR"
      requirementId,
      vendorIds = [],
      expiresAt
    } = req.body;

    if (!type || !requirementId || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Type (MATERIAL or LABOR), requirementId, and at least one vendorId are required'
      });
    }

    const staffId = req.user.staffId || req.user.id;
    const isMaterial = type.toUpperCase() === 'MATERIAL';

    let parentLeadId = null;

    if (isMaterial) {
      const matReq = await prisma.materialRequirement.findUnique({
        where: { id: requirementId },
        include: { requirementAnalysis: true }
      });
      if (!matReq) return res.status(404).json({ success: false, message: 'Material requirement not found' });
      parentLeadId = matReq.requirementAnalysis.leadId;

      await prisma.materialRequirement.update({
        where: { id: requirementId },
        data: { status: 'RFQ_SENT' }
      });
    } else {
      const labReq = await prisma.laborRequirement.findUnique({
        where: { id: requirementId },
        include: { requirementAnalysis: true }
      });
      if (!labReq) return res.status(404).json({ success: false, message: 'Labor requirement not found' });
      parentLeadId = labReq.requirementAnalysis.leadId;

      await prisma.laborRequirement.update({
        where: { id: requirementId },
        data: { status: 'RFQ_SENT' }
      });
    }

    // Create RFQs for each selected vendor
    const createdRFQs = [];
    for (const vendorId of vendorIds) {
      // Check if vendor exists
      const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
      if (!vendor) continue;

      const rfq = await prisma.rFQ.create({
        data: {
          rfqNumber: generateRFQNumber(),
          type: type.toUpperCase(),
          materialRequirementId: isMaterial ? requirementId : null,
          laborRequirementId: !isMaterial ? requirementId : null,
          sentById: staffId,
          vendorId,
          status: 'SENT',
          expiresAt: expiresAt ? new Date(expiresAt) : null
        },
        include: {
          vendor: { select: { id: true, name: true, businessName: true, phone: true } },
          materialRequirement: true,
          laborRequirement: true
        }
      });
      createdRFQs.push(rfq);

      // Socket dispatch to vendor personal room
      try {
        const io = req.app.get('io');
        if (io) {
          io.to(`vendor_${vendorId}`).emit('new_rfq', {
            id: rfq.id,
            rfqNumber: rfq.rfqNumber,
            type: rfq.type,
            sentAt: rfq.sentAt
          });
        }
      } catch (e) {}
    }

    // Update parent Lead status to PROCUREMENT_IN_PROGRESS if still in REQUIREMENTS_CREATED
    if (parentLeadId) {
      const lead = await prisma.lead.findUnique({ where: { id: parentLeadId } });
      if (lead && lead.status === 'REQUIREMENTS_CREATED') {
        await prisma.lead.update({
          where: { id: parentLeadId },
          data: {
            status: 'PROCUREMENT_IN_PROGRESS',
            statusHistory: {
              create: {
                fromStatus: lead.status,
                toStatus: 'PROCUREMENT_IN_PROGRESS',
                changedBy: req.user.name || 'Purchaser',
                notes: `RFQs dispatched to ${createdRFQs.length} vendor(s) for quotation`
              }
            }
          }
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: `RFQs successfully sent to ${createdRFQs.length} vendor(s)`,
      rfqs: createdRFQs
    });
  } catch (error) {
    console.error('Send RFQ error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send RFQs',
      error: error.message
    });
  }
}

/**
 * Vendor views their RFQ Inbox
 */
async function getVendorRFQs(req, res) {
  try {
    const vendorId = req.vendorId || req.user?.vendorId || req.user?.id || req.query.vendorId;
    const { status, type } = req.query;

    const where = { vendorId };
    if (status) where.status = status.toUpperCase();
    if (type) where.type = type.toUpperCase();

    const rfqs = await prisma.rFQ.findMany({
      where,
      include: {
        materialRequirement: {
          include: {
            requirementAnalysis: {
              include: {
                lead: {
                  select: {
                    leadNumber: true,
                    city: true,
                    preferredDate: true
                  }
                }
              }
            }
          }
        },
        laborRequirement: {
          include: {
            requirementAnalysis: {
              include: {
                lead: {
                  select: {
                    leadNumber: true,
                    city: true,
                    preferredDate: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { sentAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      count: rfqs.length,
      rfqs
    });
  } catch (error) {
    console.error('Get vendor RFQs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch RFQs',
      error: error.message
    });
  }
}

/**
 * Vendor submits quotation response to an RFQ
 */
async function respondToRFQ(req, res) {
  try {
    const { id } = req.params;
    const {
      quotedPrice,
      quotedTimeline,
      quotedNotes,
      qualityDetails,
      attachments = []
    } = req.body;

    if (quotedPrice === undefined || quotedPrice === null) {
      return res.status(400).json({ success: false, message: 'Quoted price is required' });
    }

    const rfq = await prisma.rFQ.findUnique({
      where: { id },
      include: { materialRequirement: true, laborRequirement: true }
    });

    if (!rfq) return res.status(404).json({ success: false, message: 'RFQ not found' });

    // Enforce vendor authorization
    const callerVendorId = req.vendorId || req.user?.vendorId || req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';
    if (!isAdmin && callerVendorId && rfq.vendorId !== callerVendorId) {
      return res.status(403).json({ success: false, message: 'Unauthorized: This RFQ belongs to another vendor' });
    }

    const updated = await prisma.rFQ.update({
      where: { id },
      data: {
        status: 'QUOTED',
        quotedPrice: parseFloat(quotedPrice),
        quotedTimeline: quotedTimeline || null,
        quotedNotes: quotedNotes || null,
        qualityDetails: qualityDetails || null,
        attachments: Array.isArray(attachments) ? attachments : [],
        quotedAt: new Date()
      },
      include: {
        vendor: { select: { id: true, name: true, businessName: true, rating: true, phone: true } }
      }
    });

    // Mark requirement status as QUOTATIONS_RECEIVED
    if (rfq.materialRequirementId) {
      await prisma.materialRequirement.update({
        where: { id: rfq.materialRequirementId },
        data: { status: 'QUOTATIONS_RECEIVED' }
      });
    } else if (rfq.laborRequirementId) {
      await prisma.laborRequirement.update({
        where: { id: rfq.laborRequirementId },
        data: { status: 'QUOTATIONS_RECEIVED' }
      });
    }

    // Broadcast quote received to Admin & Procurement desk
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('rfq_quoted', {
          rfqId: updated.id,
          rfqNumber: updated.rfqNumber,
          vendorName: updated.vendor?.businessName || updated.vendor?.name,
          quotedPrice: updated.quotedPrice,
          qualityDetails: updated.qualityDetails
        });
      }
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: 'Quotation submitted successfully',
      rfq: updated
    });
  } catch (error) {
    console.error('Respond to RFQ error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit quotation',
      error: error.message
    });
  }
}

/**
 * Compare all vendor quotations received for a specific requirement
 */
async function compareRFQsForRequirement(req, res) {
  try {
    const { requirementId } = req.params;
    const { type } = req.query; // "MATERIAL" | "LABOR"

    const isMaterial = (type || 'MATERIAL').toUpperCase() === 'MATERIAL';

    const where = isMaterial
      ? { materialRequirementId: requirementId }
      : { laborRequirementId: requirementId };

    const rfqs = await prisma.rFQ.findMany({
      where,
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            businessName: true,
            rating: true,
            ratingsCount: true,
            experience: true,
            city: true,
            phone: true,
            vendorType: true,
            materialCategories: true,
            laborCategories: true
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { quotedPrice: 'asc' }
      ]
    });

    return res.status(200).json({
      success: true,
      count: rfqs.length,
      rfqs
    });
  } catch (error) {
    console.error('Compare RFQs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compare quotations',
      error: error.message
    });
  }
}

/**
 * Assign winning vendor for a material or labor requirement
 */
async function assignVendorRFQ(req, res) {
  try {
    const { id } = req.params; // rfqId

    const winningRFQ = await prisma.rFQ.findUnique({
      where: { id },
      include: {
        vendor: true,
        materialRequirement: {
          include: { requirementAnalysis: { include: { lead: true } } }
        },
        laborRequirement: {
          include: { requirementAnalysis: { include: { lead: true } } }
        }
      }
    });

    if (!winningRFQ) return res.status(404).json({ success: false, message: 'RFQ not found' });

    const isMaterial = winningRFQ.type === 'MATERIAL';
    const requirementId = isMaterial ? winningRFQ.materialRequirementId : winningRFQ.laborRequirementId;
    const parentLead = isMaterial
      ? winningRFQ.materialRequirement?.requirementAnalysis?.lead
      : winningRFQ.laborRequirement?.requirementAnalysis?.lead;

    // 1. Mark this RFQ as ACCEPTED
    await prisma.rFQ.update({
      where: { id },
      data: { status: 'ACCEPTED' }
    });

    // 2. Mark other RFQs for this requirement as REJECTED
    const rejectFilter = isMaterial
      ? { materialRequirementId: requirementId, id: { not: id } }
      : { laborRequirementId: requirementId, id: { not: id } };

    await prisma.rFQ.updateMany({
      where: rejectFilter,
      data: { status: 'REJECTED' }
    });

    // 3. Assign vendor on the requirement record
    if (isMaterial) {
      await prisma.materialRequirement.update({
        where: { id: requirementId },
        data: {
          assignedVendorId: winningRFQ.vendorId,
          assignedPrice: winningRFQ.quotedPrice,
          assignedAt: new Date(),
          status: 'VENDOR_ASSIGNED'
        }
      });
    } else {
      await prisma.laborRequirement.update({
        where: { id: requirementId },
        data: {
          assignedVendorId: winningRFQ.vendorId,
          assignedPrice: winningRFQ.quotedPrice,
          assignedAt: new Date(),
          status: 'VENDOR_ASSIGNED'
        }
      });
    }

    // 4. Check if all requirements for the lead are now assigned
    if (parentLead) {
      const analysis = await prisma.requirementAnalysis.findUnique({
        where: { leadId: parentLead.id },
        include: {
          materialRequirements: true,
          laborRequirements: true
        }
      });

      const unassignedMats = (analysis?.materialRequirements || []).filter(m => m.status !== 'VENDOR_ASSIGNED' && m.status !== 'CANCELLED');
      const unassignedLabs = (analysis?.laborRequirements || []).filter(l => l.status !== 'VENDOR_ASSIGNED' && l.status !== 'CANCELLED');

      if (unassignedMats.length === 0 && unassignedLabs.length === 0) {
        await prisma.lead.update({
          where: { id: parentLead.id },
          data: {
            status: 'VENDORS_ASSIGNED',
            statusHistory: {
              create: {
                fromStatus: parentLead.status,
                toStatus: 'VENDORS_ASSIGNED',
                changedBy: req.user.name || 'Coordinator',
                notes: 'All material suppliers and labor contractors assigned. Project ready to begin.'
              }
            }
          }
        });
      }
    }

    // Notify winning vendor
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(`vendor_${winningRFQ.vendorId}`).emit('rfq_accepted', {
          rfqId: winningRFQ.id,
          rfqNumber: winningRFQ.rfqNumber,
          assignedPrice: winningRFQ.quotedPrice
        });
        io.emit('requirement_vendor_assigned', {
          requirementId,
          vendorName: winningRFQ.vendor.businessName || winningRFQ.vendor.name
        });
      }
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: `Vendor '${winningRFQ.vendor.businessName || winningRFQ.vendor.name}' assigned at ₹${winningRFQ.quotedPrice?.toLocaleString('en-IN')}`,
      rfq: winningRFQ
    });
  } catch (error) {
    console.error('Assign vendor RFQ error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign vendor',
      error: error.message
    });
  }
}

module.exports = {
  sendRFQ,
  getVendorRFQs,
  respondToRFQ,
  compareRFQsForRequirement,
  assignVendorRFQ
};
