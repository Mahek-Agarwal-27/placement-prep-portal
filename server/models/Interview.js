const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['Technical', 'Behavioral', 'System Design'],
      required: true,
    },
    topic: {
      type: String,
      required: true, // e.g. "React", "Data Structures", "Java", "General HR"
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['assistant', 'user'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    feedback: {
      score: {
        type: Number,
        default: 0,
      },
      strengths: {
        type: [String],
        default: [],
      },
      weaknesses: {
        type: [String],
        default: [],
      },
      generalTips: {
        type: String,
        default: '',
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Interview', InterviewSchema);
