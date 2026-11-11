const express = require('express');
const router = express.Router();
const {
  loginStaff,
  getStaffProfile,
  listStaff,
  createStaff,
  updateStaff,
  deleteStaff
} = require('../controllers/staff.controller');
const {
  authenticate,
  requireAdmin,
  requirePermission
} = require('../middleware/auth');

// Public route: Unified Staff Login
router.post('/login', loginStaff);

// Authenticated route: Get current staff profile
router.get('/me', authenticate, getStaffProfile);

// Super Admin / RBAC Manage routes:
router.get('/', authenticate, requirePermission('rbac.manage'), listStaff);
router.post('/', authenticate, requireAdmin, createStaff);
router.put('/:id', authenticate, requireAdmin, updateStaff);
router.delete('/:id', authenticate, requireAdmin, deleteStaff);

module.exports = router;
