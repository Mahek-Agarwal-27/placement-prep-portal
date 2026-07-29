const Activity = require('../models/Activity');
const asyncHandler = require('../middleware/errorHandler');
const { successResponse } = require('../utils/apiResponse');

// @desc    Get user's recent activity timeline
// @route   GET /api/activities
// @access  Private
exports.getActivities = asyncHandler(async (req, res) => {
  const activities = await Activity.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(20);
  
  res.status(200).json(successResponse(activities, 'Activities fetched successfully'));
});

// @desc    Log a new user activity (internal helper / route)
// @route   POST /api/activities
// @access  Private
exports.logActivity = asyncHandler(async (req, res) => {
  const { type, title, description } = req.body;

  const activity = await Activity.create({
    user: req.user.id,
    type: type || 'general',
    title: title || 'User Action',
    description: description || '',
  });

  res.status(201).json(successResponse(activity, 'Activity logged'));
});
