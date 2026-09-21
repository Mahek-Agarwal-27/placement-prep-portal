const express = require('express');
const router = express.Router();
const { getRealtimeAnalytics, resetAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/realtime', getRealtimeAnalytics);
router.post('/reset', resetAnalytics);
router.delete('/reset', resetAnalytics);

module.exports = router;
