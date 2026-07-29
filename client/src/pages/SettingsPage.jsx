import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import PasswordForm from '../components/PasswordForm';
import DangerZone from '../components/DangerZone';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import { 
  Settings, 
  User, 
  Bell, 
  Target, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  LogOut,
  Calendar,
  Clock
} from 'lucide-react';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  
  // Placement Goals State
  const [targetRole, setTargetRole] = useState(user?.placementGoal?.targetRole || 'Software Developer');
  const [targetCompanies, setTargetCompanies] = useState(user?.placementGoal?.targetCompanies?.join(', ') || 'Google, Amazon, Microsoft');
  const [prepLevel, setPrepLevel] = useState(user?.placementGoal?.prepLevel || 'Intermediate');

  // Notifications State
  const [dsaReminders, setDsaReminders] = useState(user?.notifications?.dsaReminders ?? true);
  const [weeklyReport, setWeeklyReport] = useState(user?.notifications?.weeklyReport ?? true);
  const [aiSuggestions, setAiSuggestions] = useState(user?.notifications?.aiSuggestions ?? true);
  const [emailNotifications, setEmailNotifications] = useState(user?.notifications?.emailNotifications ?? false);

  const [savingSettings, setSavingSettings] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const payload = {
        placementGoal: {
          targetRole,
          targetCompanies: targetCompanies.split(',').map(c => c.trim()).filter(Boolean),
          prepLevel,
        },
        notifications: {
          dsaReminders,
          weeklyReport,
          aiSuggestions,
          emailNotifications,
        },
      };

      const res = await userService.updateSettings(payload);
      if (res.success) {
        setSuccessMessage('Settings updated successfully!');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleExportData = async () => {
    setExportingData(true);
    try {
      const dataPayload = await userService.exportData();
      const { generateUserDataPDF } = await import('../utils/pdfExporter');
      generateUserDataPDF(dataPayload);
      setSuccessMessage('Placement data report downloaded successfully as PDF!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to generate PDF report.');
    } finally {
      setExportingData(false);
    }
  };

  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Settings className="w-6 h-6 text-blue-600" /> Account & App Settings
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your preferences, security credentials, target goals, and notification settings.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button 
              onClick={handleExportData}
              disabled={exportingData}
              className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-1.5"
              title="Download My Data (.PDF)"
            >
              <Download className="w-4 h-4 text-blue-600" />
              {exportingData ? 'Generating PDF...' : 'Export PDF Report'}
            </button>

            <button 
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {savingSettings ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Account Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900 text-base">Account Information</h3>
            </div>
            <button 
              onClick={logout} 
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="text-slate-400 font-medium">Logged in User</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{user?.name}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="text-slate-400 font-medium">Email Address</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5 truncate">{user?.email}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Member Since
              </span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{memberSince}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Session Status
              </span>
              <p className="font-bold text-emerald-600 text-sm mt-0.5">Active</p>
            </div>
          </div>
        </div>

        {/* 2. Placement Goals */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900 text-base">Placement Goals & Targets</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Target Role</label>
              <input 
                type="text" 
                value={targetRole} 
                onChange={(e) => setTargetRole(e.target.value)}
                className="input-field text-xs"
                placeholder="e.g. Software Engineer, Full Stack"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Target Companies (Comma separated)</label>
              <input 
                type="text" 
                value={targetCompanies} 
                onChange={(e) => setTargetCompanies(e.target.value)}
                className="input-field text-xs"
                placeholder="Google, Amazon, Microsoft"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Preparation Level</label>
              <select 
                value={prepLevel} 
                onChange={(e) => setPrepLevel(e.target.value)}
                className="input-field text-xs"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Notification Preferences */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900 text-base">Notification Preferences</h3>
          </div>

          <div className="space-y-3 divide-y divide-slate-100">
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs font-semibold text-slate-900">Daily DSA Reminders</p>
                <p className="text-[11px] text-slate-500">Receive reminders to complete daily DSA problem goals.</p>
              </div>
              <input 
                type="checkbox" 
                checked={dsaReminders} 
                onChange={(e) => setDsaReminders(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-semibold text-slate-900">Weekly Progress Report</p>
                <p className="text-[11px] text-slate-500">Get a weekly email summary of tasks and resume scores.</p>
              </div>
              <input 
                type="checkbox" 
                checked={weeklyReport} 
                onChange={(e) => setWeeklyReport(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-semibold text-slate-900">AI Placement Suggestions</p>
                <p className="text-[11px] text-slate-500">Proactive AI tips on resume gaps and weak topic practice.</p>
              </div>
              <input 
                type="checkbox" 
                checked={aiSuggestions} 
                onChange={(e) => setAiSuggestions(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-semibold text-slate-900">Email Notifications</p>
                <p className="text-[11px] text-slate-500">Receive major portal announcements and updates via email.</p>
              </div>
              <input 
                type="checkbox" 
                checked={emailNotifications} 
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 4. Password Security */}
        <PasswordForm />

        {/* 5. Danger Zone (Account Deletion) */}
        <DangerZone />

      </main>
    </div>
  );
};

export default SettingsPage;
