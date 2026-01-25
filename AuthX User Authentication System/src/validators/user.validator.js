/**
 * User Validators
 * Request validation for user operations
 */

const { body, param, query } = require('express-validator');

const getUsersValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query cannot exceed 100 characters'),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
    .toBoolean(),

  query('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean')
    .toBoolean(),
];

const userIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('User ID is required')
    .isUUID()
    .withMessage('Invalid user ID format'),
];

const updateUserValidator = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),

  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
];

const updateUserStatusValidator = [
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean'),

  body()
    .custom((value, { req }) => {
      if (req.body.isActive === undefined && req.body.isVerified === undefined) {
        throw new Error('At least one status field must be provided');
      }
      return true;
    }),
];

const assignRoleValidator = [
  param('id')
    .notEmpty()
    .withMessage('User ID is required')
    .isUUID()
    .withMessage('Invalid user ID format'),

  body('roleId')
    .notEmpty()
    .withMessage('Role ID is required')
    .isUUID()
    .withMessage('Invalid role ID format'),
];

const sessionIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('User ID is required')
    .isUUID()
    .withMessage('Invalid user ID format'),

  param('sessionId')
    .notEmpty()
    .withMessage('Session ID is required')
    .isUUID()
    .withMessage('Invalid session ID format'),
];

module.exports = {
  getUsersValidator,
  userIdValidator,
  updateUserValidator,
  updateUserStatusValidator,
  assignRoleValidator,
  sessionIdValidator,
};
