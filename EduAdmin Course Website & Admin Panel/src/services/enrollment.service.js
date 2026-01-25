const { Enrollment, Course, Lesson, Progress } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationResult, getSort } = require('../utils/pagination');

/**
 * Get enrollments with pagination and filtering
 * @param {Object} query - Query parameters
 * @returns {Promise<Object>}
 */
const getEnrollments = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const sort = getSort(query.sort, ['enrolledAt', 'progress.percentage']);
  
  const filter = {};
  
  if (query.student) {
    filter.student = query.student;
  }
  
  if (query.course) {
    filter.course = query.course;
  }
  
  if (query.status) {
    filter.status = query.status;
  }
  
  const [enrollments, totalResults] = await Promise.all([
    Enrollment.find(filter)
      .populate('student', 'firstName lastName email avatar')
      .populate('course', 'title slug thumbnail')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Enrollment.countDocuments(filter),
  ]);
  
  const pagination = getPaginationResult(page, limit, totalResults);
  
  return { enrollments, pagination };
};

/**
 * Get student enrollments
 * @param {string} studentId - Student ID
 * @param {Object} query - Query parameters
 * @returns {Promise<Object>}
 */
const getStudentEnrollments = async (studentId, query) => {
  const { page, limit, skip } = getPagination(query);
  
  const filter = { student: studentId };
  
  if (query.status) {
    filter.status = query.status;
  }
  
  const [enrollments, totalResults] = await Promise.all([
    Enrollment.find(filter)
      .populate({
        path: 'course',
        select: 'title slug thumbnail instructor duration',
        populate: {
          path: 'instructor',
          select: 'firstName lastName',
        },
      })
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limit),
    Enrollment.countDocuments(filter),
  ]);
  
  const pagination = getPaginationResult(page, limit, totalResults);
  
  return { enrollments, pagination };
};

/**
 * Get enrollment by ID
 * @param {string} enrollmentId - Enrollment ID
 * @returns {Promise<Enrollment>}
 */
const getEnrollmentById = async (enrollmentId) => {
  const enrollment = await Enrollment.findById(enrollmentId)
    .populate('student', 'firstName lastName email avatar')
    .populate({
      path: 'course',
      populate: [
        { path: 'instructor', select: 'firstName lastName' },
        { path: 'modules', populate: { path: 'lessons' } },
      ],
    });
  
  if (!enrollment) {
    throw ApiError.notFound('Enrollment not found');
  }
  
  return enrollment;
};

/**
 * Enroll student in a course
 * @param {string} studentId - Student ID
 * @param {string} courseId - Course ID
 * @param {Object} paymentData - Payment data (optional)
 * @returns {Promise<Enrollment>}
 */
const enrollInCourse = async (studentId, courseId, paymentData = {}) => {
  const course = await Course.findById(courseId);
  
  if (!course) {
    throw ApiError.notFound('Course not found');
  }
  
  if (!course.isPublished) {
    throw ApiError.badRequest('Course is not available for enrollment');
  }
  
  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  });
  
  if (existingEnrollment) {
    if (existingEnrollment.status === 'active' || existingEnrollment.status === 'completed') {
      throw ApiError.conflict('Already enrolled in this course');
    }
    
    // Reactivate cancelled enrollment
    existingEnrollment.status = 'active';
    existingEnrollment.enrolledAt = new Date();
    await existingEnrollment.save();
    return existingEnrollment;
  }
  
  // Get total lessons count
  const totalLessons = await Lesson.countDocuments({
    course: courseId,
    isPublished: true,
  });
  
  // Create enrollment
  const enrollment = await Enrollment.create({
    student: studentId,
    course: courseId,
    progress: {
      totalLessons,
    },
    payment: {
      amount: course.discountPrice || course.price,
      method: course.price === 0 ? 'free' : paymentData.paymentMethod,
      transactionId: paymentData.transactionId,
      paidAt: new Date(),
    },
  });
  
  return enrollment.populate([
    { path: 'student', select: 'firstName lastName email' },
    { path: 'course', select: 'title slug thumbnail' },
  ]);
};

/**
 * Update enrollment status
 * @param {string} enrollmentId - Enrollment ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Enrollment>}
 */
const updateEnrollment = async (enrollmentId, updateData) => {
  const enrollment = await Enrollment.findById(enrollmentId);
  
  if (!enrollment) {
    throw ApiError.notFound('Enrollment not found');
  }
  
  Object.assign(enrollment, updateData);
  await enrollment.save();
  
  return enrollment;
};

/**
 * Cancel enrollment
 * @param {string} enrollmentId - Enrollment ID
 * @param {string} studentId - Student ID
 * @returns {Promise<void>}
 */
const cancelEnrollment = async (enrollmentId, studentId) => {
  const enrollment = await Enrollment.findById(enrollmentId);
  
  if (!enrollment) {
    throw ApiError.notFound('Enrollment not found');
  }
  
  // Check ownership
  if (enrollment.student.toString() !== studentId) {
    throw ApiError.forbidden('You do not have permission to cancel this enrollment');
  }
  
  if (enrollment.status === 'cancelled') {
    throw ApiError.badRequest('Enrollment is already cancelled');
  }
  
  enrollment.status = 'cancelled';
  await enrollment.save();
  
  // Decrement course enrollment count
  await Course.findByIdAndUpdate(enrollment.course, {
    $inc: { enrollmentCount: -1 },
  });
};

/**
 * Check if student has access to a course
 * @param {string} studentId - Student ID
 * @param {string} courseId - Course ID
 * @returns {Promise<boolean>}
 */
const hasAccess = async (studentId, courseId) => {
  return Enrollment.isEnrolled(studentId, courseId);
};

/**
 * Get enrollment statistics
 * @returns {Promise<Object>}
 */
const getStatistics = async () => {
  const [totalEnrollments, statusStats, recentEnrollments] = await Promise.all([
    Enrollment.countDocuments(),
    Enrollment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Enrollment.countDocuments({
      enrolledAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }),
  ]);
  
  const byStatus = {};
  statusStats.forEach((stat) => {
    byStatus[stat._id] = stat.count;
  });
  
  return {
    total: totalEnrollments,
    last30Days: recentEnrollments,
    byStatus,
  };
};

module.exports = {
  getEnrollments,
  getStudentEnrollments,
  getEnrollmentById,
  enrollInCourse,
  updateEnrollment,
  cancelEnrollment,
  hasAccess,
  getStatistics,
};
