const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

/**
 * Authenticate user using JWT token
 */
const authenticate = catchAsync(async (req, res, next) => {
  // Get token from header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    throw ApiError.unauthorized('Access token is required');
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Check if user still exists
    const user = await User.findById(decoded.sub);
    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }
    
    // Check if user is active
    if (!user.isActive) {
      throw ApiError.unauthorized('User account is deactivated');
    }
    
    // Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      throw ApiError.unauthorized('Password recently changed. Please login again');
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token has expired');
    }
    throw error;
  }
});

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.sub);
    
    if (user && user.isActive) {
      req.user = user;
    }
  } catch (error) {
    // Silently fail - user just won't be authenticated
  }
  
  next();
});

/**
 * Restrict access to specific roles
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }
    
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to perform this action');
    }
    
    next();
  };
};

/**
 * Check if user is admin
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }
  
  if (req.user.role !== 'admin') {
    throw ApiError.forbidden('Admin access required');
  }
  
  next();
};

/**
 * Check if user is instructor or admin
 */
const isInstructorOrAdmin = (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }
  
  if (!['instructor', 'admin'].includes(req.user.role)) {
    throw ApiError.forbidden('Instructor or admin access required');
  }
  
  next();
};

/**
 * Check if user owns the resource or is admin
 * @param {string} userIdField - Field name containing user ID in params
 */
const isOwnerOrAdmin = (userIdField = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }
    
    const resourceUserId = req.params[userIdField];
    const isOwner = req.user._id.toString() === resourceUserId;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have permission to access this resource');
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  isAdmin,
  isInstructorOrAdmin,
  isOwnerOrAdmin,
};
