const express = require('express');
const router = express.Router();
const {
  listRoles,
  createRole,
  updateRole,
  deleteRole
} = require('../controllers/role.controller');
const {
  authenticate,
  requireAdmin,
  requirePermission
} = require('../middleware/auth');

// List all roles (requires rbac.manage or Super Admin)
router.get('/', authenticate, requirePermission('rbac.manage'), listRoles);

// Manage roles (Super Admin only)
router.post('/', authenticate, requireAdmin, createRole);
router.put('/:id', authenticate, requireAdmin, updateRole);
router.delete('/:id', authenticate, requireAdmin, deleteRole);

module.exports = router;
