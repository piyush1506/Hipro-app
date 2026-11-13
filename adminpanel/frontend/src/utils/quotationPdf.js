/**
 * Quotation PDF export.
 *
 * The admin panel runs without a server-side PDF renderer (no pdfkit /
 * puppeteer dependency), so the export is produced as a self-contained,
 * print-optimised HTML document that opens in a new window and triggers the
 * browser's print dialog — where the admin picks "Save as PDF".
 *
 * The generated document is independent from the admin dashboard, so it never
 * leaks navigation, filters or other rows into the PDF.
 */

const COMPANY = {
  legalName: 'HIND BUILDING SOLUTIONS',
  brandName: 'Hindustan Projects',
  tagline: 'Technical Waterproofing, Surface Repair & Restoration',
  hotline: '+91 94628 77757',
  email: 'support@hindbuilding.com',
};

const ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ESCAPE_MAP[char]);
}

function inr(amount) {
  const value = Number(amount) || 0;
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function lineItemsOf(quote) {
  const items = Array.isArray(quote?.lineItem) ? quote.lineItem : [];
  return items.map((li, index) => {
    const qty = parseFloat(li?.qty) || 0;
    const rate = parseFloat(li?.rate) || 0;
    return {
      index: index + 1,
      description: li?.item || li?.description || 'Scope item',
      qty,
      unit: li?.unit || 'Unit',
      rate,
      amount: qty * rate,
    };
  });
}

/**
 * Builds a standalone, print-ready HTML document for a quotation.
 *
 * @param {object} quote       quotation record (with `request` relation)
 * @param {object} [options]
 * @param {string} [options.title] document title
 * @param {string} [options.footerNote] extra note rendered in the footer
 * @returns {string} complete HTML document
 */
export function buildQuotationHtml(quote, options = {}) {
  const request = quote?.request || {};
  const customer = request.user || {};
  const items = lineItemsOf(quote);
  const advancePct = quote?.advancePercentage ?? 50;
  const advanceAmount = quote?.advanceAmount ?? (quote?.grandtotal || 0) * (advancePct / 100);

  const rows = items.length > 0
    ? items.map((item) => `
          <tr>
            <td class="num">${item.index}</td>
            <td>${escapeHtml(item.description)}</td>
            <td class="num">${item.qty}</td>
            <td>${escapeHtml(item.unit)}</td>
            <td class="num">${inr(item.rate)}</td>
            <td class="num strong">${inr(item.amount)}</td>
          </tr>`).join('')
    : `<tr><td colspan="6" class="empty">No line items were recorded for this quotation.</td></tr>`;

  const terms = quote?.termsAndConditions
    || 'Standard service scope applies. Advance payment is required before work commencement and the balance is payable on completion.';

  const title = options.title || `Quotation ${quote?.quoteNumber || ''}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
  @page { size: A4; margin: 14mm 12mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    color: #0f172a;
    font-size: 11px;
    line-height: 1.5;
    background: #ffffff;
  }
  .sheet { max-width: 780px; margin: 0 auto; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; border-bottom: 2px solid #0b2545; padding-bottom: 12px; }
  .brand h1 { font-size: 19px; letter-spacing: 0.02em; color: #0b2545; }
  .brand p { font-size: 10px; color: #475569; }
  .brand .meta { font-size: 9.5px; color: #64748b; margin-top: 4px; }
  .doc { text-align: right; }
  .doc .no { font-family: 'Consolas', monospace; font-size: 14px; font-weight: 700; color: #1d4ed8; }
  .doc p { font-size: 10px; color: #64748b; }
  .status { display: inline-block; margin-top: 6px; padding: 2px 8px; border-radius: 999px; font-size: 9px; font-weight: 700; letter-spacing: 0.06em; border: 1px solid #cbd5e1; color: #334155; }
  .status.accepted { background: #ecfdf5; border-color: #6ee7b7; color: #047857; }
  .status.rejected { background: #fef2f2; border-color: #fca5a5; color: #b91c1c; }
  .status.pending  { background: #fffbeb; border-color: #fcd34d; color: #b45309; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 14px 0; }
  .box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; background: #f8fafc; }
  .box h3 { font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; margin-bottom: 6px; }
  .box p { color: #334155; }
  table { width: 100%; border-collapse: collapse; }
  thead th { background: #0b2545; color: #ffffff; font-size: 9px; letter-spacing: 0.06em; text-transform: uppercase; text-align: left; padding: 8px 8px; font-weight: 600; }
  tbody td { padding: 7px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  .num { text-align: right; white-space: nowrap; }
  .strong { font-weight: 700; }
  .empty { text-align: center; color: #94a3b8; padding: 14px; }
  .totals { display: flex; justify-content: flex-end; margin-top: 12px; }
  .totals table { width: 260px; }
  .totals td { padding: 4px 6px; }
  .totals td:last-child { text-align: right; }
  .totals .line { border-top: 1px solid #e2e8f0; color: #475569; }
  .totals .grand td { border-top: 2px solid #0b2545; font-size: 13px; font-weight: 700; padding-top: 7px; }
  .terms { margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
  .terms h3 { font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
  .terms p { color: #475569; font-size: 10px; }
  .sign { display: flex; justify-content: space-between; gap: 40px; margin-top: 26px; }
  .sign div { flex: 1; border-top: 1px solid #cbd5e1; padding-top: 6px; font-size: 9.5px; color: #64748b; }
  .foot { margin-top: 22px; border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; }
  .actions { margin: 0 auto 16px; max-width: 780px; text-align: right; }
  .actions button { background: #0b2545; color: #fff; border: 0; border-radius: 6px; padding: 8px 16px; font-size: 12px; cursor: pointer; }
  @media print { .actions { display: none; } }
</style>
</head>
<body>
  <div class="actions">
    <button onclick="window.print()">Save as PDF / Print</button>
  </div>
  <div class="sheet">
    <div class="head">
      <div class="brand">
        <h1>${COMPANY.legalName}</h1>
        <p>${COMPANY.tagline}</p>
        <p class="meta">${COMPANY.brandName} • ${COMPANY.hotline} • ${COMPANY.email}</p>
      </div>
      <div class="doc">
        <div class="no">${escapeHtml(quote?.quoteNumber || 'N/A')}</div>
        <p>Date: ${formatDate(quote?.created_at)}</p>
        <p>Ref: ${escapeHtml(request?.requestNumber || 'N/A')}</p>
        <span class="status ${String(quote?.status || '').toLowerCase()}">${escapeHtml(String(quote?.status || 'PENDING').toUpperCase())}</span>
      </div>
    </div>

    <div class="grid">
      <div class="box">
        <h3>Customer Information</h3>
        <p><strong>${escapeHtml(customer?.name || 'Customer')}</strong></p>
        <p>Phone: ${escapeHtml(customer?.phoneNumber || 'N/A')}</p>
        <p>Property: ${escapeHtml(request?.propertyType || 'House')} (${escapeHtml(request?.propertySize || 'Standard')})</p>
      </div>
      <div class="box">
        <h3>Service Scope</h3>
        <p><strong>${escapeHtml(request?.servicecode || 'Repair Work')}</strong></p>
        <p>Address: ${escapeHtml(request?.addressline || request?.location || 'Main Residence')}</p>
        <p>Timeline: <strong>${escapeHtml(quote?.estimatedTimeline || '1-2 Working Days')}</strong></p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:28px">#</th>
          <th>Scope &amp; Specification</th>
          <th class="num" style="width:52px">Qty</th>
          <th style="width:60px">Unit</th>
          <th class="num" style="width:80px">Rate</th>
          <th class="num" style="width:92px">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="totals">
      <table>
        <tr><td>Material Cost</td><td>${inr(quote?.materialCost)}</td></tr>
        <tr><td>Labor &amp; Application</td><td>${inr(quote?.laborCost)}</td></tr>
        <tr><td>Discount</td><td>- ${inr(quote?.discount)}</td></tr>
        <tr class="line"><td>Subtotal</td><td>${inr(quote?.subtotal)}</td></tr>
        <tr class="line"><td>GST (${quote?.taxRate ?? 18}%)</td><td>${inr(quote?.taxGST)}</td></tr>
        <tr class="grand"><td>Grand Total</td><td>${inr(quote?.grandtotal)}</td></tr>
        <tr class="line"><td>Advance (${Number(advancePct).toFixed(0)}%)</td><td>${inr(advanceAmount)}</td></tr>
      </table>
    </div>

    <div class="terms">
      <h3>Terms &amp; Conditions</h3>
      <p>${escapeHtml(terms)}</p>
    </div>

    <div class="sign">
      <div>Customer Signature</div>
      <div>For ${escapeHtml(COMPANY.legalName)}</div>
    </div>

    <div class="foot">
      <span>${escapeHtml(options.footerNote || 'This is a computer generated quotation and is valid without a physical signature.')}</span>
      <span>Generated on ${formatDate(new Date())}</span>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Opens the quotation as a print-ready document so it can be saved as PDF.
 *
 * @returns {'opened'|'downloaded'|'failed'} outcome of the export
 */
export function downloadQuotationPdf(quote, options = {}) {
  const html = buildQuotationHtml(quote, options);

  if (typeof window === 'undefined') return 'failed';

  const printWindow = window.open('', '_blank', 'width=960,height=1100');
  if (!printWindow) {
    // Popup blocked - fall back to downloading the printable document.
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(quote?.quoteNumber || 'quotation').replace(/[^\w-]/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return 'downloaded';
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  const triggerPrint = () => {
    try {
      printWindow.print();
    } catch (error) {
      console.error('Quotation PDF print failed:', error);
    }
  };

  if (printWindow.document.readyState === 'complete') {
    setTimeout(triggerPrint, 300);
  } else {
    printWindow.addEventListener('load', () => setTimeout(triggerPrint, 300), { once: true });
  }

  return 'opened';
}
