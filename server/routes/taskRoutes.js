/**
 * routes/taskRoutes.js — Study Planner API routing
 *
 * All routes are protected by JWT auth middleware.
 *
 * Paths:
 *  GET    /api/tasks        → list user's tasks (with filters)
 *  GET    /api/tasks/stats  → aggregate stats
 *  POST   /api/tasks        → create a new task
 *  PUT    /api/tasks/:id    → update a task
 *  DELETE /api/tasks/:id    → delete a task
 */

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  getTaskStats,
} = require('../controllers/taskController');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(addTask);

// Stats route — must be BEFORE /:id
router.get('/stats', getTaskStats);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
