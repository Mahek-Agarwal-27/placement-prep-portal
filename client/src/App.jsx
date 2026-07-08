import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import DSATrackerPage from './pages/DSATrackerPage';
import StudyPlannerPage from './pages/StudyPlannerPage';
import NotesPage from './pages/NotesPage';

// ----- Root App Component -----
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Main Landing Redirects to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dsa-tracker"
            element={
              <ProtectedRoute>
                <DSATrackerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-planner"
            element={
              <ProtectedRoute>
                <StudyPlannerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <NotesPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback — redirect unknown routes */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
