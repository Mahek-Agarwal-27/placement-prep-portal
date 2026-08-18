const User = require('../models/User');
const Resume = require('../models/Resume');
const Question = require('../models/Question');
const AIHistory = require('../models/AIHistory');
const Interview = require('../models/Interview');
const StudySession = require('../models/StudySession');
const asyncHandler = require('../middleware/errorHandler');
const { successResponse } = require('../utils/apiResponse');

// @desc    Get real-time user analytics, streak & calculated placement readiness score
// @route   GET /api/analytics/realtime & GET /api/users/analytics
// @access  Private
exports.getRealtimeAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [
    user,
    latestResume,
    solvedCount,
    aiSessionCount,
    interviewCount,
    studySessions,
    solvedQuestions,
    aiHistories,
    interviews,
  ] = await Promise.all([
    User.findById(userId),
    Resume.findOne({ user: userId }).sort({ createdAt: -1 }),
    Question.countDocuments({ user: userId, status: 'solved' }),
    AIHistory.countDocuments({ user: userId }),
    Interview.countDocuments({ user: userId }),
    StudySession.find({ user: userId }),
    Question.find({ user: userId, status: 'solved' }),
    AIHistory.find({ user: userId }),
    Interview.find({ user: userId }),
  ]);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Calculate actual daily streak based on real activity timestamps
  let currentStreak = user.streak?.currentStreak || 0;
  let longestStreak = user.streak?.longestStreak || 0;
  const lastActiveDate = user.streak?.lastActiveDate;

  // If user has a last active date, check if they missed yesterday (reset streak display to 0 if inactive today & yesterday)
  if (lastActiveDate) {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const lastActiveStr = new Date(lastActiveDate).toISOString().split('T')[0];

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActiveStr !== todayStr && lastActiveStr !== yesterdayStr) {
      // Missed more than 1 day — current streak is 0 until a new learning activity is completed
      currentStreak = 0;
    }
  }

  // Calculate Study Hours strictly from real logged StudySessions in MongoDB (no artificial multipliers)
  const totalMinutes = studySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const studyHours = Math.round((totalMinutes / 60) * 10) / 10;

  const atsScore = latestResume ? (latestResume.atsScore || 0) : 0;
  const dsaProgress = solvedCount;
  const resumeScore = latestResume ? latestResume.atsScore : null;
  const interviewProgress = interviewCount;

  // ── Placement Readiness Score Formula (Weighted 100%) ──────────────────────
  const dsaScore = Math.min(40, (solvedCount / 150) * 40);
  const resumeScoreWeighted = (atsScore / 100) * 20;
  const interviewScore = Math.min(20, (interviewCount / 5) * 20);
  const aiScore = Math.min(10, (aiSessionCount / 10) * 10);
  const streakScore = Math.min(10, (currentStreak / 10) * 10);

  const rawReadiness = dsaScore + resumeScoreWeighted + interviewScore + aiScore + streakScore;
  const readinessScore = Math.min(100, Math.round(rawReadiness));

  // Generate Weekly Study Graph Data (Last 7 Days - strictly real logged sessions)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const weeklyStudyData = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dayName = daysOfWeek[d.getDay()];
    const dateStr = d.toISOString().split('T')[0];

    const daySessions = studySessions.filter(s => new Date(s.date).toISOString().split('T')[0] === dateStr);
    const dayMins = daySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const dayHours = Math.round((dayMins / 60) * 10) / 10;

    weeklyStudyData.push({
      day: dayName,
      hours: dayHours,
      problems: daySessions.length,
    });
  }

  // ── DSA Difficulty Breakdown (real counts from Question model) ──────────────
  const allQuestions = await Question.find({ user: userId });
  const easySolved = allQuestions.filter(q => q.difficulty === 'Easy' && q.status === 'solved').length;
  const mediumSolved = allQuestions.filter(q => q.difficulty === 'Medium' && q.status === 'solved').length;
  const hardSolved = allQuestions.filter(q => q.difficulty === 'Hard' && q.status === 'solved').length;
  const easyTotal = allQuestions.filter(q => q.difficulty === 'Easy').length;
  const mediumTotal = allQuestions.filter(q => q.difficulty === 'Medium').length;
  const hardTotal = allQuestions.filter(q => q.difficulty === 'Hard').length;

  const dsaDifficultyBreakdown = {
    easy:   { solved: easySolved,   total: Math.max(easyTotal, easySolved),   target: 80 },
    medium: { solved: mediumSolved, total: Math.max(mediumTotal, mediumSolved), target: 50 },
    hard:   { solved: hardSolved,   total: Math.max(hardTotal, hardSolved),   target: 20 },
  };

  // ── Top Topics Breakdown (real data) ───────────────────────────────────────
  const topicMap = {};
  allQuestions.forEach(q => {
    if (!topicMap[q.topic]) topicMap[q.topic] = { total: 0, solved: 0 };
    topicMap[q.topic].total++;
    if (q.status === 'solved') topicMap[q.topic].solved++;
  });
  // Sort by most solved, take top 4
  const dsaTopTopics = Object.entries(topicMap)
    .map(([name, data]) => ({ name, solved: data.solved, total: data.total }))
    .sort((a, b) => b.solved - a.solved)
    .slice(0, 4);

  // ── Weekly Readiness Trend (real weekly snapshots) ─────────────────────────
  // Calculate actual readiness score at weekly intervals based on cumulative activity
  const readinessGraphData = [];
  for (let w = 3; w >= 0; w--) {
    const weekEnd = new Date();
    weekEnd.setDate(today.getDate() - (w * 7));
    const weekQuestions = solvedQuestions.filter(q => new Date(q.updatedAt || q.createdAt) <= weekEnd).length;
    const weekAI = aiHistories.filter(a => new Date(a.createdAt) <= weekEnd).length;
    const weekInterviews = interviews.filter(i => new Date(i.createdAt) <= weekEnd).length;
    const weekDsa = Math.min(40, (weekQuestions / 150) * 40);
    const weekAiScore = Math.min(10, (weekAI / 10) * 10);
    const weekIntScore = Math.min(20, (weekInterviews / 5) * 20);
    const weekScore = Math.min(100, Math.round(weekDsa + resumeScoreWeighted + weekIntScore + weekAiScore + streakScore));
    readinessGraphData.push({ week: `Week ${4 - w}`, score: weekScore });
  }

  res.status(200).json(successResponse({
    currentStreak,
    longestStreak,
    studyHours,
    readinessScore,
    dsaProgress,
    resumeScore,
    interviewProgress,
    aiSessions: aiSessionCount,
    weeklyStudyData,
    readinessGraphData,
    dsaDifficultyBreakdown,
    dsaTopTopics,
    memberSince: user.createdAt,
  }, 'Analytics data fetched successfully'));
});

// @desc    Log a new study session
// @route   POST /api/users/study-session
// @access  Private
exports.logStudySession = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { durationMinutes, activityType } = req.body;

  const session = await StudySession.create({
    user: userId,
    durationMinutes: Number(durationMinutes) || 30,
    activityType: activityType || 'manual',
    date: new Date(),
  });

  res.status(201).json(successResponse(session, 'Study session logged successfully'));
});
