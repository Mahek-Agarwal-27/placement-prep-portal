const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      default: 'Untitled Note',
    },
    content: {
      type: String,
      default: '',
    },
    folder: {
      type: String,
      default: 'General',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Note', NoteSchema);
