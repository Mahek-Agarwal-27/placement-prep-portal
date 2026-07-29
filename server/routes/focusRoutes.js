const express = require('express');
const router = express.Router();
const { getTodaysFocus } = require('../controllers/focusController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/todays-focus', getTodaysFocus);

module.exports = router;
