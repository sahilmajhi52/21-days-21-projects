const { authService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Register a new user
 */
const register = catchAsync(async (req, res) => {
  const { user, tokens } = await authService.register(req.body);
  
  ApiResponse.success(res, 201, 'Registration successful', {
    user,
    tokens,
  });
});

/**
 * Login with email and password
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, tokens } = await authService.login(email, password);
  
  ApiResponse.success(res, 200, 'Login successful', {
    user,
    tokens,
  });
});

/**
 * Refresh authentication tokens
 */
const refreshTokens = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshAuth(refreshToken);
  
  ApiResponse.success(res, 200, 'Tokens refreshed successfully', { tokens });
});

/**
 * Logout
 */
const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  
  ApiResponse.success(res, 200, 'Logged out successfully');
});

/**
 * Get current user profile
 */
const getProfile = catchAsync(async (req, res) => {
  ApiResponse.success(res, 200, 'Profile retrieved successfully', {
    user: req.user,
  });
});

/**
 * Update current user profile
 */
const updateProfile = catchAsync(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  
  ApiResponse.success(res, 200, 'Profile updated successfully', { user });
});

/**
 * Change password
 */
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user._id, currentPassword, newPassword);
  
  ApiResponse.success(res, 200, 'Password changed successfully');
});

module.exports = {
  register,
  login,
  refreshTokens,
  logout,
  getProfile,
  updateProfile,
  changePassword,
};
