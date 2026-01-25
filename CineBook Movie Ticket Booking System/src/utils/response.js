/**
 * Standardized API Response Helpers
 */

const success = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

const created = (res, data = null, message = 'Created successfully') => {
  return success(res, data, message, 201);
};

const error = (res, message = 'Error', statusCode = 500, errorCode = null, errors = null) => {
  const response = {
    success: false,
    error: { message, status: statusCode },
  };
  if (errorCode) response.error.code = errorCode;
  if (errors) response.error.details = errors;
  return res.status(statusCode).json(response);
};

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

module.exports = { success, created, error, paginated };
