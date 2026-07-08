/**
 * pages/DashboardPage.jsx — Dashboard Landing
 * 
 * Includes the statistics layout, streak display, and highly professional 
 * visual placeholders for DSA Progress, Study Planner, Resume Score, and Interview Prep.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import questionService from '../services/questionService';
import taskService from '../services/taskService';
import noteService from '../services/noteService';
import resumeService from '../services/resumeService';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  const [dsaBreakdown, setDsaBreakdown] = useState({ easy: 0, medium: 0, hard: 0, total: 0 });
  const [agenda, setAgenda] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [totalStudyHours, setTotalStudyHours] = useState(0);
  const [latestResumeScore, setLatestResumeScore] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qStatsRes, tasksRes, notesRes, resumeRes] = await Promise.all([
          questionService.getStats(),
          taskService.getTasks({ status: '' }), // fetch all, we will slice
          noteService.getNotes(),
          resumeService.getResumes()
        ]);
        
        if (qStatsRes.success && qStatsRes.data?.byDifficulty) {
          const breakdown = { easy: 0, medium: 0, hard: 0, total: 0 };
          qStatsRes.data.byDifficulty.forEach(d => {
            if (d._id === 'Easy') breakdown.easy = d.count;
            if (d._id === 'Medium') breakdown.medium = d.count;
            if (d._id === 'Hard') breakdown.hard = d.count;
            breakdown.total += d.count;
          });
          setDsaBreakdown(breakdown);
        }
        
        if (tasksRes.success && tasksRes.data) {
          // Priority to pending/in-progress, then completed. Take top 3.
          const tasks = tasksRes.data.sort((a, b) => {
            if (a.status !== 'completed' && b.status === 'completed') return -1;
            if (a.status === 'completed' && b.status !== 'completed') return 1;
            return new Date(a.createdAt) - new Date(b.createdAt);
          });
          setAgenda(tasks.slice(0, 3));
          
          const completedHours = tasksRes.data
            .filter(t => t.status === 'completed')
            .reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
          setTotalStudyHours(completedHours);
        }

        if (notesRes.success && notesRes.data) {
          setRecentNotes(notesRes.data.slice(0, 3));
        }

        if (resumeRes.success && resumeRes.data && resumeRes.data.length > 0) {
          setLatestResumeScore(resumeRes.data[0].score);
        } else {
          setLatestResumeScore(null);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navbar Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-wider gradient-text">
            PlacementPro
          </span>
          <span className="text-xs bg-indigo-950 text-indigo-300 font-semibold px-2 py-0.5 rounded border border-indigo-800">
            Beta
          </span>
        </div>
        <nav className="hidden sm:flex items-center gap-5 text-sm font-semibold">
          <Link to="/dashboard" className="text-indigo-400 border-b-2 border-indigo-500 pb-1">
            Dashboard
          </Link>
          <Link to="/dsa-tracker" className="text-slate-400 hover:text-white transition-colors">
            DSA Tracker
          </Link>
          <Link to="/study-planner" className="text-slate-400 hover:text-white transition-colors">
            Study Planner
          </Link>
          <Link to="/notes" className="text-slate-400 hover:text-white transition-colors">
            AI Notes
          </Link>
          <Link to="/resume-analyzer" className="text-slate-400 hover:text-white transition-colors">
            Resume Analyzer
          </Link>
          <Link to="/mock-interview" className="text-slate-400 hover:text-white transition-colors">
            Mock Interview
          </Link>
          <Link to="/analytics" className="text-slate-400 hover:text-white transition-colors">
            Analytics
          </Link>
          <Link to="/profile" className="text-slate-400 hover:text-white transition-colors">
            Profile
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-slate-300 text-sm hidden md:inline">
            Hello, <strong className="text-white">{user?.name}</strong>
          </span>
          <button onClick={logout} className="btn-secondary px-4 py-2 text-xs">
            Sign Out
          </button>
        </div>
      </header>

      {/* Hero Welcome Banner */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8 space-y-8 animate-fade-in">
        {/* Profile incomplete banner if profile is empty */}
        {(!user?.profile?.college || !user?.profile?.skills || user.profile.skills.length === 0) && (
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-indigo-300 text-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 flex-shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Your profile looks a bit thin! Complete your academic profile and list your technical skills.</span>
            </div>
            <Link to="/profile" className="btn-primary py-1.5 px-4 text-xs shrink-0">
              Complete Profile
            </Link>
          </div>
        )}

        <section className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          {/* Decorative design glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500 rounded-full blur-[120px] opacity-10 pointer-events-none"></div>

          <div className="space-y-2 relative">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Ready for your next step, {user?.name}?
            </h2>
            <p className="text-slate-400 max-w-xl text-sm md:text-base">
              Welcome to the placement portal. Start tracking your DSA questions, prepare structured calendar study tasks, analyze resumes, and generate AI-driven roadmap lists.
            </p>
          </div>
          <div className="flex gap-4 relative shrink-0 w-full md:w-auto justify-center">
            <div className="card text-center py-4 px-6 border-slate-800 bg-slate-900/80 flex flex-col justify-center items-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">
                Current Streak
              </p>
              <p className="text-3xl font-extrabold text-amber-500 animate-pulse flex items-center gap-1">
                🔥 {user?.streak?.currentStreak || 0}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Longest: {user?.streak?.longestStreak || 0} days
              </p>
            </div>
          </div>
        </section>

        {/* Temporary Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                DSA Solved
              </h3>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-900">
                Active
              </span>
            </div>
            <p className="text-4xl font-extrabold text-white">
              {user?.stats?.totalDSASolved || 0} <span className="text-lg text-slate-500 font-normal">problems</span>
            </p>
          </div>
          <div className="card">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Tasks Completed
              </h3>
              <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-900">
                Scheduled
              </span>
            </div>
            <p className="text-4xl font-extrabold text-white">
              {user?.stats?.totalTasksDone || 0} <span className="text-lg text-slate-500 font-normal">done</span>
            </p>
          </div>
          <div className="card">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Study Time
              </h3>
              <span className="text-[10px] text-violet-400 font-semibold bg-violet-950/80 px-2 py-0.5 rounded border border-violet-900">
                Log Time
              </span>
            </div>
            <p className="text-4xl font-extrabold text-white">
              {user?.stats?.totalStudyHours || 0} <span className="text-lg text-slate-500 font-normal">hours</span>
            </p>
          </div>
        </section>

        {/* Feature Dashboard Placeholders Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          
          {/* Card 1: DSA Progress Placeholder */}
          <div className="card bg-slate-900 border-slate-800 p-6 flex flex-col justify-between h-96 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 rounded-full blur-[70px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"></div>
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">
                    &lt;/&gt;
                  </div>
                  <h4 className="font-bold text-white text-lg">DSA Progress Tracker</h4>
                </div>
              </div>
              <p className="text-slate-450 text-xs mb-6">
                Keep track of your solved DSA problems from LeetCode, Codeforces, or GeeksforGeeks. Get category analysis and difficulty logs.
              </p>

              {/* Visual graph using real data */}
              <div className="space-y-3 bg-slate-950/40 border border-slate-800/80 rounded-xl p-4">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Easy
                  </span>
                  <span>{dsaBreakdown.easy} Solved</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: dsaBreakdown.total ? `${(dsaBreakdown.easy / dsaBreakdown.total) * 100}%` : '0%' }}></div>
                </div>

                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-amber-500 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    Medium
                  </span>
                  <span>{dsaBreakdown.medium} Solved</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: dsaBreakdown.total ? `${(dsaBreakdown.medium / dsaBreakdown.total) * 100}%` : '0%' }}></div>
                </div>

                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-rose-500 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    Hard
                  </span>
                  <span>{dsaBreakdown.hard} Solved</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full transition-all" style={{ width: dsaBreakdown.total ? `${(dsaBreakdown.hard / dsaBreakdown.total) * 100}%` : '0%' }}></div>
                </div>
              </div>
            </div>
            <Link to="/dsa-tracker" className="btn-primary w-full justify-center text-xs mt-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Open DSA Tracker
            </Link>
          </div>

          {/* Card 2: Study Planner Placeholder */}
          <div className="card bg-slate-900 border-slate-800 p-6 flex flex-col justify-between h-96 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500 rounded-full blur-[70px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"></div>
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-white text-lg">Daily Study Planner</h4>
                </div>
              </div>
              <p className="text-slate-450 text-xs mb-4">
                Organize your study calendar. Set custom preparation tasks, log daily timings, and stay on track with automated reminders.
              </p>

              {/* Visual real list */}
              <div className="space-y-2.5 bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 min-h-[120px]">
                {agenda.length === 0 ? (
                   <p className="text-slate-500 text-xs text-center pt-8">No tasks scheduled. Create one in the planner!</p>
                ) : (
                  agenda.map(task => (
                    <div key={task._id} className="flex items-center justify-between text-xs pb-2 border-b border-slate-900/60 last:border-b-0 last:pb-0">
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-2 h-2 shrink-0 rounded-full ${task.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        <span className={`font-medium truncate ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-350'}`}>{task.title}</span>
                      </div>
                      <span className="text-slate-500 text-[10px] shrink-0 ml-2">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'No Date'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <Link to="/study-planner" className="btn-primary w-full justify-center text-xs mt-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Open Study Planner
            </Link>
          </div>

          {/* Card 3: AI Notes */}
          <div className="card bg-slate-900 border-slate-800 p-6 flex flex-col justify-between h-96 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500 rounded-full blur-[70px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"></div>
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-955 text-violet-400 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-white text-lg">AI-Integrated Notes</h4>
                </div>
              </div>
              <p className="text-slate-450 text-xs mb-4">
                Capture study logs, coding patterns, and concept definitions. Let Gemini AI summarize, explain, or improve your drafts.
              </p>

              {/* Visual list of recent notes */}
              <div className="space-y-2.5 bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 min-h-[120px]">
                {recentNotes.length === 0 ? (
                  <p className="text-slate-500 text-xs text-center pt-8">No notes yet. Start writing with AI help!</p>
                ) : (
                  recentNotes.map(note => (
                    <div key={note._id} className="flex items-center justify-between text-xs pb-2 border-b border-slate-900/60 last:border-b-0 last:pb-0">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-500 text-[10px]">📝</span>
                        <span className="font-medium truncate text-slate-300">{note.title}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded shrink-0 ml-2">
                        {note.folder}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <Link to="/notes" className="btn-primary w-full justify-center text-xs mt-4 flex items-center gap-2 bg-violet-600 hover:bg-violet-500 border-violet-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Open AI Notes
            </Link>
          </div>

          {/* Card 4: AI Resume Analyzer */}
          <div className="card bg-slate-900 border-slate-800 p-6 flex flex-col justify-between h-96 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500 rounded-full blur-[70px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"></div>
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-955 text-violet-400 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-white text-lg">AI Resume Analyzer</h4>
                </div>
              </div>
              <p className="text-slate-450 text-xs mb-6">
                Upload your resume, parse details, and compare it with current job descriptions. Receive Gemini-powered optimization scores and grammar audits.
              </p>

              {/* Visual mock score circle */}
              <div className="flex items-center gap-6 bg-slate-950/40 border border-slate-800/80 rounded-xl p-4">
                <div className="relative w-16 h-16 flex items-center justify-center bg-violet-955 rounded-full border-4 border-violet-900 border-t-violet-500 shadow-md">
                  <span className="text-white font-extrabold text-sm">{latestResumeScore !== null ? `${latestResumeScore}%` : 'N/A'}</span>
                </div>
                <div className="space-y-1 text-xs text-slate-400">
                  <p className="text-white font-bold text-sm">Review Metrics</p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Length & Layout
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Keyword Matching
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Bullet-point Impact
                  </p>
                </div>
              </div>
            </div>
            <Link to="/resume-analyzer" className="btn-primary w-full justify-center text-xs mt-4 flex items-center gap-2 bg-violet-600 hover:bg-violet-500 border-violet-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Open Resume Analyzer
            </Link>
          </div>

          {/* Card 4: Interview Preparation Placeholder */}
          <div className="card bg-slate-900 border-slate-800 p-6 flex flex-col justify-between h-96 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500 rounded-full blur-[70px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"></div>
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-955 text-rose-400 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-white text-lg">AI Mock Interview</h4>
                </div>
              </div>
              <p className="text-slate-450 text-xs mb-6">
                Prepare for technical and behavioral placement rounds. Undergo conversational interviews powered by the Gemini API with structured transcripts.
              </p>

              {/* Visual details */}
              <div className="space-y-2 bg-slate-950/40 border border-slate-800/80 rounded-xl p-4">
                <div className="flex justify-between text-xs border-b border-slate-900/60 pb-1.5">
                  <span className="text-slate-400">Supported Formats:</span>
                  <span className="font-semibold text-white">Chat & Audio</span>
                </div>
                <div className="flex justify-between text-xs border-b border-slate-900/60 pb-1.5">
                  <span className="text-slate-400">Standard Rounds:</span>
                  <span className="font-semibold text-white">HR, Tech, System Design</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Post-interview details:</span>
                  <span className="font-semibold text-rose-450">Gemini Feedback Score</span>
                </div>
              </div>
            </div>
            <Link to="/mock-interview" className="btn-primary w-full justify-center text-xs mt-4 flex items-center gap-2 bg-rose-600 hover:bg-rose-500 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Open Mock Interview
            </Link>
          </div>

          {/* Card 6: Performance Analytics */}
          <div className="card bg-slate-900 border-slate-800 p-6 flex flex-col justify-between h-96 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500 rounded-full blur-[70px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"></div>
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-white text-lg">Performance Analytics</h4>
                </div>
              </div>
              <p className="text-slate-450 text-xs mb-6">
                Gain deep insights into your placement readiness. Review problem difficulty ratios, study hourly categories, and overall score trends.
              </p>

              {/* Visual mini statistics layout */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 text-xs">
                <div className="text-center p-2 bg-slate-900/60 rounded border border-slate-850">
                  <p className="text-slate-500 text-[10px]">Resume Feedback</p>
                  <p className="text-cyan-400 font-extrabold text-sm mt-0.5">Active</p>
                </div>
                <div className="text-center p-2 bg-slate-900/60 rounded border border-slate-850">
                  <p className="text-slate-500 text-[10px]">Completed Study</p>
                  <p className="text-emerald-400 font-extrabold text-sm mt-0.5">{totalStudyHours} hrs</p>
                </div>
              </div>
            </div>
            <Link to="/analytics" className="btn-primary w-full justify-center text-xs mt-4 flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              Open Analytics
            </Link>
          </div>

        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
