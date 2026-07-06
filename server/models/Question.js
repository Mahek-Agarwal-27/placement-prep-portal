/**
 * models/Question.js — Mongoose schema for DSA question tracking
 *
 * Each document represents one DSA problem logged by a user.
 * Fields:
 *  - user        : reference to the User who logged this question
 *  - title       : name/title of the problem
 *  - platform    : LeetCode | Codeforces | GFG | HackerRank | Other
 *  - difficulty  : Easy | Medium | Hard
 *  - topic       : category (Arrays, Trees, DP, etc.)
 *  - status      : solved | attempted | to-do
 *  - link        : optional URL to the problem
 *  - notes       : personal revision notes
 *  - solvedAt    : date the problem was marked solved
 *  - timestamps  : createdAt, updatedAt (auto-managed)
 */

const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
  {
    // ── Owner ──────────────────────────────────────────────────────────────────
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true, // Speeds up per-user queries
    },

    // ── Problem Details ────────────────────────────────────────────────────────
    title: {
      type:      String,
      required:  [true, 'Problem title is required'],
      trim:      true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    platform: {
      type:    String,
      enum:    ['LeetCode', 'Codeforces', 'GFG', 'HackerRank', 'InterviewBit', 'Other'],
      default: 'LeetCode',
    },

    difficulty: {
      type:    String,
      enum:    ['Easy', 'Medium', 'Hard'],
      required: [true, 'Difficulty is required'],
    },

    topic: {
      type:    String,
      enum:    [
        'Arrays', 'Strings', 'Linked List', 'Stacks & Queues',
        'Trees', 'Graphs', 'Dynamic Programming', 'Recursion & Backtracking',
        'Sorting & Searching', 'Hashing', 'Greedy', 'Bit Manipulation',
        'Math', 'Sliding Window', 'Two Pointers', 'Heap', 'Other',
      ],
      default: 'Other',
    },

    status: {
      type:    String,
      enum:    ['solved', 'attempted', 'to-do'],
      default: 'to-do',
    },

    // ── Optional Extras ────────────────────────────────────────────────────────
    link: {
      type:    String,
      default: '',
      trim:    true,
    },

    notes: {
      type:    String,
      default: '',
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },

    // ── Solve Date ─────────────────────────────────────────────────────────────
    solvedAt: {
      type:    Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = mongoose.model('Question', QuestionSchema);
