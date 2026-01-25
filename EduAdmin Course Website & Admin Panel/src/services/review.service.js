const { Review, Course, Enrollment } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationResult, getSort } = require('../utils/pagination');

/**
 * Get reviews for a course
 * @param {string} courseId - Course ID
 * @param {Object} query - Query parameters
 * @returns {Promise<Object>}
 */
const getReviews = async (courseId, query) => {
  const { page, limit, skip } = getPagination(query);
  const sort = getSort(query.sort, ['createdAt', 'rating', 'helpfulCount']);
  
  const filter = { course: courseId };
  
  // Non-admin only see approved reviews
  if (query.isApproved !== undefined) {
    filter.isApproved = query.isApproved;
  } else {
    filter.isApproved = true;
  }
  
  if (query.rating) {
    filter.rating = query.rating;
  }
  
  const [reviews, totalResults] = await Promise.all([
    Review.find(filter)
      .populate('student', 'firstName lastName avatar')
      .populate('response.respondedBy', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter),
  ]);
  
  const pagination = getPaginationResult(page, limit, totalResults);
  
  // Calculate rating breakdown
  const ratingBreakdown = await Review.aggregate([
    { $match: { course: courseId, isApproved: true } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);
  
  const breakdown = {};
  for (let i = 5; i >= 1; i--) {
    const found = ratingBreakdown.find((r) => r._id === i);
    breakdown[i] = found ? found.count : 0;
  }
  
  return { reviews, pagination, ratingBreakdown: breakdown };
};

/**
 * Get review by ID
 * @param {string} reviewId - Review ID
 * @returns {Promise<Review>}
 */
const getReviewById = async (reviewId) => {
  const review = await Review.findById(reviewId)
    .populate('student', 'firstName lastName avatar')
    .populate('response.respondedBy', 'firstName lastName');
  
  if (!review) {
    throw ApiError.notFound('Review not found');
  }
  
  return review;
};

/**
 * Create a review
 * @param {string} studentId - Student ID
 * @param {string} courseId - Course ID
 * @param {Object} reviewData - Review data
 * @returns {Promise<Review>}
 */
const createReview = async (studentId, courseId, reviewData) => {
  const course = await Course.findById(courseId);
  
  if (!course) {
    throw ApiError.notFound('Course not found');
  }
  
  // Check if student is enrolled and has made progress
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: { $in: ['active', 'completed'] },
  });
  
  if (!enrollment) {
    throw ApiError.forbidden('You must be enrolled to review this course');
  }
  
  // Check for existing review
  const existingReview = await Review.findOne({
    student: studentId,
    course: courseId,
  });
  
  if (existingReview) {
    throw ApiError.conflict('You have already reviewed this course');
  }
  
  const review = await Review.create({
    ...reviewData,
    student: studentId,
    course: courseId,
    isApproved: true, // Auto-approve for now, can be changed to false for moderation
  });
  
  return review.populate('student', 'firstName lastName avatar');
};

/**
 * Update review
 * @param {string} reviewId - Review ID
 * @param {string} studentId - Student ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Review>}
 */
const updateReview = async (reviewId, studentId, updateData) => {
  const review = await Review.findById(reviewId);
  
  if (!review) {
    throw ApiError.notFound('Review not found');
  }
  
  if (review.student.toString() !== studentId) {
    throw ApiError.forbidden('You can only update your own review');
  }
  
  Object.assign(review, updateData);
  await review.save();
  
  // Update course rating if rating changed
  if (updateData.rating) {
    const course = await Course.findById(review.course);
    if (course) {
      await course.updateRating();
    }
  }
  
  return review.populate('student', 'firstName lastName avatar');
};

/**
 * Delete review
 * @param {string} reviewId - Review ID
 * @param {string} userId - User ID
 * @param {boolean} isAdmin - Is user admin
 * @returns {Promise<void>}
 */
const deleteReview = async (reviewId, userId, isAdmin = false) => {
  const review = await Review.findById(reviewId);
  
  if (!review) {
    throw ApiError.notFound('Review not found');
  }
  
  if (!isAdmin && review.student.toString() !== userId) {
    throw ApiError.forbidden('You can only delete your own review');
  }
  
  const courseId = review.course;
  await review.deleteOne();
  
  // Update course rating
  const course = await Course.findById(courseId);
  if (course) {
    await course.updateRating();
  }
};

/**
 * Approve/reject review (admin)
 * @param {string} reviewId - Review ID
 * @param {boolean} approve - Approve or reject
 * @returns {Promise<Review>}
 */
const approveReview = async (reviewId, approve) => {
  const review = await Review.findById(reviewId);
  
  if (!review) {
    throw ApiError.notFound('Review not found');
  }
  
  review.isApproved = approve;
  await review.save();
  
  // Update course rating
  const course = await Course.findById(review.course);
  if (course) {
    await course.updateRating();
  }
  
  return review;
};

/**
 * Add instructor response to review
 * @param {string} reviewId - Review ID
 * @param {string} instructorId - Instructor ID
 * @param {string} content - Response content
 * @returns {Promise<Review>}
 */
const respondToReview = async (reviewId, instructorId, content) => {
  const review = await Review.findById(reviewId).populate('course', 'instructor');
  
  if (!review) {
    throw ApiError.notFound('Review not found');
  }
  
  // Check if user is the course instructor
  if (review.course.instructor.toString() !== instructorId) {
    throw ApiError.forbidden('Only the course instructor can respond to reviews');
  }
  
  review.response = {
    content,
    respondedBy: instructorId,
    respondedAt: new Date(),
  };
  
  await review.save();
  
  return review.populate([
    { path: 'student', select: 'firstName lastName avatar' },
    { path: 'response.respondedBy', select: 'firstName lastName' },
  ]);
};

module.exports = {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  approveReview,
  respondToReview,
};
