const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const {
  getVendors,
  getVendorCategories,
  getVendorById,
  getVendorRatings,
  createVendor,
  updateVendor,
  deleteVendor,
  toggleVendorStatus,
  toggleVendorKYC,
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
  optionalAuth,
  requireAdmin,
  requireVendor,
  preventVendorIDOR
} = require('../middleware/auth');

// ==========================================
// 1. SPECIFIC SUB-ROUTES (Must be before /:id)
// ==========================================

// Dynamic Vendor Onboarding Catalog (Live Services, Sub-services & Material Categories)
router.get('/catalog', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: {
        subServices: {
          where: { isActive: true },
          select: { id: true, titleEn: true, titleHi: true, desc: true }
        }
      },
      orderBy: { created_at: 'asc' }
    });

    const materialCategories = [
      'Cement & Aggregate', 'TMT Steel & Iron Rods', 'Plywood, Timber & Laminates',
      'Pipes & Plumbing Hardware', 'Electrical Hardware & Wires', 'Paints, Putty & Waterproofing Chemicals',
      'Tiles, Marbles & Sanitaryware', 'Bricks, Stone & AAC Blocks', 'Glass, Aluminum & Hardware'
    ];

    res.json({
      success: true,
      services,
      materialCategories
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Vendor categories list with live count
router.get('/categories', getVendorCategories);

// Vendor quotations (Admin/Vendor only — scoped by role)
router.get('/quotes', authenticate, getVendorQuotes);
router.post('/quotes', authenticate, requireVendor, preventVendorIDOR, createVendorQuote);
router.put('/quotes/:id', authenticate, requireVendor, preventVendorIDOR, updateVendorQuote);
router.delete('/quotes/:id', authenticate, requireVendor, preventVendorIDOR, deleteVendorQuote);

// Vendor assignment (Admin only)
router.patch('/assign/:requestId', authenticate, requireAdmin, assignVendorToRequest);

// Vendor-facing operational endpoints
router.get('/requests', optionalAuth, getVendorRequests);
router.get('/my-quotes', authenticate, requireVendor, preventVendorIDOR, getMyVendorQuotes);
router.get('/my-jobs', authenticate, requireVendor, preventVendorIDOR, getMyVendorJobs);

// Admin status & KYC toggles (must match specific subpaths before generic /:id)
router.patch('/:id/status', authenticate, requireAdmin, toggleVendorStatus);
router.patch('/:id/verify-kyc', authenticate, requireAdmin, toggleVendorKYC);

// ==========================================
// 2. ROOT & PARAMETERIZED VENDOR ROUTES
// ==========================================

// List all vendors (Sanitized public view for non-admin, full for admin)
router.get('/', optionalAuth, getVendors);

// Create new vendor (Admin only)
router.post('/', authenticate, requireAdmin, createVendor);

// Get single vendor ratings & reviews (Public/Customer/Admin)
router.get('/:id/ratings', optionalAuth, getVendorRatings);

// Get single vendor by ID (Must be after /quotes, /categories, etc.)
router.get('/:id', optionalAuth, getVendorById);

// Update single vendor (Admin only)
router.put('/:id', authenticate, requireAdmin, updateVendor);

// Delete single vendor (Admin only)
router.delete('/:id', authenticate, requireAdmin, deleteVendor);

module.exports = router;
