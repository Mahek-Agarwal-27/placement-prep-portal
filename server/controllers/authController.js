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

  // Log login activity
  const Activity = require('../models/Activity');
  Activity.create({
    user: user._id,
    type: 'login',
    title: 'User Signed In',
    description: 'Active session started.',
  }).catch(() => {});

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

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private (Protected by JWT)
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json(errorResponse('User not found'));
  }

  const { name, avatar, college, branch, graduationYear, skills, bio, linkedIn, github } = req.body;

  if (name !== undefined) user.name = name;
  if (avatar !== undefined) user.avatar = avatar;

  if (user.profile) {
    if (college !== undefined) user.profile.college = college;
    if (branch !== undefined) user.profile.branch = branch;
    if (graduationYear !== undefined) user.profile.graduationYear = graduationYear;
    if (bio !== undefined) user.profile.bio = bio;
    if (linkedIn !== undefined) user.profile.linkedIn = linkedIn;
    if (github !== undefined) user.profile.github = github;
    
    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        user.profile.skills = skills;
      } else if (typeof skills === 'string') {
        user.profile.skills = skills.split(',').map(s => s.trim()).filter(s => s !== '');
      }
    }
  }

  await user.save();

  // Update placement goals if provided
  const { placementGoal, notifications, themePreference } = req.body;
  if (placementGoal) {
    if (placementGoal.targetRole !== undefined) user.placementGoal.targetRole = placementGoal.targetRole;
    if (placementGoal.targetCompanies !== undefined) user.placementGoal.targetCompanies = placementGoal.targetCompanies;
    if (placementGoal.prepLevel !== undefined) user.placementGoal.prepLevel = placementGoal.prepLevel;
  }
  if (notifications) {
    if (notifications.dsaReminders !== undefined) user.notifications.dsaReminders = notifications.dsaReminders;
    if (notifications.weeklyReport !== undefined) user.notifications.weeklyReport = notifications.weeklyReport;
    if (notifications.aiSuggestions !== undefined) user.notifications.aiSuggestions = notifications.aiSuggestions;
    if (notifications.emailNotifications !== undefined) user.notifications.emailNotifications = notifications.emailNotifications;
  }
  if (themePreference !== undefined) user.themePreference = themePreference;

  await user.save();

  res.status(200).json(successResponse(user, 'Profile updated successfully'));
});

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json(errorResponse('Please provide current and new password'));
  }

  if (newPassword.length < 6) {
    return res.status(400).json(errorResponse('New password must be at least 6 characters'));
  }

  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return res.status(404).json(errorResponse('User not found'));
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json(errorResponse('Incorrect current password'));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json(successResponse(null, 'Password updated successfully'));
});

// @desc    Update settings (notifications, theme, goals)
// @route   PUT /api/auth/settings
// @access  Private
exports.updateSettings = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json(errorResponse('User not found'));
  }

  const { notifications, themePreference, placementGoal } = req.body;
  if (notifications) {
    user.notifications = { ...user.notifications.toObject(), ...notifications };
  }
  if (themePreference) {
    user.themePreference = themePreference;
  }
  if (placementGoal) {
    user.placementGoal = { ...user.placementGoal.toObject(), ...placementGoal };
  }

  await user.save();
  res.status(200).json(successResponse(user, 'Settings updated successfully'));
});

// @desc    Delete user account & all linked records
// @route   DELETE /api/auth/account
// @access  Private
exports.deleteAccount = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(errorResponse('User not found'));
  }

  // Delete all user related documents across collections
  const Question = require('../models/Question');
  const Task = require('../models/Task');
  const Resume = require('../models/Resume');
  const Note = require('../models/Note');
  const Interview = require('../models/Interview');
  const AIHistory = require('../models/AIHistory');
  const Activity = require('../models/Activity');

  await Promise.all([
    Question.deleteMany({ user: userId }),
    Task.deleteMany({ user: userId }),
    Resume.deleteMany({ user: userId }),
    Note.deleteMany({ user: userId }),
    Interview.deleteMany({ user: userId }),
    AIHistory.deleteMany({ user: userId }),
    Activity.deleteMany({ user: userId }),
    User.deleteOne({ _id: userId }),
  ]);

  res.status(200).json(successResponse(null, 'Account and all data permanently deleted.'));
});

// @desc    Forgot Password — Send reset password token email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json(errorResponse('Please provide a registered email address.'));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json(errorResponse('User not found.'));
  }

  // Get reset token & save hashed version + expiry to DB
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Construct reset URL for client
  const clientHost = req.headers.origin || 'http://localhost:5173';
  const resetUrl = `${clientHost}/reset-password/${resetToken}`;

  const sendEmail = require('../utils/sendEmail');
  const mailResult = await sendEmail({
    email: user.email,
    subject: 'Reset Your HireNovaAI Password',
    message: `You requested a password reset. Click this link to reset your password: ${resetUrl}`,
    resetUrl,
  });

  const msg = mailResult.sent 
    ? 'Password reset link sent to your email.' 
    : 'Reset link generated! Click below to reset your password (or configure SMTP in .env for real emails).';

  res.status(200).json(successResponse({ resetUrl: mailResult.devMode ? resetUrl : null }, msg));
});

// @desc    Reset Password — Validate token and set new password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const crypto = require('crypto');

  // Hash raw token from URL param
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json(errorResponse('Invalid or expired reset password token.'));
  }

  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json(errorResponse('Password must be at least 6 characters long.'));
  }

  // Set new password (pre-save hook in User.js automatically hashes it)
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json(successResponse(null, 'Password reset successfully. Please login again.'));
});


