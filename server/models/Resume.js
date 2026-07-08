const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String, // Path or URL to the uploaded resume
      required: true,
    },
    jobDescription: {
      type: String, // Optional target JD
      default: '',
    },
    score: {
      type: Number, // Overall ATS score
      default: 0,
    },
    feedback: {
      // Structured AI feedback
      type: Object,
      default: {
        keywordMatching: [],
        formatting: [],
        bulletPoints: [],
        generalAdvice: '',
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resume', ResumeSchema);
