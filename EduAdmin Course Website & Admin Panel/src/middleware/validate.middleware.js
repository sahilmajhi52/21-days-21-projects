const Joi = require('joi');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick');

/**
 * Validate request against Joi schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validate = (schema) => (req, res, next) => {
  // Pick only the keys from schema that exist in request
  const validSchema = pick(schema, ['params', 'query', 'body']);
  
  // Pick corresponding values from request
  const object = pick(req, Object.keys(validSchema));
  
  // Compile and validate
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);
  
  if (error) {
    const errorMessage = error.details
      .map((details) => details.message)
      .join(', ');
    return next(ApiError.badRequest(errorMessage));
  }
  
  // Assign validated values back to request
  Object.assign(req, value);
  return next();
};

module.exports = validate;
