/**
 * Authentication Middleware
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/AppError');

/**
 * Authenticate user via JWT
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Access token required', 'TOKEN_REQUIRED');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.accessSecret);

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      next(AppError.unauthorized('Token expired', 'TOKEN_EXPIRED'));
    } else if (error.name === 'JsonWebTokenError') {
      next(AppError.unauthorized('Invalid token', 'INVALID_TOKEN'));
    } else {
      next(error);
    }
  }
};

/**
 * Optional authentication
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      req.user = jwt.verify(token, config.jwt.accessSecret);
    }
    next();
  } catch {
    next();
  }
};

/**
 * Require specific role
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required', 'AUTH_REQUIRED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden('Insufficient permissions', 'FORBIDDEN'));
    }

    next();
  };
};

/**
 * Admin only
 */
const adminOnly = requireRole('ADMIN');

/**
 * Admin or Theater Owner
 */
const adminOrOwner = requireRole('ADMIN', 'THEATER_OWNER');

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
  adminOnly,
  adminOrOwner,
};
