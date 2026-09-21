import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import {
  Code2,
  FileText,
  Calendar as CalendarIcon,
  Mic,
  ArrowRight,
  CheckCircle2,
  Target,
  Flame,
  Activity,
  TrendingUp,
  Sparkles
} from 'lucide-react';

import taskService from '../services/taskService';
import questionService from '../services/questionService';
import interviewService from '../services/interviewService';
import resumeService from '../services/resumeService';
import activityService from '../services/activityService';

const DashboardPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // Real user data state
  const [tasks, setTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [pendingDSA, setPendingDSA] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [upcomingInterview, setUpcomingInterview] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [latestResume, setLatestResume] = useState(null);
  const [activities, setActivities] = useState([]);

  const fetchData = async () => {
    try {
      const [tasksRes, upcomingRes, questionsRes, pendingQRes, interviewsRes, resumesRes, actRes] = await Promise.allSettled([
        taskService.getTasks(),
        taskService.getUpcomingSession(),
        questionService.getQuestions(),
        questionService.getQuestions({ status: 'to-do' }),
        interviewService.getInterviews(),
        resumeService.getResumes(),
        activityService.getActivities(),
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

      if (actRes.status === 'fulfilled' && actRes.value?.success && Array.isArray(actRes.value.data)) {
        setActivities(actRes.value.data);
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

  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;

  // Compute Today's Mission tasks from real student data (Unified & non-repeating)
  const getDailyMissions = () => {
    return [
      {
        tag: 'Resume ATS',
        icon: FileText,
        title: latestResume ? 'Review ATS Keywords' : 'Upload & Scan Resume',
        subtitle: latestResume
          ? `ATS Score: ${latestResume.atsScore || 0}% • ${latestResume.targetRole || 'Target Role'}`
          : 'Benchmark resume ATS score and identify skill gaps',
        completed: Boolean(latestResume),
        statusLabel: latestResume ? `${latestResume.atsScore || 0}% ATS` : 'To Do',
        actionLabel: latestResume ? 'Improve Resume' : 'Analyze Resume',
        path: '/resume-analyzer',
      },
      {
        tag: 'DSA Tracker',
        icon: Code2,
        title: pendingDSA.length > 0 ? `Solve: ${pendingDSA[0].title}` : (questions.length > 0 ? 'Practice Core DSA' : 'Add Target DSA Problem'),
        subtitle: pendingDSA.length > 0
          ? `${pendingDSA[0].difficulty} • ${pendingDSA[0].topic || 'DSA'} (${pendingDSA[0].platform || 'LeetCode'})`
          : (questions.length > 0 ? `${questions.length} problems logged in tracker` : 'Queue coding challenges for daily practice'),
        completed: pendingDSA.length === 0 && questions.length > 0,
        statusLabel: pendingDSA.length > 0 ? `${pendingDSA.length} Pending` : (questions.length > 0 ? 'Completed' : 'To Do'),
        actionLabel: 'Open DSA Tracker',
        path: '/dsa-tracker',
      },
      {
        tag: 'AI Interview',
        icon: Mic,
        title: upcomingInterview?.status === 'active'
          ? `Resume: ${upcomingInterview.topic || 'Interview'}`
          : (interviews.length > 0 ? (upcomingInterview?.topic || 'Technical Interview') : 'First Mock Interview'),
        subtitle: upcomingInterview?.status === 'active'
          ? 'Live technical round in progress'
          : (interviews.length > 0
            ? `Last Score: ${upcomingInterview?.feedback?.score || 0}% • ${upcomingInterview?.type || 'Technical'} Round`
            : 'Simulate 15-minute interview with AI Recruiter'),
        completed: Boolean(interviews.length > 0 && upcomingInterview?.status !== 'active'),
        statusLabel: upcomingInterview?.status === 'active'
          ? 'In Progress'
          : (interviews.length > 0 ? 'Evaluated' : 'To Do'),
        actionLabel: upcomingInterview?.status === 'active' ? 'Resume Session' : 'Start Interview',
        path: '/mock-interview',
      },
      {
        tag: 'Study Planner',
        icon: CalendarIcon,
        title: upcomingTasks.length > 0
          ? `Task: ${upcomingTasks[0].title}`
          : (tasks.length > 0 ? 'Daily Study Milestone' : 'Schedule Study Tasks'),
        subtitle: upcomingTasks.length > 0
          ? `${upcomingTasks[0].dueDate ? 'Due Today' : 'Scheduled'} • ${upcomingTasks[0].category || 'General'}`
          : (tasks.length > 0 ? `${completedTasksCount} of ${tasks.length} tasks finished` : 'Set daily preparation milestones and schedule tasks'),
        completed: upcomingTasks.length === 0 && completedTasksCount > 0,
        statusLabel: tasks.length > 0 ? `${Math.round((completedTasksCount / tasks.length) * 100)}% Done` : 'To Do',
        actionLabel: tasks.length > 0 ? 'Open Study Planner' : 'Create Study Plan',
        path: '/study-planner',
      },
    ];
  };

  const dailyMissions = getDailyMissions();
  const completedMissionsCount = dailyMissions.filter((m) => m.completed).length;

  // Compute real 7-day activity rhythm & consistency
  const getWeeklyRhythm = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const isToday = i === 0;

      // Check activity logs
      const dayActivities = (activities || []).filter((a) => {
        const aDate = new Date(a.createdAt || a.timestamp || a.date);
        return !isNaN(aDate) && aDate.toISOString().split('T')[0] === dateStr;
      });

      // Check completed tasks
      const dayCompletedTasks = (tasks || []).filter((t) => {
        if (t.status !== 'completed') return false;
        const tDate = new Date(t.updatedAt || t.createdAt);
        return !isNaN(tDate) && tDate.toISOString().split('T')[0] === dateStr;
      });

      // Check solved questions
      const dayQuestions = (questions || []).filter((q) => {
        if (q.status !== 'solved') return false;
        const qDate = new Date(q.updatedAt || q.createdAt);
        return !isNaN(qDate) && qDate.toISOString().split('T')[0] === dateStr;
      });

      // Check interviews
      const dayInterviews = (interviews || []).filter((iv) => {
        const ivDate = new Date(iv.createdAt || iv.updatedAt);
        return !isNaN(ivDate) && ivDate.toISOString().split('T')[0] === dateStr;
      });

      const totalCount = dayActivities.length + dayCompletedTasks.length + dayQuestions.length + dayInterviews.length;

      days.push({
        dateStr,
        dayLabel,
        dayNum,
        isToday,
        count: totalCount,
        isActive: totalCount > 0,
      });
    }
    return days;
  };

  const weeklyDays = getWeeklyRhythm();
  const activeDaysCount = weeklyDays.filter((d) => d.isActive).length;
  const consistencyPercentage = Math.round((activeDaysCount / 7) * 100);
  const currentStreak = user?.streak?.currentStreak || (activeDaysCount > 0 ? (weeklyDays[6].isActive ? 1 : 0) : 0);
  const longestStreak = Math.max(user?.streak?.longestStreak || 0, currentStreak);

  const getAIInsight = () => {
    if (currentStreak >= 3 || activeDaysCount >= 4) {
      return "You've been consistently practicing this week. Keep building your preparation habit.";
    }
    if (currentStreak >= 1 || activeDaysCount >= 1) {
      return "Good momentum! Solve a DSA challenge or practice a mock interview today to maintain your streak.";
    }
    return "No study activity recorded yet this week. Complete a mission above to kickstart your learning rhythm.";
  };

  return (
    <div className="min-h-screen bg-[#EFE9FE] flex text-[#1A1A2E] font-sans antialiased">
      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────── */}
      <Sidebar />

      {/* ── MAIN CONTENT AREA ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* ── TOP HEADER BAR ─────────────────────────────────────────── */}
        <Navbar />

        {/* ── MAIN DASHBOARD CONTAINER ───────────────────────────────── */}
        <main className="p-4 sm:p-6 lg:p-8 pb-24 sm:pb-12 lg:pb-8 space-y-6 sm:space-y-8 max-w-[1500px] w-full mx-auto">

          {/* ── TODAY'S MISSION (Main Actionable Hub) ── */}
          <div className="purple-panel bg-[#E8DEFD] border border-[#D7C7FE] rounded-3xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 shadow-sm">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-200/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#6C47FF] text-white flex items-center justify-center shadow-xs shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#1A1A2E] tracking-tight">
                    Today's Mission
                  </h2>
                  <p className="text-[11px] sm:text-xs text-gray-600 font-medium">
                    Small, consistent steps toward your dream placement.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-bold text-[#6C47FF] bg-white px-3.5 py-1.5 rounded-full border border-purple-200 shadow-2xs">
                  {completedMissionsCount} of {dailyMissions.length} Complete
                </span>
              </div>
            </div>

            {/* 4 Large Mission Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {dailyMissions.map((mission, idx) => {
                const Icon = mission.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-purple-100 shadow-xs hover:shadow-md hover:border-purple-200 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-100 text-[#6C47FF] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>

                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            mission.completed
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : mission.statusLabel === 'In Progress'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-purple-50 text-[#6C47FF] border-purple-200'
                          }`}
                        >
                          {mission.completed && <CheckCircle2 className="w-3 h-3 inline mr-1 text-emerald-600" />}
                          {mission.statusLabel}
                        </span>
                      </div>

                      <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                        {mission.tag}
                      </span>
                      <h3 className="text-sm font-extrabold text-[#1A1A2E] leading-snug truncate">
                        {mission.title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1.5 font-medium line-clamp-2 leading-relaxed">
                        {mission.subtitle}
                      </p>
                    </div>

                    <button
                      onClick={() => navigate(mission.path)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#6C47FF] text-white text-xs font-bold hover:bg-[#5A36EC] transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>{mission.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── YOUR LEARNING RHYTHM SECTION (Directly below Today's Mission) ── */}
          <div className="purple-panel bg-[#E8DEFD] border border-[#D7C7FE] rounded-3xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 shadow-sm">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-200/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#6C47FF] text-white flex items-center justify-center shadow-xs shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#1A1A2E] tracking-tight">
                    Your Learning Rhythm
                  </h2>
                  <p className="text-[11px] sm:text-xs text-gray-600 font-medium">
                    Show your learning consistency and study activity.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-bold text-[#6C47FF] bg-white px-3.5 py-1.5 rounded-full border border-purple-200 shadow-2xs">
                  {activeDaysCount} of 7 Days Active
                </span>
              </div>
            </div>

            {/* 3 Balanced Sub-Cards */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
              
              {/* 1. Weekly Activity Heatmap */}
              <div className="md:col-span-5 bg-white rounded-2xl p-4 sm:p-5 border border-purple-100 shadow-xs flex flex-col justify-between space-y-3 sm:space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                      7-Day Activity
                    </span>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-100 text-[#6C47FF] flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-extrabold text-[#1A1A2E]">Weekly Activity Heatmap</h3>
                  <p className="text-xs text-gray-600 mt-1 font-medium">
                    Actual study sessions & tasks over the last 7 days.
                  </p>
                </div>

                {/* 7 Day Blocks */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
                  {weeklyDays.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1 sm:gap-1.5 min-w-0">
                      <span className={`text-[10px] sm:text-[11px] font-bold ${day.isToday ? 'text-[#6C47FF]' : 'text-gray-500'} truncate`}>
                        {day.dayLabel}
                      </span>
                      <div
                        className={`w-full aspect-square rounded-lg sm:rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-extrabold transition-all border ${
                          day.isActive
                            ? 'bg-[#6C47FF] text-white border-[#5A36EC] shadow-xs'
                            : 'bg-[#F6F2FE] text-gray-400 border-purple-100/60'
                        } ${day.isToday ? 'ring-2 ring-[#6C47FF] ring-offset-1 sm:ring-offset-2' : ''}`}
                        title={`${day.dayLabel} (${day.dateStr}): ${day.count} activities`}
                      >
                        {day.isActive ? (
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                        ) : (
                          <span className="text-[10px] sm:text-[11px] font-bold opacity-70">{day.dayNum}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-gray-500 font-medium pt-2 border-t border-purple-50">
                  <span className="truncate pr-2">{activeDaysCount === 0 ? 'No activity this week' : `${activeDaysCount} active days recorded`}</span>
                  <span className="flex items-center gap-1.5 text-[#6C47FF] font-bold shrink-0">
                    <span className="w-2 h-2 rounded-full bg-[#6C47FF]"></span> Active
                  </span>
                </div>
              </div>

              {/* 2. Streak & Consistency Metrics */}
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3 sm:gap-3.5">
                {/* Current Streak */}
                <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Current Streak
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-xl sm:text-2xl font-black text-[#1A1A2E]">{currentStreak}</span>
                      <span className="text-xs font-bold text-gray-500">Days</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium mt-0.5">
                      {currentStreak > 0 ? `Best: ${longestStreak} days` : 'Practice today to start'}
                    </p>
                  </div>
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 ${currentStreak > 0 ? 'bg-amber-100 text-amber-600' : 'bg-purple-100 text-purple-400'}`}>
                    <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>

                {/* Study Consistency */}
                <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Study Consistency
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-xl sm:text-2xl font-black text-[#6C47FF]">{consistencyPercentage}%</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium mt-0.5">
                      {activeDaysCount}/7 active days this week
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-purple-100 text-[#6C47FF] flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </div>

              {/* 3. AI Insight Card */}
              <div className="md:col-span-4 bg-white rounded-2xl p-4 sm:p-5 border border-purple-100 shadow-xs flex flex-col justify-between space-y-3 sm:space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <span className="text-[10px] sm:text-[11px] font-bold text-[#6C47FF] uppercase tracking-wider flex items-center gap-1.5 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                      <Sparkles className="w-3.5 h-3.5 text-[#6C47FF]" />
                      AI Rhythm Insight
                    </span>
                    <span className="text-[10px] font-bold text-gray-500">Realtime</span>
                  </div>

                  <h3 className="text-sm font-extrabold text-[#1A1A2E] leading-snug">
                    {currentStreak >= 3 || activeDaysCount >= 4
                      ? 'Consistent Preparation Momentum'
                      : activeDaysCount >= 1
                        ? 'Building Preparation Habit'
                        : 'Kickstart Your Rhythm'}
                  </h3>

                  <p className="text-xs text-gray-600 mt-2 font-medium leading-relaxed bg-[#F8F5FF] p-3 rounded-xl border border-purple-100/60">
                    "{getAIInsight()}"
                  </p>
                </div>

                <div className="pt-2 border-t border-purple-50 flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium">
                    Calculated from actual study data
                  </span>
                  <Link
                    to="/analytics"
                    className="text-xs font-bold text-[#6C47FF] hover:underline flex items-center gap-1"
                  >
                    <span>View Analytics</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default DashboardPage;


