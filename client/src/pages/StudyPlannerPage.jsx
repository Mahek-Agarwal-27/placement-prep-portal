import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import taskService from '../services/taskService';
import { 
  Calendar, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  X, 
  BookOpen, 
  Tag 
} from 'lucide-react';

const CATEGORIES = ['DSA', 'Development', 'System Design', 'Core Subjects', 'Aptitude', 'Soft Skills', 'Other'];
const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['pending', 'in-progress', 'completed'];

const EMPTY_FORM = {
  title: '', description: '', category: 'DSA',
  priority: 'medium', status: 'pending', dueDate: '', estimatedHours: '',
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const toDateInput = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
};

// ── Modal Sub-component ────────────────────────────────────────────────────────
const TaskModal = ({ isOpen, onClose, onSave, initial }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
        estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : 1,
        dueDate: form.dueDate || null,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-base font-semibold text-slate-900">
              {initial ? 'Edit Study Task' : 'Add Study Task'}
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Task Title *</label>
            <input 
              className="input-field text-xs" 
              placeholder="e.g. Solve 5 Graph DP Problems, Review System Design Notes" 
              value={form.title} 
              onChange={set('title')} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <select className="input-field text-xs" value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Priority</label>
              <select className="input-field text-xs" value={form.priority} onChange={set('priority')}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Status</label>
              <select className="input-field text-xs" value={form.status} onChange={set('status')}>
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Est. Hours</label>
              <input 
                type="number" 
                className="input-field text-xs" 
                placeholder="1" 
                value={form.estimatedHours} 
                onChange={set('estimatedHours')} 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Due Date</label>
              <input 
                type="date" 
                className="input-field text-xs" 
                value={form.dueDate} 
                onChange={set('dueDate')} 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Description (optional)</label>
            <textarea 
              className="input-field text-xs resize-y min-h-[70px] py-2" 
              placeholder="Task details or specific goals..." 
              value={form.description} 
              onChange={set('description')} 
            />
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : (initial ? 'Save Task' : 'Add Task')}
            </button>
            <button onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Page Component ───────────────────────────────────────────────────────
const StudyPlannerPage = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterCategory) params.category = filterCategory;
      if (filterPriority) params.priority = filterPriority;
      if (filterStatus) params.status = filterStatus;
      const res = await taskService.getTasks(params);
      if (res.success) setTasks(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, filterPriority, filterStatus]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await taskService.getTaskStats();
      if (res.success) setStats(res.data);
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks, fetchStats]);

  const handleSave = async (formData) => {
    if (editTarget) {
      await taskService.updateTask(editTarget._id, formData);
    } else {
      await taskService.createTask(formData);
    }
    fetchTasks();
    fetchStats();
    setEditTarget(null);
  };

  const handleStatusToggle = async (t) => {
    const nextMap = { 'pending': 'in-progress', 'in-progress': 'completed', 'completed': 'pending' };
    const next = nextMap[t.status] || 'pending';
    try {
      await taskService.updateTask(t._id, { status: next });
      fetchTasks();
      fetchStats();
    } catch (_) {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.deleteTask(id);
      fetchTasks();
      fetchStats();
    } catch (_) {}
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" /> Placement Study Planner
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Organize study tasks, set target completion hours, and maintain daily schedule.
            </p>
          </div>

          <button 
            onClick={() => { setEditTarget(null); setModalOpen(true); }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Tasks</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalTasks ?? 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending</span>
            <p className="text-2xl font-bold text-slate-700 mt-1">{stats?.totalPending ?? 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">In Progress</span>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats?.totalInProgress ?? 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Completed</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats?.totalCompleted ?? 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">Due Soon</span>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats?.upcomingCount ?? 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span className="text-xs font-medium text-rose-600 uppercase tracking-wider">Overdue</span>
            <p className="text-2xl font-bold text-rose-600 mt-1">{stats?.overdueCount ?? 0}</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
              className="input-field pl-9 py-2 text-xs" 
              placeholder="Search tasks..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <select 
              className="input-field py-2 text-xs w-auto"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>

            <select 
              className="input-field py-2 text-xs w-auto"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>

            <select 
              className="input-field py-2 text-xs w-auto"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>

            {(search || filterCategory || filterPriority || filterStatus) && (
              <button 
                onClick={() => { setSearch(''); setFilterCategory(''); setFilterPriority(''); setFilterStatus(''); }}
                className="text-xs text-slate-500 hover:text-slate-800 underline px-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Task Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-full p-8 text-center text-xs text-slate-400">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-white border border-slate-200 rounded-xl space-y-2">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No tasks found</p>
              <p className="text-[11px] text-slate-400">Click "Add Task" to create a new study item.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                      {task.category}
                    </span>

                    <button 
                      onClick={() => handleStatusToggle(task)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                        task.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        task.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {task.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      <span className="capitalize">{task.status}</span>
                    </button>
                  </div>

                  <h3 className={`font-semibold text-sm text-slate-900 ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    {task.dueDate && (
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" /> {formatDate(task.dueDate)}
                      </span>
                    )}
                    <span className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                      {task.estimatedHours || 1}h
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => { setEditTarget(task); setModalOpen(true); }}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(task._id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </main>

      <TaskModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleSave} 
        initial={editTarget} 
      />
    </div>
  );
};

export default StudyPlannerPage;
