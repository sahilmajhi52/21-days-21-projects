/**
 * Standardized API Response class
 */
class ApiResponse {
  /**
   * Create a success response
   * @param {Object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Success message
   * @param {*} data - Response data
   * @param {Object} meta - Additional metadata (pagination, etc.)
   */
  static success(res, statusCode = 200, message = 'Success', data = null, meta = null) {
    const response = {
      success: true,
      message,
    };
    
    if (data !== null) {
      response.data = data;
    }
    
    if (meta !== null) {
      response.meta = meta;
    }
    
    return res.status(statusCode).json(response);
  }

  /**
   * Create an error response
   * @param {Object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {*} errors - Validation errors or additional error details
   */
  static error(res, statusCode = 500, message = 'Error', errors = null) {
    const response = {
      success: false,
      message,
    };
    
    if (errors !== null) {
      response.errors = errors;
    }
    
    return res.status(statusCode).json(response);
  }

  /**
   * Create a paginated response
   * @param {Object} res - Express response object
   * @param {*} data - Response data
   * @param {Object} pagination - Pagination info
   * @param {string} message - Success message
   */
  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      meta: {
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          totalPages: pagination.totalPages,
          totalResults: pagination.totalResults,
          hasNextPage: pagination.page < pagination.totalPages,
          hasPrevPage: pagination.page > 1,
        },
      },
    });
  }
}

module.exports = ApiResponse;
