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
const { signup, login, getMe, updateProfile, changePassword, updateSettings, deleteAccount, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Define API paths and route handlers
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/settings', protect, updateSettings);
router.delete('/account', protect, deleteAccount);

module.exports = router;
