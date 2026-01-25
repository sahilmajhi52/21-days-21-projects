const tokenService = require('./token.service');
const authService = require('./auth.service');
const userService = require('./user.service');
const categoryService = require('./category.service');
const courseService = require('./course.service');
const moduleService = require('./module.service');
const lessonService = require('./lesson.service');
const enrollmentService = require('./enrollment.service');
const progressService = require('./progress.service');
const reviewService = require('./review.service');

module.exports = {
  tokenService,
  authService,
  userService,
  categoryService,
  courseService,
  moduleService,
  lessonService,
  enrollmentService,
  progressService,
  reviewService,
};
