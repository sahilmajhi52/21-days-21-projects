const Joi = require('joi');
const { objectId, pagination } = require('./common.validation');

const getCourses = {
  query: Joi.object().keys({
    ...pagination,
    sort: Joi.string(),
    search: Joi.string().max(100),
    category: Joi.string().custom(objectId),
    instructor: Joi.string().custom(objectId),
    level: Joi.string().valid('beginner', 'intermediate', 'advanced', 'all-levels'),
    status: Joi.string().valid('draft', 'pending', 'published', 'archived'),
    isPublished: Joi.boolean(),
    isFeatured: Joi.boolean(),
    minPrice: Joi.number().min(0),
    maxPrice: Joi.number().min(0),
  }),
};

const getCourse = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
  }),
};

const getCourseBySlug = {
  params: Joi.object().keys({
    slug: Joi.string().required(),
  }),
};

const createCourse = {
  body: Joi.object().keys({
    title: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().max(5000).required(),
    shortDescription: Joi.string().max(300),
    category: Joi.string().custom(objectId).required(),
    thumbnail: Joi.string().uri(),
    previewVideo: Joi.string().uri(),
    price: Joi.number().min(0).required(),
    discountPrice: Joi.number().min(0),
    level: Joi.string().valid('beginner', 'intermediate', 'advanced', 'all-levels').default('all-levels'),
    language: Joi.string().default('English'),
    requirements: Joi.array().items(Joi.string().max(300)),
    learningOutcomes: Joi.array().items(Joi.string().max(300)),
    tags: Joi.array().items(Joi.string().trim()),
  }),
};

const updateCourse = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string().trim().min(1).max(200),
      description: Joi.string().max(5000),
      shortDescription: Joi.string().max(300),
      category: Joi.string().custom(objectId),
      thumbnail: Joi.string().uri().allow(null),
      previewVideo: Joi.string().uri().allow(null),
      price: Joi.number().min(0),
      discountPrice: Joi.number().min(0).allow(null),
      level: Joi.string().valid('beginner', 'intermediate', 'advanced', 'all-levels'),
      language: Joi.string(),
      requirements: Joi.array().items(Joi.string().max(300)),
      learningOutcomes: Joi.array().items(Joi.string().max(300)),
      tags: Joi.array().items(Joi.string().trim()),
      status: Joi.string().valid('draft', 'pending', 'published', 'archived'),
      isPublished: Joi.boolean(),
      isFeatured: Joi.boolean(),
    })
    .min(1),
};

const deleteCourse = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
  }),
};

const publishCourse = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  getCourses,
  getCourse,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
};
