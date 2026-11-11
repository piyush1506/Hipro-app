const express = require('express');
const router = express.Router();
const {
  createProject,
  listProjects,
  getProjectById,
  updateProjectStatus
} = require('../controllers/project.controller');
const {
  authenticate,
  requirePermission
} = require('../middleware/auth');

// Create project from lead (Civil Engineer / Super Admin)
router.post('/', authenticate, requirePermission('projects.manage'), createProject);

// List projects (Permission-based)
router.get('/', authenticate, requirePermission('projects.view'), listProjects);

// Get single project
router.get('/:id', authenticate, requirePermission('projects.view'), getProjectById);

// Update project status
router.patch('/:id/status', authenticate, requirePermission('projects.manage'), updateProjectStatus);

module.exports = router;
