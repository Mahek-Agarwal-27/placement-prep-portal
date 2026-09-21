const express = require('express');
const router = express.Router();
const { exportUserData, deleteAccount } = require('../controllers/userController');
const { getRealtimeAnalytics, logStudySession, resetAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/analytics', getRealtimeAnalytics);
router.post('/study-session', logStudySession);
router.post('/analytics/reset', resetAnalytics);
router.delete('/analytics/reset', resetAnalytics);
router.get('/export-data', exportUserData);
router.delete('/delete-account', deleteAccount);

module.exports = router;
