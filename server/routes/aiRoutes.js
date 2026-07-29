const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateAIResponse, chatAIResponse } = require('../controllers/aiController');

router.use(protect);

router.route('/generate')
  .post(generateAIResponse);

router.route('/chat')
  .post(chatAIResponse);

module.exports = router;
