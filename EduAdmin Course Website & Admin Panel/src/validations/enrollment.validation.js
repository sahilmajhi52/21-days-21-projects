const Joi = require('joi');
const { objectId, pagination } = require('./common.validation');

const getEnrollments = {
  query: Joi.object().keys({
    ...pagination,
    sort: Joi.string(),
    student: Joi.string().custom(objectId),
    course: Joi.string().custom(objectId),
    status: Joi.string().valid('active', 'completed', 'expired', 'cancelled'),
  }),
};

const getMyEnrollments = {
  query: Joi.object().keys({
    ...pagination,
    sort: Joi.string(),
    status: Joi.string().valid('active', 'completed', 'expired', 'cancelled'),
  }),
};

const getEnrollment = {
  params: Joi.object().keys({
    enrollmentId: Joi.string().custom(objectId).required(),
  }),
};

const enrollInCourse = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    paymentMethod: Joi.string().valid('free', 'card', 'paypal', 'coupon'),
    transactionId: Joi.string(),
  }),
};

const updateEnrollment = {
  params: Joi.object().keys({
    enrollmentId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      status: Joi.string().valid('active', 'completed', 'expired', 'cancelled'),
    })
    .min(1),
};

const cancelEnrollment = {
  params: Joi.object().keys({
    enrollmentId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  getEnrollments,
  getMyEnrollments,
  getEnrollment,
  enrollInCourse,
  updateEnrollment,
  cancelEnrollment,
};
