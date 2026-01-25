const Joi = require('joi');

/**
 * Custom Joi validator function for MongoDB ObjectId
 * @param {string} value - The value to validate
 * @param {Object} helpers - Joi helpers
 * @returns {string} The validated value
 */
const objectIdValidator = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid MongoDB ObjectId');
  }
  return value;
};

/**
 * Common validation schemas
 */
const common = {
  // MongoDB ObjectId validator function (use with .custom())
  objectId: objectIdValidator,
  
  // Pagination
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  },
  
  // Sort
  sort: Joi.string(),
  
  // Search
  search: Joi.string().max(100),
  
  // Password requirements
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    }),
  
  // Email
  email: Joi.string().email().lowercase().trim(),
  
  // Name fields
  name: Joi.string().trim().min(1).max(50),
};

module.exports = common;
