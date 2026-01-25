/**
 * Wrapper function to catch async errors in route handlers
 * Eliminates the need for try-catch blocks in every controller
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

module.exports = catchAsync;
