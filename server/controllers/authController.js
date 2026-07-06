/**
 * controllers/authController.js — Authentication controllers
 *
 * Handlers:
 *  - signup: Register a new user
 *  - login: Authenticate user & return token
 *  - getMe: Get current user profile (requires auth middleware)
 */

const User = require('../models/User');
const asyncHandler = require('../middleware/errorHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json(errorResponse('Please enter all fields (name, email, password)'));
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json(errorResponse('User already exists with this email'));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password, // Will be hashed via pre-save hook in User model
  });

  // Generate JWT token
  const token = user.generateToken();

  // Exclude password from the returned user object
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: user.profile,
    streak: user.streak,
    stats: user.stats,
    createdAt: user.createdAt,
  };

  res.status(201).json(successResponse({ token, user: userResponse }, 'Registration successful'));
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate fields
  if (!email || !password) {
    return res.status(400).json(errorResponse('Please provide email and password'));
  }

  // Check for user (must explicitly select password since select: false in model)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json(errorResponse('Invalid credentials'));
  }

  // Check password match
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json(errorResponse('Invalid credentials'));
  }

  // Generate JWT token
  const token = user.generateToken();

  // Exclude password from response
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: user.profile,
    streak: user.streak,
    stats: user.stats,
    createdAt: user.createdAt,
  };

  res.status(200).json(successResponse({ token, user: userResponse }, 'Login successful'));
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private (Protected by JWT)
exports.getMe = asyncHandler(async (req, res, next) => {
  // req.user is set by the protect middleware
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json(errorResponse('User not found'));
  }

  res.status(200).json(successResponse(user, 'User profile fetched successfully'));
});
