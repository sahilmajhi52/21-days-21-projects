const Joi = require('joi');
const { objectId, pagination } = require('./common.validation');

const getLessons = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
    moduleId: Joi.string().custom(objectId).required(),
  }),
  query: Joi.object().keys({
    ...pagination,
    isPublished: Joi.boolean(),
  }),
};

const getLesson = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
    moduleId: Joi.string().custom(objectId).required(),
    lessonId: Joi.string().custom(objectId).required(),
  }),
};

const createLesson = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
    moduleId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    title: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().max(2000),
    type: Joi.string().valid('video', 'article', 'quiz', 'assignment', 'resource').default('video'),
    content: Joi.object().keys({
      videoUrl: Joi.string().uri(),
      videoProvider: Joi.string().valid('local', 'youtube', 'vimeo', 's3'),
      articleContent: Joi.string(),
      resources: Joi.array().items(
        Joi.object().keys({
          name: Joi.string().required(),
          url: Joi.string().uri().required(),
          type: Joi.string().valid('pdf', 'document', 'link', 'other'),
        })
      ),
    }),
    duration: Joi.number().integer().min(0).default(0),
    order: Joi.number().integer().min(0),
    isPreview: Joi.boolean().default(false),
    isPublished: Joi.boolean().default(false),
  }),
};

const updateLesson = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
    moduleId: Joi.string().custom(objectId).required(),
    lessonId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string().trim().min(1).max(200),
      description: Joi.string().max(2000),
      type: Joi.string().valid('video', 'article', 'quiz', 'assignment', 'resource'),
      content: Joi.object().keys({
        videoUrl: Joi.string().uri().allow(null),
        videoProvider: Joi.string().valid('local', 'youtube', 'vimeo', 's3').allow(null),
        articleContent: Joi.string().allow(null),
        resources: Joi.array().items(
          Joi.object().keys({
            name: Joi.string().required(),
            url: Joi.string().uri().required(),
            type: Joi.string().valid('pdf', 'document', 'link', 'other'),
          })
        ),
      }),
      duration: Joi.number().integer().min(0),
      order: Joi.number().integer().min(0),
      isPreview: Joi.boolean(),
      isPublished: Joi.boolean(),
    })
    .min(1),
};

const deleteLesson = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
    moduleId: Joi.string().custom(objectId).required(),
    lessonId: Joi.string().custom(objectId).required(),
  }),
};

const reorderLessons = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
    moduleId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    lessonIds: Joi.array()
      .items(Joi.string().custom(objectId))
      .min(1)
      .required(),
  }),
};

module.exports = {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
};
