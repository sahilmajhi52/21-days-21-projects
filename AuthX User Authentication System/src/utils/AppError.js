/**
 * Custom Application Error Class
 * Provides structured error handling with HTTP status codes
 */

class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);

    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  // Factory methods for common errors
  static badRequest(message = 'Bad request', errorCode = 'BAD_REQUEST') {
    return new AppError(message, 400, errorCode);
  }

  static unauthorized(message = 'Unauthorized', errorCode = 'UNAUTHORIZED') {
    return new AppError(message, 401, errorCode);
  }

  static forbidden(message = 'Forbidden', errorCode = 'FORBIDDEN') {
    return new AppError(message, 403, errorCode);
  }

  static notFound(message = 'Resource not found', errorCode = 'NOT_FOUND') {
    return new AppError(message, 404, errorCode);
  }

  static conflict(message = 'Conflict', errorCode = 'CONFLICT') {
    return new AppError(message, 409, errorCode);
  }

  static tooManyRequests(message = 'Too many requests', errorCode = 'RATE_LIMITED') {
    return new AppError(message, 429, errorCode);
  }

  static internal(message = 'Internal server error', errorCode = 'INTERNAL_ERROR') {
    return new AppError(message, 500, errorCode);
  }

  toJSON() {
    return {
      success: false,
      error: {
        message: this.message,
        code: this.errorCode,
        status: this.statusCode,
      },
    };
  }
}

module.exports = AppError;
