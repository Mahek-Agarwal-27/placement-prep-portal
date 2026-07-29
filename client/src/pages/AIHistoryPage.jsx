import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AIHistoryCard from '../components/AIHistoryCard';
import { HistorySkeleton } from '../components/SkeletonLoader';
import aiHistoryService from '../services/aiHistoryService';
import { 
  Sparkles, 
  BookOpen, 
  Rocket, 
  MessageSquare, 
  FileText, 
  Trash2, 
  Search, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle 
} from 'lucide-react';

const ITEMS_PER_PAGE = 6;

const AIHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, note, roadmap, chat, resume
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await aiHistoryService.getHistory();
      if (res.success) {
        setHistory(res.data);
      }
    } catch (err) {
      setError('Unable to load your AI history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this history record?')) return;
    try {
      await aiHistoryService.deleteItem(id);
      fetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear ALL AI History records? This action cannot be undone.')) return;
    try {
      await aiHistoryService.clearAll();
      fetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter, Sort, Paginate
  const processedHistory = history
    .filter((item) => {
      const matchesTab = activeTab === 'all' || item.category === activeTab;
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const totalPages = Math.ceil(processedHistory.length / ITEMS_PER_PAGE) || 1;
  const paginatedHistory = processedHistory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" /> AI History Dashboard ⭐
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Filter, search, sort, and review all your generated AI notes, roadmaps, and chat interactions.
            </p>
          </div>

          {history.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="btn-secondary text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
            >
              <Trash2 className="w-4 h-4" /> Clear All History
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Tabs, Search Bar & Sort Dropdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            <button
              onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({history.length})
            </button>

            <button
              onClick={() => { setActiveTab('note'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
                activeTab === 'note'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> AI Notes ({history.filter(h => h.category === 'note').length})
            </button>

            <button
              onClick={() => { setActiveTab('roadmap'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
                activeTab === 'roadmap'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" /> AI Roadmap ({history.filter(h => h.category === 'roadmap').length})
            </button>

            <button
              onClick={() => { setActiveTab('resume'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
                activeTab === 'resume'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Resume Analysis ({history.filter(h => h.category === 'resume').length})
            </button>

            <button
              onClick={() => { setActiveTab('chat'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
                activeTab === 'chat'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> AI Chat ({history.filter(h => h.category === 'chat').length})
            </button>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-60">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text"
                className="input-field text-xs pl-9 py-1.5"
                placeholder="Search your AI history..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

        </div>

        {/* History Cards Grid */}
        {loading ? (
          <HistorySkeleton />
        ) : paginatedHistory.length === 0 ? (
          <div className="p-14 text-center bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
            <div className="w-14 h-14 rounded-full bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mx-auto text-2xl font-bold">
              🤖
            </div>
            <h3 className="text-base font-bold text-slate-900">No AI activity yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Generate AI notes, roadmaps, scan resumes, or chat with AI to see history records populate here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedHistory.map((item) => (
              <AIHistoryCard
                key={item._id}
                item={item}
                onView={(rec) => setSelectedItem(rec)}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-3 shadow-sm text-xs">
            <span className="text-slate-500 font-medium">
              Showing Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn-secondary text-xs py-1 px-3 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="btn-secondary text-xs py-1 px-3 disabled:opacity-40"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Item View Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base">{selectedItem.title}</h3>
                <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedItem.content}
              </div>

              <div className="flex justify-end pt-2">
                <button onClick={() => setSelectedItem(null)} className="btn-secondary text-xs">Close</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AIHistoryPage;
