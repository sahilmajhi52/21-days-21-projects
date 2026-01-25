/**
 * Validation Middleware
 */

const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        status: 400,
        details: errors.array().map((e) => ({
          field: e.path,
          message: e.msg,
        })),
      },
    });
  }
  next();
};

module.exports = validate;
