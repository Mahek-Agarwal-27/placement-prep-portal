const User = require('../models/User');
const Resume = require('../models/Resume');
const Question = require('../models/Question');
const AIHistory = require('../models/AIHistory');
const Interview = require('../models/Interview');
const asyncHandler = require('../middleware/errorHandler');
const { successResponse } = require('../utils/apiResponse');

// @desc    Get real-time user analytics & calculated placement readiness score
// @route   GET /api/analytics/realtime
// @access  Private
exports.getRealtimeAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [user, latestResume, solvedCount, aiSessionCount, interviewCount] = await Promise.all([
    User.findById(userId),
    Resume.findOne({ user: userId }).sort({ createdAt: -1 }),
    Question.countDocuments({ user: userId, status: 'solved' }),
    AIHistory.countDocuments({ user: userId }),
    Interview.countDocuments({ user: userId }),
  ]);

  const atsScore = latestResume ? latestResume.atsScore : null;
  const daysActive = user ? Math.max(1, Math.ceil((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))) : 1;

  // Dynamic Placement Readiness Calculation Formula
  let score = 0;
  if (atsScore !== null) {
    score += atsScore * 0.45;
  }
  score += Math.min(30, solvedCount * 1.5);
  score += Math.min(15, aiSessionCount * 1.5);
  score += Math.min(10, interviewCount * 5);

  const placementReadinessScore = Math.min(100, Math.round(score));

  res.status(200).json(successResponse({
    daysActive,
    problemsSolved: solvedCount,
    resumeScore: atsScore, // null if no resume uploaded yet
    aiSessions: aiSessionCount,
    interviewsCompleted: interviewCount,
    placementReadinessScore,
    memberSince: user?.createdAt,
  }, 'Realtime analytics fetched successfully'));
});
