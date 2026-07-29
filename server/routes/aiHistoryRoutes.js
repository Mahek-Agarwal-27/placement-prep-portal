const express = require('express');
const router = express.Router();
const { 
  getAIHistory, 
  addAIHistory, 
  deleteAIHistoryItem, 
  clearAllAIHistory 
} = require('../controllers/aiHistoryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getAIHistory)
  .post(addAIHistory);

router.delete('/clear-all', clearAllAIHistory);
router.delete('/:id', deleteAIHistoryItem);

module.exports = router;
