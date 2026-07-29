const User = require('../models/User');
const Question = require('../models/Question');
const Task = require('../models/Task');
const Resume = require('../models/Resume');
const Note = require('../models/Note');
const Interview = require('../models/Interview');
const AIHistory = require('../models/AIHistory');
const Activity = require('../models/Activity');

const asyncHandler = require('../middleware/errorHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Export all user data as JSON
// @route   GET /api/users/export-data
// @access  Private
exports.exportUserData = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [user, questions, tasks, resumes, notes, interviews, aiHistory, activities] = await Promise.all([
    User.findById(userId).select('-password'),
    Question.find({ user: userId }),
    Task.find({ user: userId }),
    Resume.find({ user: userId }),
    Note.find({ user: userId }),
    Interview.find({ user: userId }),
    AIHistory.find({ user: userId }),
    Activity.find({ user: userId }),
  ]);

  if (!user) {
    return res.status(404).json(errorResponse('User not found'));
  }

  const exportPayload = {
    exportDate: new Date().toISOString(),
    user,
    dsaProgress: questions,
    studyPlannerTasks: tasks,
    resumeHistory: resumes,
    notesHistory: notes,
    interviewHistory: interviews,
    aiInteractionHistory: aiHistory,
    activityTimeline: activities,
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="hirenova-user-data-${userId}.json"`);
  res.status(200).json(exportPayload);
});

// @desc    Delete user account & permanently purge all linked user records
// @route   DELETE /api/users/delete-account
// @access  Private
exports.deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json(errorResponse('User not found'));
  }

  // Purge all records across database
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

  res.status(200).json(successResponse(null, 'Account and all associated records permanently deleted.'));
});
