/**
 * Authentication Controller
 * Handles authentication-related HTTP requests
 */

const authService = require('../services/auth.service');
const tokenService = require('../services/token.service');
const { success, created } = require('../utils/response');
const config = require('../config');

/**
 * Extract request metadata (IP, user agent)
 */
const getRequestMetadata = (req) => ({
  ipAddress: req.ip || req.connection?.remoteAddress,
  userAgent: req.headers['user-agent'],
});

/**
 * Set refresh token cookie
 */
const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: config.cookie.httpOnly,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    maxAge: config.cookie.maxAge,
    path: '/api/v1/auth',
  });
};

/**
 * Clear refresh token cookie
 */
const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: config.cookie.httpOnly,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    path: '/api/v1/auth',
  });
};

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { email, username, password, firstName, lastName } = req.body;
    const metadata = getRequestMetadata(req);

    const result = await authService.register(
      { email, username, password, firstName, lastName },
      metadata
    );

    // Set refresh token cookie
    setRefreshTokenCookie(res, result.tokens.refreshToken);

    return created(res, {
      user: result.user,
      accessToken: result.tokens.accessToken,
      expiresIn: result.tokens.expiresIn,
    }, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const metadata = getRequestMetadata(req);

    const result = await authService.login(
      { email, username, password },
      metadata
    );

    // Set refresh token cookie
    setRefreshTokenCookie(res, result.tokens.refreshToken);

    return success(res, {
      user: result.user,
      accessToken: result.tokens.accessToken,
      expiresIn: result.tokens.expiresIn,
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (revoke current refresh token)
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    const metadata = getRequestMetadata(req);

    await authService.logout(refreshToken, req.user.id, metadata);

    // Clear refresh token cookie
    clearRefreshTokenCookie(res);

    return success(res, null, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
const logoutAll = async (req, res, next) => {
  try {
    const metadata = getRequestMetadata(req);

    await authService.logoutAll(req.user.id, metadata);

    // Clear refresh token cookie
    clearRefreshTokenCookie(res);

    return success(res, null, 'Logged out from all devices');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public (with valid refresh token)
 */
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Refresh token is required',
          code: 'TOKEN_REQUIRED',
          status: 401,
        },
      });
    }

    const metadata = getRequestMetadata(req);
    const tokens = await authService.refreshToken(token, metadata);

    // Set new refresh token cookie
    setRefreshTokenCookie(res, tokens.refreshToken);

    return success(res, {
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
    }, 'Token refreshed successfully');
  } catch (error) {
    // Clear invalid cookie
    clearRefreshTokenCookie(res);
    next(error);
  }
};

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const metadata = getRequestMetadata(req);

    await authService.changePassword(
      req.user.id,
      currentPassword,
      newPassword,
      metadata
    );

    // Clear refresh token cookie (user needs to re-login)
    clearRefreshTokenCookie(res);

    return success(res, null, 'Password changed successfully. Please login again.');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    return success(res, { user }, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/auth/sessions
 * @desc    Get user's active refresh tokens
 * @access  Private
 */
const getActiveSessions = async (req, res, next) => {
  try {
    const tokens = await tokenService.getUserActiveTokens(req.user.id);
    return success(res, { sessions: tokens }, 'Active sessions retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  logoutAll,
  refreshToken,
  changePassword,
  getMe,
  getActiveSessions,
};
