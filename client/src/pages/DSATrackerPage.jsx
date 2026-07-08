/**
 * pages/DSATrackerPage.jsx — DSA Problem Tracker
 *
 * Features:
 *  - Stats bar: total solved by difficulty (Easy/Medium/Hard)
 *  - Add/Edit modal form for creating or updating problems
 *  - Filterable, searchable problem table
 *  - Quick status toggle (to-do → attempted → solved)
 *  - Delete with inline confirmation
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import questionService from '../services/questionService';

// ── Constants ─────────────────────────────────────────────────────────────────
const PLATFORMS   = ['LeetCode', 'Codeforces', 'GFG', 'HackerRank', 'InterviewBit', 'Other'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const TOPICS = [
  'Arrays', 'Strings', 'Linked List', 'Stacks & Queues',
  'Trees', 'Graphs', 'Dynamic Programming', 'Recursion & Backtracking',
  'Sorting & Searching', 'Hashing', 'Greedy', 'Bit Manipulation',
  'Math', 'Sliding Window', 'Two Pointers', 'Heap', 'Other',
];
const STATUSES = ['to-do', 'attempted', 'solved'];

const STATUS_STYLES = {
  'solved':    'bg-emerald-950 text-emerald-300 border-emerald-800',
  'attempted': 'bg-amber-950  text-amber-300  border-amber-800',
  'to-do':     'bg-slate-800  text-slate-400  border-slate-700',
};
const DIFF_STYLES = {
  Easy:   'bg-emerald-950 text-emerald-300',
  Medium: 'bg-amber-950  text-amber-400',
  Hard:   'bg-rose-950   text-rose-400',
};

// ── Empty Form ────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  title: '', platform: 'LeetCode', difficulty: 'Easy',
  topic: 'Other', status: 'to-do', link: '', notes: '',
};

// ── Sub-component: Stats Bar ──────────────────────────────────────────────────
const StatsBar = ({ stats, loading }) => {
  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card h-24 animate-pulse bg-slate-800 border-slate-700"></div>
      ))}
    </div>
  );

  const byDiff = {};
  (stats?.byDifficulty || []).forEach(d => { byDiff[d._id] = d; });

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total */}
      <div className="card bg-slate-900 border-slate-800 flex flex-col justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Logged</p>
        <p className="text-4xl font-extrabold text-white mt-2">{stats?.totalQuestions ?? 0}</p>
        <p className="text-xs text-slate-500 mt-1">problems</p>
      </div>
      {/* Easy */}
      <div className="card bg-slate-900 border-slate-800 flex flex-col justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Easy</p>
        <p className="text-4xl font-extrabold text-white mt-2">{byDiff['Easy']?.solved ?? 0}</p>
        <p className="text-xs text-slate-500 mt-1">of {byDiff['Easy']?.total ?? 0} solved</p>
      </div>
      {/* Medium */}
      <div className="card bg-slate-900 border-slate-800 flex flex-col justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Medium</p>
        <p className="text-4xl font-extrabold text-white mt-2">{byDiff['Medium']?.solved ?? 0}</p>
        <p className="text-xs text-slate-500 mt-1">of {byDiff['Medium']?.total ?? 0} solved</p>
      </div>
      {/* Hard */}
      <div className="card bg-slate-900 border-slate-800 flex flex-col justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-rose-400">Hard</p>
        <p className="text-4xl font-extrabold text-white mt-2">{byDiff['Hard']?.solved ?? 0}</p>
        <p className="text-xs text-slate-500 mt-1">of {byDiff['Hard']?.total ?? 0} solved</p>
      </div>
    </div>
  );
};

// ── Sub-component: Add/Edit Modal ─────────────────────────────────────────────
const QuestionModal = ({ isOpen, onClose, onSave, initial }) => {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  // Sync form when opening with existing data for edit
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto relative">
        {/* Glow */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-10 pointer-events-none"></div>

        <div className="p-6 space-y-5 relative">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">
              {initial ? 'Edit Problem' : 'Log New Problem'}
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-2xl leading-none">×</button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-sm">{error}</div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Problem Title *</label>
            <input className="input-field" placeholder="e.g. Two Sum" value={form.title} onChange={set('title')} />
          </div>

          {/* Platform + Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Platform</label>
              <select className="input-field" value={form.platform} onChange={set('platform')}>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Difficulty *</label>
              <select className="input-field" value={form.difficulty} onChange={set('difficulty')}>
                {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Topic + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Topic</label>
              <select className="input-field" value={form.topic} onChange={set('topic')}>
                {TOPICS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</label>
              <select className="input-field" value={form.status} onChange={set('status')}>
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Problem URL (optional)</label>
            <input className="input-field" placeholder="https://leetcode.com/problems/..." value={form.link} onChange={set('link')} />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Personal Notes (optional)</label>
            <textarea className="input-field resize-y min-h-[80px] py-2.5" placeholder="Approach, edge cases, time complexity…" value={form.notes} onChange={set('notes')} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-slate-800">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center py-3">
              {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (initial ? 'Save Changes' : 'Add Problem')}
            </button>
            <button onClick={onClose} className="btn-secondary px-6 py-3">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Page Component ───────────────────────────────────────────────────────
const DSATrackerPage = () => {
  const { user, logout } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError]         = useState('');

  // Modal state
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = add mode

  // Filters state
  const [search, setSearch]         = useState('');
  const [filterDiff, setFilterDiff] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTopic, setFilterTopic]   = useState('');

  // Delete confirmation inline
  const [deleteId, setDeleteId] = useState(null);

  // ── Data Fetching ────────────────────────────────────────────────────────────
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search)       params.search     = search;
      if (filterDiff)   params.difficulty = filterDiff;
      if (filterStatus) params.status     = filterStatus;
      if (filterTopic)  params.topic      = filterTopic;
      const res = await questionService.getQuestions(params);
      if (res.success) setQuestions(res.data);
    } catch (e) {
      setError('Failed to load questions. Ensure the server is running.');
    } finally {
      setLoading(false);
    }
  }, [search, filterDiff, filterStatus, filterTopic]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await questionService.getStats();
      if (res.success) setStats(res.data);
    } catch (_) {} finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ── CRUD Handlers ────────────────────────────────────────────────────────────
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
    const next  = order[(order.indexOf(q.status) + 1) % order.length];
    try {
      await questionService.updateQuestion(q._id, { status: next });
      fetchQuestions();
      fetchStats();
    } catch (_) {}
  };

  const handleDelete = async (id) => {
    try {
      await questionService.deleteQuestion(id);
      setDeleteId(null);
      fetchQuestions();
      fetchStats();
    } catch (_) {}
  };

  const openEdit = (q) => { setEditTarget(q); setModalOpen(true); };
  const openAdd  = ()  => { setEditTarget(null); setModalOpen(true); };

  const clearFilters = () => {
    setSearch(''); setFilterDiff(''); setFilterStatus(''); setFilterTopic('');
  };

  const hasActiveFilters = search || filterDiff || filterStatus || filterTopic;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen text-slate-100 flex flex-col">
      {/* Navbar */}
      <header className="glass-panel sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/dashboard">
            <Logo />
          </Link>
          <span className="text-xs bg-indigo-950 text-indigo-300 font-semibold px-2 py-0.5 rounded border border-indigo-800">Beta</span>
        </div>
        <nav className="hidden sm:flex items-center gap-5 text-sm font-semibold">
          <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">Dashboard</Link>
          <Link to="/dsa-tracker" className="text-indigo-400 border-b-2 border-indigo-500 pb-1">DSA Tracker</Link>
          <Link to="/profile"   className="text-slate-400 hover:text-white transition-colors">Profile</Link>
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-slate-300 text-sm hidden md:inline">Hi, <strong className="text-white">{user?.name}</strong></span>
          <ThemeToggle />
          <button onClick={logout} className="btn-secondary px-4 py-2 text-xs">Sign Out</button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8 space-y-8 animate-fade-in">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="text-2xl">{'</>'}</span> DSA Problem Tracker
            </h1>
            <p className="text-slate-400 text-sm mt-1">Log, filter, and track every problem you solve across platforms.</p>
          </div>
          <button onClick={openAdd} className="btn-primary px-5 py-2.5 flex items-center gap-2 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Log Problem
          </button>
        </div>

        {/* Stats Bar */}
        <StatsBar stats={stats} loading={statsLoading} />

        {/* Progress Bar for Total Solved */}
        {stats && stats.totalQuestions > 0 && (
          <div className="card bg-slate-900 border-slate-800 p-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-300">Overall Completion</span>
              <span className="text-sm font-bold text-indigo-400">{stats.totalSolved} / {stats.totalQuestions} solved</span>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.round((stats.totalSolved / stats.totalQuestions) * 100)}%`,
                  background: 'linear-gradient(90deg, #6366f1, #10b981)',
                }}
              ></div>
            </div>
            <div className="flex gap-4 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Solved: {stats.totalSolved}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Attempted: {stats.totalAttempted}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-600"></span>To-Do: {stats.totalTodo}</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="input-field pl-9 text-sm"
              placeholder="Search by title…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Difficulty */}
          <select className="input-field w-auto text-sm" value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
            <option value="">All Difficulties</option>
            {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
          </select>

          {/* Status */}
          <select className="input-field w-auto text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>

          {/* Topic */}
          <select className="input-field w-auto text-sm" value={filterTopic} onChange={e => setFilterTopic(e.target.value)}>
            <option value="">All Topics</option>
            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn-secondary text-xs px-3 py-2">Clear</button>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-sm">{error}</div>
        )}

        {/* Questions Table */}
        <div className="card bg-slate-900 border-slate-800 p-0 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center px-6">
              <div className="text-5xl">📭</div>
              <p className="text-slate-400 font-semibold text-lg">
                {hasActiveFilters ? 'No problems match your filters.' : 'No problems logged yet.'}
              </p>
              <p className="text-slate-500 text-sm max-w-sm">
                {hasActiveFilters ? 'Try adjusting or clearing your filters.' : 'Click "Log Problem" to start tracking your DSA journey!'}
              </p>
              {!hasActiveFilters && (
                <button onClick={openAdd} className="btn-primary mt-2">Log your first problem</button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50">
                    <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 w-8">#</th>
                    <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">Title</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 hidden md:table-cell">Platform</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">Difficulty</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 hidden lg:table-cell">Topic</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {questions.map((q, idx) => (
                    <tr key={q._id} className="hover:bg-slate-800/30 transition-colors group">
                      {/* # */}
                      <td className="px-5 py-3.5 text-slate-600 text-xs">{idx + 1}</td>

                      {/* Title */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-100 group-hover:text-white transition-colors">
                          {q.link ? (
                            <a href={q.link} target="_blank" rel="noopener noreferrer"
                              className="hover:text-indigo-400 flex items-center gap-1.5">
                              {q.title}
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-60 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ) : q.title}
                        </div>
                        {q.notes && (
                          <p className="text-slate-500 text-xs mt-0.5 max-w-xs truncate">{q.notes}</p>
                        )}
                      </td>

                      {/* Platform */}
                      <td className="px-4 py-3.5 text-slate-400 text-xs hidden md:table-cell">{q.platform}</td>

                      {/* Difficulty Badge */}
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${DIFF_STYLES[q.difficulty]}`}>
                          {q.difficulty}
                        </span>
                      </td>

                      {/* Topic */}
                      <td className="px-4 py-3.5 text-slate-400 text-xs hidden lg:table-cell">{q.topic}</td>

                      {/* Status — click to cycle */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleStatusCycle(q)}
                          title="Click to change status"
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity ${STATUS_STYLES[q.status]}`}
                        >
                          {q.status === 'to-do' ? 'To-Do' : q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        {deleteId === q._id ? (
                          <span className="flex items-center justify-end gap-2 text-xs">
                            <span className="text-slate-400">Delete?</span>
                            <button onClick={() => handleDelete(q._id)} className="text-rose-400 hover:text-rose-300 font-bold">Yes</button>
                            <button onClick={() => setDeleteId(null)} className="text-slate-400 hover:text-slate-300">No</button>
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(q)} title="Edit"
                              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-indigo-400 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button onClick={() => setDeleteId(q._id)} title="Delete"
                              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="px-5 py-3 border-t border-slate-800/60 text-xs text-slate-500">
                Showing {questions.length} {questions.length === 1 ? 'problem' : 'problems'}
                {hasActiveFilters ? ' (filtered)' : ''}.
                &nbsp;Click on a status badge to cycle it quickly.
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      <QuestionModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave}
        initial={editTarget}
      />
    </div>
  );
};

export default DSATrackerPage;
