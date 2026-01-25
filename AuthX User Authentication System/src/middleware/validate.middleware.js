/**
 * Validation Middleware
 * Handles express-validator results
 */

const { validationResult } = require('express-validator');
const { error } = require('../utils/response');

/**
 * Process validation results and return errors if any
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return error(
      res,
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      formattedErrors
    );
  }

  next();
};

module.exports = validate;
