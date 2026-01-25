/**
 * Custom API Error class for consistent error handling
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message = 'Bad Request') {
    return new ApiError(400, message);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Not Found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflict') {
    return new ApiError(409, message);
  }

  static unprocessable(message = 'Unprocessable Entity') {
    return new ApiError(422, message);
  }

  static tooManyRequests(message = 'Too Many Requests') {
    return new ApiError(429, message);
  }

  static internal(message = 'Internal Server Error') {
    return new ApiError(500, message, false);
  }

  // Payment specific errors
  static insufficientBalance(message = 'Insufficient balance') {
    return new ApiError(400, message);
  }

  static transactionFailed(message = 'Transaction failed') {
    return new ApiError(400, message);
  }

  static duplicateTransaction(message = 'Duplicate transaction detected') {
    return new ApiError(409, message);
  }
}

module.exports = ApiError;
