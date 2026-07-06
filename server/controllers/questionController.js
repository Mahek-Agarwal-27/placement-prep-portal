/**
 * controllers/questionController.js — DSA Question CRUD handlers
 *
 * Handlers:
 *  - getQuestions   : GET  /api/questions        → list all questions for logged-in user
 *  - addQuestion    : POST /api/questions        → create a new question entry
 *  - updateQuestion : PUT  /api/questions/:id   → edit an existing question
 *  - deleteQuestion : DELETE /api/questions/:id → remove a question
 *  - getStats       : GET  /api/questions/stats  → aggregate counts by difficulty/topic
 */

const Question   = require('../models/Question');
const User       = require('../models/User');
const asyncHandler  = require('../middleware/errorHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get all questions for the logged-in user
// @route   GET /api/questions
// @access  Private
exports.getQuestions = asyncHandler(async (req, res) => {
  const { status, difficulty, topic, platform, search } = req.query;

  // Build dynamic filter — only return questions owned by this user
  const filter = { user: req.user.id };
  if (status)     filter.status     = status;
  if (difficulty) filter.difficulty = difficulty;
  if (topic)      filter.topic      = topic;
  if (platform)   filter.platform   = platform;
  if (search) {
    filter.title = { $regex: search, $options: 'i' }; // Case-insensitive title search
  }

  const questions = await Question.find(filter).sort({ createdAt: -1 });
  res.status(200).json(successResponse(questions, 'Questions fetched successfully'));
});

// @desc    Add a new DSA question
// @route   POST /api/questions
// @access  Private
exports.addQuestion = asyncHandler(async (req, res) => {
  const { title, platform, difficulty, topic, status, link, notes } = req.body;

  if (!title || !difficulty) {
    return res.status(400).json(errorResponse('Title and difficulty are required'));
  }

  const question = await Question.create({
    user:       req.user.id,
    title,
    platform:   platform   || 'LeetCode',
    difficulty,
    topic:      topic      || 'Other',
    status:     status     || 'to-do',
    link:       link       || '',
    notes:      notes      || '',
    solvedAt:   status === 'solved' ? new Date() : null,
  });

  // If the question is marked solved, increment the user's stat counter
  if (status === 'solved') {
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'stats.totalDSASolved': 1 },
    });
  }

  res.status(201).json(successResponse(question, 'Question added successfully'));
});

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private
exports.updateQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findOne({ _id: req.params.id, user: req.user.id });

  if (!question) {
    return res.status(404).json(errorResponse('Question not found or not authorized'));
  }

  const prevStatus = question.status;
  const { title, platform, difficulty, topic, status, link, notes } = req.body;

  // Apply updates selectively
  if (title      !== undefined) question.title      = title;
  if (platform   !== undefined) question.platform   = platform;
  if (difficulty !== undefined) question.difficulty = difficulty;
  if (topic      !== undefined) question.topic      = topic;
  if (link       !== undefined) question.link       = link;
  if (notes      !== undefined) question.notes      = notes;

  // Handle status transition for stat tracking
  if (status !== undefined && status !== prevStatus) {
    question.status = status;

    if (status === 'solved' && prevStatus !== 'solved') {
      // Newly solved — increment user counter
      question.solvedAt = new Date();
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { 'stats.totalDSASolved': 1 },
      });
    } else if (status !== 'solved' && prevStatus === 'solved') {
      // Un-solving — decrement user counter
      question.solvedAt = null;
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { 'stats.totalDSASolved': -1 },
      });
    }
  }

  await question.save();
  res.status(200).json(successResponse(question, 'Question updated successfully'));
});

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private
exports.deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findOne({ _id: req.params.id, user: req.user.id });

  if (!question) {
    return res.status(404).json(errorResponse('Question not found or not authorized'));
  }

  // If the deleted question was solved, decrement user stat
  if (question.status === 'solved') {
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'stats.totalDSASolved': -1 },
    });
  }

  await question.deleteOne();
  res.status(200).json(successResponse(null, 'Question deleted successfully'));
});

// @desc    Get aggregate stats for the user's DSA questions
// @route   GET /api/questions/stats
// @access  Private
exports.getStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Totals by difficulty
  const byDifficulty = await Question.aggregate([
    { $match: { user: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
    { $group: { _id: '$difficulty', total: { $sum: 1 }, solved: { $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] } } } },
  ]);

  // Totals by topic (only solved)
  const byTopic = await Question.aggregate([
    { $match: { user: require('mongoose').Types.ObjectId.createFromHexString(userId), status: 'solved' } },
    { $group: { _id: '$topic', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 }, // Top 6 topics
  ]);

  // Overall totals
  const totalQuestions = await Question.countDocuments({ user: userId });
  const totalSolved    = await Question.countDocuments({ user: userId, status: 'solved' });
  const totalAttempted = await Question.countDocuments({ user: userId, status: 'attempted' });
  const totalTodo      = await Question.countDocuments({ user: userId, status: 'to-do' });

  res.status(200).json(successResponse(
    { byDifficulty, byTopic, totalQuestions, totalSolved, totalAttempted, totalTodo },
    'Stats fetched successfully'
  ));
});
