/**
 * utils/apiResponse.js — Standardized API response helpers
 *
 * Usage:
 *   res.status(200).json(successResponse(data, 'User created'));
 *   res.status(400).json(errorResponse('Invalid email'));
 */

/**
 * Returns a consistent success response object.
 * @param {*}      data    - The payload to return
 * @param {string} message - Human-readable success message
 */
const successResponse = (data = null, message = 'Success') => ({
  success: true,
  message,
  data,
});

/**
 * Returns a consistent error response object.
 * @param {string} message - Human-readable error message
 * @param {*}      errors  - Optional validation errors array
 */
const errorResponse = (message = 'Something went wrong', errors = null) => ({
  success: false,
  message,
  ...(errors && { errors }),
});

module.exports = { successResponse, errorResponse };
