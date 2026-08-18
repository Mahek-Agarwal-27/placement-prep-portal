const mongoose = require('mongoose');

const StudySessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activityType: {
      type: String,
      enum: ['dsa', 'ai', 'interview', 'notes', 'manual'],
      default: 'manual',
    },
    durationMinutes: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StudySession', StudySessionSchema);
