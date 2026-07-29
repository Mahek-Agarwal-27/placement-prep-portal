const AIHistory = require('../models/AIHistory');
const asyncHandler = require('../middleware/errorHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get user's AI history (notes, roadmaps, chats)
// @route   GET /api/ai-history
// @access  Private
exports.getAIHistory = asyncHandler(async (req, res) => {
  const history = await AIHistory.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json(successResponse(history, 'AI History retrieved successfully'));
});

// @desc    Add new AI history entry
// @route   POST /api/ai-history
// @access  Private
exports.addAIHistory = asyncHandler(async (req, res) => {
  const { category, title, content, duration, metadata } = req.body;

  if (!category || !title) {
    return res.status(400).json(errorResponse('Category and title are required.'));
  }

  const entry = await AIHistory.create({
    user: req.user.id,
    category,
    title,
    content: content || '',
    duration: duration || '',
    metadata: metadata || {},
  });

  res.status(201).json(successResponse(entry, 'AI History entry recorded'));
});

// @desc    Delete single AI history item
// @route   DELETE /api/ai-history/:id
// @access  Private
exports.deleteAIHistoryItem = asyncHandler(async (req, res) => {
  const item = await AIHistory.findOne({ _id: req.params.id, user: req.user.id });
  if (!item) {
    return res.status(404).json(errorResponse('History record not found'));
  }

  await item.deleteOne();
  res.status(200).json(successResponse(null, 'History record deleted'));
});

// @desc    Clear all AI history for user
// @route   DELETE /api/ai-history/clear-all
// @access  Private
exports.clearAllAIHistory = asyncHandler(async (req, res) => {
  await AIHistory.deleteMany({ user: req.user.id });
  res.status(200).json(successResponse(null, 'All AI history cleared'));
});
