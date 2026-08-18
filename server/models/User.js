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
      phone:          { type: String, default: '' },
      college:        { type: String, default: '' },
      branch:         { type: String, default: '' },
      graduationYear: { type: Number, default: null },
      skills:         { type: [String], default: [] },
      bio:            { type: String, default: '' },
      linkedIn:       { type: String, default: '' },
      github:         { type: String, default: '' },
    },

    // ── Placement Goals ────────────────────────────────────────────────────────
    placementGoal: {
      targetRole:      { type: String, default: 'Software Developer' },
      targetCompanies: { type: [String], default: ['Google', 'Amazon', 'Microsoft'] },
      prepLevel:       { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
    },

    // ── Notification Preferences ──────────────────────────────────────────────
    notifications: {
      dsaReminders:       { type: Boolean, default: true },
      weeklyReport:       { type: Boolean, default: true },
      aiSuggestions:      { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: false },
    },

    // ── Theme Preference ──────────────────────────────────────────────────────
    themePreference: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'light',
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

    // ── Gamification / Achievements ───────────────────────────────────────────
    achievements: [
      {
        title: { type: String, required: true },
        icon: { type: String, required: true },
        description: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now }
      }
    ],

    // ── Reset Password Token & Expiry ──────────────────────────────────────────
    resetPasswordToken: String,
    resetPasswordExpire: Date,
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

// ── Instance Method: Generate and Hash Reset Password Token ───────────────────
UserSchema.methods.getResetPasswordToken = function () {
  const crypto = require('crypto');

  // Generate random 20-byte token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token using SHA-256 and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire time to 30 minutes
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  return resetToken; // Return raw unhashed token to send in email link
};

// ── Instance Method: Update Daily Streak on Valid Learning Activity ───────────
UserSchema.methods.updateStreak = async function () {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (!this.streak) {
    this.streak = { currentStreak: 1, longestStreak: 1, lastActiveDate: now };
    await this.save();
    return this.streak;
  }

  if (!this.streak.lastActiveDate) {
    this.streak.currentStreak = 1;
    this.streak.longestStreak = Math.max(1, this.streak.longestStreak || 1);
    this.streak.lastActiveDate = now;
    await this.save();
    return this.streak;
  }

  const lastActiveStr = new Date(this.streak.lastActiveDate).toISOString().split('T')[0];

  if (todayStr === lastActiveStr) {
    // Same day activity — streak already credited for today
    return this.streak;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastActiveStr === yesterdayStr) {
    // Consecutive day activity — increment streak
    this.streak.currentStreak = (this.streak.currentStreak || 0) + 1;
    this.streak.longestStreak = Math.max(this.streak.longestStreak || 0, this.streak.currentStreak);
  } else {
    // Missed one or more days — reset streak to 1 upon completing today's new activity
    this.streak.currentStreak = 1;
    this.streak.longestStreak = Math.max(this.streak.longestStreak || 1, 1);
  }

  this.streak.lastActiveDate = now;
  await this.save();
  return this.streak;
};

module.exports = mongoose.model('User', UserSchema);
