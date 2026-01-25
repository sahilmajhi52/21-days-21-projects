/**
 * Permission Routes
 */

const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const {
  permissionIdValidator,
  createPermissionValidator,
} = require('../validators/role.validator');

// All routes require authentication
router.use(authenticate);

// Get all permissions
router.get(
  '/',
  requirePermission('roles:read'),
  roleController.getPermissions
);

// Get permissions grouped by resource
router.get(
  '/grouped',
  requirePermission('roles:read'),
  roleController.getPermissionsGrouped
);

// Create permission
router.post(
  '/',
  createPermissionValidator,
  validate,
  requirePermission('roles:manage'),
  roleController.createPermission
);

// Delete permission
router.delete(
  '/:id',
  permissionIdValidator,
  validate,
  requirePermission('roles:manage'),
  roleController.deletePermission
);

module.exports = router;
