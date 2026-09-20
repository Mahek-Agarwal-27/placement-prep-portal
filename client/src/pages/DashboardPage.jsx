import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import FloatingAIAssistant from '../components/FloatingAIAssistant';
import {
  Code2,
  FileText,
  Sparkles,
  Calendar as CalendarIcon,
  Bot,
  Mic,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';

import taskService from '../services/taskService';
import questionService from '../services/questionService';
import interviewService from '../services/interviewService';
import resumeService from '../services/resumeService';

const DashboardPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [showRecModal, setShowRecModal] = useState(false);

  // Real user data state
  const [tasks, setTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [pendingDSA, setPendingDSA] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [upcomingInterview, setUpcomingInterview] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [latestResume, setLatestResume] = useState(null);

  const fetchData = async () => {
    try {
      const [tasksRes, upcomingRes, questionsRes, pendingQRes, interviewsRes, resumesRes] = await Promise.allSettled([
        taskService.getTasks(),
        taskService.getUpcomingSession(),
        questionService.getQuestions(),
        questionService.getQuestions({ status: 'to-do' }),
        interviewService.getInterviews(),
        resumeService.getResumes(),
      ]);

      if (tasksRes.status === 'fulfilled' && tasksRes.value?.success && Array.isArray(tasksRes.value.data)) {
        setTasks(tasksRes.value.data);
      }

      if (upcomingRes.status === 'fulfilled' && upcomingRes.value?.success) {
        if (Array.isArray(upcomingRes.value.data)) {
          setUpcomingTasks(upcomingRes.value.data);
        } else if (upcomingRes.value.data) {
          setUpcomingTasks([upcomingRes.value.data]);
        } else {
          setUpcomingTasks([]);
        }
      }

      if (questionsRes.status === 'fulfilled' && questionsRes.value?.success && Array.isArray(questionsRes.value.data)) {
        setQuestions(questionsRes.value.data);
      }

      if (pendingQRes.status === 'fulfilled' && pendingQRes.value?.success && Array.isArray(pendingQRes.value.data)) {
        setPendingDSA(pendingQRes.value.data);
      }

      if (interviewsRes.status === 'fulfilled' && interviewsRes.value?.success && Array.isArray(interviewsRes.value.data)) {
        const list = interviewsRes.value.data;
        setInterviews(list);
        const activeOrRecent = list.find((i) => i.status === 'active') || list[0] || null;
        setUpcomingInterview(activeOrRecent);
      }

      if (resumesRes.status === 'fulfilled' && resumesRes.value?.success && Array.isArray(resumesRes.value.data)) {
        setResumes(resumesRes.value.data);
        setLatestResume(resumesRes.value.data[0] || null);
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

  // Compute dynamic AI Recommendation based on real user activity
  const getDynamicAIRecommendation = () => {
    if (!latestResume) {
      return {
        title: 'Upload Resume for ATS Check',
        shortDesc: 'Analyze your resume ATS match score & get instant optimization tips.',
        modalTitle: 'AI Resume ATS Recommendation',
        modalPoints: [
          'Upload your latest resume in PDF or DOCX format.',
          'Benchmark your technical keywords against modern job descriptions.',
          'Identify missing skills to pass corporate automated screeners.'
        ],
        actionLabel: 'Go to Resume Analyzer',
        actionPath: '/resume-analyzer'
      };
    }

    if (pendingDSA.length > 0) {
      const topTopic = pendingDSA[0]?.topic || 'Data Structures';
      return {
        title: `Focus on ${topTopic}`,
        shortDesc: `You have ${pendingDSA.length} pending problem${pendingDSA.length === 1 ? '' : 's'}. Target ${topTopic} to build problem-solving agility.`,
        modalTitle: `AI DSA Strategy: ${topTopic}`,
        modalPoints: [
          `Prioritize pending questions: ${pendingDSA.slice(0, 2).map((q) => q.title).join(', ')}.`,
          'Focus on time & space complexity edge cases.',
          'Mark questions as completed to track your mastery progress.'
        ],
        actionLabel: 'Open DSA Tracker',
        actionPath: '/dsa-tracker'
      };
    }

    if (interviews.length === 0) {
      return {
        title: 'Start First Mock Interview',
        shortDesc: 'Simulate live technical & behavioral rounds with AI Recruiter.',
        modalTitle: 'AI Interview Readiness Recommendation',
        modalPoints: [
          'Practice live coding explanations and problem formulation.',
          'Receive detailed scoring on technical accuracy & communication.',
          'Review AI feedback breakdown to target weak spots.'
        ],
        actionLabel: 'Start Mock Interview',
        actionPath: '/mock-interview'
      };
    }

    const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
    return {
      title: 'Maintain Prep Consistency',
      shortDesc: `${completedTasksCount}/${tasks.length || 0} tasks done • ${questions.length} DSA problems logged. Keep your momentum going.`,
      modalTitle: 'AI Placement Roadmap',
      modalPoints: [
        'Review your recent mock interview feedback notes.',
        'Complete today\'s study milestones in the study planner.',
        'Solve 1-2 medium DSA problems to stay sharp.'
      ],
      actionLabel: 'Open Study Planner',
      actionPath: '/study-planner'
    };
  };

  const aiRec = getDynamicAIRecommendation();
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-[#EFE9FE] flex text-[#1A1A2E] font-sans antialiased">
      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────── */}
      <Sidebar />

      {/* ── MAIN CONTENT AREA ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* ── TOP HEADER BAR ─────────────────────────────────────────── */}
        <Navbar />

        {/* ── MAIN DASHBOARD CONTAINER ───────────────────────────────── */}
        <main className="p-8 space-y-8 max-w-[1500px] w-full mx-auto">

          {/* ── AI OVERVIEW PANEL ── */}
          <div className="purple-panel bg-[#E8DEFD] border border-[#D7C7FE] rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#1A1A2E] tracking-tight">
                AI Overview
              </h2>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-200/60 px-3 py-1 rounded-full border border-purple-300/40">
                Live Insights
              </span>
            </div>

            {/* 4 Equal Workable Sub-cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              {/* Card 1: AI Recommendation */}
              <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6C47FF] flex items-center justify-center mb-3">
                    <Bot className="w-5 h-5 text-[#6C47FF]" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    AI Recommendation
                  </span>
                  <h3 className="text-sm font-extrabold text-[#1A1A2E] leading-snug line-clamp-1">
                    {aiRec.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 font-medium line-clamp-2">
                    {aiRec.shortDesc}
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
              <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6C47FF] flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5 text-[#6C47FF]" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Resume Status
                  </span>
                  {latestResume ? (
                    <>
                      <h3 className="text-sm font-extrabold text-emerald-600 leading-snug">
                        ATS Score: {latestResume.atsScore || 0}%
                      </h3>
                      <p className="text-xs text-gray-500 mt-2 font-medium line-clamp-2">
                        {latestResume.targetRole ? `Target: ${latestResume.targetRole}` : (latestResume.fileName || 'Resume analyzed')}
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-extrabold text-[#1A1A2E] leading-snug">
                        No Resume Analyzed
                      </h3>
                      <p className="text-xs text-gray-500 mt-2 font-medium line-clamp-2">
                        Upload your resume to get instant ATS match scoring & feedback.
                      </p>
                    </>
                  )}
                </div>
                <button
                  onClick={() => navigate('/resume-analyzer')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#6C47FF] text-white text-xs font-bold hover:bg-[#5A36EC] transition-all shadow-xs"
                >
                  {latestResume ? 'Improve Resume' : 'Analyze Resume'}
                </button>
              </div>

              {/* Card 3: Mock Interview */}
              <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6C47FF] flex items-center justify-center mb-3">
                    <Mic className="w-5 h-5 text-[#6C47FF]" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Mock Interview
                  </span>
                  {upcomingInterview ? (
                    <>
                      <h3 className="text-sm font-extrabold text-[#1A1A2E] leading-snug line-clamp-1">
                        {upcomingInterview.topic || 'Interview Session'}
                      </h3>
                      <p className="text-xs text-gray-500 mt-2 font-medium line-clamp-2">
                        {upcomingInterview.status === 'active'
                          ? 'Active session in progress'
                          : upcomingInterview.feedback?.score !== undefined
                            ? `Last Score: ${upcomingInterview.feedback.score}% • ${upcomingInterview.type || 'Technical'}`
                            : `${upcomingInterview.type || 'Technical'} Round completed`}
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-extrabold text-[#1A1A2E] leading-snug">
                        No Sessions Yet
                      </h3>
                      <p className="text-xs text-gray-500 mt-2 font-medium line-clamp-2">
                        Simulate live technical & HR interview rounds with AI.
                      </p>
                    </>
                  )}
                </div>
                <button
                  onClick={() => navigate('/mock-interview')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#6C47FF] text-white text-xs font-bold hover:bg-[#5A36EC] transition-all shadow-xs"
                >
                  {upcomingInterview?.status === 'active' ? 'Resume Session' : 'Start Mock Interview'}
                </button>
              </div>

              {/* Card 4: Roadmap Progress */}
              <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6C47FF] flex items-center justify-center mb-3">
                    <Sparkles className="w-5 h-5 text-[#6C47FF]" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Study Planner Progress
                  </span>
                  {tasks.length > 0 ? (
                    <>
                      <h3 className="text-sm font-extrabold text-emerald-600 leading-snug">
                        {completedTasksCount} of {tasks.length} Completed
                      </h3>
                      <p className="text-xs text-gray-500 mt-2 font-medium line-clamp-2">
                        {tasks.length - completedTasksCount > 0
                          ? `${tasks.length - completedTasksCount} pending tasks in your roadmap.`
                          : 'All scheduled tasks completed! Great work.'}
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-extrabold text-[#1A1A2E] leading-snug">
                        Plan Your Roadmap
                      </h3>
                      <p className="text-xs text-gray-500 mt-2 font-medium line-clamp-2">
                        Create study tasks and milestone roadmaps to ace placements.
                      </p>
                    </>
                  )}
                </div>
                <button
                  onClick={() => navigate('/study-planner')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#6C47FF] text-white text-xs font-bold hover:bg-[#5A36EC] transition-all shadow-xs"
                >
                  {tasks.length > 0 ? 'Continue Learning' : 'Create Study Plan'}
                </button>
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
                        {pendingDSA.length > 0 ? `${pendingDSA.length} Pending Problems` : `${questions.length} Problems Logged`}
                      </span>
                    </div>
                  </div>

                  {pendingDSA.length > 0 ? (
                    <div className="space-y-2 mt-3 divide-y divide-gray-100">
                      {pendingDSA.slice(0, 2).map((q, idx) => (
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
                        {questions.length > 0 ? 'All pending DSA problems completed!' : 'No upcoming DSA tasks.'}
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

        </main>
      </div>

      {/* AI Recommendation Modal (Dynamic) */}
      {showRecModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-purple-100 rounded-3xl max-w-lg w-full p-6 shadow-xl space-y-5 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6C47FF] flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase text-[#6C47FF] tracking-wider">AI Recommendation Plan</span>
                <h3 className="text-xl font-black text-[#1A1A2E] mt-0.5">{aiRec.modalTitle}</h3>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed bg-purple-50/60 p-4 rounded-2xl border border-purple-100">
              <p className="font-semibold text-slate-900">
                Actionable roadmap based on your current preparation status:
              </p>
              <ul className="space-y-2 list-disc list-inside text-gray-600">
                {aiRec.modalPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
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
                onClick={() => {
                  setShowRecModal(false);
                  navigate(aiRec.actionPath);
                }}
                className="px-6 py-2.5 rounded-2xl bg-[#6C47FF] text-white text-xs font-bold hover:bg-[#5A36EC] transition-all shadow-sm"
              >
                {aiRec.actionLabel} →
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

