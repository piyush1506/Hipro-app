const express = require('express');
const router = express.Router();
const {
  sendRFQ,
  getVendorRFQs,
  respondToRFQ,
  compareRFQsForRequirement,
  assignVendorRFQ
} = require('../controllers/rfq.controller');
const {
  authenticate,
  requirePermission,
  requireVendor
} = require('../middleware/auth');

// Purchase Person / Civil Engineer sends RFQ to vendors
router.post('/send', authenticate, requirePermission('procurement.send_rfq'), sendRFQ);

// Vendor views their RFQs
router.get('/vendor/inbox', authenticate, requireVendor, getVendorRFQs);

// Vendor responds to RFQ with quotation
router.patch('/:id/respond', authenticate, requireVendor, respondToRFQ);

// Compare RFQs for a specific requirement
router.get('/compare/:requirementId', authenticate, requirePermission('procurement.compare'), compareRFQsForRequirement);

// Assign winning vendor from RFQs
router.patch('/:id/assign', authenticate, requirePermission('procurement.assign'), assignVendorRFQ);

module.exports = router;
