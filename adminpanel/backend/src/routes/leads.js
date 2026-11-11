const express = require('express');
const router = express.Router();
const {
  listLeads,
  getLeadById,
  createLead,
  verifyLead,
  assignLeadToEngineer,
  contactLead,
  rejectLead
} = require('../controllers/lead.controller');
const {
  authenticate,
  requirePermission
} = require('../middleware/auth');

// List leads (role-filtered, requires leads.view)
router.get('/', authenticate, requirePermission('leads.view'), listLeads);

// Get single lead details
router.get('/:id', authenticate, requirePermission('leads.view'), getLeadById);

// Create lead manually
router.post('/', authenticate, requirePermission('leads.view'), createLead);

// Telecaller actions:
router.patch('/:id/contact', authenticate, requirePermission('leads.contact'), contactLead);
router.patch('/:id/verify', authenticate, requirePermission('leads.verify'), verifyLead);
router.patch('/:id/reject', authenticate, requirePermission('leads.reject'), rejectLead);

// Lead assignment to Civil Engineer:
router.patch('/:id/assign', authenticate, requirePermission('leads.assign'), assignLeadToEngineer);

module.exports = router;
