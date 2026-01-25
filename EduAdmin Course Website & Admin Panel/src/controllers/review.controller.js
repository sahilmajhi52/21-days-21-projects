const { reviewService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Get reviews for a course
 */
const getReviews = catchAsync(async (req, res) => {
  const { reviews, pagination, ratingBreakdown } = await reviewService.getReviews(
    req.params.courseId,
    req.query
  );
  
  ApiResponse.paginated(res, reviews, pagination, 'Reviews retrieved successfully');
  
  // Add rating breakdown to response
  res.json({
    success: true,
    message: 'Reviews retrieved successfully',
    data: reviews,
    ratingBreakdown,
    meta: {
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
        totalResults: pagination.totalResults,
        hasNextPage: pagination.page < pagination.totalPages,
        hasPrevPage: pagination.page > 1,
      },
    },
  });
});

/**
 * Get review by ID
 */
const getReview = catchAsync(async (req, res) => {
  const review = await reviewService.getReviewById(req.params.reviewId);
  
  ApiResponse.success(res, 200, 'Review retrieved successfully', { review });
});

/**
 * Create review
 */
const createReview = catchAsync(async (req, res) => {
  const review = await reviewService.createReview(
    req.user._id,
    req.params.courseId,
    req.body
  );
  
  ApiResponse.success(res, 201, 'Review created successfully', { review });
});

/**
 * Update review
 */
const updateReview = catchAsync(async (req, res) => {
  const review = await reviewService.updateReview(
    req.params.reviewId,
    req.user._id,
    req.body
  );
  
  ApiResponse.success(res, 200, 'Review updated successfully', { review });
});

/**
 * Delete review
 */
const deleteReview = catchAsync(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  await reviewService.deleteReview(req.params.reviewId, req.user._id, isAdmin);
  
  ApiResponse.success(res, 200, 'Review deleted successfully');
});

/**
 * Approve review (admin)
 */
const approveReview = catchAsync(async (req, res) => {
  const review = await reviewService.approveReview(req.params.reviewId, true);
  
  ApiResponse.success(res, 200, 'Review approved successfully', { review });
});

/**
 * Reject review (admin)
 */
const rejectReview = catchAsync(async (req, res) => {
  const review = await reviewService.approveReview(req.params.reviewId, false);
  
  ApiResponse.success(res, 200, 'Review rejected successfully', { review });
});

/**
 * Respond to review (instructor)
 */
const respondToReview = catchAsync(async (req, res) => {
  const review = await reviewService.respondToReview(
    req.params.reviewId,
    req.user._id,
    req.body.content
  );
  
  ApiResponse.success(res, 200, 'Response added successfully', { review });
});

module.exports = {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  approveReview,
  rejectReview,
  respondToReview,
};
