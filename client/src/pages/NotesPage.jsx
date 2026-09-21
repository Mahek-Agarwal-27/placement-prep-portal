import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
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
  Save,
  HelpCircle,
  BookOpen,
  Target,
  FileCode,
  RefreshCw
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
  const [showNotesMobile, setShowNotesMobile] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [filterFolder, setFilterFolder] = useState('');

  // AI Modal state & chat context
  const [showAiModal, setShowAiModal] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const fetchNotes = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
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
      if (showSpinner) setLoading(false);
    }
  }, [search, filterFolder]);

  useEffect(() => {
    fetchNotes(true);
  }, [fetchNotes]);

  const handleSelectNote = (note) => {
    setActiveNote(note);
    setTitle(note.title);
    setContent(note.content);
    setFolder(note.folder || 'General');
    setTags(note.tags ? note.tags.join(', ') : '');
    setShowNotesMobile(false);
  };

  const handleCreateNew = () => {
    setActiveNote(null);
    setTitle('');
    setContent('');
    setFolder('General');
    setTags('');
    setShowNotesMobile(false);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    const payload = { title, content, folder, tags: parsedTags };

    try {
      if (activeNote) {
        const res = await noteService.updateNote(activeNote._id, payload);
        if (res.success) {
          setActiveNote(res.data);
          // Instant optimistic update in note list
          setNotes(prev => prev.map(n => n._id === res.data._id ? res.data : n));
        }
      } else {
        const res = await noteService.createNote(payload);
        if (res.success) {
          setActiveNote(res.data);
          // Instant optimistic insert at top of list
          setNotes(prev => [res.data, ...prev]);
        }
      }
      fetchNotes(false);
    } catch (e) {
      setError('Failed to save note.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await noteService.deleteNote(id);
      if (activeNote?._id === id) {
        handleCreateNew();
      }
      fetchNotes(false);
    } catch (e) {
      console.error(e);
      setError('Failed to delete note.');
    }
  };

  const handleClearAll = async () => {
    if (notes.length === 0) return;
    if (!window.confirm('Are you sure you want to delete ALL saved notes? This action cannot be undone.')) return;
    try {
      await noteService.clearAllNotes();
      handleCreateNew();
      setNotes([]);
      fetchNotes(false);
    } catch (e) {
      console.error('Failed to clear notes:', e);
      setError('Failed to clear all notes.');
    }
  };

  const handleAIAction = async (actionType = null, overridePrompt = null) => {
    const userTypedPrompt = overridePrompt || customPrompt.trim();
    const contextText = content.trim();
    const activeTitle = title.trim();

    // Find the last real user prompt topic from history if user didn't type a new prompt
    let lastTopicFromHistory = '';
    for (let i = chatHistory.length - 1; i >= 0; i--) {
      const item = chatHistory[i];
      if (item.role === 'user' && item.text && !['explain', 'roadmap', 'interview_questions', 'revision', 'summarize'].includes(item.text.toLowerCase())) {
        lastTopicFromHistory = item.text;
        break;
      }
    }

    const effectivePrompt = userTypedPrompt || lastTopicFromHistory || activeTitle;

    if (!effectivePrompt && !contextText && !actionType) {
      setAiResult('Please enter a topic/question or select an AI action.');
      return;
    }

    setIsGenerating(true);
    const newPromptLabel = userTypedPrompt || (actionType ? `${actionType} on ${effectivePrompt || 'Note'}` : 'AI Study Assistance');
    
    // Add user message to local session history
    const updatedHistory = [
      ...chatHistory,
      { role: 'user', text: newPromptLabel }
    ];
    setChatHistory(updatedHistory);

    try {
      const res = await aiService.generateAIResponse({
        prompt: effectivePrompt,
        action: actionType,
        context: contextText,
        history: chatHistory
      });

      if (res && res.success && res.data.text) {
        const aiText = res.data.text;
        setAiResult(aiText);
        setChatHistory([
          ...updatedHistory,
          { role: 'assistant', text: aiText }
        ]);
        setCustomPrompt('');
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
    setContent(prev => (prev ? `${prev}\n\n--- AI Study Note ---\n${aiResult}` : aiResult));
    setShowAiModal(false);
  };

  const saveAiResultAsNewNote = async () => {
    if (!aiResult) return;
    const generatedTitle = customPrompt.trim() 
      ? `AI Note: ${customPrompt.trim().substring(0, 30)}`
      : 'AI Generated Study Note';

    try {
      const res = await noteService.createNote({
        title: generatedTitle,
        content: aiResult,
        folder: 'General',
        tags: ['AI-Note']
      });
      if (res.success) {
        setActiveNote(res.data);
        setTitle(res.data.title);
        setContent(res.data.content);
        setFolder(res.data.folder || 'General');
        fetchNotes();
        setShowAiModal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFE9FE] flex text-[#1A1A2E] font-sans antialiased h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />

        <main className="flex-1 flex overflow-hidden relative">
          
          {/* Mobile Notes Backdrop Overlay */}
          {showNotesMobile && (
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-fade-in"
              onClick={() => setShowNotesMobile(false)}
            />
          )}

          {/* Left Sidebar: Folder & Note List */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-white border-r border-purple-200/70 flex flex-col shrink-0 transition-transform duration-300 ease-in-out md:static md:translate-x-0 overflow-y-auto ${
            showNotesMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
          }`}>
            <div className="p-4 border-b border-purple-100 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <button 
                  onClick={() => { handleCreateNew(); setShowNotesMobile(false); }} 
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-[#6C47FF] text-white text-xs font-bold hover:bg-[#5A36EC] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> New AI Note
                </button>
                <button
                  onClick={() => setShowNotesMobile(false)}
                  className="md:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  title="Close notes"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                <input 
                  className="w-full pl-8 py-1.5 text-xs rounded-xl border border-purple-200 focus:border-[#6C47FF] outline-none" 
                  placeholder="Search notes..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div className="p-4 flex-1">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Your Saved Notes {notes.length > 0 && `(${notes.length})`}
                </h3>
                {notes.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-[11px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors px-1.5 py-0.5 rounded-md hover:bg-rose-50"
                    title="Delete all saved notes"
                  >
                    <Trash2 className="w-3 h-3" /> Clear All
                  </button>
                )}
              </div>
              {loading ? (
                <div className="text-center py-6 text-xs text-gray-400">Loading notes...</div>
              ) : notes.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400 font-medium">No notes found. Create your first note!</div>
              ) : (
                <div className="space-y-2">
                  {notes.map(item => (
                    <div
                      key={item._id}
                      onClick={() => handleSelectNote(item)}
                      className={`w-full text-left p-3 rounded-2xl transition-all border flex flex-col gap-1 relative group cursor-pointer ${
                        activeNote?._id === item._id 
                          ? 'bg-[#EAE5FF] border-[#6C47FF] shadow-xs' 
                          : 'bg-white border-purple-100 hover:border-purple-200'
                      }`}
                    >
                      <div className="flex justify-between items-center pr-7">
                        <span className="text-xs font-bold text-[#1A1A2E] truncate w-full">{item.title}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 flex justify-between w-full mt-1 font-medium pr-7">
                        <span className="text-[#6C47FF] font-bold">{item.folder}</span>
                        <span>{new Date(item.updatedAt || item.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <button 
                        onClick={(e) => handleDelete(item._id, e)}
                        className="absolute right-2.5 top-2.5 text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 z-10"
                        title="Delete this note"
                        aria-label="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Note Editor Area */}
          <section className="flex-1 flex flex-col bg-white overflow-hidden">
            
            {/* Editor Header Bar */}
            <div className="p-3 sm:p-4 border-b border-purple-100 flex flex-col gap-2.5 bg-white shadow-xs shrink-0">
              
              {/* Mobile Quick Actions & Drawer Trigger (Screens < md) */}
              <div className="flex items-center justify-between gap-2 md:hidden">
                <button
                  onClick={() => setShowNotesMobile(true)}
                  className="py-1.5 px-2.5 rounded-xl border border-purple-200 text-xs font-bold text-gray-700 flex items-center gap-1.5 hover:bg-purple-50 shrink-0 shadow-2xs"
                  title="View Saved Notes"
                >
                  <FileText className="w-3.5 h-3.5 text-[#6C47FF]" /> Notes ({notes.length})
                </button>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowAiModal(true)}
                    className="py-1.5 px-2.5 rounded-xl bg-purple-100 text-[#6C47FF] text-xs font-bold hover:bg-purple-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> AI Assist
                  </button>

                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="py-1.5 px-3 rounded-xl bg-[#6C47FF] text-white text-xs font-bold hover:bg-[#5A36EC] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save
                  </button>
                </div>
              </div>

              {/* Note Title Input (Full Width Row, so placeholder is completely visible) */}
              <div className="w-full">
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note Title (e.g. System Design Notes)"
                  className="text-sm sm:text-base font-extrabold text-[#1A1A2E] outline-none w-full bg-transparent border-b border-transparent focus:border-[#6C47FF] transition-colors py-1 placeholder:text-gray-400"
                />
              </div>

              {/* Secondary Bar: Folder Selector (Mobile + Desktop) & Desktop Actions */}
              <div className="flex items-center gap-2 flex-wrap justify-between">
                <select 
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  className="py-1.5 px-2.5 rounded-xl border border-purple-200 text-xs font-bold text-gray-700 outline-none cursor-pointer bg-white hover:border-purple-300"
                >
                  {FOLDERS.map(f => <option key={f}>{f}</option>)}
                </select>

                {/* Active Note Actions & Desktop Save/AI Assist buttons */}
                <div className="flex items-center gap-2">
                  {activeNote && (
                    <button 
                      onClick={(e) => handleDelete(activeNote._id, e)}
                      className="py-1.5 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Delete this note"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}

                  <div className="hidden md:flex items-center gap-2">
                    <button 
                      onClick={() => setShowAiModal(true)}
                      className="py-1.5 px-3 rounded-xl bg-purple-100 text-[#6C47FF] text-xs font-bold hover:bg-purple-200 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> AI Assist
                    </button>

                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="py-1.5 px-4 rounded-xl bg-[#6C47FF] text-white text-xs font-bold hover:bg-[#5A36EC] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Note Content Textarea */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-purple-50/20">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your notes, ask AI questions, or draft placement roadmaps here..."
                className="w-full h-full min-h-[300px] bg-transparent outline-none text-[#1A1A2E] text-xs leading-relaxed resize-none font-mono"
              />
            </div>

          </section>

        </main>

        {/* AI Assistant Modal — Natural Language & Concept Intelligence */}
        {showAiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
            <div className="bg-white border border-purple-100 rounded-3xl shadow-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center border-b border-purple-100 pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6C47FF] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1A1A2E]">AI Note Assistant</h3>
                    <p className="text-[10px] text-gray-500 font-medium">Ask any technical question or generate structured study notes</p>
                  </div>
                </div>
                <button onClick={() => setShowAiModal(false)} className="text-gray-400 hover:text-gray-600 font-bold p-1 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Intent Action Pills — 3 Modes Only */}
              <div className="flex flex-wrap gap-2 shrink-0">
                <button 
                  onClick={() => handleAIAction('explain')} 
                  disabled={isGenerating}
                  className="px-3.5 py-1.5 rounded-full bg-purple-50 text-[#6C47FF] border border-purple-100 hover:bg-purple-100 text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Explain Simply
                </button>
                <button 
                  onClick={() => handleAIAction('roadmap')} 
                  disabled={isGenerating}
                  className="px-3.5 py-1.5 rounded-full bg-purple-50 text-[#6C47FF] border border-purple-100 hover:bg-purple-100 text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5" /> Learning Roadmap
                </button>
                <button 
                  onClick={() => handleAIAction('summarize')} 
                  disabled={isGenerating}
                  className="px-3.5 py-1.5 rounded-full bg-purple-50 text-[#6C47FF] border border-purple-100 hover:bg-purple-100 text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Summarize Note
                </button>
              </div>

              {/* Response Output Display with ReactMarkdown */}
              <div className="flex-1 min-h-[180px] overflow-y-auto bg-purple-50/40 border border-purple-100 rounded-2xl p-4 space-y-3">
                {isGenerating ? (
                  <div className="flex items-center justify-center h-full text-xs text-purple-600 font-medium gap-2 py-8">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>HireNova AI is generating structured study notes...</span>
                  </div>
                ) : aiResult ? (
                  <div className="prose prose-sm max-w-none text-xs text-slate-800 font-sans leading-relaxed space-y-2">
                    <ReactMarkdown>{aiResult}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-gray-400 font-medium">
                    Select an AI action pill above to generate structured notes.
                  </div>
                )}
              </div>

              {/* Action Buttons for Integration */}
              {aiResult && (
                <div className="flex items-center justify-between gap-3 pt-2 shrink-0 border-t border-purple-100">
                  <button
                    onClick={() => {
                      setChatHistory([]);
                      setAiResult('');
                    }}
                    className="py-2 px-3 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Clear Session
                  </button>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={saveAiResultAsNewNote}
                      className="py-2 px-4 rounded-xl bg-purple-100 text-[#6C47FF] font-bold text-xs hover:bg-purple-200 transition-all cursor-pointer"
                    >
                      Save as New Note
                    </button>
                    <button 
                      onClick={applyAiResultToNote}
                      className="py-2 px-4 rounded-xl bg-[#6C47FF] text-white font-bold text-xs hover:bg-[#5A36EC] transition-all shadow-xs cursor-pointer"
                    >
                      Append to Active Note
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPage;
