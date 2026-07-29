const express = require('express');
const router = express.Router();
const { getActivities, logActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getActivities)
  .post(logActivity);

module.exports = router;
