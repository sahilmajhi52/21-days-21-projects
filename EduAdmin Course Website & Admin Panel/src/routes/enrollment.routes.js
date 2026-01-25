const express = require('express');
const { enrollmentController, progressController } = require('../controllers');
const { validate, authenticate, isAdmin } = require('../middleware');
const { enrollmentValidation, progressValidation } = require('../validations');

const router = express.Router();

// Student routes
router.get('/my-enrollments', authenticate, validate(enrollmentValidation.getMyEnrollments), enrollmentController.getMyEnrollments);
router.post('/courses/:courseId', authenticate, validate(enrollmentValidation.enrollInCourse), enrollmentController.enrollInCourse);
router.post('/:enrollmentId/cancel', authenticate, validate(enrollmentValidation.cancelEnrollment), enrollmentController.cancelEnrollment);

// Progress routes
router.get('/courses/:courseId/progress', authenticate, validate(progressValidation.getProgress), progressController.getCourseProgress);
router.get('/courses/:courseId/lessons/:lessonId/progress', authenticate, validate(progressValidation.getLessonProgress), progressController.getLessonProgress);
router.patch('/courses/:courseId/lessons/:lessonId/progress', authenticate, validate(progressValidation.updateLessonProgress), progressController.updateLessonProgress);
router.post('/courses/:courseId/lessons/:lessonId/complete', authenticate, validate(progressValidation.markLessonComplete), progressController.markLessonComplete);
router.get('/courses/:courseId/next-lesson', authenticate, progressController.getNextLesson);

// Admin routes
router.get('/', authenticate, isAdmin, validate(enrollmentValidation.getEnrollments), enrollmentController.getEnrollments);
router.get('/statistics', authenticate, isAdmin, enrollmentController.getStatistics);
router.get('/:enrollmentId', authenticate, validate(enrollmentValidation.getEnrollment), enrollmentController.getEnrollment);
router.patch('/:enrollmentId', authenticate, isAdmin, validate(enrollmentValidation.updateEnrollment), enrollmentController.updateEnrollment);

module.exports = router;
