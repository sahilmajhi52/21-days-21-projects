/**
 * Role and Permission Routes
 */

const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const {
  roleIdValidator,
  createRoleValidator,
  updateRoleValidator,
  permissionIdValidator,
  createPermissionValidator,
  assignPermissionValidator,
  setPermissionsValidator,
} = require('../validators/role.validator');

// All routes require authentication
router.use(authenticate);

// ==================== ROLE ROUTES ====================

// Get all roles
router.get(
  '/',
  requirePermission('roles:read'),
  roleController.getRoles
);

// Get role by ID
router.get(
  '/:id',
  roleIdValidator,
  validate,
  requirePermission('roles:read'),
  roleController.getRoleById
);

// Create role
router.post(
  '/',
  createRoleValidator,
  validate,
  requirePermission('roles:create'),
  roleController.createRole
);

// Update role
router.put(
  '/:id',
  updateRoleValidator,
  validate,
  requirePermission('roles:update'),
  roleController.updateRole
);

// Delete role
router.delete(
  '/:id',
  roleIdValidator,
  validate,
  requirePermission('roles:delete'),
  roleController.deleteRole
);

// Set all permissions for a role
router.put(
  '/:id/permissions',
  setPermissionsValidator,
  validate,
  requirePermission('roles:manage'),
  roleController.setRolePermissions
);

// Assign permission to role
router.post(
  '/:roleId/permissions',
  assignPermissionValidator,
  validate,
  requirePermission('roles:manage'),
  roleController.assignPermission
);

// Remove permission from role
router.delete(
  '/:roleId/permissions/:permissionId',
  roleIdValidator,
  permissionIdValidator,
  validate,
  requirePermission('roles:manage'),
  roleController.removePermission
);

module.exports = router;
