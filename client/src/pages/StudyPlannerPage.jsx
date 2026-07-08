/**
 * pages/StudyPlannerPage.jsx — Study Planner
 *
 * Features:
 *  - Stats overview: total tasks, pending, in-progress, completed, overdue, upcoming
 *  - Add/Edit modal form for creating or updating tasks
 *  - Filterable, searchable task list displayed as cards
 *  - Quick status toggle (pending → in-progress → completed)
 *  - Priority badges (low/medium/high)
 *  - Due date tracking with overdue highlighting
 *  - Delete with inline confirmation
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import taskService from '../services/taskService';

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = ['DSA', 'Development', 'System Design', 'Core Subjects', 'Aptitude', 'Soft Skills', 'Other'];
const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES   = ['pending', 'in-progress', 'completed'];

const STATUS_STYLES = {
  'completed':   'bg-emerald-950 text-emerald-300 border-emerald-800',
  'in-progress': 'bg-indigo-950  text-indigo-300  border-indigo-800',
  'pending':     'bg-slate-800   text-slate-400   border-slate-700',
};
const PRIORITY_STYLES = {
  high:   'bg-rose-950   text-rose-400   border-rose-800',
  medium: 'bg-amber-950  text-amber-400  border-amber-800',
  low:    'bg-slate-800  text-slate-400  border-slate-700',
};
const CATEGORY_COLORS = {
  'DSA':            'text-emerald-400',
  'Development':    'text-indigo-400',
  'System Design':  'text-violet-400',
  'Core Subjects':  'text-sky-400',
  'Aptitude':       'text-amber-400',
  'Soft Skills':    'text-rose-400',
  'Other':          'text-slate-400',
};

const EMPTY_FORM = {
  title: '', description: '', category: 'Other',
  priority: 'medium', status: 'pending', dueDate: '', estimatedHours: '',
};

// ── Helper: format date for display ───────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const isOverdue = (dateStr, status) => {
  if (!dateStr || status === 'completed') return false;
  return new Date(dateStr) < new Date();
};

// Convert date to YYYY-MM-DD for input[type=date]
const toDateInput = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
};

// ── Sub-component: Stats Overview ─────────────────────────────────────────────
const StatsOverview = ({ stats, loading }) => {
  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card h-24 animate-pulse bg-slate-800 border-slate-700"></div>
      ))}
    </div>
  );

  const items = [
    { label: 'Total Tasks',  value: stats?.totalTasks ?? 0,      color: 'text-white' },
    { label: 'Pending',      value: stats?.totalPending ?? 0,    color: 'text-slate-400' },
    { label: 'In Progress',  value: stats?.totalInProgress ?? 0, color: 'text-indigo-400' },
    { label: 'Completed',    value: stats?.totalCompleted ?? 0,  color: 'text-emerald-400' },
    { label: 'Due This Week', value: stats?.upcomingCount ?? 0,  color: 'text-amber-400' },
    { label: 'Overdue',      value: stats?.overdueCount ?? 0,    color: stats?.overdueCount > 0 ? 'text-rose-400' : 'text-slate-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {items.map(item => (
        <div key={item.label} className="card bg-slate-900 border-slate-800 py-4 px-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{item.label}</p>
          <p className={`text-3xl font-extrabold ${item.color}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
};

// ── Sub-component: Task Modal ─────────────────────────────────────────────────
const TaskModal = ({ isOpen, onClose, onSave, initial }) => {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initial) {
        setForm({
          ...EMPTY_FORM, ...initial,
          dueDate: toDateInput(initial.dueDate),
          estimatedHours: initial.estimatedHours || '',
        });
      } else {
        setForm(EMPTY_FORM);
      }
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
      const payload = {
        ...form,
        estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : 0,
        dueDate: form.dueDate || null,
      };
      await onSave(payload);
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
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-10 pointer-events-none"></div>
        <div className="p-6 space-y-5 relative">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">
              {initial ? 'Edit Task' : 'Create New Task'}
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-2xl leading-none">×</button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-sm">{error}</div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Task Title *</label>
            <input className="input-field" placeholder="e.g. Revise Binary Trees" value={form.title} onChange={set('title')} />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description (optional)</label>
            <textarea className="input-field resize-y min-h-[70px] py-2.5" placeholder="What needs to be done..." value={form.description} onChange={set('description')} />
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Category</label>
              <select className="input-field" value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Priority</label>
              <select className="input-field" value={form.priority} onChange={set('priority')}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Due Date + Estimated Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Due Date</label>
              <input type="date" className="input-field" value={form.dueDate} onChange={set('dueDate')} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Estimated Hours</label>
              <input type="number" className="input-field" placeholder="e.g. 2" min="0" step="0.5" value={form.estimatedHours} onChange={set('estimatedHours')} />
            </div>
          </div>

          {/* Status (only shown in edit mode) */}
          {initial && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</label>
              <select className="input-field" value={form.status} onChange={set('status')}>
                {STATUSES.map(s => <option key={s} value={s}>{s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t border-slate-800">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center py-3">
              {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (initial ? 'Save Changes' : 'Create Task')}
            </button>
            <button onClick={onClose} className="btn-secondary px-6 py-3">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Page Component ───────────────────────────────────────────────────────
const StudyPlannerPage = () => {
  const { user, logout } = useAuth();

  const [tasks, setTasks]               = useState([]);
  const [stats, setStats]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError]               = useState('');

  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [deleteId, setDeleteId] = useState(null);

  // ── Data Fetching ────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search)         params.search   = search;
      if (filterStatus)   params.status   = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (filterCategory) params.category = filterCategory;
      const res = await taskService.getTasks(params);
      if (res.success) setTasks(res.data);
    } catch (e) {
      setError('Failed to load tasks. Ensure the server is running.');
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterPriority, filterCategory]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await taskService.getTaskStats();
      if (res.success) setStats(res.data);
    } catch (_) {} finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // ── CRUD Handlers ────────────────────────────────────────────────────────────
  const handleSave = async (formData) => {
    if (editTarget) {
      await taskService.updateTask(editTarget._id, formData);
    } else {
      await taskService.addTask(formData);
    }
    fetchTasks();
    fetchStats();
    setEditTarget(null);
  };

  const handleStatusCycle = async (task) => {
    const order = ['pending', 'in-progress', 'completed'];
    const next  = order[(order.indexOf(task.status) + 1) % order.length];
    try {
      await taskService.updateTask(task._id, { status: next });
      fetchTasks();
      fetchStats();
    } catch (_) {}
  };

  const handleDelete = async (id) => {
    try {
      await taskService.deleteTask(id);
      setDeleteId(null);
      fetchTasks();
      fetchStats();
    } catch (_) {}
  };

  const openEdit = (t) => { setEditTarget(t); setModalOpen(true); };
  const openAdd  = ()  => { setEditTarget(null); setModalOpen(true); };
  const clearFilters = () => { setSearch(''); setFilterStatus(''); setFilterPriority(''); setFilterCategory(''); };
  const hasActiveFilters = search || filterStatus || filterPriority || filterCategory;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">
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
          <Link to="/dsa-tracker" className="text-slate-400 hover:text-white transition-colors">DSA Tracker</Link>
          <Link to="/study-planner" className="text-indigo-400 border-b-2 border-indigo-500 pb-1">Study Planner</Link>
          <Link to="/profile" className="text-slate-400 hover:text-white transition-colors">Profile</Link>
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Study Planner
            </h1>
            <p className="text-slate-400 text-sm mt-1">Plan your preparation schedule, set deadlines, and track daily progress.</p>
          </div>
          <button onClick={openAdd} className="btn-primary px-5 py-2.5 flex items-center gap-2 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>

        {/* Stats Overview */}
        <StatsOverview stats={stats} loading={statsLoading} />

        {/* Progress Bar */}
        {stats && stats.totalTasks > 0 && (
          <div className="card bg-slate-900 border-slate-800 p-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-300">Task Completion</span>
              <span className="text-sm font-bold text-emerald-400">{stats.totalCompleted} / {stats.totalTasks} done</span>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.round((stats.totalCompleted / stats.totalTasks) * 100)}%`,
                  background: 'linear-gradient(90deg, #6366f1, #10b981)',
                }}
              ></div>
            </div>
            {stats.totalStudyHours > 0 && (
              <p className="text-xs text-slate-500 mt-2">📚 Total study hours logged: <span className="text-white font-semibold">{stats.totalStudyHours}h</span></p>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" className="input-field pl-9 text-sm" placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input-field w-auto text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select className="input-field w-auto text-sm" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          <select className="input-field w-auto text-sm" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn-secondary text-xs px-3 py-2">Clear</button>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-sm">{error}</div>
        )}

        {/* Task Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="card bg-slate-900 border-slate-800 flex flex-col items-center justify-center py-20 space-y-4 text-center px-6">
            <div className="text-5xl">📋</div>
            <p className="text-slate-400 font-semibold text-lg">
              {hasActiveFilters ? 'No tasks match your filters.' : 'No tasks created yet.'}
            </p>
            <p className="text-slate-500 text-sm max-w-sm">
              {hasActiveFilters ? 'Try adjusting or clearing your filters.' : 'Click "New Task" to start planning your study schedule!'}
            </p>
            {!hasActiveFilters && (
              <button onClick={openAdd} className="btn-primary mt-2">Create your first task</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tasks.map(task => (
              <div
                key={task._id}
                className={`card bg-slate-900 border-slate-800 p-5 flex flex-col justify-between group relative overflow-hidden transition-all
                  ${task.status === 'completed' ? 'opacity-75' : ''}
                  ${isOverdue(task.dueDate, task.status) ? 'border-l-4 border-l-rose-500' : ''}
                `}
              >
                {/* Glow effect */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500 rounded-full blur-[50px] opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity"></div>

                <div className="space-y-3 relative">
                  {/* Header Row: Category + Priority */}
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${CATEGORY_COLORS[task.category] || 'text-slate-400'}`}>
                      {task.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${PRIORITY_STYLES[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className={`font-bold text-white text-base ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </h4>

                  {/* Description */}
                  {task.description && (
                    <p className="text-slate-500 text-xs line-clamp-2">{task.description}</p>
                  )}

                  {/* Meta: Due date + Est. hours */}
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    {task.dueDate && (
                      <span className={`flex items-center gap-1 ${isOverdue(task.dueDate, task.status) ? 'text-rose-400 font-semibold' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {isOverdue(task.dueDate, task.status) ? 'Overdue: ' : ''}{formatDate(task.dueDate)}
                      </span>
                    )}
                    {task.estimatedHours > 0 && (
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {task.estimatedHours}h
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer: Status + Actions */}
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800/60">
                  {/* Status badge — click to cycle */}
                  <button
                    onClick={() => handleStatusCycle(task)}
                    title="Click to change status"
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity ${STATUS_STYLES[task.status]}`}
                  >
                    {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </button>

                  {/* Actions */}
                  {deleteId === task._id ? (
                    <span className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Delete?</span>
                      <button onClick={() => handleDelete(task._id)} className="text-rose-400 hover:text-rose-300 font-bold">Yes</button>
                      <button onClick={() => setDeleteId(null)} className="text-slate-400 hover:text-slate-300">No</button>
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(task)} title="Edit"
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-indigo-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => setDeleteId(task._id)} title="Delete"
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Count footer */}
        {!loading && tasks.length > 0 && (
          <p className="text-xs text-slate-500 text-center">
            Showing {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            {hasActiveFilters ? ' (filtered)' : ''}.
            Click on a status badge to cycle it quickly.
          </p>
        )}
      </main>

      {/* Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave}
        initial={editTarget}
      />
    </div>
  );
};

export default StudyPlannerPage;
