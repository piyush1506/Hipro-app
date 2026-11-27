// Hipro GST Verification Routes (NIC E-Invoice / E-Way Bill Integration)
const express = require('express');
const router = express.Router();
const gstService = require('../services/gst.service');
const prisma = require('../prisma');

/**
 * GET /api/v1/gst/verify/:gstin
 * Verify GSTIN number and return taxpayer details
 */
router.get('/verify/:gstin', async (req, res) => {
  try {
    const { gstin } = req.params;
    const result = await gstService.verifyGSTIN(gstin);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: result.message || 'GSTIN verification failed',
        errors: result.errors || null
      });
    }

    return res.json({
      success: true,
      verified: true,
      data: result
    });
  } catch (error) {
    console.error('GST Verification API Error:', error);
    return res.status(500).json({
      success: false,
      verified: false,
      message: 'Internal server error while verifying GSTIN: ' + error.message
    });
  }
});

/**
 * POST /api/v1/gst/verify
 * JSON Body variant: { gstin: "29AABCU9603R1Z7" }
 */
router.post('/verify', async (req, res) => {
  try {
    const { gstin } = req.body;
    if (!gstin) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'GSTIN number is required in request body.'
      });
    }

    const result = await gstService.verifyGSTIN(gstin);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: result.message || 'GSTIN verification failed',
        errors: result.errors || null
      });
    }

    return res.json({
      success: true,
      verified: true,
      data: result
    });
  } catch (error) {
    console.error('GST Verification API Error:', error);
    return res.status(500).json({
      success: false,
      verified: false,
      message: 'Internal server error while verifying GSTIN: ' + error.message
    });
  }
});

/**
 * POST /api/v1/gst/vendor/:vendorId/verify
 * Verifies a vendor's GSTIN and syncs verified legal details with their profile
 */
router.post('/vendor/:vendorId/verify', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { gstin } = req.body;

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    const targetGstin = gstin || vendor.gstinNumber;
    if (!targetGstin) {
      return res.status(400).json({
        success: false,
        message: 'No GSTIN provided or on record for this vendor.'
      });
    }

    const result = await gstService.verifyGSTIN(targetGstin);

    if (!result.success || !result.verified) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: result.message || 'GSTIN verification failed'
      });
    }

    // Update vendor in database with normalized GSTIN
    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        gstinNumber: result.gstin,
        // If businessName is empty, automatically assign TradeName or LegalName
        businessName: vendor.businessName || result.tradeName || result.legalName
      }
    });

    return res.json({
      success: true,
      verified: true,
      message: `GSTIN successfully verified (${result.statusDetails.label})`,
      vendor: updatedVendor,
      gstinDetails: result
    });
  } catch (error) {
    console.error('Vendor GST Verification Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message
    });
  }
});

module.exports = router;

