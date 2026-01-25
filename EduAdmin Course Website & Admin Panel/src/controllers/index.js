const authController = require('./auth.controller');
const userController = require('./user.controller');
const categoryController = require('./category.controller');
const courseController = require('./course.controller');
const moduleController = require('./module.controller');
const lessonController = require('./lesson.controller');
const enrollmentController = require('./enrollment.controller');
const progressController = require('./progress.controller');
const reviewController = require('./review.controller');
const adminController = require('./admin.controller');

module.exports = {
  authController,
  userController,
  categoryController,
  courseController,
  moduleController,
  lessonController,
  enrollmentController,
  progressController,
  reviewController,
  adminController,
};
