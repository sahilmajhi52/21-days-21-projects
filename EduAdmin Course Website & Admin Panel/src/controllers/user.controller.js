const { userService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Get all users (admin)
 */
const getUsers = catchAsync(async (req, res) => {
  const { users, pagination } = await userService.getUsers(req.query);
  
  ApiResponse.paginated(res, users, pagination, 'Users retrieved successfully');
});

/**
 * Get user by ID
 */
const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  
  ApiResponse.success(res, 200, 'User retrieved successfully', { user });
});

/**
 * Create a new user (admin)
 */
const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  
  ApiResponse.success(res, 201, 'User created successfully', { user });
});

/**
 * Update user (admin)
 */
const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUser(req.params.userId, req.body);
  
  ApiResponse.success(res, 200, 'User updated successfully', { user });
});

/**
 * Delete user (admin)
 */
const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUser(req.params.userId);
  
  ApiResponse.success(res, 200, 'User deleted successfully');
});

/**
 * Get user statistics (admin)
 */
const getStatistics = catchAsync(async (req, res) => {
  const stats = await userService.getStatistics();
  
  ApiResponse.success(res, 200, 'Statistics retrieved successfully', { stats });
});

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getStatistics,
};
