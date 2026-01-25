/**
 * Auth Controller
 */

const authService = require('../services/auth.service');
const { success, created } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return created(res, result, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return success(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);
    return success(res, tokens, 'Token refreshed');
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    return success(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.userId);
    return success(res, { user }, 'Profile retrieved');
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.userId, currentPassword, newPassword);
    return success(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, bio, avatar, email, password, confirmPassword } = req.body;
    await authService.updateProfile(req.user.userId, firstName, lastName, bio, avatar, email, password, confirmPassword );
    return success(res, null, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    return success(res, null, 'Password reset email sent');
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    return success(res, null, 'Password reset successfully');
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    await authService.verifyEmail(token);
    return success(res, null, 'Email verified successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refreshToken, logout, getProfile, changePassword, updateProfile, forgotPassword, resetPassword };
