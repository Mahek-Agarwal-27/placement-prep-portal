const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateAIResponse } = require('../controllers/aiController');

router.use(protect);

router.route('/generate')
  .post(generateAIResponse);

module.exports = router;
