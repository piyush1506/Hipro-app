const express = require('express');
const router = express.Router();
const {
  createRequirementAnalysis,
  getRequirementsByLead,
  addMaterialItem,
  addLaborItem
} = require('../controllers/requirement.controller');
const {
  authenticate,
  requirePermission
} = require('../middleware/auth');

// Create requirement analysis (Civil Engineer / Super Admin)
router.post('/', authenticate, requirePermission('requirements.create'), createRequirementAnalysis);

// Get requirements for a lead
router.get('/lead/:leadId', authenticate, requirePermission('requirements.view'), getRequirementsByLead);

// Add items to existing analysis
router.post('/:analysisId/materials', authenticate, requirePermission('requirements.edit'), addMaterialItem);
router.post('/:analysisId/labors', authenticate, requirePermission('requirements.edit'), addLaborItem);

module.exports = router;
