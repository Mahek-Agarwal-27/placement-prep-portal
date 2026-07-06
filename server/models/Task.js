/**
 * models/Task.js — Mongoose schema for study planner tasks
 *
 * Each document represents one study task created by a user.
 * Fields:
 *  - user      : reference to the owning User
 *  - title     : what to study/do
 *  - description : optional longer description
 *  - category  : DSA | Development | System Design | Core Subjects | Aptitude | Soft Skills | Other
 *  - priority  : low | medium | high
 *  - status    : pending | in-progress | completed
 *  - dueDate   : deadline date
 *  - estimatedHours : estimated time to complete
 *  - completedAt : timestamp when marked completed
 *  - timestamps : createdAt, updatedAt (auto)
 */

const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    // ── Owner ──────────────────────────────────────────────────────────────────
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    // ── Task Details ───────────────────────────────────────────────────────────
    title: {
      type:      String,
      required:  [true, 'Task title is required'],
      trim:      true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    description: {
      type:      String,
      default:   '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    category: {
      type:    String,
      enum:    ['DSA', 'Development', 'System Design', 'Core Subjects', 'Aptitude', 'Soft Skills', 'Other'],
      default: 'Other',
    },

    priority: {
      type:    String,
      enum:    ['low', 'medium', 'high'],
      default: 'medium',
    },

    status: {
      type:    String,
      enum:    ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },

    // ── Scheduling ─────────────────────────────────────────────────────────────
    dueDate: {
      type:    Date,
      default: null,
    },

    estimatedHours: {
      type:    Number,
      default: 0,
      min:     [0, 'Estimated hours cannot be negative'],
    },

    // ── Completion ─────────────────────────────────────────────────────────────
    completedAt: {
      type:    Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', TaskSchema);
