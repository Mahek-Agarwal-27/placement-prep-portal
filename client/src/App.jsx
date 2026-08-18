import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './components/SplashScreen';

// Import Pages
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import DSATrackerPage from './pages/DSATrackerPage';
import StudyPlannerPage from './pages/StudyPlannerPage';
import NotesPage from './pages/NotesPage';
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage';
import InterviewPage from './pages/InterviewPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import AIHistoryPage from './pages/AIHistoryPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import FloatingAIAssistant from './components/FloatingAIAssistant';

// ----- Root App Component -----
function App() {
  // Show splash only once per browser session
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem('splash-shown') === 'true'
  );

  const handleSplashDone = () => {
    sessionStorage.setItem('splash-shown', 'true');
    setSplashDone(true);
  };

  return (
    <>
      {/* Splash Screen — shown once per session */}
      {!splashDone && <SplashScreen onDone={handleSplashDone} />}

      <AuthProvider>
        <Router>
          <Routes>
            {/* Main Landing Route & Marketing Sub-pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Public Auth Routes */}
            <Route path="/login"  element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute><SettingsPage /></ProtectedRoute>
            } />
            <Route path="/ai-history" element={
              <ProtectedRoute><AIHistoryPage /></ProtectedRoute>
            } />
            <Route path="/dsa" element={
              <ProtectedRoute><DSATrackerPage /></ProtectedRoute>
            } />
            <Route path="/dsa-tracker" element={
              <ProtectedRoute><DSATrackerPage /></ProtectedRoute>
            } />
            <Route path="/planner" element={
              <ProtectedRoute><StudyPlannerPage /></ProtectedRoute>
            } />
            <Route path="/study-planner" element={
              <ProtectedRoute><StudyPlannerPage /></ProtectedRoute>
            } />
            <Route path="/notes" element={
              <ProtectedRoute><NotesPage /></ProtectedRoute>
            } />
            <Route path="/resume" element={
              <ProtectedRoute><ResumeAnalyzerPage /></ProtectedRoute>
            } />
            <Route path="/resume-analyzer" element={
              <ProtectedRoute><ResumeAnalyzerPage /></ProtectedRoute>
            } />
            <Route path="/interview" element={
              <ProtectedRoute><InterviewPage /></ProtectedRoute>
            } />
            <Route path="/mock-interview" element={
              <ProtectedRoute><InterviewPage /></ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute><AnalyticsPage /></ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <FloatingAIAssistant />
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;
