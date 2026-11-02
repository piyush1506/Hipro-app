const express = require('express');
const router = express.Router();
const {
  getVendors,
  getVendorCategories,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  toggleVendorStatus,
  getVendorQuotes,
  createVendorQuote,
  updateVendorQuote,
  deleteVendorQuote,
  assignVendorToRequest,
  getVendorRequests,
  getMyVendorQuotes,
  getMyVendorJobs
} = require('../controllers/vendor.controller');
const {
  authenticate,
  requireAdmin,
  requireVendor,
  preventVendorIDOR
} = require('../middleware/auth');

// ==========================================
// VENDOR MANAGEMENT (Super Admin Protected)
// ==========================================

// List all vendors
router.get('/', getVendors);

// Vendor categories list with live count
router.get('/categories', getVendorCategories);

// Get single vendor
router.get('/:id', getVendorById);

// Create new vendor (Admin only)
router.post('/', authenticate, requireAdmin, createVendor);

// Update vendor (Admin only)
router.put('/:id', authenticate, requireAdmin, updateVendor);

// Delete vendor (Admin only)
router.delete('/:id', authenticate, requireAdmin, deleteVendor);

// Toggle vendor status (active/inactive) (Admin only)
router.patch('/:id/status', authenticate, requireAdmin, toggleVendorStatus);

// ==========================================
// VENDOR QUOTATIONS
// ==========================================

// Get all vendor quotes (with filters)
router.get('/quotes', getVendorQuotes);

// Submit a new vendor quotation (Vendor only with IDOR prevention)
router.post('/quotes', authenticate, requireVendor, preventVendorIDOR, createVendorQuote);

// Update a vendor quotation (Vendor only with IDOR prevention)
router.put('/quotes/:id', authenticate, requireVendor, preventVendorIDOR, updateVendorQuote);

// Delete a vendor quotation (Vendor or Admin)
router.delete('/quotes/:id', authenticate, requireVendor, preventVendorIDOR, deleteVendorQuote);

// ==========================================
// VENDOR ASSIGNMENT (Admin assigns vendor)
// ==========================================

// Admin manually assigns a vendor to a request (Admin only)
router.patch('/assign/:requestId', authenticate, requireAdmin, assignVendorToRequest);

// ==========================================
// VENDOR-FACING ENDPOINTS
// ==========================================

// Get requests open for vendor quoting
router.get('/requests', getVendorRequests);

// Get quotes submitted by the authenticated vendor
router.get('/my-quotes', authenticate, requireVendor, preventVendorIDOR, getMyVendorQuotes);

// Get jobs assigned to the authenticated vendor
router.get('/my-jobs', authenticate, requireVendor, preventVendorIDOR, getMyVendorJobs);

module.exports = router;
