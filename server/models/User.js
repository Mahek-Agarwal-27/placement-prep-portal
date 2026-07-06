/**
 * models/User.js — Mongoose schema for the User collection
 *
 * Fields:
 *  - name, email, password (hashed), role, avatar
 *  - profile: college, branch, graduationYear, skills
 *  - streak: currentStreak, lastActiveDate (for daily activity)
 *  - timestamps: createdAt, updatedAt (auto-managed by Mongoose)
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    // ── Basic Info ────────────────────────────────────────────────────────────
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
      minlength: [2,  'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type:     String,
      required: [true, 'Email is required'],
      unique:   true,
      lowercase: true,
      trim:     true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [6,    'Password must be at least 6 characters'],
      select:    false, // Never return password in queries by default
    },

    // ── Role ──────────────────────────────────────────────────────────────────
    role: {
      type:    String,
      enum:    ['student', 'admin'],
      default: 'student',
    },

    // ── Avatar ────────────────────────────────────────────────────────────────
    avatar: {
      type:    String,
      default: '', // URL to profile picture (optional)
    },

    // ── Student Profile Details ───────────────────────────────────────────────
    profile: {
      college:        { type: String, default: '' },
      branch:         { type: String, default: '' },
      graduationYear: { type: Number, default: null },
      skills:         { type: [String], default: [] },
      bio:            { type: String, default: '' },
      linkedIn:       { type: String, default: '' },
      github:         { type: String, default: '' },
    },

    // ── Daily Streak Tracking ─────────────────────────────────────────────────
    streak: {
      currentStreak:  { type: Number, default: 0 },
      longestStreak:  { type: Number, default: 0 },
      lastActiveDate: { type: Date,   default: null },
    },

    // ── Study Stats (updated as user completes tasks) ─────────────────────────
    stats: {
      totalDSASolved:  { type: Number, default: 0 },
      totalTasksDone:  { type: Number, default: 0 },
      totalStudyHours: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ── Pre-save Hook: Hash password before saving ────────────────────────────────
UserSchema.pre('save', async function (next) {
  // Only hash if password field was modified (avoids re-hashing on other updates)
  if (!this.isModified('password')) return next();

  const salt    = await bcrypt.genSalt(12); // 12 rounds = good security/performance balance
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance Method: Compare entered password with hashed password ─────────────
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Instance Method: Generate JWT token ───────────────────────────────────────
UserSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = mongoose.model('User', UserSchema);
