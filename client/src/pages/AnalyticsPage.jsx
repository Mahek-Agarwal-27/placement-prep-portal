import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
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
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import questionService from '../services/questionService';
import taskService from '../services/taskService';
import resumeService from '../services/resumeService';
import interviewService from '../services/interviewService';

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Easy (Green), Medium (Orange), Hard (Red)
const CATEGORY_COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#14b8a6'];

const AnalyticsPage = () => {
  const { user, logout } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Stats States
  const [dsaStats, setDsaStats] = useState([]);
  const [dsaTotal, setDsaTotal] = useState(0);
  const [taskStats, setTaskStats] = useState(null);
  const [resumeData, setResumeData] = useState([]);
  const [interviewData, setInterviewData] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
        const [qRes, tRes, rRes, iRes] = await Promise.all([
          questionService.getStats(),
          taskService.getTaskStats(),
          resumeService.getResumes(),
          interviewService.getInterviews(),
        ]);
        
        // 1. Process DSA Stats
        if (qRes.success && qRes.data?.byDifficulty) {
          let total = 0;
          const formattedDsa = qRes.data.byDifficulty.map((d) => {
            total += d.count;
            return { name: d._id, value: d.count };
          });
          setDsaStats(formattedDsa);
          setDsaTotal(total);
        }

        // 2. Process Study Planner Stats
        if (tRes.success && tRes.data) {
          setTaskStats(tRes.data);
        }

        // 3. Process Resumes (reversing to show chronological order)
        if (rRes.success && rRes.data) {
          const formattedResumes = rRes.data
            .map((r) => ({
              name: new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
              score: r.score,
            }))
            .reverse();
          setResumeData(formattedResumes);
        }

        // 4. Process Interviews
        if (iRes.success && iRes.data) {
          const completedInterviews = iRes.data
            .filter((i) => i.status === 'completed')
            .map((i) => ({
              topic: i.topic,
              score: i.feedback?.score || 0,
            }))
            .reverse();
          setInterviewData(completedInterviews);
        }

      } catch (e) {
        console.error(e);
        setError('Failed to fetch analytics data. Make sure all backend servers are active.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Aggregated KPIs
  const highestResumeScore = resumeData.length > 0 ? Math.max(...resumeData.map(r => r.score)) : 0;
  const highestInterviewScore = interviewData.length > 0 ? Math.max(...interviewData.map(i => i.score)) : 0;

  return (
    <div className="min-h-screen text-slate-100 flex flex-col overflow-y-auto">
      {/* Navbar */}
      <header className="glass-panel px-6 py-4 flex justify-between items-center shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Link to="/dashboard">
            <Logo />
          </Link>
          <span className="text-xs bg-indigo-950 text-indigo-300 font-semibold px-2 py-0.5 rounded border border-indigo-800">Beta</span>
        </div>
        <nav className="hidden sm:flex items-center gap-5 text-sm font-semibold">
          <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">Dashboard</Link>
          <Link to="/dsa-tracker" className="text-slate-400 hover:text-white transition-colors">DSA Tracker</Link>
          <Link to="/study-planner" className="text-slate-400 hover:text-white transition-colors">Study Planner</Link>
          <Link to="/notes" className="text-slate-400 hover:text-white transition-colors">AI Notes</Link>
          <Link to="/resume-analyzer" className="text-slate-400 hover:text-white transition-colors">Resume Analyzer</Link>
          <Link to="/mock-interview" className="text-slate-400 hover:text-white transition-colors">Mock Interview</Link>
          <Link to="/analytics" className="text-indigo-400 border-b-2 border-indigo-500 pb-1">Analytics</Link>
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-slate-300 text-sm hidden md:inline">Hi, <strong className="text-white">{user?.name}</strong></span>
          <ThemeToggle />
          <button onClick={logout} className="btn-secondary px-4 py-2 text-xs">Sign Out</button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full p-6 md:p-8 space-y-8 flex-1 relative">
        {/* Glow */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-500 rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-500 rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Performance Analytics</h1>
            <p className="text-slate-400 text-sm mt-1">Unified view of your DSA progress, study logs, resume scores, and interview performance.</p>
          </div>
          <Link to="/dashboard" className="btn-secondary px-4 py-2 text-xs font-semibold">
            ← Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-sm text-center relative z-10">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Compiling statistics and charts...</p>
          </div>
        ) : (
          <div className="space-y-8 relative z-10">
            {/* KPI Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: DSA Total */}
              <div className="card bg-slate-900 border-slate-850 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-slate-450 text-xs font-bold uppercase tracking-wider mb-2">DSA Problems Solved</h3>
                  <p className="text-4xl font-extrabold text-white">{dsaTotal}</p>
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/50 border border-emerald-900 px-2 py-0.5 rounded self-start mt-4">
                  Active Tracker
                </div>
              </div>

              {/* Card 2: Study Hours */}
              <div className="card bg-slate-900 border-slate-850 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-slate-450 text-xs font-bold uppercase tracking-wider mb-2">Study Hours Logged</h3>
                  <p className="text-4xl font-extrabold text-white">
                    {taskStats?.totalStudyHours || 0} <span className="text-sm font-normal text-slate-500">hours</span>
                  </p>
                </div>
                <div className="text-[10px] text-indigo-400 font-semibold bg-indigo-950/50 border border-indigo-900 px-2 py-0.5 rounded self-start mt-4">
                  {taskStats?.totalCompleted || 0} tasks completed
                </div>
              </div>

              {/* Card 3: Best Resume Score */}
              <div className="card bg-slate-900 border-slate-850 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-slate-450 text-xs font-bold uppercase tracking-wider mb-2">Best Resume ATS Score</h3>
                  <p className="text-4xl font-extrabold text-white">
                    {highestResumeScore ? `${highestResumeScore}%` : 'N/A'}
                  </p>
                </div>
                <div className="text-[10px] text-violet-400 font-semibold bg-violet-950/50 border border-violet-900 px-2 py-0.5 rounded self-start mt-4">
                  {resumeData.length} scans conducted
                </div>
              </div>

              {/* Card 4: Best Mock Interview */}
              <div className="card bg-slate-900 border-slate-850 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-slate-450 text-xs font-bold uppercase tracking-wider mb-2">Best Mock Interview</h3>
                  <p className="text-4xl font-extrabold text-white">
                    {highestInterviewScore ? `${highestInterviewScore}%` : 'N/A'}
                  </p>
                </div>
                <div className="text-[10px] text-rose-450 font-semibold bg-rose-950/50 border border-rose-900 px-2 py-0.5 rounded self-start mt-4">
                  {interviewData.length} graded sessions
                </div>
              </div>
            </section>

            {/* Charts Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart 1: DSA Difficulty distribution */}
              <div className="card bg-slate-900 border-slate-850 p-6 flex flex-col h-[400px]">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="text-emerald-400">&lt;/&gt;</span> DSA Solved Ratio
                </h3>
                <div className="flex-1 flex items-center justify-center">
                  {dsaTotal === 0 ? (
                    <p className="text-slate-500 text-sm">No DSA problems logged yet.</p>
                  ) : (
                    <div className="w-full h-full flex flex-col sm:flex-row items-center justify-between">
                      <div className="w-full sm:w-1/2 h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={dsaStats}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {dsaStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3 sm:pr-8">
                        {dsaStats.map((entry, index) => (
                          <div key={entry.name} className="flex items-center gap-3 text-sm">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                            <span className="text-slate-400 font-semibold">{entry.name}:</span>
                            <span className="text-white font-extrabold">{entry.value} ({dsaTotal ? ((entry.value / dsaTotal) * 100).toFixed(0) : 0}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chart 2: Study Tasks categories */}
              <div className="card bg-slate-900 border-slate-850 p-6 flex flex-col h-[400px]">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="text-indigo-400">📅</span> Task Categories Breakdown
                </h3>
                <div className="flex-1">
                  {!taskStats?.byCategory || taskStats.byCategory.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-slate-500 text-sm">No study tasks created yet.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={taskStats.byCategory}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="_id" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar name="Total Tasks" dataKey="total" fill="#4338ca" radius={[4, 4, 0, 0]} />
                        <Bar name="Completed" dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Chart 3: Resume score progress */}
              <div className="card bg-slate-900 border-slate-850 p-6 flex flex-col h-[400px]">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="text-violet-400">📝</span> ATS Resume Match Trend
                </h3>
                <div className="flex-1">
                  {resumeData.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-slate-500 text-sm">No resume scans conducted yet.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={resumeData}
                        margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                        <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }} />
                        <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Chart 4: Mock interview performance */}
              <div className="card bg-slate-900 border-slate-850 p-6 flex flex-col h-[400px]">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="text-rose-450">🎙️</span> Mock Interview Scores
                </h3>
                <div className="flex-1">
                  {interviewData.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-slate-500 text-sm">No completed interview feedback yet.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={interviewData}
                        margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="topic" stroke="#94a3b8" fontSize={11} />
                        <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }} />
                        <Bar name="Grade Score" dataKey="score" fill="#f43f5e" radius={[4, 4, 0, 0]}>
                          {interviewData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.score >= 80 ? '#10b981' : entry.score >= 50 ? '#f59e0b' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnalyticsPage;
