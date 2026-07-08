import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import noteService from '../services/noteService';
import aiService from '../services/aiService';

const NotesPage = () => {
  const { user, logout } = useAuth();
  
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
  const [deleteId, setDeleteId] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterFolder, setFilterFolder] = useState('');

  // AI Modal state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiAction, setAiAction] = useState('summarize');
  const [aiResult, setAiResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const contentRef = useRef(null);

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

  // Load active note into form
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
      setFolder(activeNote.folder);
      setTags(activeNote.tags.join(', '));
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
        title,
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
    try {
      await noteService.deleteNote(id);
      if (activeNote && activeNote._id === id) {
        setActiveNote(null);
      }
      setDeleteId(null);
      fetchNotes();
    } catch (e) {
      console.error(e);
    }
  };

  const createNewNote = () => {
    setActiveNote(null);
  };

  const handleAIAction = async () => {
    setIsGenerating(true);
    setAiResult('');
    
    // Get selected text if any, otherwise use full content
    let selectedText = '';
    if (window.getSelection) {
      selectedText = window.getSelection().toString();
    }
    
    const contextText = selectedText || content;
    
    try {
      const res = await aiService.generateAIResponse({
        prompt: aiPrompt,
        context: contextText,
        action: aiAction,
      });
      if (res.success) {
        setAiResult(res.data.text);
      }
    } catch (e) {
      setAiResult('Error generating AI response. Please ensure your GEMINI_API_KEY is configured correctly.');
    } finally {
      setIsGenerating(false);
    }
  };

  const appendAiResult = () => {
    setContent(prev => prev + '\n\n' + aiResult);
    setShowAiModal(false);
  };

  // Get unique folders for sidebar
  const folders = [...new Set(notes.map(n => n.folder))];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col h-screen overflow-hidden">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex justify-between items-center shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="text-xl font-extrabold tracking-wider gradient-text">PlacementPro</Link>
          <span className="text-xs bg-indigo-950 text-indigo-300 font-semibold px-2 py-0.5 rounded border border-indigo-800">Beta</span>
        </div>
        <nav className="hidden sm:flex items-center gap-5 text-sm font-semibold">
          <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">Dashboard</Link>
          <Link to="/dsa-tracker" className="text-slate-400 hover:text-white transition-colors">DSA Tracker</Link>
          <Link to="/study-planner" className="text-slate-400 hover:text-white transition-colors">Study Planner</Link>
          <Link to="/notes" className="text-indigo-400 border-b-2 border-indigo-500 pb-1">AI Notes</Link>
          <Link to="/profile" className="text-slate-400 hover:text-white transition-colors">Profile</Link>
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-slate-300 text-sm hidden md:inline">Hi, <strong className="text-white">{user?.name}</strong></span>
          <button onClick={logout} className="btn-secondary px-4 py-2 text-xs">Sign Out</button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/40 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-slate-800">
            <button onClick={createNewNote} className="btn-primary w-full justify-center flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Note
            </button>
          </div>
          
          <div className="p-4 flex-1">
            <div className="mb-4">
              <input 
                type="text" 
                placeholder="Search notes..." 
                className="input-field text-sm py-1.5 px-3 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Folders</h3>
              <ul className="space-y-1">
                <li>
                  <button 
                    onClick={() => setFilterFolder('')}
                    className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${filterFolder === '' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    All Notes
                  </button>
                </li>
                {folders.map(f => (
                  <li key={f}>
                    <button 
                      onClick={() => setFilterFolder(f)}
                      className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${filterFolder === f ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                      📁 {f}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Notes List</h3>
              {loading ? (
                <div className="text-center py-4 text-sm text-slate-500">Loading...</div>
              ) : notes.length === 0 ? (
                <div className="text-center py-4 text-sm text-slate-500">No notes found</div>
              ) : (
                <ul className="space-y-1">
                  {notes.map(note => (
                    <li key={note._id} className="group relative">
                      <button 
                        onClick={() => setActiveNote(note)}
                        className={`w-full text-left px-3 py-2 rounded text-sm truncate transition-colors pr-8 ${activeNote?._id === note._id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}
                      >
                        {note.title}
                      </button>
                      
                      {deleteId === note._id ? (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-slate-900 px-1 rounded border border-slate-700 z-10">
                           <button onClick={() => handleDeleteNote(note._id)} className="text-rose-400 text-xs px-1 hover:text-rose-300 font-bold">✓</button>
                           <button onClick={() => setDeleteId(null)} className="text-slate-400 text-xs px-1 hover:text-white">✕</button>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setDeleteId(note._id); }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </aside>

        {/* Editor Area */}
        <section className="flex-1 flex flex-col bg-slate-950 p-6 overflow-hidden relative">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-5 pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-4 shrink-0 relative z-10">
            <div className="flex gap-2">
               <input 
                 type="text" 
                 value={folder}
                 onChange={(e) => setFolder(e.target.value)}
                 className="bg-transparent text-sm text-slate-400 border-b border-slate-700 focus:border-indigo-500 outline-none w-32 px-1"
                 placeholder="Folder name"
               />
               <input 
                 type="text" 
                 value={tags}
                 onChange={(e) => setTags(e.target.value)}
                 className="bg-transparent text-sm text-slate-400 border-b border-slate-700 focus:border-indigo-500 outline-none w-48 px-1"
                 placeholder="Tags (comma separated)"
               />
            </div>
            
            <div className="flex gap-3 items-center">
              <span className="text-xs text-slate-500">{activeNote ? 'Editing Note' : 'New Note'}</span>
              
              <button 
                onClick={() => setShowAiModal(true)} 
                className="btn-secondary px-3 py-1.5 flex items-center gap-1.5 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
              >
                <span className="text-lg leading-none">✨</span> AI Magic
              </button>
              
              <button 
                onClick={handleSaveNote}
                disabled={isSaving}
                className="btn-primary px-4 py-1.5 flex items-center gap-2"
              >
                {isSaving ? (
                   <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Note
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col relative z-10 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
             <input
               type="text"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               className="bg-transparent text-2xl font-bold text-white px-6 py-4 border-b border-slate-800 outline-none w-full placeholder:text-slate-600"
               placeholder="Note Title..."
             />
             <textarea
               ref={contentRef}
               value={content}
               onChange={(e) => setContent(e.target.value)}
               className="bg-transparent text-slate-300 flex-1 p-6 outline-none resize-none placeholder:text-slate-600 leading-relaxed"
               placeholder="Start typing your notes here..."
             ></textarea>
          </div>
        </section>
      </main>

      {/* AI Assistant Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative">
            
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-10 pointer-events-none"></div>
            
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/80 z-10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-xl">✨</span> Gemini AI Assistant
              </h3>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 space-y-4 z-10">
               <div className="text-sm text-slate-400 mb-2">
                 The AI will use your currently selected text. If no text is selected, it will use the entire note content.
               </div>
               
               <div className="flex gap-3">
                 <button onClick={() => setAiAction('summarize')} className={`px-4 py-2 text-sm rounded-lg border transition-colors ${aiAction === 'summarize' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>Summarize</button>
                 <button onClick={() => setAiAction('explain')} className={`px-4 py-2 text-sm rounded-lg border transition-colors ${aiAction === 'explain' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>Explain</button>
                 <button onClick={() => setAiAction('improve')} className={`px-4 py-2 text-sm rounded-lg border transition-colors ${aiAction === 'improve' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>Improve Writing</button>
                 <button onClick={() => setAiAction('custom')} className={`px-4 py-2 text-sm rounded-lg border transition-colors ${aiAction === 'custom' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>Custom Prompt</button>
               </div>
               
               {aiAction === 'custom' && (
                 <textarea
                   value={aiPrompt}
                   onChange={(e) => setAiPrompt(e.target.value)}
                   className="input-field min-h-[80px]"
                   placeholder="E.g., Generate 3 quiz questions based on this note..."
                 ></textarea>
               )}
               
               <button 
                 onClick={handleAIAction}
                 disabled={isGenerating || (aiAction === 'custom' && !aiPrompt.trim())}
                 className="btn-primary w-full justify-center py-2.5"
               >
                 {isGenerating ? 'Generating...' : 'Generate AI Response'}
               </button>
               
               {aiResult && (
                 <div className="mt-4 pt-4 border-t border-slate-800">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">AI Response</h4>
                   <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-300 whitespace-pre-wrap">
                     {aiResult}
                   </div>
                   <div className="mt-3 flex justify-end gap-2">
                     <button onClick={appendAiResult} className="btn-secondary px-3 py-1.5 text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
                       Append to Note
                     </button>
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
