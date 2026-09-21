import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import questionService from '../services/questionService';
import taskService from '../services/taskService';
import resumeService from '../services/resumeService';
import interviewService from '../services/interviewService';
import userService from '../services/userService';
import {
  BarChart3,
  Code2,
  FileText,
  MessageSquare,
  CheckCircle2,
  Calendar,
  RotateCcw,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  Check,
} from 'lucide-react';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6'];

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  
  // Reset Modal States
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetOptions, setResetOptions] = useState({
    resetDsa: true,
    resetTasks: true,
    resetStudySessions: true,
    resetStreak: true,
    resetInterviews: true,
    resetResumes: true,
  });
  
  // Stats States
  const [dsaStats, setDsaStats] = useState([]);
  const [dsaTotal, setDsaTotal] = useState(0);
  const [taskStats, setTaskStats] = useState(null);
  const [taskChartData, setTaskChartData] = useState([]);
  const [resumeData, setResumeData] = useState([]);
  const [interviewData, setInterviewData] = useState([]);

  const fetchAnalytics = useCallback(async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true);
    setError('');
    try {
      const [qRes, tRes, rRes, iRes] = await Promise.all([
        questionService.getStats(),
        taskService.getTaskStats(),
        resumeService.getResumes(),
        interviewService.getInterviews(),
      ]);
      
      // 1. Process DSA Stats
      if (qRes.success && qRes.data) {
        const { byDifficulty, totalSolved } = qRes.data;
        if (Array.isArray(byDifficulty)) {
          const formattedDsa = byDifficulty.map((d) => ({
            name: d._id || 'Unknown',
            value: d.solved ?? d.count ?? 0,
          })).filter(item => item.value > 0);
          setDsaStats(formattedDsa);
        } else {
          setDsaStats([]);
        }
        setDsaTotal(totalSolved ?? 0);
      } else {
        setDsaStats([]);
        setDsaTotal(0);
      }

      // 2. Process Study Planner & Task Tracker Stats
      if (tRes.success && tRes.data) {
        setTaskStats(tRes.data);
        const byCat = tRes.data.byCategory || [];
        if (byCat.length > 0) {
          const formattedTasks = byCat.map((cat) => ({
            name: cat._id || 'General',
            completed: cat.completed || 0,
            pending: Math.max(0, (cat.total || 0) - (cat.completed || 0)),
            total: cat.total || 0,
          }));
          setTaskChartData(formattedTasks);
        } else if ((tRes.data.totalTasks || 0) > 0) {
          setTaskChartData([
            { name: 'Completed', completed: tRes.data.totalCompleted || 0, pending: 0 },
            { name: 'In Progress', completed: 0, pending: tRes.data.totalInProgress || 0 },
            { name: 'Pending', completed: 0, pending: tRes.data.totalPending || 0 },
          ]);
        } else {
          setTaskChartData([]);
        }
      } else {
        setTaskStats(null);
        setTaskChartData([]);
      }

      // 3. Process Resume Scores Over Time
      if (rRes.success && Array.isArray(rRes.data)) {
        const formattedResume = rRes.data.slice().reverse().map((r, i) => ({
          name: `Scan ${i + 1}`,
          score: r.atsScore || 0,
        }));
        setResumeData(formattedResume);
      } else {
        setResumeData([]);
      }

      // 4. Process Mock Interview Scores
      if (iRes.success && Array.isArray(iRes.data)) {
        const formattedInterview = iRes.data
          .map((item, idx) => {
            const scoreVal = item.feedback?.score ?? item.score;
            return {
              name: item.topic ? (item.topic.length > 14 ? `${item.topic.slice(0, 14)}...` : item.topic) : `Session ${idx + 1}`,
              score: scoreVal !== undefined && scoreVal !== null ? Number(scoreVal) : null,
            };
          })
          .filter(item => item.score !== null && !isNaN(item.score))
          .reverse();
        setInterviewData(formattedInterview);
      } else {
        setInterviewData([]);
      }
    } catch (err) {
      setError('Failed to load analytics.');
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(true);
  }, [fetchAnalytics]);

  const handleConfirmReset = async () => {
    setIsResetting(true);
    setError('');
    setResetSuccess('');
    try {
      await userService.resetAnalytics(resetOptions);
      setShowResetModal(false);
      setResetSuccess('Progress and placement analytics reset successfully!');
      await fetchAnalytics(false);
      setTimeout(() => setResetSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to reset analytics:', err);
      setError('Failed to reset analytics data. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const highestResumeScore = resumeData.length > 0 ? Math.max(...resumeData.map(r => r.score)) : 0;
  const highestInterviewScore = interviewData.length > 0 ? Math.max(...interviewData.map(i => i.score)) : 0;

  return (
    <div className="min-h-screen bg-[#EFE9FE] flex text-[#1A1A2E] font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="max-w-[1500px] mx-auto w-full p-4 sm:p-6 lg:p-8 pb-24 sm:pb-12 lg:pb-8 space-y-6 sm:space-y-8 flex-1">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-5 sm:pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#6C47FF]" /> Progress & Placement Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Unified view of your DSA progress, study task tracker, resume ATS scores, and interview evaluations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowResetModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-semibold text-xs sm:text-sm shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
              title="Reset Progress and Analytics"
            >
              <RotateCcw className="w-4 h-4 text-rose-500" />
              <span>Reset Analytics</span>
            </button>
          </div>
        </div>

        {resetSuccess && (
          <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{resetSuccess}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 sm:p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* KPI Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Total Solved</p>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{dsaTotal}</h3>
              </div>
              <div className="p-2 sm:p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <Code2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-2">DSA problems completed</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Study Tasks Done</p>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{taskStats?.totalCompleted ?? 0}</h3>
              </div>
              <div className="p-2 sm:p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-2">out of {taskStats?.totalTasks ?? 0} total tasks</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Peak ATS Score</p>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  {highestResumeScore ? `${highestResumeScore}%` : 'N/A'}
                </h3>
              </div>
              <div className="p-2 sm:p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-2">Best resume scan result</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Top Interview Grade</p>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  {highestInterviewScore ? `${highestInterviewScore}%` : 'N/A'}
                </h3>
              </div>
              <div className="p-2 sm:p-2.5 bg-rose-50 text-rose-600 rounded-lg">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-2">AI evaluation score</p>
          </div>

        </div>

        {/* Charts Grid: 2x2 Clean Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
          
          {/* Chart 1: DSA Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex justify-between items-center gap-2 mb-4">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 truncate min-w-0">
                <Code2 className="w-4 h-4 text-[#6C47FF] shrink-0" />
                <span className="truncate">DSA Difficulty Distribution</span>
              </h3>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                {dsaTotal} Total Solved
              </span>
            </div>
            <div className="h-56 sm:h-64">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
              ) : dsaStats.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">No DSA data available.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dsaStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {dsaStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px', fontSize: '12px' }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 2: Study Tasks Progress & Category Distribution */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex justify-between items-center gap-2 mb-4">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 truncate min-w-0">
                <Calendar className="w-4 h-4 text-[#6C47FF] shrink-0" />
                <span className="truncate">Study Task Tracker</span>
              </h3>
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 whitespace-nowrap shrink-0">
                {taskStats?.totalCompleted || 0}/{taskStats?.totalTasks || 0} Tasks Done
              </span>
            </div>
            <div className="h-56 sm:h-64">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
              ) : taskChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">No study tasks data available. Add tasks in Study Planner.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px', fontSize: '12px' }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" name="Pending" fill="#6C47FF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 3: Resume History */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex justify-between items-center gap-2 mb-4">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 truncate min-w-0">
                <FileText className="w-4 h-4 text-[#6C47FF] shrink-0" />
                <span className="truncate">Resume ATS Score History</span>
              </h3>
              <span className="text-[10px] sm:text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100 whitespace-nowrap shrink-0">
                Peak: {highestResumeScore}%
              </span>
            </div>
            <div className="h-56 sm:h-64">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
              ) : resumeData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">No resume history available.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={resumeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="score" stroke="#7C3AED" strokeWidth={2.5} dot={{ fill: '#7C3AED', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 4: Mock Interview Performance */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex justify-between items-center gap-2 mb-4">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 truncate min-w-0">
                <MessageSquare className="w-4 h-4 text-[#6C47FF] shrink-0" />
                <span className="truncate">Mock Interview Score Progress</span>
              </h3>
              <span className="text-[10px] sm:text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 whitespace-nowrap shrink-0">
                Top: {highestInterviewScore}%
              </span>
            </div>
            <div className="h-56 sm:h-64">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
              ) : interviewData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">No mock interview data available.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={interviewData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="score" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>

      </main>
      </div>

      {/* Reset Analytics Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Reset Placement & Progress</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Select the analytics modules you want to reset</p>
                </div>
              </div>
              <button
                onClick={() => !isResetting && setShowResetModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-medium text-slate-500">Modules to Reset</span>
              <button
                type="button"
                onClick={() => {
                  const allSelected = Object.values(resetOptions).every(Boolean);
                  setResetOptions({
                    resetDsa: !allSelected,
                    resetTasks: !allSelected,
                    resetStudySessions: !allSelected,
                    resetStreak: !allSelected,
                    resetInterviews: !allSelected,
                    resetResumes: !allSelected,
                  });
                }}
                className="text-[11px] font-bold text-[#6C47FF] hover:underline cursor-pointer"
              >
                {Object.values(resetOptions).every(Boolean) ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-0.5">
              <div
                onClick={() => setResetOptions(prev => ({ ...prev, resetDsa: !prev.resetDsa }))}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  resetOptions.resetDsa ? 'bg-purple-50/70 border-[#6C47FF]/40' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Code2 className="w-4 h-4 text-[#6C47FF] shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">DSA Practice Progress</p>
                    <p className="text-[11px] text-slate-500">Reset solved problems count & mark to-do</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={resetOptions.resetDsa}
                  onChange={() => {}}
                  className="rounded text-[#6C47FF] focus:ring-[#6C47FF] cursor-pointer"
                />
              </div>

              <div
                onClick={() => setResetOptions(prev => ({ ...prev, resetTasks: !prev.resetTasks }))}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  resetOptions.resetTasks ? 'bg-purple-50/70 border-[#6C47FF]/40' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#6C47FF] shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Study Tasks & Tracker</p>
                    <p className="text-[11px] text-slate-500">Reset completed tasks back to pending</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={resetOptions.resetTasks}
                  onChange={() => {}}
                  className="rounded text-[#6C47FF] focus:ring-[#6C47FF] cursor-pointer"
                />
              </div>

              <div
                onClick={() => setResetOptions(prev => ({ ...prev, resetStudySessions: !prev.resetStudySessions, resetStreak: !prev.resetStreak }))}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  resetOptions.resetStudySessions ? 'bg-purple-50/70 border-[#6C47FF]/40' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-[#6C47FF] shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Study Sessions & Activity Streak</p>
                    <p className="text-[11px] text-slate-500">Reset logged study hours & daily streak</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={resetOptions.resetStudySessions}
                  onChange={() => {}}
                  className="rounded text-[#6C47FF] focus:ring-[#6C47FF] cursor-pointer"
                />
              </div>

              <div
                onClick={() => setResetOptions(prev => ({ ...prev, resetInterviews: !prev.resetInterviews }))}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  resetOptions.resetInterviews ? 'bg-purple-50/70 border-[#6C47FF]/40' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-[#6C47FF] shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Mock Interview Score Progress</p>
                    <p className="text-[11px] text-slate-500">Clear past interview score evaluations</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={resetOptions.resetInterviews}
                  onChange={() => {}}
                  className="rounded text-[#6C47FF] focus:ring-[#6C47FF] cursor-pointer"
                />
              </div>

              <div
                onClick={() => setResetOptions(prev => ({ ...prev, resetResumes: !prev.resetResumes }))}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  resetOptions.resetResumes ? 'bg-purple-50/70 border-[#6C47FF]/40' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#6C47FF] shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Resume ATS Score History</p>
                    <p className="text-[11px] text-slate-500">Clear resume evaluation score history</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={resetOptions.resetResumes}
                  onChange={() => {}}
                  className="rounded text-[#6C47FF] focus:ring-[#6C47FF] cursor-pointer"
                />
              </div>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>Warning: This will reset your selected placement analytics and progress data.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={isResetting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={isResetting || !Object.values(resetOptions).some(Boolean)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Reset Selected</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;

