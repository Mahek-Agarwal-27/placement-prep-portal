const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  uploadMiddleware, 
  analyzeResume, 
  getResumes, 
  deleteResume,
  clearAllResumes 
} = require('../controllers/resumeController');

router.use(protect);

router.route('/')
  .get(getResumes);

router.route('/analyze')
  .post(uploadMiddleware, analyzeResume);

router.delete('/clear-all', clearAllResumes);

router.route('/:id')
  .delete(deleteResume);

module.exports = router;
