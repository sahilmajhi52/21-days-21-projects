const Joi = require('joi');
const { objectId, pagination } = require('./common.validation');

const getReviews = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
  }),
  query: Joi.object().keys({
    ...pagination,
    sort: Joi.string(),
    rating: Joi.number().integer().min(1).max(5),
    isApproved: Joi.boolean(),
  }),
};

const getReview = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
    reviewId: Joi.string().custom(objectId).required(),
  }),
};

const createReview = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    rating: Joi.number().integer().min(1).max(5).required(),
    title: Joi.string().trim().max(100),
    comment: Joi.string().trim().min(10).max(2000).required(),
  }),
};

const updateReview = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
    reviewId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      rating: Joi.number().integer().min(1).max(5),
      title: Joi.string().trim().max(100),
      comment: Joi.string().trim().min(10).max(2000),
    })
    .min(1),
};

const deleteReview = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
    reviewId: Joi.string().custom(objectId).required(),
  }),
};

const approveReview = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
    reviewId: Joi.string().custom(objectId).required(),
  }),
};

const respondToReview = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
    reviewId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    content: Joi.string().trim().min(1).max(1000).required(),
  }),
};

module.exports = {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  approveReview,
  respondToReview,
};
