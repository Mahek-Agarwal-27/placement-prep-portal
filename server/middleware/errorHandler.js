/**
 * middleware/errorHandler.js — Global async error-handling middleware
 *
 * Wraps async route handlers so unhandled Promise rejections
 * are forwarded to Express's error handler instead of crashing.
 *
 * Usage in a controller:
 *   exports.getUser = asyncHandler(async (req, res) => {
 *     const user = await User.findById(req.params.id);
 *     res.json(successResponse(user));
 *   });
 */

/**
 * Higher-order function that wraps an async route handler.
 * @param {Function} fn - The async route handler
 * @returns {Function}    Express middleware with error forwarding
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
