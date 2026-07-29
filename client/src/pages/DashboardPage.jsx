import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import questionService from '../services/questionService';
import taskService from '../services/taskService';
import noteService from '../services/noteService';
import resumeService from '../services/resumeService';
import interviewService from '../services/interviewService';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import TodaysFocusCard from '../components/TodaysFocusCard';
import { 
  Flame, 
  BookOpen, 
  Target, 
  Code2, 
  FileText, 
  MessageSquare, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const DashboardPage = () => {
  const { user } = useAuth();

  const [dsaBreakdown, setDsaBreakdown] = useState({ easy: 0, medium: 0, hard: 0, total: 0 });
  const [agenda, setAgenda] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [totalStudyHours, setTotalStudyHours] = useState(0);
  const [latestResumeScore, setLatestResumeScore] = useState(null);
  const [latestInterviewScore, setLatestInterviewScore] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qStatsRes, tasksRes, notesRes, resumeRes, interviewRes] = await Promise.all([
          questionService.getStats(),
          taskService.getTasks({ status: '' }),
          noteService.getNotes(),
          resumeService.getResumes(),
          interviewService.getInterviews()
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
          setLatestResumeScore(resumeRes.data[0].atsScore);
        } else {
          setLatestResumeScore(null);
        }

        if (interviewRes.success && interviewRes.data) {
          const completed = interviewRes.data.filter(i => i.status === 'completed');
          if (completed.length > 0) {
            setLatestInterviewScore(completed[0].feedback?.score || null);
          } else {
            setLatestInterviewScore(null);
          }
        } else {
          setLatestInterviewScore(null);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  // Compute readiness score
  const readinessScore = Math.min(
    100,
    Math.round((dsaBreakdown.total * 2) + (latestResumeScore ? latestResumeScore * 0.4 : 0) + (latestInterviewScore ? latestInterviewScore * 0.4 : 0))
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8 space-y-8">
        
        {/* Top Header & Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {getGreeting()}, {user?.name || 'Student'} 👋
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track your placement preparation and improve every day.
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-sm text-xs font-medium text-slate-700">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Streak: <strong className="text-slate-900">{user?.streak?.currentStreak || 1} Days</strong></span>
            </div>
            
            <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-sm text-xs font-medium text-slate-700">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Study: <strong className="text-slate-900">{totalStudyHours} hrs</strong></span>
            </div>

            <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-sm text-xs font-medium text-slate-700">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>Readiness: <strong className="text-slate-900">{readinessScore}%</strong></span>
            </div>
          </div>
        </div>

        {/* Today's Focus AI Recommendation Card */}
        <TodaysFocusCard />

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard 
            title="DSA Progress"
            value={`${dsaBreakdown.total} Solved`}
            subtitle="Problems completed"
            trend="+3 this week"
            icon={Code2}
          />
          <StatCard 
            title="Resume Score"
            value={latestResumeScore !== null ? `${latestResumeScore}/100` : 'Not Scanned'}
            subtitle={latestResumeScore !== null ? "ATS match strength" : "Upload resume to scan"}
            trend={latestResumeScore !== null ? "Latest Scan" : null}
            icon={FileText}
          />
          <StatCard 
            title="Interview Grade"
            value={latestInterviewScore !== null ? `${latestInterviewScore}%` : 'No Mock Yet'}
            subtitle={latestInterviewScore !== null ? "Technical evaluation" : "Practice mock interview"}
            trend={latestInterviewScore !== null ? "Evaluated" : null}
            icon={MessageSquare}
          />
          <StatCard 
            title="AI Study Notes"
            value={`${recentNotes.length} Saved`}
            subtitle="Roadmaps & summaries"
            icon={Sparkles}
          />
        </div>

        {/* Core Modules Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* DSA Tracker Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-base">DSA Tracker</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {dsaBreakdown.total} Total
                </span>
              </div>
              
              <p className="text-xs text-slate-500 mb-6">
                Practice topic-wise problem solving and monitor your difficulty breakdown.
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Easy Problems</span>
                  <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{dsaBreakdown.easy}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, dsaBreakdown.easy * 5)}%` }}></div>
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-600 font-medium">Medium Problems</span>
                  <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{dsaBreakdown.medium}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, dsaBreakdown.medium * 5)}%` }}></div>
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-600 font-medium">Hard Problems</span>
                  <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">{dsaBreakdown.hard}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min(100, dsaBreakdown.hard * 5)}%` }}></div>
                </div>
              </div>
            </div>

            <Link 
              to="/dsa-tracker" 
              className="btn-primary w-full mt-6 text-xs flex items-center justify-center gap-1.5"
            >
              Open DSA Tracker <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Resume Analyzer Module */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-base">Resume Analyzer</h3>
                </div>
                <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  AI Powered
                </span>
              </div>

              <p className="text-xs text-slate-500 mb-6">
                Parse details and match your resume with job descriptions for ATS feedback.
              </p>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
                <div className="w-14 h-14 rounded-full border-4 border-purple-200 border-t-purple-600 flex items-center justify-center bg-white font-bold text-slate-900 text-sm">
                  {latestResumeScore !== null ? `${latestResumeScore}` : 'N/A'}
                </div>
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-slate-900">ATS Readiness</p>
                  <p className="text-slate-500">✓ Keywords matching</p>
                  <p className="text-slate-500">✓ Formatting review</p>
                </div>
              </div>
            </div>

            <Link 
              to="/resume-analyzer" 
              className="btn-secondary w-full mt-6 text-xs flex items-center justify-center gap-1.5"
            >
              Analyze Resume <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mock Interview & AI Roadmap */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-base">Mock Interview</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  Interactive
                </span>
              </div>

              <p className="text-xs text-slate-500 mb-6">
                Practice technical & HR round questions with Gemini AI feedback.
              </p>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Available Rounds:</span>
                  <span className="font-semibold text-slate-900">Tech, HR, System</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Latest Score:</span>
                  <span className="font-semibold text-blue-600">
                    {latestInterviewScore !== null ? `${latestInterviewScore}%` : 'Not Graded'}
                  </span>
                </div>
              </div>
            </div>

            <Link 
              to="/mock-interview" 
              className="btn-primary w-full mt-6 text-xs flex items-center justify-center gap-1.5"
            >
              Start Practice Round <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

        {/* Study Agenda & Notes Quick List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
          
          {/* Daily Study Tasks */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" /> Today's Study Agenda
              </h3>
              <Link to="/study-planner" className="text-xs text-blue-600 hover:underline font-medium">
                View Planner →
              </Link>
            </div>

            {agenda.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No tasks added for today.</p>
            ) : (
              <div className="space-y-2.5">
                {agenda.map((task) => (
                  <div key={task._id} className="p-3 border border-slate-100 rounded-lg flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className={`w-4 h-4 ${task.status === 'completed' ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span className={`text-xs font-medium ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      {task.estimatedHours || 1} hrs
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Notes & Roadmaps */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" /> Recent AI Roadmaps & Notes
              </h3>
              <Link to="/notes" className="text-xs text-blue-600 hover:underline font-medium">
                View Notes →
              </Link>
            </div>

            {recentNotes.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No notes generated yet.</p>
            ) : (
              <div className="space-y-2.5">
                {recentNotes.map((note) => (
                  <div key={note._id} className="p-3 border border-slate-100 rounded-lg flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-medium text-slate-800 truncate max-w-[200px]">
                        {note.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded font-medium">
                      {note.folder || 'General'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
};

export default DashboardPage;
