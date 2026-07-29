/**
 * server.js — Entry point for the Express backend
 *
 * Responsibilities:
 *  - Load environment variables
 *  - Connect to MongoDB Atlas
 *  - Register middlewares (CORS, JSON parsing, etc.)
 *  - Mount all API route groups
 *  - Start the HTTP server
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load .env variables before anything else
dotenv.config();

const connectDB = require('./config/db');

const app = express();

// ── Database ──────────────────────────────────────────────────────────────────
connectDB();
console.log(`🔑 GEMINI_API_KEY loaded: ${process.env.GEMINI_API_KEY ? 'YES (' + process.env.GEMINI_API_KEY.substring(0, 5) + '...)' : 'NO'}`);

// ── Middlewares ───────────────────────────────────────────────────────────────

// CORS — allow requests from the React dev server and production domain
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.CLIENT_URL
  ],
  credentials: true,
}));

// Parse incoming JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded form data (for multipart, Multer handles it per-route)
app.use(express.urlencoded({ extended: true }));

// Serve files uploaded via Multer (e.g. resumes, notes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/questions', require('./routes/questionRoutes')); // Phase 4: DSA Tracker
app.use('/api/tasks', require('./routes/taskRoutes'));      // Phase 5: Study Planner
app.use('/api/notes', require('./routes/noteRoutes'));      // Phase 6: AI Notes
app.use('/api/ai', require('./routes/aiRoutes'));        // Phase 6: AI Notes
app.use('/api/resumes', require('./routes/resumeRoutes'));    // Phase 7: Resume Analyzer
app.use('/api/interviews', require('./routes/interviewRoutes')); // Phase 8: AI Mock Interview
app.use('/api/ai-history', require('./routes/aiHistoryRoutes')); // AI History Storage
app.use('/api/activities', require('./routes/activityRoutes')); // User Activity Timeline
app.use('/api/analytics', require('./routes/analyticsRoutes')); // Realtime Analytics & Readiness Score
app.use('/api/users', require('./routes/userRoutes')); // User Account & Data Export
app.use('/api/notifications', require('./routes/notificationRoutes')); // Notifications Center
app.use('/api/focus', require('./routes/focusRoutes')); // Today's Focus AI Recommendations

// ── Health-Check Route ────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '✅ Placement Prep Portal API is running',
    version: '1.0.0',
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
