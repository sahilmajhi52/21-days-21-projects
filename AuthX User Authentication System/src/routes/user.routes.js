/**
 * User Routes
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission, requireOwnershipOrPermission } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const {
  getUsersValidator,
  userIdValidator,
  updateUserValidator,
  updateUserStatusValidator,
  assignRoleValidator,
  sessionIdValidator,
} = require('../validators/user.validator');

// All routes require authentication
router.use(authenticate);

// List users - requires users:read permission
router.get(
  '/',
  requirePermission('users:read'),
  getUsersValidator,
  validate,
  userController.getUsers
);

// Get user by ID - owner or users:read permission
router.get(
  '/:id',
  userIdValidator,
  validate,
  requireOwnershipOrPermission('id', 'users:read'),
  userController.getUserById
);

// Update user - owner or users:update permission
router.put(
  '/:id',
  userIdValidator,
  updateUserValidator,
  validate,
  requireOwnershipOrPermission('id', 'users:update'),
  userController.updateUser
);

// Update user status - requires users:manage permission
router.patch(
  '/:id/status',
  userIdValidator,
  updateUserStatusValidator,
  validate,
  requirePermission('users:manage'),
  userController.updateUserStatus
);

// Delete user - requires users:delete permission
router.delete(
  '/:id',
  userIdValidator,
  validate,
  requirePermission('users:delete'),
  userController.deleteUser
);

// Assign role to user - requires users:manage permission
router.post(
  '/:id/roles',
  assignRoleValidator,
  validate,
  requirePermission('users:manage'),
  userController.assignRole
);

// Remove role from user - requires users:manage permission
router.delete(
  '/:id/roles/:roleId',
  userIdValidator,
  validate,
  requirePermission('users:manage'),
  userController.removeRole
);

// Get user sessions - owner or users:manage permission
router.get(
  '/:id/sessions',
  userIdValidator,
  validate,
  requireOwnershipOrPermission('id', 'users:manage'),
  userController.getUserSessions
);

// Terminate session - owner or users:manage permission
router.delete(
  '/:id/sessions/:sessionId',
  sessionIdValidator,
  validate,
  requireOwnershipOrPermission('id', 'users:manage'),
  userController.terminateSession
);

module.exports = router;
