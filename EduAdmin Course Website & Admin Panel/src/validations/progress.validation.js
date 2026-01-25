const Joi = require('joi');
const { objectId, pagination } = require('./common.validation');

const getProgress = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
  }),
};

const getLessonProgress = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
    lessonId: Joi.string().custom(objectId).required(),
  }),
};

const updateLessonProgress = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
    lessonId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      watchTime: Joi.number().integer().min(0),
      lastPosition: Joi.number().integer().min(0),
      isCompleted: Joi.boolean(),
      notes: Joi.string().max(5000),
    })
    .min(1),
};

const markLessonComplete = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
    lessonId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  getProgress,
  getLessonProgress,
  updateLessonProgress,
  markLessonComplete,
};
