const Question = require('../models/Question');
const Resume = require('../models/Resume');
const AIHistory = require('../models/AIHistory');
const Interview = require('../models/Interview');
const asyncHandler = require('../middleware/errorHandler');
const { successResponse } = require('../utils/apiResponse');

// @desc    Get personalized Today's Focus daily prep recommendations based on DB data
// @route   GET /api/focus/todays-focus
// @access  Private
exports.getTodaysFocus = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [questions, latestResume, aiCount, interviews] = await Promise.all([
    Question.find({ user: userId }),
    Resume.findOne({ user: userId }).sort({ createdAt: -1 }),
    AIHistory.countDocuments({ user: userId }),
    Interview.find({ user: userId, status: 'completed' }),
  ]);

  // Topic mastery map
  const topicStats = {};
  questions.forEach(q => {
    const t = q.topic || 'DSA';
    if (!topicStats[t]) topicStats[t] = { total: 0, solved: 0 };
    topicStats[t].total += 1;
    if (q.status === 'solved') topicStats[t].solved += 1;
  });

  // Determine weakest topic
  let weakestTopic = 'Dynamic Programming';
  let lowestRatio = 1.0;
  Object.keys(topicStats).forEach(topic => {
    const ratio = topicStats[topic].solved / topicStats[topic].total;
    if (ratio < lowestRatio) {
      lowestRatio = ratio;
      weakestTopic = topic;
    }
  });

  // Construct personalized daily action items
  const tasks = [];
  const solvedCount = questions.filter(q => q.status === 'solved').length;

  if (solvedCount < 10) {
    tasks.push('Solve 2 LeetCode / DSA problems today');
  } else {
    tasks.push(`Practice 2 Medium problems on ${weakestTopic}`);
  }

  if (!latestResume) {
    tasks.push('Upload & analyze your primary resume');
  } else if (latestResume.atsScore < 75) {
    tasks.push('Improve resume project bullet points and missing keywords');
  } else {
    tasks.push('Review technical project details for interviews');
  }

  if (interviews.length === 0) {
    tasks.push('Take your first AI Mock Technical Interview session');
  } else {
    tasks.push('Revise Core Subjects (OS, DBMS, Computer Networks)');
  }

  // Construct targeted AI suggestion
  let aiSuggestion = `Your ${weakestTopic} progress is currently low. Dedicate 30 minutes to practicing ${weakestTopic} questions today.`;
  if (!latestResume) {
    aiSuggestion = 'You have not uploaded a resume yet. Run a Resume AI scan to identify ATS gaps.';
  } else if (solvedCount === 0) {
    aiSuggestion = 'Start your placement journey by logging your first solved DSA problem today!';
  }

  res.status(200).json(successResponse({
    tasks,
    aiSuggestion,
    focusTopic: weakestTopic,
    solvedCount,
    atsScore: latestResume ? latestResume.atsScore : null,
  }, 'Today\'s Focus generated successfully'));
});
