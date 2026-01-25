/**
 * Role and Permission Validators
 */

const { body, param } = require('express-validator');

const roleIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Role ID is required')
    .isUUID()
    .withMessage('Invalid role ID format'),
];

const createRoleValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Role name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Role name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z_]+$/)
    .withMessage('Role name can only contain letters and underscores'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Description cannot exceed 255 characters'),

  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean'),

  body('permissionIds')
    .optional()
    .isArray()
    .withMessage('permissionIds must be an array'),

  body('permissionIds.*')
    .optional()
    .isUUID()
    .withMessage('Invalid permission ID format'),
];

const updateRoleValidator = [
  param('id')
    .notEmpty()
    .withMessage('Role ID is required')
    .isUUID()
    .withMessage('Invalid role ID format'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Role name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z_]+$/)
    .withMessage('Role name can only contain letters and underscores'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Description cannot exceed 255 characters'),

  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean'),
];

const permissionIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Permission ID is required')
    .isUUID()
    .withMessage('Invalid permission ID format'),
];

const createPermissionValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Permission name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Permission name must be between 2 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Description cannot exceed 255 characters'),

  body('resource')
    .trim()
    .notEmpty()
    .withMessage('Resource is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Resource must be between 2 and 50 characters')
    .matches(/^[a-z_]+$/)
    .withMessage('Resource can only contain lowercase letters and underscores'),

  body('action')
    .trim()
    .notEmpty()
    .withMessage('Action is required')
    .isIn(['create', 'read', 'update', 'delete', 'manage'])
    .withMessage('Action must be one of: create, read, update, delete, manage'),
];

const assignPermissionValidator = [
  param('roleId')
    .notEmpty()
    .withMessage('Role ID is required')
    .isUUID()
    .withMessage('Invalid role ID format'),

  body('permissionId')
    .notEmpty()
    .withMessage('Permission ID is required')
    .isUUID()
    .withMessage('Invalid permission ID format'),
];

const setPermissionsValidator = [
  param('id')
    .notEmpty()
    .withMessage('Role ID is required')
    .isUUID()
    .withMessage('Invalid role ID format'),

  body('permissionIds')
    .isArray()
    .withMessage('permissionIds must be an array'),

  body('permissionIds.*')
    .isUUID()
    .withMessage('Invalid permission ID format'),
];

module.exports = {
  roleIdValidator,
  createRoleValidator,
  updateRoleValidator,
  permissionIdValidator,
  createPermissionValidator,
  assignPermissionValidator,
  setPermissionsValidator,
};
