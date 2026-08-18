const PreparationSession = require('../models/PreparationSession');
const StudySession = require('../models/StudySession');
const asyncHandler = require('../middleware/errorHandler');
const { successResponse } = require('../utils/apiResponse');

// Activity Type titles lookup
const ACTIVITY_TITLES = {
  dsa: 'DSA Practice',
  resume: 'Resume Analysis',
  interview: 'Mock Interview',
  notes: 'AI Notes / Roadmap',
  general: 'General Study',
};

// @desc    Start a preparation tracking session
// @route   POST /api/activity/start
// @access  Private
exports.startActivity = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { activityType } = req.body;

  const validTypes = ['dsa', 'resume', 'interview', 'notes', 'general'];
  const type = validTypes.includes(activityType) ? activityType : 'dsa';
  const title = req.body.title || ACTIVITY_TITLES[type] || 'Preparation Session';

  // Check if there is already an active session for this user
  let activeSession = await PreparationSession.findOne({ user: userId, status: 'active' });

  if (activeSession) {
    // If starting the same type, return the active session so client can resume
    if (activeSession.activityType === type) {
      const elapsedSeconds = Math.floor((new Date() - new Date(activeSession.startTime)) / 1000);
      return res.status(200).json(successResponse({
        session: activeSession,
        elapsedSeconds,
        isResumed: true,
      }, 'Resumed existing active session'));
    }

    // If starting a different type, auto-stop the previous active session
    const now = new Date();
    const durationMins = Math.max(1, Math.round((now - new Date(activeSession.startTime)) / 60000));
    activeSession.endTime = now;
    activeSession.duration = durationMins;
    activeSession.status = 'completed';
    await activeSession.save();

    // Also record in StudySession & update streak
    await StudySession.create({
      user: userId,
      activityType: activeSession.activityType === 'notes' ? 'notes' : activeSession.activityType,
      durationMinutes: durationMins,
      date: now,
    });

    const User = require('../models/User');
    const user = await User.findById(userId);
    if (user) {
      await user.updateStreak();
    }
  }

  // Create new active preparation session
  const newSession = await PreparationSession.create({
    user: userId,
    activityType: type,
    title,
    startTime: new Date(),
    status: 'active',
  });

  res.status(201).json(successResponse({
    session: newSession,
    elapsedSeconds: 0,
    isResumed: false,
  }, 'Started preparation session'));
});

// @desc    Stop active preparation session
// @route   POST /api/activity/stop
// @access  Private
exports.stopActivity = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { sessionId } = req.body;

  let session;
  if (sessionId) {
    session = await PreparationSession.findOne({ _id: sessionId, user: userId, status: 'active' });
  } else {
    session = await PreparationSession.findOne({ user: userId, status: 'active' });
  }

  if (!session) {
    return res.status(404).json({ success: false, message: 'No active preparation session found' });
  }

  const now = new Date();
  const durationMins = Math.max(1, Math.round((now - new Date(session.startTime)) / 60000));

  session.endTime = now;
  session.duration = durationMins;
  session.status = 'completed';
  await session.save();

  // Create standard StudySession entry for dashboard compatibility
  await StudySession.create({
    user: userId,
    activityType: session.activityType === 'notes' ? 'notes' : session.activityType,
    durationMinutes: durationMins,
    date: now,
  });

  // Update user daily streak for completing a valid learning activity
  const User = require('../models/User');
  const user = await User.findById(userId);
  if (user) {
    await user.updateStreak();
  }

  res.status(200).json(successResponse({
    session,
    durationMinutes: durationMins,
  }, 'Preparation session completed and saved'));
});

// @desc    Get current active session (for page refresh session recovery)
// @route   GET /api/activity/active
// @access  Private
exports.getActiveActivity = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const activeSession = await PreparationSession.findOne({ user: userId, status: 'active' });

  if (!activeSession) {
    return res.status(200).json(successResponse({ activeSession: null, elapsedSeconds: 0 }, 'No active session'));
  }

  const elapsedSeconds = Math.floor((new Date() - new Date(activeSession.startTime)) / 1000);
  res.status(200).json(successResponse({
    activeSession,
    elapsedSeconds,
  }, 'Active session fetched'));
});

// @desc    Get real-time study statistics & breakdown
// @route   GET /api/activity/stats
// @access  Private
exports.getActivityStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const now = new Date();

  // Start of Today (00:00:00)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Start of Week (7 days ago)
  const startOfWeek = new Date();
  startOfWeek.setDate(now.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);

  const [completedSessions, activeSession, legacyStudySessions] = await Promise.all([
    PreparationSession.find({ user: userId, status: 'completed' }),
    PreparationSession.findOne({ user: userId, status: 'active' }),
    StudySession.find({ user: userId }),
  ]);

  // If there's an active session, calculate elapsed minutes live
  let activeElapsedMins = 0;
  let activeSessionData = null;
  if (activeSession) {
    const elapsedSecs = Math.floor((now - new Date(activeSession.startTime)) / 1000);
    activeElapsedMins = Math.floor(elapsedSecs / 60);
    activeSessionData = {
      id: activeSession._id,
      activityType: activeSession.activityType,
      title: activeSession.title,
      startTime: activeSession.startTime,
      elapsedSeconds: elapsedSecs,
    };
  }

  // Combine PreparationSessions & legacy StudySessions
  let todayMinutes = 0;
  let weeklyMinutes = 0;
  let totalMinutes = 0;

  const breakdown = {
    dsa: 0,
    resume: 0,
    interview: 0,
    notes: 0,
    general: 0,
  };

  // Process PreparationSessions
  completedSessions.forEach(s => {
    const dur = s.duration || 0;
    const sDate = new Date(s.startTime);
    totalMinutes += dur;

    if (sDate >= startOfToday) todayMinutes += dur;
    if (sDate >= startOfWeek) weeklyMinutes += dur;

    const typeKey = breakdown.hasOwnProperty(s.activityType) ? s.activityType : 'general';
    breakdown[typeKey] += dur;
  });

  // Process legacy StudySessions (avoid duplicates by checking date)
  legacyStudySessions.forEach(s => {
    const dur = s.durationMinutes || 0;
    const sDate = new Date(s.date);
    // Add legacy minutes if no preparation sessions exist for this day
    const hasPrepSession = completedSessions.some(p => new Date(p.startTime).toDateString() === sDate.toDateString());
    if (!hasPrepSession) {
      totalMinutes += dur;
      if (sDate >= startOfToday) todayMinutes += dur;
      if (sDate >= startOfWeek) weeklyMinutes += dur;
      const typeKey = breakdown.hasOwnProperty(s.activityType) ? s.activityType : 'general';
      breakdown[typeKey] += dur;
    }
  });

  // Include active session elapsed time in today's & weekly total
  todayMinutes += activeElapsedMins;
  weeklyMinutes += activeElapsedMins;
  totalMinutes += activeElapsedMins;
  if (activeSession && breakdown.hasOwnProperty(activeSession.activityType)) {
    breakdown[activeSession.activityType] += activeElapsedMins;
  }

  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const todayHours = Math.round((todayMinutes / 60) * 10) / 10;
  const weeklyHours = Math.round((weeklyMinutes / 60) * 10) / 10;

  res.status(200).json(successResponse({
    todayMinutes,
    todayHours,
    weeklyMinutes,
    weeklyHours,
    totalMinutes,
    totalHours,
    activeSession: activeSessionData,
    breakdown,
  }, 'Activity statistics fetched successfully'));
});
