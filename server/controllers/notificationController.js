const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/errorHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(30);

  res.status(200).json(successResponse(notifications, 'Notifications fetched successfully'));
});

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user.id });
  if (!notification) {
    return res.status(404).json(errorResponse('Notification not found'));
  }

  notification.read = true;
  await notification.save();

  res.status(200).json(successResponse(notification, 'Notification marked as read'));
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user.id, read: false }, { $set: { read: true } });
  res.status(200).json(successResponse(null, 'All notifications marked as read'));
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user.id });
  if (!notification) {
    return res.status(404).json(errorResponse('Notification not found'));
  }

  await notification.deleteOne();
  res.status(200).json(successResponse(null, 'Notification deleted'));
});

// @desc    Clear all notifications for user
// @route   DELETE /api/notifications/clear-all
// @access  Private
exports.clearAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ user: req.user.id });
  res.status(200).json(successResponse(null, 'All notifications cleared successfully'));
});

