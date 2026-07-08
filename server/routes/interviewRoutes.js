const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  startInterview,
  submitResponse,
  endAndEvaluate,
  getInterviews,
  getInterviewById,
} = require('../controllers/interviewController');

router.use(protect);

router.route('/')
  .get(getInterviews);

router.route('/start')
  .post(startInterview);

router.route('/:id')
  .get(getInterviewById);

router.route('/:id/message')
  .post(submitResponse);

router.route('/:id/end')
  .post(endAndEvaluate);

module.exports = router;
