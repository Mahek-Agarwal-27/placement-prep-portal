const express = require('express');
const router = express.Router();
const { getRealtimeAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/realtime', getRealtimeAnalytics);

module.exports = router;
