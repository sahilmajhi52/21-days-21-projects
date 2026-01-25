const Joi = require('joi');

// Custom ObjectId validator
const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid MongoDB ObjectId');
  }
  return value;
};

// Indian phone number validator
const phoneNumber = Joi.string()
  .pattern(/^[6-9]\d{9}$/)
  .messages({
    'string.pattern.base': 'Phone number must be a valid 10-digit Indian mobile number',
  });

// UPI ID validator
const upiId = Joi.string()
  .pattern(/^[\w.-]+@[\w]+$/)
  .messages({
    'string.pattern.base': 'Invalid UPI ID format',
  });

// PIN validator
const pin = Joi.string()
  .pattern(/^\d{4,6}$/)
  .messages({
    'string.pattern.base': 'PIN must be 4-6 digits',
  });

// Amount validator
const amount = Joi.number()
  .positive()
  .precision(2)
  .messages({
    'number.positive': 'Amount must be positive',
  });

// Pagination
const pagination = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
};

// Password
const password = Joi.string()
  .min(6)
  .max(128)
  .messages({
    'string.min': 'Password must be at least 6 characters',
  });

module.exports = {
  objectId,
  phoneNumber,
  upiId,
  pin,
  amount,
  pagination,
  password,
};
