import React, { useState, useEffect } from 'react';
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
} from 'recharts';
import questionService from '../services/questionService';
import taskService from '../services/taskService';
import resumeService from '../services/resumeService';
import interviewService from '../services/interviewService';
import { BarChart3, Code2, FileText, MessageSquare, CheckCircle2 } from 'lucide-react';

const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

const AnalyticsPage = () => {
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
        if (qRes.success && qRes.data) {
          const { byDifficulty, byTopic, totalSolved } = qRes.data;
          if (Array.isArray(byDifficulty)) {
            const formattedDsa = byDifficulty.map((d) => ({
              name: d._id || 'Unknown',
              value: d.solved ?? d.count ?? 0,
            })).filter(item => item.value > 0);
            setDsaStats(formattedDsa);
          }
          setDsaTotal(totalSolved ?? 0);
        }

        // 2. Process Study Planner Stats
        if (tRes.success && tRes.data) {
          setTaskStats(tRes.data);
        }

        // 3. Process Resume Scores Over Time
        if (rRes.success && Array.isArray(rRes.data)) {
          const formattedResume = rRes.data.reverse().map((r, i) => ({
            name: `Scan ${i + 1}`,
            score: r.atsScore || 0,
          }));
          setResumeData(formattedResume);
        }

        // 4. Process Mock Interview Scores
        if (iRes.success && Array.isArray(iRes.data)) {
          const formattedInterview = iRes.data
            .map((item, idx) => {
              const scoreVal = item.feedback?.score ?? item.score;
              return {
                name: `Session ${idx + 1}`,
                score: scoreVal !== undefined && scoreVal !== null ? Number(scoreVal) : null,
              };
            })
            .filter(item => item.score !== null && !isNaN(item.score))
            .reverse();
          setInterviewData(formattedInterview);
        }
      } catch (err) {
        setError('Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const highestResumeScore = resumeData.length > 0 ? Math.max(...resumeData.map(r => r.score)) : 0;
  const highestInterviewScore = interviewData.length > 0 ? Math.max(...interviewData.map(i => i.score)) : 0;

  return (
    <div className="min-h-screen bg-[#EFE9FE] flex text-[#1A1A2E] font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="max-w-[1500px] mx-auto w-full p-8 space-y-8 flex-1">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" /> Placement Analytics & Performance
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Unified view of your DSA progress, study logs, resume scores, and interview performance.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* KPI Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Solved</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{dsaTotal}</h3>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <Code2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">DSA problems completed</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Study Tasks Done</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{taskStats?.totalCompleted ?? 0}</h3>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">out of {taskStats?.totalTasks ?? 0} total tasks</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Peak ATS Score</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {highestResumeScore ? `${highestResumeScore}%` : 'N/A'}
                </h3>
              </div>
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Best resume scan result</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Top Interview Grade</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {highestInterviewScore ? `${highestInterviewScore}%` : 'N/A'}
                </h3>
              </div>
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">AI evaluation score</p>
          </div>

        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart 1: DSA Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 text-sm mb-4">DSA Problem Difficulty Distribution</h3>
            <div className="h-64">
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
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 2: Resume History */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 text-sm mb-4">Resume ATS Score History</h3>
            <div className="h-64">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
              ) : resumeData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">No resume history available.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={resumeData}>
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

          {/* Chart 3: Mock Interview Performance */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2">
            <h3 className="font-semibold text-slate-900 text-sm mb-4">Mock Interview Score Progress</h3>
            <div className="h-64">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
              ) : interviewData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">No mock interview data available.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={interviewData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="topic" stroke="#94A3B8" fontSize={11} />
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
    </div>
  );
};

export default AnalyticsPage;
