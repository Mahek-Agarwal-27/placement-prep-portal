import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import noteService from '../services/noteService';
import aiService from '../services/aiService';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Trash2, 
  FileText, 
  Folder, 
  Check, 
  X, 
  Loader2, 
  Save 
} from 'lucide-react';

const FOLDERS = ['General', 'DSA Roadmaps', 'System Design', 'HR Questions', 'Resume Notes'];

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Note form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [folder, setFolder] = useState('General');
  const [tags, setTags] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [filterFolder, setFilterFolder] = useState('');

  // AI Modal state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiAction, setAiAction] = useState('summarize');
  const [aiResult, setAiResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterFolder) params.folder = filterFolder;
      
      const res = await noteService.getNotes(params);
      if (res.success) {
        setNotes(res.data);
      }
    } catch (e) {
      setError('Failed to load notes.');
    } finally {
      setLoading(false);
    }
  }, [search, filterFolder]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
      setFolder(activeNote.folder);
      setTags(activeNote.tags ? activeNote.tags.join(', ') : '');
    } else {
      setTitle('');
      setContent('');
      setFolder('General');
      setTags('');
    }
  }, [activeNote]);

  const handleSaveNote = async () => {
    setIsSaving(true);
    try {
      const payload = {
        title: title || 'Untitled Note',
        content,
        folder: folder || 'General',
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      if (activeNote) {
        const res = await noteService.updateNote(activeNote._id, payload);
        if (res.success) {
          setActiveNote(res.data);
          fetchNotes();
        }
      } else {
        const res = await noteService.createNote(payload);
        if (res.success) {
          setActiveNote(res.data);
          fetchNotes();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await noteService.deleteNote(id);
      if (activeNote && activeNote._id === id) {
        setActiveNote(null);
      }
      fetchNotes();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAIAction = async () => {
    const contextText = content.trim();
    if (!contextText) {
      setAiResult('Please write some content in the note before using AI generation.');
      return;
    }

    setIsGenerating(true);
    setAiResult('');
    
    try {
      const res = await aiService.generateAIResponse({
        action: aiAction,
        context: contextText,
      });

      if (res.success) {
        setAiResult(res.data.text);
      }
    } catch (e) {
      const serverMsg = e.response?.data?.message || e.message || 'AI service unavailable. Please try again.';
      setAiResult(`❌ Error: ${serverMsg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const applyAiResultToNote = () => {
    if (!aiResult) return;
    setContent(prev => (prev ? `${prev}\n\n--- AI Output ---\n${aiResult}` : aiResult));
    setShowAiModal(false);
    setAiResult('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col h-screen overflow-hidden">
      <Navbar />

      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Folder & Note List */}
        <aside className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-slate-200 space-y-3">
            <button 
              onClick={() => setActiveNote(null)} 
              className="btn-primary w-full flex items-center justify-center gap-2 text-xs py-2.5"
            >
              <Plus className="w-4 h-4" /> New AI Roadmap / Note
            </button>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input 
                className="input-field pl-8 py-1.5 text-xs" 
                placeholder="Search notes..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="p-4 flex-1">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">Your Notes</h3>
            {loading ? (
              <div className="text-center py-6 text-xs text-slate-400">Loading notes...</div>
            ) : notes.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No notes found.</div>
            ) : (
              <div className="space-y-2">
                {notes.map(item => (
                  <button 
                    key={item._id}
                    onClick={() => setActiveNote(item)}
                    className={`w-full text-left p-3 rounded-xl transition-all border flex flex-col gap-1 relative group ${
                      activeNote?._id === item._id 
                        ? 'bg-blue-50/70 border-blue-200' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center pr-6">
                      <span className="text-xs font-semibold text-slate-900 truncate w-full">{item.title}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex justify-between w-full mt-1">
                      <span className="text-purple-600 font-medium">{item.folder}</span>
                      <span>{new Date(item.updatedAt || item.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div 
                      onClick={(e) => { e.stopPropagation(); handleDeleteNote(item._id); }}
                      className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Note Editor Area */}
        <section className="flex-1 flex flex-col bg-white overflow-hidden">
          
          {/* Editor Header Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 justify-between items-center bg-white shadow-sm shrink-0">
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title (e.g. System Design Roadmap, DSA Revision)"
              className="text-lg font-bold text-slate-900 outline-none w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-600 transition-colors py-1"
            />

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
              <select 
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="input-field py-1.5 text-xs w-auto"
              >
                {FOLDERS.map(f => <option key={f}>{f}</option>)}
              </select>

              <button 
                onClick={() => setShowAiModal(true)}
                className="btn-ai text-xs py-2 px-3"
              >
                <Sparkles className="w-3.5 h-3.5" /> AI Assist
              </button>

              <button 
                onClick={handleSaveNote}
                disabled={isSaving}
                className="btn-primary text-xs py-2 px-4"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
              </button>
            </div>
          </div>

          {/* Note Content Textarea */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your notes, code snippets, or placement roadmaps here..."
              className="w-full h-full min-h-[400px] bg-transparent outline-none text-slate-800 text-sm leading-relaxed resize-none font-mono"
            />
          </div>

        </section>

      </main>

      {/* AI Assistant Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" /> AI Note Assistant
              </h3>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">Select AI Action</label>
              <select 
                value={aiAction} 
                onChange={(e) => setAiAction(e.target.value)}
                className="input-field text-xs py-2"
              >
                <option value="summarize">Summarize Note Keypoints</option>
                <option value="explain">Explain Concepts Simply</option>
                <option value="improve">Improve Grammar & Clarity</option>
              </select>
            </div>

            <button 
              onClick={handleAIAction}
              disabled={isGenerating}
              className="btn-ai w-full py-2 text-xs"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Generate AI Content'}
            </button>

            {aiResult && (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {aiResult}
                </div>
                <button 
                  onClick={applyAiResultToNote}
                  className="btn-primary w-full py-2 text-xs"
                >
                  Append to Note
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
