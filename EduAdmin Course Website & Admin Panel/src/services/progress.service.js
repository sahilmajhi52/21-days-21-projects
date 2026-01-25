const { Progress, Enrollment, Lesson, Course } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Get student progress for a course
 * @param {string} studentId - Student ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>}
 */
const getCourseProgress = async (studentId, courseId) => {
  // Check enrollment
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: { $in: ['active', 'completed'] },
  });
  
  if (!enrollment) {
    throw ApiError.forbidden('Not enrolled in this course');
  }
  
  // Get all progress records for this course
  const progressRecords = await Progress.find({
    student: studentId,
    course: courseId,
  }).populate('lesson', 'title module order');
  
  // Get total lessons
  const totalLessons = await Lesson.countDocuments({
    course: courseId,
    isPublished: true,
  });
  
  const completedLessons = progressRecords.filter((p) => p.isCompleted).length;
  
  return {
    enrollment: {
      id: enrollment._id,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
    },
    progress: {
      percentage: enrollment.progress.percentage,
      completedLessons,
      totalLessons,
      lastAccessedAt: enrollment.progress.lastAccessedAt,
    },
    lessons: progressRecords.map((p) => ({
      lessonId: p.lesson._id,
      title: p.lesson.title,
      isCompleted: p.isCompleted,
      completedAt: p.completedAt,
      watchTime: p.watchTime,
      lastPosition: p.lastPosition,
    })),
  };
};

/**
 * Get or create lesson progress
 * @param {string} studentId - Student ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Progress>}
 */
const getLessonProgress = async (studentId, lessonId) => {
  const lesson = await Lesson.findById(lessonId);
  
  if (!lesson) {
    throw ApiError.notFound('Lesson not found');
  }
  
  // Check enrollment
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: lesson.course,
    status: { $in: ['active', 'completed'] },
  });
  
  if (!enrollment) {
    throw ApiError.forbidden('Not enrolled in this course');
  }
  
  let progress = await Progress.findOne({
    student: studentId,
    lesson: lessonId,
  });
  
  if (!progress) {
    progress = await Progress.create({
      student: studentId,
      course: lesson.course,
      lesson: lessonId,
      module: lesson.module,
      enrollment: enrollment._id,
    });
  }
  
  return progress;
};

/**
 * Update lesson progress
 * @param {string} studentId - Student ID
 * @param {string} lessonId - Lesson ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Progress>}
 */
const updateLessonProgress = async (studentId, lessonId, updateData) => {
  const lesson = await Lesson.findById(lessonId);
  
  if (!lesson) {
    throw ApiError.notFound('Lesson not found');
  }
  
  // Check enrollment
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: lesson.course,
    status: { $in: ['active', 'completed'] },
  });
  
  if (!enrollment) {
    throw ApiError.forbidden('Not enrolled in this course');
  }
  
  let progress = await Progress.findOne({
    student: studentId,
    lesson: lessonId,
  });
  
  if (!progress) {
    progress = await Progress.create({
      student: studentId,
      course: lesson.course,
      lesson: lessonId,
      module: lesson.module,
      enrollment: enrollment._id,
    });
  }
  
  // Update progress fields
  if (updateData.watchTime !== undefined) {
    progress.watchTime = Math.max(progress.watchTime, updateData.watchTime);
  }
  
  if (updateData.lastPosition !== undefined) {
    progress.lastPosition = updateData.lastPosition;
  }
  
  if (updateData.notes !== undefined) {
    progress.notes = updateData.notes;
  }
  
  if (updateData.isCompleted) {
    progress.isCompleted = true;
    progress.completedAt = new Date();
  }
  
  await progress.save();
  
  // Update enrollment last accessed
  enrollment.progress.lastAccessedAt = new Date();
  enrollment.progress.lastLessonId = lessonId;
  await enrollment.save();
  
  return progress;
};

/**
 * Mark lesson as complete
 * @param {string} studentId - Student ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Progress>}
 */
const markLessonComplete = async (studentId, lessonId) => {
  return updateLessonProgress(studentId, lessonId, { isCompleted: true });
};

/**
 * Get next lesson for a student
 * @param {string} studentId - Student ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Lesson|null>}
 */
const getNextLesson = async (studentId, courseId) => {
  // Get all completed lessons
  const completedProgress = await Progress.find({
    student: studentId,
    course: courseId,
    isCompleted: true,
  }).select('lesson');
  
  const completedLessonIds = completedProgress.map((p) => p.lesson);
  
  // Get all lessons ordered
  const lessons = await Lesson.find({
    course: courseId,
    isPublished: true,
    _id: { $nin: completedLessonIds },
  })
    .sort({ module: 1, order: 1 })
    .limit(1);
  
  return lessons[0] || null;
};

module.exports = {
  getCourseProgress,
  getLessonProgress,
  updateLessonProgress,
  markLessonComplete,
  getNextLesson,
};
