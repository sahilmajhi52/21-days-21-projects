/**
 * Standardized API Response class
 */
class ApiResponse {
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

  // Payment specific responses
  static transactionSuccess(res, transaction, message = 'Transaction successful') {
    return res.status(200).json({
      success: true,
      message,
      data: {
        transactionId: transaction._id,
        referenceId: transaction.referenceId,
        amount: transaction.amount,
        status: transaction.status,
        timestamp: transaction.createdAt,
      },
    });
  }
}

module.exports = ApiResponse;
