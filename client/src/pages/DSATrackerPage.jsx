import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import questionService from '../services/questionService';
import { 
  Code2, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  X, 
  BarChart2, 
  Layers 
} from 'lucide-react';

const PLATFORMS = ['LeetCode', 'Codeforces', 'GFG', 'HackerRank', 'InterviewBit', 'Other'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const TOPICS = [
  'Arrays', 'Strings', 'Linked List', 'Stacks & Queues',
  'Trees', 'Graphs', 'Dynamic Programming', 'Recursion & Backtracking',
  'Sorting & Searching', 'Hashing', 'Greedy', 'Bit Manipulation',
  'Math', 'Sliding Window', 'Two Pointers', 'Heap', 'Other',
];
const STATUSES = ['to-do', 'attempted', 'solved'];

const EMPTY_FORM = {
  title: '', platform: 'LeetCode', difficulty: 'Easy',
  topic: 'Arrays', status: 'to-do', link: '', notes: '',
};

// ── Sub-component: Add/Edit Modal ─────────────────────────────────────────────
const QuestionModal = ({ isOpen, onClose, onSave, initial }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm(initial ? { ...EMPTY_FORM, ...initial } : EMPTY_FORM);
      setError('');
    }
  }, [isOpen, initial]);

  if (!isOpen) return null;

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
        <div className="p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {initial ? 'Edit DSA Problem' : 'Log New Problem'}
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Problem Title *</label>
            <input 
              className="input-field" 
              placeholder="e.g. Two Sum, Reverse Linked List" 
              value={form.title} 
              onChange={set('title')} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Platform</label>
              <select className="input-field" value={form.platform} onChange={set('platform')}>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Difficulty *</label>
              <select className="input-field" value={form.difficulty} onChange={set('difficulty')}>
                {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Topic</label>
              <select className="input-field" value={form.topic} onChange={set('topic')}>
                {TOPICS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Status</label>
              <select className="input-field" value={form.status} onChange={set('status')}>
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Problem URL (optional)</label>
            <input 
              className="input-field" 
              placeholder="https://leetcode.com/problems/..." 
              value={form.link} 
              onChange={set('link')} 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Personal Notes (optional)</label>
            <textarea 
              className="input-field resize-y min-h-[80px] py-2" 
              placeholder="Approach, time complexity, edge cases..." 
              value={form.notes} 
              onChange={set('notes')} 
            />
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : (initial ? 'Save Changes' : 'Add Problem')}
            </button>
            <button onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const DSATrackerPage = () => {
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterDiff, setFilterDiff] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTopic, setFilterTopic] = useState('');

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterDiff) params.difficulty = filterDiff;
      if (filterStatus) params.status = filterStatus;
      if (filterTopic) params.topic = filterTopic;
      const res = await questionService.getQuestions(params);
      if (res.success) setQuestions(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, filterDiff, filterStatus, filterTopic]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await questionService.getStats();
      if (res.success) setStats(res.data);
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchQuestions();
    fetchStats();
  }, [fetchQuestions, fetchStats]);

  const handleSave = async (formData) => {
    if (editTarget) {
      await questionService.updateQuestion(editTarget._id, formData);
    } else {
      await questionService.addQuestion(formData);
    }
    fetchQuestions();
    fetchStats();
    setEditTarget(null);
  };

  const handleStatusCycle = async (q) => {
    const order = ['to-do', 'attempted', 'solved'];
    const next = order[(order.indexOf(q.status) + 1) % order.length];
    try {
      await questionService.updateQuestion(q._id, { status: next });
      fetchQuestions();
      fetchStats();
    } catch (_) {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this problem entry?')) return;
    try {
      await questionService.deleteQuestion(id);
      fetchQuestions();
      fetchStats();
    } catch (_) {}
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear ALL logged DSA problems?')) return;
    try {
      await questionService.clearAll();
      fetchQuestions();
      fetchStats();
    } catch (_) {}
  };

  // Compute topic progress percentages dynamically from logged questions
  const DEFAULT_TOPICS = ['Arrays', 'Strings', 'Linked List', 'Trees', 'Graphs', 'Dynamic Programming'];
  
  const topicMap = {};
  DEFAULT_TOPICS.forEach(t => { topicMap[t] = { total: 0, solved: 0 }; });

  questions.forEach(q => {
    const t = q.topic || 'Other';
    if (!topicMap[t]) {
      topicMap[t] = { total: 0, solved: 0 };
    }
    topicMap[t].total += 1;
    if (q.status === 'solved') {
      topicMap[t].solved += 1;
    }
  });

  const topicProgress = Object.keys(topicMap)
    .map(topic => {
      const { total, solved } = topicMap[topic];
      const percent = total > 0 ? Math.round((solved / total) * 100) : 0;
      return { topic, percent, solved, total };
    })
    .filter(tp => tp.total > 0 || DEFAULT_TOPICS.includes(tp.topic));

  const byDiff = {};
  (stats?.byDifficulty || []).forEach(d => { byDiff[d._id] = d; });

  return (
    <div className="min-h-screen bg-[#EFE9FE] flex text-[#1A1A2E] font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="flex-1 max-w-[1500px] mx-auto w-full p-8 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-200/60 pb-6">
            <div>
              <h1 className="text-2xl font-black text-[#1A1A2E] tracking-tight flex items-center gap-2">
                <Code2 className="w-6 h-6 text-[#6C47FF]" /> DSA Learning Tracker
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1">
                Log solved problems, track topic completion rates, and maintain consistency.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {questions.length > 0 && (
                <button 
                  onClick={handleClearAll}
                  className="px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs hover:bg-rose-100 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Clear all DSA questions"
                >
                  <Trash2 className="w-4 h-4" /> Clear All
                </button>
              )}
              <button 
                onClick={() => { setEditTarget(null); setModalOpen(true); }}
                className="px-6 py-3 rounded-2xl bg-[#6C47FF] text-white font-bold text-sm hover:bg-[#5A36EC] transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Log Problem
              </button>
            </div>
          </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Logged</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalQuestions ?? 0}</p>
            <span className="text-[11px] text-slate-400">problems recorded</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Easy</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{byDiff['Easy']?.solved ?? 0}</p>
            <span className="text-[11px] text-slate-400">of {byDiff['Easy']?.total ?? 0} solved</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">Medium</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{byDiff['Medium']?.solved ?? 0}</p>
            <span className="text-[11px] text-slate-400">of {byDiff['Medium']?.total ?? 0} solved</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span className="text-xs font-medium text-rose-600 uppercase tracking-wider">Hard</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{byDiff['Hard']?.solved ?? 0}</p>
            <span className="text-[11px] text-slate-400">of {byDiff['Hard']?.total ?? 0} solved</span>
          </div>
        </div>

        {/* Dynamic Topic Mastery Progress Cards */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" /> Topic Mastery & Completion
            </h3>
            <span className="text-xs text-slate-400">
              Updates in real-time based on your logged problems
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {topicProgress.map((tp) => (
              <div key={tp.topic} className="p-3.5 border border-slate-100 rounded-lg bg-slate-50 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">{tp.topic}</span>
                  <span className="font-bold text-blue-600">{tp.percent}% ({tp.solved}/{tp.total})</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${tp.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
          
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
              className="input-field pl-9 py-2 text-xs" 
              placeholder="Search problems by title..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <select 
              className="input-field py-2 text-xs w-auto"
              value={filterDiff}
              onChange={(e) => setFilterDiff(e.target.value)}
            >
              <option value="">All Difficulties</option>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select 
              className="input-field py-2 text-xs w-auto"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>

            <select 
              className="input-field py-2 text-xs w-auto"
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
            >
              <option value="">All Topics</option>
              {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            {(search || filterDiff || filterStatus || filterTopic) && (
              <button 
                onClick={() => { setSearch(''); setFilterDiff(''); setFilterStatus(''); setFilterTopic(''); }}
                className="text-xs text-slate-500 hover:text-slate-800 underline px-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Problems Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading problems...</div>
          ) : questions.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Code2 className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-medium text-slate-700">No problems found</p>
              <p className="text-xs text-slate-400">Try adjusting filters or click "Log Problem" above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Problem</th>
                    <th className="py-3 px-4">Topic</th>
                    <th className="py-3 px-4">Difficulty</th>
                    <th className="py-3 px-4">Platform</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {questions.map((q) => (
                    <tr key={q._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Status Cycle Button */}
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => handleStatusCycle(q)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-xs border transition-colors ${
                            q.status === 'solved' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : q.status === 'attempted'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {q.status === 'solved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          {q.status === 'attempted' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                          <span className="capitalize">{q.status}</span>
                        </button>
                      </td>

                      {/* Title & Link */}
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {q.link ? (
                          <a 
                            href={q.link} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors"
                          >
                            {q.title} <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        ) : (
                          q.title
                        )}
                      </td>

                      {/* Topic */}
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {q.topic}
                      </td>

                      {/* Difficulty Badge */}
                      <td className="py-3 px-4">
                        <span className={`badge ${
                          q.difficulty === 'Easy' ? 'badge-easy' :
                          q.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'
                        }`}>
                          {q.difficulty}
                        </span>
                      </td>

                      {/* Platform */}
                      <td className="py-3 px-4 text-slate-500 font-medium">
                        {q.platform}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => { setEditTarget(q); setModalOpen(true); }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(q._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      <QuestionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleSave} 
        initial={editTarget} 
      />
      </div>
    </div>
  );
};

export default DSATrackerPage;
