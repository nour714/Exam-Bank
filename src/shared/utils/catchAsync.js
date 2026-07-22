/**
 * Wraps async Express controller functions to automatically catch rejected promises
 * and forward errors to Express's next() error handling middleware.
 *
 * @param {Function} fn - Async Express middleware/controller function
 * @returns {Function} Express middleware handler
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
