const Joi = require('joi');
const { objectId, pagination } = require('./common.validation');

const getCategories = {
  query: Joi.object().keys({
    ...pagination,
    sort: Joi.string(),
    search: Joi.string().max(100),
    isActive: Joi.boolean(),
    parent: Joi.string().custom(objectId),
  }),
};

const getCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId).required(),
  }),
};

const createCategory = {
  body: Joi.object().keys({
    name: Joi.string().trim().min(1).max(100).required(),
    description: Joi.string().max(500),
    icon: Joi.string().uri(),
    parent: Joi.string().custom(objectId),
    isActive: Joi.boolean().default(true),
    order: Joi.number().integer().min(0).default(0),
  }),
};

const updateCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().trim().min(1).max(100),
      description: Joi.string().max(500),
      icon: Joi.string().uri(),
      parent: Joi.string().custom(objectId).allow(null),
      isActive: Joi.boolean(),
      order: Joi.number().integer().min(0),
    })
    .min(1),
};

const deleteCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
