const express = require('express');
const { courseController, moduleController, lessonController, reviewController } = require('../controllers');
const { validate, authenticate, optionalAuth, isInstructorOrAdmin } = require('../middleware');
const { courseValidation, moduleValidation, lessonValidation, reviewValidation } = require('../validations');

const router = express.Router();

// Public routes (with optional auth for more info)
router.get('/', optionalAuth, validate(courseValidation.getCourses), courseController.getCourses);
router.get('/slug/:slug', optionalAuth, validate(courseValidation.getCourseBySlug), courseController.getCourseBySlug);

// Instructor routes
router.get('/my-courses', authenticate, isInstructorOrAdmin, courseController.getMyCourses);
router.get('/statistics', authenticate, isInstructorOrAdmin, courseController.getStatistics);

// Course CRUD
router.post(
  '/',
  authenticate,
  isInstructorOrAdmin,
  validate(courseValidation.createCourse),
  courseController.createCourse
);

router
  .route('/:courseId')
  .get(optionalAuth, validate(courseValidation.getCourse), courseController.getCourse)
  .patch(authenticate, validate(courseValidation.updateCourse), courseController.updateCourse)
  .delete(authenticate, validate(courseValidation.deleteCourse), courseController.deleteCourse);

// Publish/Unpublish
router.post(
  '/:courseId/publish',
  authenticate,
  validate(courseValidation.publishCourse),
  courseController.publishCourse
);
router.post(
  '/:courseId/unpublish',
  authenticate,
  validate(courseValidation.publishCourse),
  courseController.unpublishCourse
);

// Module routes (nested under course)
router
  .route('/:courseId/modules')
  .get(validate(moduleValidation.getModules), moduleController.getModules)
  .post(authenticate, validate(moduleValidation.createModule), moduleController.createModule);

router.post(
  '/:courseId/modules/reorder',
  authenticate,
  validate(moduleValidation.reorderModules),
  moduleController.reorderModules
);

router
  .route('/:courseId/modules/:moduleId')
  .get(validate(moduleValidation.getModule), moduleController.getModule)
  .patch(authenticate, validate(moduleValidation.updateModule), moduleController.updateModule)
  .delete(authenticate, validate(moduleValidation.deleteModule), moduleController.deleteModule);

// Lesson routes (nested under module)
router
  .route('/:courseId/modules/:moduleId/lessons')
  .get(validate(lessonValidation.getLessons), lessonController.getLessons)
  .post(authenticate, validate(lessonValidation.createLesson), lessonController.createLesson);

router.post(
  '/:courseId/modules/:moduleId/lessons/reorder',
  authenticate,
  validate(lessonValidation.reorderLessons),
  lessonController.reorderLessons
);

router
  .route('/:courseId/modules/:moduleId/lessons/:lessonId')
  .get(optionalAuth, validate(lessonValidation.getLesson), lessonController.getLesson)
  .patch(authenticate, validate(lessonValidation.updateLesson), lessonController.updateLesson)
  .delete(authenticate, validate(lessonValidation.deleteLesson), lessonController.deleteLesson);

// Review routes (nested under course)
router
  .route('/:courseId/reviews')
  .get(validate(reviewValidation.getReviews), reviewController.getReviews)
  .post(authenticate, validate(reviewValidation.createReview), reviewController.createReview);

router
  .route('/:courseId/reviews/:reviewId')
  .get(validate(reviewValidation.getReview), reviewController.getReview)
  .patch(authenticate, validate(reviewValidation.updateReview), reviewController.updateReview)
  .delete(authenticate, validate(reviewValidation.deleteReview), reviewController.deleteReview);

router.post(
  '/:courseId/reviews/:reviewId/respond',
  authenticate,
  validate(reviewValidation.respondToReview),
  reviewController.respondToReview
);

module.exports = router;
