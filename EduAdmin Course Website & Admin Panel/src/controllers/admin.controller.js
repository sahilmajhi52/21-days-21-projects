const { userService, courseService, enrollmentService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Get dashboard statistics
 */
const getDashboardStats = catchAsync(async (req, res) => {
  const [userStats, courseStats, enrollmentStats] = await Promise.all([
    userService.getStatistics(),
    courseService.getStatistics(),
    enrollmentService.getStatistics(),
  ]);
  
  ApiResponse.success(res, 200, 'Dashboard statistics retrieved successfully', {
    users: userStats,
    courses: courseStats,
    enrollments: enrollmentStats,
  });
});

module.exports = {
  getDashboardStats,
};
