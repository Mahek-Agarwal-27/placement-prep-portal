import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import focusService from '../services/focusService';
import activityService from '../services/activityService';
import activityTrackerService from '../services/activityTrackerService';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import FloatingAIAssistant from '../components/FloatingAIAssistant';
import StudyTimer from '../components/StudyTimer';
import {
  Flame,
  Target,
  Code2,
  FileText,
  MessageSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  RefreshCw,
  Calendar as CalendarIcon,
  CheckCircle2,
  BookOpen,
  Bot,
  Circle,
  MapPin,
  Mic,
  Award
} from 'lucide-react';

import taskService from '../services/taskService';
import questionService from '../services/questionService';
import interviewService from '../services/interviewService';

const DashboardPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [showRecModal, setShowRecModal] = useState(false);

  // Dedicated overview card states
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [upcomingDSA, setUpcomingDSA] = useState([]);
  const [upcomingInterview, setUpcomingInterview] = useState(null);

  // Analytics state
  const [analytics, setAnalytics] = useState({
    currentStreak: 0,
    longestStreak: 0,
    studyHours: 0,
    readinessScore: 0,
    dsaProgress: 0,
    resumeScore: null,
    interviewProgress: 0,
    aiSessions: 0,
    weeklyStudyData: [],
  });

  const fetchData = async () => {
    try {
      const [analyticsRes, activityStatsRes, upcomingRes, questionsRes, interviewsRes] = await Promise.all([
        userService.getAnalytics(),
        activityTrackerService.getActivityStats(),
        taskService.getUpcomingSession(),
        questionService.getQuestions({ status: 'to-do' }),
        interviewService.getInterviews(),
      ]);

      let realtimeHours = 0;
      let realtimeMinutes = 0;
      if (activityStatsRes.success && activityStatsRes.data) {
        realtimeMinutes = activityStatsRes.data.totalMinutes || 0;
        realtimeHours = activityStatsRes.data.totalHours || 0;
      }

      if (analyticsRes.success && analyticsRes.data) {
        setAnalytics({
          ...analyticsRes.data,
          studyHours: realtimeHours > 0 ? realtimeHours : analyticsRes.data.studyHours,
          totalMinutes: realtimeMinutes,
        });
      }

      if (upcomingRes.success && Array.isArray(upcomingRes.data)) {
        setUpcomingTasks(upcomingRes.data);
      } else if (upcomingRes.success && upcomingRes.data) {
        setUpcomingTasks([upcomingRes.data]);
      } else {
        setUpcomingTasks([]);
      }

      if (questionsRes.success && Array.isArray(questionsRes.data)) {
        setUpcomingDSA(questionsRes.data);
      } else {
        setUpcomingDSA([]);
      }

      if (interviewsRes.success && Array.isArray(interviewsRes.data)) {
        const activeOrRecent = interviewsRes.data.find(i => i.status === 'active') || interviewsRes.data[0] || null;
        setUpcomingInterview(activeOrRecent);
      } else {
        setUpcomingInterview(null);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#EFE9FE] flex text-[#1A1A2E] font-sans antialiased">
      {/* ── LEFT SIDEBAR (Matching reference design 1) ────────────────────── */}
      <Sidebar />

      {/* ── MAIN CONTENT AREA ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* ── TOP HEADER BAR (Matching reference design 1) ─────────────────── */}
        <Navbar />

        {/* ── MAIN DASHBOARD CONTAINER ───────────────────────────────────── */}
        <main className="p-8 space-y-8 max-w-[1500px] w-full mx-auto">

          {/* ── AI OVERVIEW PANEL (Matching Reference Design 1 Top Outer Container) ── */}
          <div className="purple-panel bg-[#E8DEFD] border border-[#D7C7FE] rounded-3xl p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-extrabold text-[#1A1A2E] tracking-tight mb-2">
              AI Overview
            </h2>

            {/* 4 Equal White Sub-cards Row matching exact layout in Reference Design 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              {/* Card 1: AI Recommendation */}
              <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6C47FF] flex items-center justify-center mb-3">
                    <Bot className="w-5 h-5 text-[#6C47FF]" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    AI Recommendation
                  </span>
                  <h3 className="text-sm font-extrabold text-[#1A1A2E] leading-snug">
                    Focus on Graphs this week.
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 font-medium">
                    AI recommends Graphs this week to maximize interview readiness.
                  </p>
                </div>
                <button
                  onClick={() => setShowRecModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#6C47FF] text-white text-xs font-bold hover:bg-[#5A36EC] transition-all shadow-xs"
                >
                  View Recommendation
                </button>
              </div>

              {/* Card 2: Resume Status */}
              <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6C47FF] flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5 text-[#6C47FF]" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Resume Status
                  </span>
                  <h3 className="text-sm font-extrabold text-emerald-600 leading-snug">
                    Ready for Review
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 font-medium">
                    Improve your resume before your next interview.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/resume-analyzer')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#6C47FF] text-white text-xs font-bold hover:bg-[#5A36EC] transition-all shadow-xs"
                >
                  Improve Resume
                </button>
              </div>

              {/* Card 3: Mock Interview */}
              <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6C47FF] flex items-center justify-center mb-3">
                    <Mic className="w-5 h-5 text-[#6C47FF]" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Mock Interview
                  </span>
                  <h3 className="text-sm font-extrabold text-[#1A1A2E] leading-snug">
                    Next Session
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 font-medium">
                    Today • 6:00 PM
                  </p>
                </div>
                <button
                  onClick={() => navigate('/mock-interview')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#6C47FF] text-white text-xs font-bold hover:bg-[#5A36EC] transition-all shadow-xs"
                >
                  View Details
                </button>
              </div>

              {/* Card 4: Roadmap Progress */}
              <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6C47FF] flex items-center justify-center mb-3">
                    <Sparkles className="w-5 h-5 text-[#6C47FF]" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Roadmap Progress
                  </span>
                  <h3 className="text-sm font-extrabold text-emerald-600 leading-snug">
                    Week 3 Unlocked
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 font-medium">
                    Continue learning and stay on track.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/study-planner')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#6C47FF] text-white text-xs font-bold hover:bg-[#5A36EC] transition-all shadow-xs"
                >
                  Continue Learning
                </button>
              </div>

            </div>
          </div>

          {/* ── REAL-TIME METRICS & DSA PROGRESS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: DSA Progress */}
            <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6C47FF] flex items-center justify-center shrink-0">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  DSA Solved
                </span>
                <h3 className="text-2xl font-black text-[#1A1A2E] mt-0.5">
                  {analytics.dsaProgress || 0} <span className="text-xs font-semibold text-gray-400">problems</span>
                </h3>
                <Link to="/dsa-tracker" className="text-xs text-[#6C47FF] font-bold hover:underline mt-1 inline-block">
                  Go to DSA Tracker →
                </Link>
              </div>
            </div>

            {/* Card 2: Readiness Score */}
            <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Readiness Score
                </span>
                <h3 className="text-2xl font-black text-[#1A1A2E] mt-0.5">
                  {analytics.readinessScore || 0}%
                </h3>
                <Link to="/analytics" className="text-xs text-[#6C47FF] font-bold hover:underline mt-1 inline-block">
                  View Analytics →
                </Link>
              </div>
            </div>

            {/* Card 3: Study Hours */}
            <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Study Hours
                </span>
                <h3 className="text-2xl font-black text-[#1A1A2E] mt-0.5">
                  {analytics.studyHours && analytics.studyHours >= 1 ? (
                    <>
                      {analytics.studyHours} <span className="text-xs font-semibold text-gray-400">mins</span>
                    </>
                  ) : (
                    <>
                      {analytics.totalMinutes || 0} <span className="text-xs font-semibold text-gray-400">mins</span>
                    </>
                  )}
                </h3>
                <span className="text-xs text-gray-400 font-medium mt-1 block">Live timer tracking</span>
              </div>
            </div>

            {/* Card 4: Current Streak */}
            <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Current Streak
                </span>
                <h3 className="text-2xl font-black text-[#1A1A2E] mt-0.5">
                  {analytics.currentStreak || 0} <span className="text-xs font-semibold text-gray-400">days</span>
                </h3>
                <span className="text-xs text-gray-400 font-medium mt-1 block">Keep it up! 🔥</span>
              </div>
            </div>
          </div>

          {/* ── UPCOMING SESSIONS & PREPARATION OVERVIEW PANEL ── */}
          <div className="purple-panel bg-[#E8DEFD] border border-[#D7C7FE] rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-[#1A1A2E] tracking-tight">
              Upcoming Sessions & Action Items
            </h2>

            {/* Grid of 3 Independent Dedicated Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Dedicated Card 1: Study Planner (Multi-task support) */}
              <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-xs flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#6C47FF] text-white flex items-center justify-center shrink-0">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                        Study Planner
                      </span>
                      <span className="text-xs font-extrabold text-[#1A1A2E]">
                        {upcomingTasks.length > 0 ? `${upcomingTasks.length} Upcoming Tasks` : 'Planner'}
                      </span>
                    </div>
                  </div>

                  {upcomingTasks.length > 0 ? (
                    <div className="space-y-2 mt-3 divide-y divide-gray-100">
                      {upcomingTasks.slice(0, 2).map((t, idx) => (
                        <div key={t._id || idx} className={idx > 0 ? 'pt-2' : ''}>
                          <h3 className="text-xs font-black text-[#1A1A2E] truncate">
                            {t.title}
                          </h3>
                          <p className="text-[11px] font-bold text-[#6C47FF] mt-0.5">
                            {t.dueDate ? (
                              new Date(t.dueDate).toDateString() === new Date().toDateString()
                                ? 'Today'
                                : new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            ) : (
                              'Scheduled'
                            )}
                            {t.category ? ` • ${t.category}` : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 space-y-1">
                      <h3 className="text-xs font-bold text-gray-700">
                        No upcoming sessions scheduled.
                      </h3>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Schedule study tasks in your Study Planner.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate('/study-planner')}
                  className="w-full py-2 px-3 rounded-xl border border-purple-200 text-[#1A1A2E] text-xs font-bold hover:bg-purple-50 transition-all text-center mt-2"
                >
                  Go to Study Planner
                </button>
              </div>

              {/* Dedicated Card 2: DSA Practice Overview */}
              <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-xs flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6C47FF] flex items-center justify-center shrink-0">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                        DSA Practice
                      </span>
                      <span className="text-xs font-extrabold text-[#1A1A2E]">
                        {upcomingDSA.length > 0 ? `${upcomingDSA.length} Pending Problems` : 'DSA Queue'}
                      </span>
                    </div>
                  </div>

                  {upcomingDSA.length > 0 ? (
                    <div className="space-y-2 mt-3 divide-y divide-gray-100">
                      {upcomingDSA.slice(0, 2).map((q, idx) => (
                        <div key={q._id || idx} className={idx > 0 ? 'pt-2' : ''}>
                          <h3 className="text-xs font-black text-[#1A1A2E] truncate">
                            {q.title}
                          </h3>
                          <p className="text-[11px] font-bold text-emerald-600 mt-0.5">
                            {q.difficulty} • {q.topic || 'DSA'} ({q.platform || 'LeetCode'})
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 space-y-1">
                      <h3 className="text-xs font-bold text-gray-700">
                        No upcoming DSA tasks.
                      </h3>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Add target DSA problems to your tracker.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate('/dsa-tracker')}
                  className="w-full py-2 px-3 rounded-xl border border-purple-200 text-[#1A1A2E] text-xs font-bold hover:bg-purple-50 transition-all text-center mt-2"
                >
                  Open DSA Tracker
                </button>
              </div>

              {/* Dedicated Card 3: Mock Interview Overview */}
              <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-xs flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Mic className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                        Mock Interview
                      </span>
                      <span className="text-xs font-extrabold text-[#1A1A2E]">
                        {upcomingInterview?.status === 'active' ? 'Active Session' : 'AI Recruiter'}
                      </span>
                    </div>
                  </div>

                  {upcomingInterview ? (
                    <div className="mt-3 space-y-1">
                      <h3 className="text-xs font-black text-[#1A1A2E] truncate">
                        {upcomingInterview.topic || 'Technical Interview'}
                      </h3>
                      <p className="text-[11px] font-bold text-blue-600">
                        {upcomingInterview.type || 'Technical'} Round • {upcomingInterview.status === 'active' ? 'In Progress' : 'Last Session'}
                      </p>
                      <p className="text-[11px] text-gray-500 font-medium line-clamp-1">
                        {upcomingInterview.status === 'active'
                          ? 'Session ready to continue'
                          : upcomingInterview.feedback?.score !== null && upcomingInterview.feedback?.score !== undefined
                            ? `Last Score: ${upcomingInterview.feedback.score}%`
                            : 'Ready for new evaluation'}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-1">
                      <h3 className="text-xs font-bold text-gray-700">
                        No interview scheduled.
                      </h3>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Start a mock interview with AI Recruiter.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate('/mock-interview')}
                  className="w-full py-2 px-3 rounded-xl border border-purple-200 text-[#1A1A2E] text-xs font-bold hover:bg-purple-50 transition-all text-center mt-2"
                >
                  {upcomingInterview?.status === 'active' ? 'Resume Session' : 'Start Mock Interview'}
                </button>
              </div>

            </div>
          </div>

          {/* ── LIVE STUDY TIMER & STATS (Functional backend tracking kept intact) ── */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-[#1A1A2E] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#6C47FF]" /> Study Tracker & Live Analytics
            </h3>
            <StudyTimer onSessionChange={fetchData} />
          </div>

        </main>
      </div>

      {/* AI Recommendation Modal */}
      {showRecModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-purple-100 rounded-3xl max-w-lg w-full p-6 shadow-xl space-y-5 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6C47FF] flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase text-[#6C47FF] tracking-wider">AI Recommendation Plan</span>
                <h3 className="text-xl font-black text-[#1A1A2E] mt-0.5">Focus on Graphs & Tree Data Structures</h3>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed bg-purple-50/60 p-4 rounded-2xl border border-purple-100">
              <p className="font-semibold text-slate-900">
                Based on your recent problem activity and targeted role:
              </p>
              <ul className="space-y-2 list-disc list-inside text-gray-600">
                <li>Solve 5 Graph Traversal problems (BFS & DFS).</li>
                <li>Review Topological Sorting & Shortest Path (Dijkstra's Algorithm).</li>
                <li>Practice 2 Medium LeetCode Graph interview questions.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRecModal(false)}
                className="px-5 py-2.5 rounded-2xl border border-purple-200 text-[#1A1A2E] text-xs font-bold hover:bg-purple-50 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => { setShowRecModal(false); navigate('/dsa-tracker'); }}
                className="px-6 py-2.5 rounded-2xl bg-[#6C47FF] text-white text-xs font-bold hover:bg-[#5A36EC] transition-all shadow-sm"
              >
                Open DSA Practice →
              </button>
            </div>
          </div>
        </div>
      )}

      <FloatingAIAssistant />
    </div>
  );
};

export default DashboardPage;
