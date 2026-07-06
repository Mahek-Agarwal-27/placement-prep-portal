/**
 * middleware/authMiddleware.js — JWT Authentication Guard
 *
 * Protects routes by verifying the Bearer token in the Authorization header.
 * Attaches the decoded user payload to req.user for downstream controllers.
 *
 * Will be fully implemented in Phase 2.
 */

const jwt      = require('jsonwebtoken');
const asyncHandler = require('./errorHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from Authorization header: "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    // Verify token with the JWT secret from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
  }
});

module.exports = { protect };
