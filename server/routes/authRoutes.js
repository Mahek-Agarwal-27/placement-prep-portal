/**
 * routes/authRoutes.js — Routing rules for user authentication
 *
 * Paths:
 *  - POST /api/auth/signup -> Register a user
 *  - POST /api/auth/login  -> Authentication
 *  - GET  /api/auth/me     -> Current user's profile (requires JWT)
 */

const express = require('express');
const router  = express.Router();
const { signup, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Define API paths and route handlers
router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
