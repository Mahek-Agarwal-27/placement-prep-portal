const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getNotes, getNoteById, createNote, updateNote, deleteNote, clearAllNotes } = require('../controllers/noteController');

router.use(protect);

router.route('/')
  .get(getNotes)
  .post(createNote)
  .delete(clearAllNotes);

router.route('/:id')
  .get(getNoteById)
  .put(updateNote)
  .delete(deleteNote);

module.exports = router;
