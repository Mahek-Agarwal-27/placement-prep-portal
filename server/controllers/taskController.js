/**
 * controllers/taskController.js — Study Planner CRUD handlers
 *
 * Handlers:
 *  - getTasks    : GET    /api/tasks        → list all tasks for logged-in user
 *  - addTask     : POST   /api/tasks        → create a new task
 *  - updateTask  : PUT    /api/tasks/:id    → edit an existing task
 *  - deleteTask  : DELETE /api/tasks/:id    → remove a task
 *  - getTaskStats: GET    /api/tasks/stats   → aggregate task statistics
 */

const Task          = require('../models/Task');
const User          = require('../models/User');
const asyncHandler  = require('../middleware/errorHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get all tasks for the logged-in user
// @route   GET /api/tasks
// @access  Private
exports.getTasks = asyncHandler(async (req, res) => {
  const { status, priority, category, search } = req.query;

  const filter = { user: req.user.id };
  if (status)   filter.status   = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (search)   filter.title    = { $regex: search, $options: 'i' };

  const tasks = await Task.find(filter).sort({ dueDate: 1, createdAt: -1 });
  res.status(200).json(successResponse(tasks, 'Tasks fetched successfully'));
});

// @desc    Add a new study task
// @route   POST /api/tasks
// @access  Private
exports.addTask = asyncHandler(async (req, res) => {
  const { title, description, category, priority, status, dueDate, estimatedHours } = req.body;

  if (!title) {
    return res.status(400).json(errorResponse('Task title is required'));
  }

  const taskStatus = status || 'pending';

  const task = await Task.create({
    user:           req.user.id,
    title,
    description:    description     || '',
    category:       category        || 'Other',
    priority:       priority        || 'medium',
    status:         taskStatus,
    dueDate:        dueDate         || null,
    estimatedHours: estimatedHours  || 0,
    completedAt:    taskStatus === 'completed' ? new Date() : null,
  });

  // If task is marked completed, increment user stats and check achievements
  if (taskStatus === 'completed') {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $inc: {
          'stats.totalTasksDone':  1,
          'stats.totalStudyHours': estimatedHours || 0,
        },
      },
      { new: true }
    );
    const { evaluateAchievements } = require('../utils/achievementEngine');
    if (evaluateAchievements(user)) {
      await user.save();
    }
  }

  res.status(201).json(successResponse(task, 'Task created successfully'));
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user.id });

  if (!task) {
    return res.status(404).json(errorResponse('Task not found or not authorized'));
  }

  const prevStatus = task.status;
  const { title, description, category, priority, status, dueDate, estimatedHours } = req.body;

  // Track the old estimated hours for stats correction
  const prevEstimatedHours = task.estimatedHours || 0;

  if (title          !== undefined) task.title          = title;
  if (description    !== undefined) task.description    = description;
  if (category       !== undefined) task.category       = category;
  if (priority       !== undefined) task.priority       = priority;
  if (dueDate        !== undefined) task.dueDate        = dueDate;
  if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;

  // Handle status transition
  if (status !== undefined && status !== prevStatus) {
    task.status = status;

    if (status === 'completed' && prevStatus !== 'completed') {
      task.completedAt = new Date();
      const user = await User.findByIdAndUpdate(
        req.user.id,
        {
          $inc: {
            'stats.totalTasksDone':  1,
            'stats.totalStudyHours': task.estimatedHours || 0,
          },
        },
        { new: true }
      );
      const { evaluateAchievements } = require('../utils/achievementEngine');
      if (evaluateAchievements(user)) {
        await user.save();
      }
    } else if (status !== 'completed' && prevStatus === 'completed') {
      task.completedAt = null;
      await User.findByIdAndUpdate(req.user.id, {
        $inc: {
          'stats.totalTasksDone':  -1,
          'stats.totalStudyHours': -(prevEstimatedHours || 0),
        },
      });
    }
  }

  await task.save();
  res.status(200).json(successResponse(task, 'Task updated successfully'));
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user.id });

  if (!task) {
    return res.status(404).json(errorResponse('Task not found or not authorized'));
  }

  // If the deleted task was completed, decrement user stats
  if (task.status === 'completed') {
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        'stats.totalTasksDone':  -1,
        'stats.totalStudyHours': -(task.estimatedHours || 0),
      },
    });
  }

  await task.deleteOne();
  res.status(200).json(successResponse(null, 'Task deleted successfully'));
});

// @desc    Get aggregate stats for the user's tasks
// @route   GET /api/tasks/stats
// @access  Private
exports.getTaskStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const totalTasks     = await Task.countDocuments({ user: userId });
  const totalPending   = await Task.countDocuments({ user: userId, status: 'pending' });
  const totalInProgress = await Task.countDocuments({ user: userId, status: 'in-progress' });
  const totalCompleted = await Task.countDocuments({ user: userId, status: 'completed' });

  // Sum of estimated hours for completed tasks
  const hoursResult = await Task.aggregate([
    { $match: { user: require('mongoose').Types.ObjectId.createFromHexString(userId), status: 'completed' } },
    { $group: { _id: null, totalHours: { $sum: '$estimatedHours' } } },
  ]);
  const totalStudyHours = hoursResult.length > 0 ? hoursResult[0].totalHours : 0;

  // Tasks by category (completed count)
  const byCategory = await Task.aggregate([
    { $match: { user: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
    { $group: {
      _id: '$category',
      total: { $sum: 1 },
      completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
    }},
    { $sort: { total: -1 } },
  ]);

  // Upcoming tasks (due in next 7 days, not completed)
  const now = new Date();
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingCount = await Task.countDocuments({
    user: userId,
    status: { $ne: 'completed' },
    dueDate: { $gte: now, $lte: weekLater },
  });

  // Overdue tasks
  const overdueCount = await Task.countDocuments({
    user: userId,
    status: { $ne: 'completed' },
    dueDate: { $lt: now, $ne: null },
  });

  res.status(200).json(successResponse(
    {
      totalTasks, totalPending, totalInProgress, totalCompleted,
      totalStudyHours, byCategory, upcomingCount, overdueCount,
    },
    'Task stats fetched successfully'
  ));
});
