/**
 * Standardized API Response Helpers
 * Ensures consistent response format across all endpoints
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const success = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a created response (201)
 */
const created = (res, data = null, message = 'Resource created successfully') => {
  return success(res, data, message, 201);
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} errorCode - Application error code
 * @param {Array} errors - Validation errors
 */
const error = (res, message = 'An error occurred', statusCode = 500, errorCode = null, errors = null) => {
  const response = {
    success: false,
    error: {
      message,
      status: statusCode,
    },
  };

  if (errorCode) {
    response.error.code = errorCode;
  }

  if (errors && errors.length > 0) {
    response.error.details = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a paginated response
 */
const paginated = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1,
    },
  });
};

module.exports = {
  success,
  created,
  error,
  paginated,
};
