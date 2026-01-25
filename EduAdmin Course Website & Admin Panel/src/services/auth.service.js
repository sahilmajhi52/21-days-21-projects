const { User } = require('../models');
const tokenService = require('./token.service');
const ApiError = require('../utils/ApiError');

/**
 * Register a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} User and tokens
 */
const register = async (userData) => {
  if (await User.isEmailTaken(userData.email)) {
    throw ApiError.conflict('Email already taken');
  }
  
  const user = await User.create(userData);
  const tokens = tokenService.generateAuthTokens(user._id);
  
  // Save refresh token
  user.refreshToken = tokens.refresh.token;
  await user.save();
  
  return { user, tokens };
};

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User and tokens
 */
const login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password +refreshToken');
  
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  
  if (!user.isActive) {
    throw ApiError.unauthorized('Account is deactivated');
  }
  
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  
  const tokens = tokenService.generateAuthTokens(user._id);
  
  // Update refresh token and last login
  user.refreshToken = tokens.refresh.token;
  user.lastLogin = new Date();
  await user.save();
  
  // Remove password from response
  user.password = undefined;
  user.refreshToken = undefined;
  
  return { user, tokens };
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New tokens
 */
const refreshAuth = async (refreshToken) => {
  try {
    const decoded = tokenService.verifyRefreshToken(refreshToken);
    
    const user = await User.findById(decoded.sub).select('+refreshToken');
    
    if (!user || user.refreshToken !== refreshToken) {
      throw ApiError.unauthorized('Invalid refresh token');
    }
    
    if (!user.isActive) {
      throw ApiError.unauthorized('Account is deactivated');
    }
    
    const tokens = tokenService.generateAuthTokens(user._id);
    
    // Update refresh token
    user.refreshToken = tokens.refresh.token;
    await user.save();
    
    return tokens;
  } catch (error) {
    throw ApiError.unauthorized('Please authenticate');
  }
};

/**
 * Logout
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<void>}
 */
const logout = async (refreshToken) => {
  try {
    const decoded = tokenService.verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.sub).select('+refreshToken');
    
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  } catch (error) {
    // Silently handle - token might be expired
  }
};

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw ApiError.badRequest('Current password is incorrect');
  }
  
  user.password = newPassword;
  user.refreshToken = null; // Invalidate all sessions
  await user.save();
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<User>}
 */
const updateProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  
  Object.assign(user, updateData);
  await user.save();
  
  return user;
};

module.exports = {
  register,
  login,
  refreshAuth,
  logout,
  changePassword,
  updateProfile,
};
