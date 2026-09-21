const Note = require('../models/Note');
const asyncHandler = require('../middleware/errorHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get all notes for logged-in user
// @route   GET /api/notes
// @access  Private
exports.getNotes = asyncHandler(async (req, res) => {
  const { folder, tag, search } = req.query;
  const filter = { user: req.user.id };

  if (folder) filter.folder = folder;
  if (tag) filter.tags = tag;
  if (search) filter.title = { $regex: search, $options: 'i' };

  const notes = await Note.find(filter).sort({ updatedAt: -1 });
  res.status(200).json(successResponse(notes, 'Notes fetched successfully'));
});

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
exports.getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
  if (!note) {
    return res.status(404).json(errorResponse('Note not found'));
  }
  res.status(200).json(successResponse(note, 'Note fetched successfully'));
});

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
exports.createNote = asyncHandler(async (req, res) => {
  const { title, content, folder, tags } = req.body;

  const note = await Note.create({
    user: req.user.id,
    title: title || 'Untitled Note',
    content: content || '',
    folder: folder || 'General',
    tags: tags || [],
  });

  res.status(201).json(successResponse(note, 'Note created successfully'));
});

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
exports.updateNote = asyncHandler(async (req, res) => {
  let note = await Note.findOne({ _id: req.params.id, user: req.user.id });
  if (!note) {
    return res.status(404).json(errorResponse('Note not found'));
  }

  const { title, content, folder, tags } = req.body;
  if (title !== undefined) note.title = title;
  if (content !== undefined) note.content = content;
  if (folder !== undefined) note.folder = folder;
  if (tags !== undefined) note.tags = tags;

  await note.save();
  res.status(200).json(successResponse(note, 'Note updated successfully'));
});

// @desc    Delete single note
// @route   DELETE /api/notes/:id
// @access  Private
exports.deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!note) {
    return res.status(404).json(errorResponse('Note not found'));
  }
  res.status(200).json(successResponse(null, 'Note deleted successfully'));
});

// @desc    Clear all notes for logged-in user
// @route   DELETE /api/notes
// @access  Private
exports.clearAllNotes = asyncHandler(async (req, res) => {
  await Note.deleteMany({ user: req.user.id });
  res.status(200).json(successResponse(null, 'All notes cleared successfully'));
});
