/**
 * routes/questionRoutes.js — DSA Question API routing
 *
 * All routes are protected by JWT auth middleware.
 *
 * Paths:
 *  GET    /api/questions        → list user's questions (with filters)
 *  GET    /api/questions/stats  → aggregate stats for charts
 *  POST   /api/questions        → add a new question
 *  PUT    /api/questions/:id    → update a question
 *  DELETE /api/questions/:id    → delete a question
 */

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getStats,
  clearAllQuestions,
} = require('../controllers/questionController');

// All routes in this file require authentication
router.use(protect);

router.route('/')
  .get(getQuestions)
  .post(addQuestion);

// Stats & clear-all routes — must be BEFORE /:id so it is not treated as an id
router.get('/stats', getStats);
router.delete('/clear-all', clearAllQuestions);

router.route('/:id')
  .put(updateQuestion)
  .delete(deleteQuestion);

module.exports = router;
