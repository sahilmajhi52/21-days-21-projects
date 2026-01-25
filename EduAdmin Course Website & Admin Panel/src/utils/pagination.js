/**
 * Build pagination object from query parameters
 * @param {Object} query - Express request query object
 * @returns {Object} Pagination configuration
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

/**
 * Build pagination result object
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} totalResults - Total number of results
 * @returns {Object} Pagination result object
 */
const getPaginationResult = (page, limit, totalResults) => {
  const totalPages = Math.ceil(totalResults / limit);
  
  return {
    page,
    limit,
    totalPages,
    totalResults,
  };
};

/**
 * Parse sort query parameter
 * @param {string} sortQuery - Sort query string (e.g., '-createdAt,title')
 * @param {Array} allowedFields - Array of allowed sort fields
 * @returns {Object} Mongoose sort object
 */
const getSort = (sortQuery, allowedFields = []) => {
  if (!sortQuery) {
    return { createdAt: -1 }; // Default sort by newest first
  }
  
  const sortObj = {};
  const fields = sortQuery.split(',');
  
  fields.forEach((field) => {
    const isDesc = field.startsWith('-');
    const fieldName = isDesc ? field.substring(1) : field;
    
    // Only allow sorting by specified fields (if provided)
    if (allowedFields.length === 0 || allowedFields.includes(fieldName)) {
      sortObj[fieldName] = isDesc ? -1 : 1;
    }
  });
  
  return Object.keys(sortObj).length > 0 ? sortObj : { createdAt: -1 };
};

/**
 * Parse filter query parameters
 * @param {Object} query - Express request query object
 * @param {Array} allowedFields - Array of allowed filter fields
 * @returns {Object} Mongoose filter object
 */
const getFilters = (query, allowedFields = []) => {
  const filters = {};
  
  allowedFields.forEach((field) => {
    if (query[field] !== undefined && query[field] !== '') {
      // Handle special operators
      if (typeof query[field] === 'object') {
        filters[field] = {};
        if (query[field].gte) filters[field].$gte = query[field].gte;
        if (query[field].lte) filters[field].$lte = query[field].lte;
        if (query[field].gt) filters[field].$gt = query[field].gt;
        if (query[field].lt) filters[field].$lt = query[field].lt;
      } else {
        filters[field] = query[field];
      }
    }
  });
  
  return filters;
};

module.exports = {
  getPagination,
  getPaginationResult,
  getSort,
  getFilters,
};
