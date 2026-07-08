const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadMiddleware, analyzeResume, getResumes, deleteResume } = require('../controllers/resumeController');

router.use(protect);

router.route('/')
  .get(getResumes);

router.route('/analyze')
  .post(uploadMiddleware, analyzeResume);

router.route('/:id')
  .delete(deleteResume);

module.exports = router;
