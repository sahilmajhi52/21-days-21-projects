/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

const AppError = require('../utils/AppError');
const config = require('../config');

/**
 * Handle 404 Not Found errors
 */
const notFound = (req, res, next) => {
  next(AppError.notFound(`Route ${req.originalUrl} not found`));
};

/**
 * Handle Prisma-specific errors
 */
const handlePrismaError = (error) => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target?.[0] || 'field';
      return AppError.conflict(`A record with this ${field} already exists`, 'DUPLICATE_ENTRY');

    case 'P2025':
      // Record not found
      return AppError.notFound('Record not found', 'RECORD_NOT_FOUND');

    case 'P2003':
      // Foreign key constraint
      return AppError.badRequest('Related record not found', 'FOREIGN_KEY_ERROR');

    case 'P2014':
      // Required relation violation
      return AppError.badRequest('Required relation missing', 'RELATION_ERROR');

    default:
      return AppError.internal('Database error occurred', 'DATABASE_ERROR');
  }
};

/**
 * Handle JWT-specific errors
 */
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return AppError.unauthorized('Invalid token', 'INVALID_TOKEN');
  }
  if (error.name === 'TokenExpiredError') {
    return AppError.unauthorized('Token has expired', 'TOKEN_EXPIRED');
  }
  return error;
};

/**
 * Handle validation errors
 */
const handleValidationError = (error) => {
  if (error.array && typeof error.array === 'function') {
    const errors = error.array();
    return AppError.badRequest('Validation failed', 'VALIDATION_ERROR');
  }
  return error;
};

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log error in development
  if (config.env === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
    });
  }

  // Handle specific error types
  if (err.code?.startsWith('P')) {
    // Prisma errors start with 'P'
    error = handlePrismaError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError(err);
  } else if (!error.isOperational) {
    // Unknown errors - don't leak details in production
    error = config.env === 'production'
      ? AppError.internal('An unexpected error occurred')
      : AppError.internal(err.message);
  }

  // Send error response
  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    error: {
      message: error.message || 'Internal server error',
      code: error.errorCode || 'INTERNAL_ERROR',
      status: statusCode,
    },
  };

  // Include stack trace in development
  if (config.env === 'development' && err.stack) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  notFound,
  errorHandler,
};
