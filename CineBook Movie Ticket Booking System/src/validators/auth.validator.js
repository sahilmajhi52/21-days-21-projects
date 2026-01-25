/**
 * Auth Validators
 */

const { body } = require('express-validator');

const registerValidator = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('firstName').trim().notEmpty().withMessage('First name required'),
  body('lastName').trim().notEmpty().withMessage('Last name required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone required'),
];

const loginValidator = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

module.exports = { registerValidator, loginValidator };
