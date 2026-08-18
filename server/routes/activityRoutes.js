const express = require('express');
const router = express.Router();
const {
  startActivity,
  stopActivity,
  getActiveActivity,
  getActivityStats,
} = require('../controllers/activityTrackerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/start', startActivity);
router.post('/stop', stopActivity);
router.get('/active', getActiveActivity);
router.get('/stats', getActivityStats);

module.exports = router;
