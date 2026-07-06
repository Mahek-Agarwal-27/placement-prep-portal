import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ----- Placeholder pages (will be built in later phases) -----
// Phase 1: We just show a "Coming Soon" landing to confirm the app boots correctly.
const ComingSoon = ({ name }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4">
    <h1 className="text-4xl font-bold gradient-text">{name}</h1>
    <p className="text-slate-400 text-lg">This page will be implemented in a later phase.</p>
  </div>
);

// ----- Root App Component -----
function App() {
  return (
    <Router>
      <Routes>
        {/* Phase 1 — sanity-check routes (will be replaced in Phase 2+) */}
        <Route path="/"          element={<ComingSoon name="🚀 Placement Prep Portal" />} />
        <Route path="/login"     element={<ComingSoon name="Login" />} />
        <Route path="/signup"    element={<ComingSoon name="Signup" />} />
        <Route path="/dashboard" element={<ComingSoon name="Dashboard" />} />

        {/* Fallback — redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
