import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
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
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleExportData = async () => {
    setExportingData(true);
    try {
      const res = await userService.exportUserData();
      if (res.success && res.data) {
        const text = `
=== HireNovaAI User Data & Placement Report ===
Name: ${res.data.user.name}
Email: ${res.data.user.email}
Role Target: ${res.data.user.placementGoal?.targetRole || 'N/A'}
Preparation Level: ${res.data.user.placementGoal?.prepLevel || 'N/A'}
Target Companies: ${res.data.user.placementGoal?.targetCompanies?.join(', ') || 'N/A'}
Report Generated: ${new Date().toLocaleString()}

DSA Questions Logged (${res.data.questionsCount}):
${res.data.questions.map(q => `- ${q.title} [${q.difficulty}] (${q.status})`).join('\n')}

Study Tasks (${res.data.tasksCount}):
${res.data.tasks.map(t => `- ${t.title} [${t.priority}] (${t.status})`).join('\n')}

Resume Scans (${res.data.resumesCount}):
${res.data.resumes.map(r => `- Score: ${r.atsScore}/100 - ${new Date(r.createdAt).toLocaleDateString()}`).join('\n')}
        `.trim();

        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `HireNovaAI_Report_${res.data.user.name.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      setErrorMessage('Failed to export user data');
    } finally {
      setExportingData(false);
    }
  };

  const memberSinceFormatted = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="min-h-screen bg-[#EFE9FE] flex text-[#1A1A2E] font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="flex-1 max-w-[1500px] mx-auto w-full p-4 sm:p-6 lg:p-8 pb-24 sm:pb-12 lg:pb-8 space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-200/60 pb-5 sm:pb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1A1A2E] tracking-tight flex items-center gap-2">
              <Settings className="w-6 h-6 text-[#6C47FF]" /> Settings & Preferences
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
              Manage your profile preferences, placement target goals, security credentials, and notifications.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <button 
              onClick={handleExportData}
              disabled={exportingData}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-white border border-purple-200 text-[#1A1A2E] text-xs font-bold hover:bg-purple-50 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#6C47FF]" />
              {exportingData ? 'Exporting...' : 'Export Data'}
            </button>
            <button 
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-[#6C47FF] text-white text-xs font-bold hover:bg-[#5A36EC] transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {savingSettings ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Profile Summary Card */}
        <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover border-2 border-[#6C47FF] shadow-md shrink-0 aspect-square" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#8B5CF6] text-white text-2xl font-black flex items-center justify-center shadow-md shrink-0 aspect-square">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div>
              <h2 className="text-lg font-black text-[#1A1A2E]">{user?.name || 'User Profile'}</h2>
              <p className="text-xs text-gray-500 font-medium">{user?.email || 'user@example.com'}</p>
              <span className="text-[11px] font-bold text-[#6C47FF] mt-1 inline-block bg-purple-50 px-2.5 py-0.5 rounded-md">
                Member since {memberSinceFormatted}
              </span>
            </div>
          </div>

          <button 
            onClick={logout}
            className="px-4 py-2 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs hover:bg-rose-100 transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* 2. Target Placement Goals Form */}
        <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-purple-100 pb-3">
            <Target className="w-5 h-5 text-[#6C47FF]" />
            <h3 className="text-base font-extrabold text-[#1A1A2E]">Placement Goals & Preferences</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Target Role
              </label>
              <input 
                type="text" 
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. SDE-1, Fullstack Engineer, Data Analyst"
                className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 text-xs font-semibold outline-none focus:border-[#6C47FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Target Companies (comma separated)
              </label>
              <input 
                type="text" 
                value={targetCompanies}
                onChange={(e) => setTargetCompanies(e.target.value)}
                placeholder="Google, Amazon, Microsoft, Flipkart"
                className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 text-xs font-semibold outline-none focus:border-[#6C47FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Current Preparation Level
              </label>
              <select
                value={prepLevel}
                onChange={(e) => setPrepLevel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 text-xs font-semibold outline-none focus:border-[#6C47FF]"
              >
                <option value="Beginner">Beginner (Starting DSA & Basics)</option>
                <option value="Intermediate">Intermediate (Practicing LeetCode & Projects)</option>
                <option value="Advanced">Advanced (Mock Interviews & System Design)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Notification Preferences */}
        <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-purple-100 pb-3">
            <Bell className="w-5 h-5 text-[#6C47FF]" />
            <h3 className="text-base font-extrabold text-[#1A1A2E]">Notification & Reminder Preferences</h3>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs font-bold text-[#1A1A2E]">DSA Daily Reminders</p>
                <p className="text-[11px] text-gray-500 font-medium">Get reminded to solve daily DSA practice problems.</p>
              </div>
              <input 
                type="checkbox" 
                checked={dsaReminders} 
                onChange={(e) => setDsaReminders(e.target.checked)}
                className="w-4 h-4 accent-[#6C47FF] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-purple-50">
              <div>
                <p className="text-xs font-bold text-[#1A1A2E]">Weekly Progress Report</p>
                <p className="text-[11px] text-gray-500 font-medium">Get a weekly email summary of tasks and resume scores.</p>
              </div>
              <input 
                type="checkbox" 
                checked={weeklyReport} 
                onChange={(e) => setWeeklyReport(e.target.checked)}
                className="w-4 h-4 accent-[#6C47FF] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-purple-50">
              <div>
                <p className="text-xs font-bold text-[#1A1A2E]">AI Placement Suggestions</p>
                <p className="text-[11px] text-gray-500 font-medium">Proactive AI tips on resume gaps and weak topic practice.</p>
              </div>
              <input 
                type="checkbox" 
                checked={aiSuggestions} 
                onChange={(e) => setAiSuggestions(e.target.checked)}
                className="w-4 h-4 accent-[#6C47FF] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-purple-50">
              <div>
                <p className="text-xs font-bold text-[#1A1A2E]">Email Notifications</p>
                <p className="text-[11px] text-gray-500 font-medium">Receive major portal announcements and updates via email.</p>
              </div>
              <input 
                type="checkbox" 
                checked={emailNotifications} 
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 accent-[#6C47FF] rounded cursor-pointer"
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
    </div>
  );
};

export default SettingsPage;
