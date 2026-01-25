const authValidation = require('./auth.validation');
const userValidation = require('./user.validation');
const categoryValidation = require('./category.validation');
const courseValidation = require('./course.validation');
const moduleValidation = require('./module.validation');
const lessonValidation = require('./lesson.validation');
const enrollmentValidation = require('./enrollment.validation');
const progressValidation = require('./progress.validation');
const reviewValidation = require('./review.validation');

module.exports = {
  authValidation,
  userValidation,
  categoryValidation,
  courseValidation,
  moduleValidation,
  lessonValidation,
  enrollmentValidation,
  progressValidation,
  reviewValidation,
};
