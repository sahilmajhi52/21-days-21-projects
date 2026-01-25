const Joi = require('joi');
const { objectId, pagination } = require('./common.validation');

const getModules = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
  }),
  query: Joi.object().keys({
    ...pagination,
    isPublished: Joi.boolean(),
  }),
};

const getModule = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
    moduleId: Joi.string().custom(objectId).required(),
  }),
};

const createModule = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    title: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().max(1000),
    order: Joi.number().integer().min(0),
    isPublished: Joi.boolean().default(false),
  }),
};

const updateModule = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
    moduleId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string().trim().min(1).max(200),
      description: Joi.string().max(1000),
      order: Joi.number().integer().min(0),
      isPublished: Joi.boolean(),
    })
    .min(1),
};

const deleteModule = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
    moduleId: Joi.string().custom(objectId).required(),
  }),
};

const reorderModules = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    moduleIds: Joi.array()
      .items(Joi.string().custom(objectId))
      .min(1)
      .required(),
  }),
};

module.exports = {
  getModules,
  getModule,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
};
