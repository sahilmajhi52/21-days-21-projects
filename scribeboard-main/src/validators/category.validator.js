/**
 * Category Validators
 */

const Joi = require('joi');

const createCategory = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(500),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
  icon: Joi.string().max(50),
  metaTitle: Joi.string().max(60),
  metaDescription: Joi.string().max(160)
});

const updateCategory = Joi.object({
  name: Joi.string().min(2).max(50),
  description: Joi.string().max(500).allow(''),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
  icon: Joi.string().max(50).allow(''),
  isActive: Joi.boolean(),
  sortOrder: Joi.number().integer(),
  metaTitle: Joi.string().max(60).allow(''),
  metaDescription: Joi.string().max(160).allow('')
});

module.exports = {
  createCategory,
  updateCategory
};
