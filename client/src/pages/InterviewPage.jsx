import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import interviewService from '../services/interviewService';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, 
  Plus, 
  Send, 
  Bot, 
  User, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Loader2, 
  Check,
  ChevronDown,
  Trash2
} from 'lucide-react';

// Predefined Topics Lists
const TECHNICAL_TOPICS = [
  'Data Structures & Algorithms (DSA)',
  'General Technical / Core CS',
  'Java',
  'C++',
  'Python',
  'JavaScript',
  'React.js',
  'Node.js',
  'MERN Stack',
  'SQL',
  'MySQL',
  'Database Management Systems (DBMS)',
  'Operating Systems (OS)',
  'Computer Networks (CN)',
  'Object-Oriented Programming (OOPs)',
  'Machine Learning',
  'Deep Learning',
  'Artificial Intelligence',
  'Data Science',
  'Cloud Computing',
  'DevOps',
  'Cyber Security',
  'Other (Custom Topic)'
];

const SYSTEM_DESIGN_TOPICS = [
  'Scalable Web Applications',
  'Distributed Systems',
  'Database Design',
  'API Design',
  'Microservices Architecture',
  'Cloud Architecture',
  'Caching Strategies',
  'Load Balancing',
  'Real-time Systems',
  'Notification Systems',
  'E-commerce System Design',
  'Social Media System Design',
  'Other (Custom Topic)'
];

const InterviewPage = () => {
  const { user } = useAuth();
  const [type, setType] = useState('Technical');
  const [selectedTopic, setSelectedTopic] = useState('Data Structures & Algorithms (DSA)');
  const [customTopic, setCustomTopic] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'System Design') {
      setSelectedTopic('Scalable Web Applications');
    } else if (newType === 'Technical') {
      setSelectedTopic('Data Structures & Algorithms (DSA)');
    } else {
      setSelectedTopic('');
    }
    setCustomTopic('');
    setSearchQuery('');
  };

  const [inputMessage, setInputMessage] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [history, setHistory] = useState([]);
  
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingSession, setLoadingSession] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [error, setError] = useState('');

  const chatEndRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await interviewService.getInterviews();
      if (res && res.success && Array.isArray(res.data)) {
        setHistory(res.data);
        return res.data;
      }
    } catch (e) {
      console.error('Failed to fetch interview history:', e);
    } finally {
      setLoadingHistory(false);
    }
    return [];
  };

  useEffect(() => {
    const initPage = async () => {
      setLoadingHistory(true);
      const pastSessions = await fetchHistory();
      
      // Check if there was an active session before reload
      const savedSessionId = sessionStorage.getItem('hirenova_active_interview_id');
      if (savedSessionId) {
        const found = pastSessions.find(s => s._id === savedSessionId);
        if (found) {
          setActiveSession(found);
          try {
            const detail = await interviewService.getInterviewById(savedSessionId);
            if (detail && detail.success && detail.data) {
              setActiveSession(detail.data);
            }
          } catch (e) {
            console.warn('Could not refresh saved session detail:', e);
          }
        } else {
          try {
            const detail = await interviewService.getInterviewById(savedSessionId);
            if (detail && detail.success && detail.data) {
              setActiveSession(detail.data);
            } else {
              sessionStorage.removeItem('hirenova_active_interview_id');
            }
          } catch {
            sessionStorage.removeItem('hirenova_active_interview_id');
          }
        }
      }
    };

    initPage();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isSending]);

  const filteredTopics = (
    type === 'System Design' ? SYSTEM_DESIGN_TOPICS : TECHNICAL_TOPICS
  ).filter(t => 
    t.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartInterview = async () => {
    let effectiveTopic = type === 'Behavioral' ? 'HR & Behavioral' : selectedTopic;
    if (type !== 'Behavioral' && selectedTopic === 'Other (Custom Topic)') {
      if (!customTopic || !customTopic.trim()) {
        setError('Please enter your custom topic.');
        return;
      }
      effectiveTopic = customTopic.trim();
    }

    if (type !== 'Behavioral' && !effectiveTopic) {
      setError(`Please select a ${type === 'System Design' ? 'System Design Topic' : 'Focus Topic / Tech Stack'}.`);
      return;
    }

    setIsStarting(true);
    setError('');
    try {
      const res = await interviewService.startInterview({
        type,
        topic: effectiveTopic,
      });
      if (res && res.success && res.data) {
        setActiveSession(res.data);
        if (res.data._id) {
          sessionStorage.setItem('hirenova_active_interview_id', res.data._id);
        }
        fetchHistory();
      } else {
        setError(res?.message || 'Failed to start interview session.');
      }
    } catch (e) {
      const serverErr = e.response?.data?.message || e.message || 'Failed to start interview session.';
      setError(serverErr);
    } finally {
      setIsStarting(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const userMsg = inputMessage.trim();
    if (!userMsg || isSending || !activeSession || !activeSession._id || activeSession.status !== 'active') {
      return;
    }

    const currentSessionId = activeSession._id;
    setInputMessage('');
    setIsSending(true);
    setError('');

    // Optimistically push user message into active session using functional state update
    setActiveSession((prev) => {
      if (!prev) return prev;
      const currentMsgs = Array.isArray(prev.messages) ? prev.messages : [];
      return {
        ...prev,
        messages: [
          ...currentMsgs, 
          { 
            role: 'user', 
            content: userMsg, 
            createdAt: new Date().toISOString() 
          }
        ]
      };
    });

    try {
      const res = await interviewService.respondToInterview(currentSessionId, userMsg);
      if (res && res.success && res.data) {
        setActiveSession(res.data);
        if (res.data._id) {
          sessionStorage.setItem('hirenova_active_interview_id', res.data._id);
        }
        // Silently sync history in background
        interviewService.getInterviews().then(historyRes => {
          if (historyRes && historyRes.success && Array.isArray(historyRes.data)) {
            setHistory(historyRes.data);
          }
        }).catch(() => {});
      } else {
        setError(res?.message || 'Failed to receive recruiter response.');
      }
    } catch (err) {
      console.error('Error sending response:', err);
      const serverErr = err.response?.data?.message || err.message || 'Failed to send message. Please try again.';
      setError(serverErr);
    } finally {
      setIsSending(false);
    }
  };

  const handleEndInterview = async () => {
    if (!activeSession || !activeSession._id || isEnding) return;

    const userAnswersCount = (activeSession.messages || []).filter(m => m && m.role === 'user').length;
    const maxQuestions = activeSession.type === 'Behavioral' ? 8 : activeSession.type === 'System Design' ? 7 : 10;

    if (activeSession.status === 'active' && userAnswersCount < maxQuestions) {
      const confirmEnd = window.confirm(`You have answered ${userAnswersCount} out of ${maxQuestions} questions. Are you sure you want to finish?`);
      if (!confirmEnd) return;
    }

    setIsEnding(true);
    setError('');
    try {
      const res = await interviewService.endInterview(activeSession._id);
      if (res && res.success && res.data) {
        setActiveSession(res.data);
        sessionStorage.removeItem('hirenova_active_interview_id');
        fetchHistory();
      } else {
        setError(res?.message || 'Failed to grade the interview transcript.');
      }
    } catch (e) {
      const serverErr = e.response?.data?.message || e.message || 'Failed to grade the interview transcript.';
      setError(serverErr);
    } finally {
      setIsEnding(false);
    }
  };

  const handleSelectPastSession = async (session) => {
    if (!session || !session._id) return;
    setError('');
    setActiveSession(session);
    if (session.status === 'active') {
      sessionStorage.setItem('hirenova_active_interview_id', session._id);
    } else {
      sessionStorage.removeItem('hirenova_active_interview_id');
    }
    setLoadingSession(true);
    try {
      const res = await interviewService.getInterviewById(session._id);
      if (res && res.success && res.data) {
        setActiveSession(res.data);
      } else {
        setError('Interview session not found.');
      }
    } catch (e) {
      console.error('Failed to fetch session detail:', e);
      if (!session.messages) {
        setError('Interview session not found.');
      }
    } finally {
      setLoadingSession(false);
    }
  };

  const handleDeleteSession = async (e, id) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    if (!window.confirm('Delete this past interview session?')) return;
    try {
      await interviewService.deleteInterview(id);
      if (activeSession?._id === id) {
        setActiveSession(null);
        sessionStorage.removeItem('hirenova_active_interview_id');
      }
      fetchHistory();
    } catch (err) {
      setError('Failed to delete interview session.');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL past mock interview sessions?')) return;
    try {
      await interviewService.clearAll();
      setActiveSession(null);
      sessionStorage.removeItem('hirenova_active_interview_id');
      fetchHistory();
    } catch (err) {
      setError('Failed to clear interview history.');
    }
  };

  return (
    <div className="min-h-screen bg-[#EFE9FE] flex text-[#1A1A2E] font-sans antialiased h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />

      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Session History */}
        <aside className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-slate-200">
            <button 
              onClick={() => { setActiveSession(null); setError(''); }} 
              className="btn-primary w-full flex items-center justify-center gap-2 text-xs py-2.5"
            >
              <Plus className="w-4 h-4" /> Start New Interview
            </button>
          </div>
          
          <div className="p-4 flex-1">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Past Interviews</h3>
              {history.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Clear all past interviews"
                >
                  <Trash2 className="w-3 h-3" /> Clear All
                </button>
              )}
            </div>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8 text-xs text-slate-400 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Loading history...
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No previous sessions.</div>
            ) : (
              <div className="space-y-2">
                {history.map(item => (
                  <div 
                    key={item._id}
                    onClick={() => handleSelectPastSession(item)}
                    className={`w-full text-left p-3 rounded-xl transition-all border flex flex-col gap-1 relative group cursor-pointer ${
                      activeSession?._id === item._id 
                        ? 'bg-blue-50/70 border-blue-200' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-900 truncate w-2/3">{item.topic}</span>
                      
                      <div className="flex items-center gap-1.5">
                        {item.status === 'completed' ? (
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                            {item.feedback?.score !== null && item.feedback?.score !== undefined ? `${item.feedback.score}%` : 'N/A'}
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-1.5 py-0.5 rounded border border-amber-200">
                            Active
                          </span>
                        )}

                        <button
                          onClick={(e) => handleDeleteSession(e, item._id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded transition-opacity"
                          title="Delete interview session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 flex justify-between w-full mt-1">
                      <span>{item.type}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Workspace Area */}
        <section className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
          
          {error && (
            <div className="p-3 mx-6 mt-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center shrink-0 z-10 flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loadingSession ? (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="flex flex-col items-center gap-3 text-slate-500 text-xs font-medium">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span>Loading interview session...</span>
              </div>
            </div>
          ) : !activeSession ? (
            /* Setup Screen */
            <div className="max-w-md mx-auto my-auto p-6 space-y-6 animate-fade-in w-full bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2 border border-blue-100">
                  <Bot className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold text-slate-900">AI Mock Recruiter</h1>
                <p className="text-xs text-slate-500">Practice real-time technical and behavioral interview questions with Gemini AI feedback.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Interview Type</label>
                  <select 
                    value={type} 
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="input-field py-2 text-xs"
                  >
                    <option value="Technical">Technical Round</option>
                    <option value="Behavioral">Behavioral / HR Round</option>
                    <option value="System Design">System Design Round</option>
                  </select>
                </div>

                {type !== 'Behavioral' ? (
                  <div className="space-y-1.5" ref={dropdownRef}>
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      {type === 'System Design' ? 'System Design Topic' : 'Focus Area / Tech Stack'} <span className="text-rose-500">*</span>
                    </label>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="input-field py-2 text-xs w-full text-left flex justify-between items-center bg-white border border-slate-200 rounded-xl"
                      >
                        <span className={selectedTopic ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                          {selectedTopic || (type === 'System Design' ? 'Select System Design Topic...' : 'Select Focus Area / Tech Stack...')}
                        </span>
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>

                      {dropdownOpen && (
                        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-hidden flex flex-col">
                          <div className="p-2 border-b border-slate-100 bg-slate-50">
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search topic..."
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                              autoFocus
                            />
                          </div>

                          <div className="overflow-y-auto max-h-48 divide-y divide-slate-50">
                            {filteredTopics.length > 0 ? (
                              filteredTopics.map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => {
                                    setSelectedTopic(t);
                                    setDropdownOpen(false);
                                    setSearchQuery('');
                                  }}
                                  className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 transition-colors flex items-center justify-between ${
                                    selectedTopic === t ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700'
                                  }`}
                                >
                                  <span>{t}</span>
                                  {selectedTopic === t && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-xs text-slate-400 text-center">No matching topics found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedTopic === 'Other (Custom Topic)' && (
                      <div className="pt-2">
                        <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Enter Custom Topic *</label>
                        <input
                          type="text"
                          value={customTopic}
                          onChange={(e) => setCustomTopic(e.target.value)}
                          placeholder="e.g. Flutter, Go, Rust, SAP, Salesforce, Unity"
                          className="input-field py-2 text-xs"
                          onKeyDown={(e) => { if (e.key === 'Enter') handleStartInterview(); }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-700">
                    <span className="font-semibold block mb-0.5">Behavioral / HR Round Selected</span>
                    <span>The focus topic is automatically configured to evaluate soft skills, leadership, and HR scenarios.</span>
                  </div>
                )}

                <button 
                  onClick={handleStartInterview}
                  disabled={isStarting}
                  className="btn-primary w-full py-2.5 text-xs font-semibold"
                >
                  {isStarting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Starting Session...
                    </span>
                  ) : 'Start Interview Round'}
                </button>
              </div>
            </div>
          ) : (
            /* Active Interview Chat Room */
            <div className="flex-1 flex flex-col overflow-hidden relative z-10 h-full bg-white">
              
              {/* Header Bar */}
              <div className="px-6 py-3.5 border-b border-slate-200 bg-white flex justify-between items-center shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      Mock Interview: {activeSession.topic || 'General Technical'}
                      {activeSession.status === 'active' && (
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      )}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[11px] text-slate-400">{activeSession.type} Round • AI Corporate Recruiter</p>
                      {activeSession.status === 'active' && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-100">
                          Question {Math.min((activeSession.messages || []).filter(m => m.role === 'assistant').length, activeSession.type === 'Behavioral' ? 8 : activeSession.type === 'System Design' ? 7 : 10)} / {activeSession.type === 'Behavioral' ? 8 : activeSession.type === 'System Design' ? 7 : 10}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {activeSession.status === 'active' && (
                  <button 
                    onClick={handleEndInterview} 
                    disabled={isEnding}
                    className="btn-secondary text-xs py-1.5 px-3 border-slate-200 hover:border-slate-300"
                  >
                    {isEnding ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" /> Analyzing your performance...
                      </span>
                    ) : 'Finish & Grade'}
                  </button>
                )}
              </div>

              {/* Chat Message Transcript */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                {(activeSession?.messages || []).map((msg, idx) => {
                  if (!msg) return null;
                  const isAssistant = msg.role === 'assistant';
                  const messageText = typeof msg.content === 'string' 
                    ? msg.content 
                    : (typeof msg.text === 'string' ? msg.text : String(msg.content || ''));
                  return (
                    <div 
                      key={msg._id || idx} 
                      className={`flex items-start gap-3 ${isAssistant ? 'justify-start' : 'justify-end'} animate-fade-in`}
                    >
                      {isAssistant && (
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div className={`max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed border shadow-sm ${
                        isAssistant
                          ? 'bg-white border-slate-200 text-slate-800 rounded-tl-none'
                          : 'bg-blue-600 text-white border-blue-600 rounded-tr-none'
                      }`}>
                        {isAssistant && (
                          <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider mb-1">AI Recruiter</p>
                        )}
                        <p className="whitespace-pre-wrap">{messageText}</p>
                      </div>

                      {!isAssistant && (
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1 font-semibold text-xs border border-slate-300">
                          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                  );
                })}

                {isSending && (
                  <div className="flex items-center gap-3 justify-start animate-fade-in">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-xs text-slate-600 font-medium italic">Generating next question...</span>
                    </div>
                  </div>
                )}

                {/* Evaluation Results Card (If session completed) */}
                {activeSession.status === 'completed' && activeSession.feedback && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 my-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-slate-900 text-sm">Evaluation Report</h3>
                      </div>
                      <span className="text-sm font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                        {activeSession.feedback.score === 0 ? '0/100 (N/A)' : `${activeSession.feedback.score}/100`}
                      </span>
                    </div>

                    {activeSession.feedback.generalTips && (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed">
                        <p className="font-semibold text-slate-900 mb-1">Recruiter Summary</p>
                        {activeSession.feedback.generalTips}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2">
                        <p className="font-semibold text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Strengths
                        </p>
                        <ul className="space-y-1 text-slate-600">
                          {(activeSession.feedback.strengths || []).map((s, i) => (
                            <li key={i}>• {s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <p className="font-semibold text-amber-700 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" /> Areas for Improvement
                        </p>
                        <ul className="space-y-1 text-slate-600">
                          {(activeSession.feedback.weaknesses || []).map((w, i) => (
                            <li key={i}>• {w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {(activeSession.feedback.topicsToImprove?.length > 0 || activeSession.feedback.recommendedPracticeQuestions?.length > 0) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-100">
                        {activeSession.feedback.topicsToImprove?.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="font-semibold text-blue-700 flex items-center gap-1.5">
                              <Lightbulb className="w-4 h-4 text-blue-600" /> Topics to Focus On
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {activeSession.feedback.topicsToImprove.map((t, idx) => (
                                <span key={idx} className="bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded text-[11px] border border-blue-100">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {activeSession.feedback.recommendedPracticeQuestions?.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="font-semibold text-purple-700 flex items-center gap-1.5">
                              <MessageSquare className="w-4 h-4 text-purple-600" /> Recommended Practice
                            </p>
                            <ul className="space-y-1 text-slate-600">
                              {activeSession.feedback.recommendedPracticeQuestions.map((q, idx) => (
                                <li key={idx}>• {q}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              {activeSession.status === 'active' && (
                <div className="p-4 border-t border-slate-200 bg-white shrink-0">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSendMessage(e);
                    }}
                    className="flex gap-2 max-w-4xl mx-auto"
                  >
                    <input 
                      type="text" 
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your response here... (Press Enter to send)"
                      className="input-field text-xs py-2.5"
                      disabled={isSending}
                      autoFocus
                    />
                    <button 
                      type="submit"
                      disabled={isSending || !inputMessage.trim()}
                      className="btn-primary px-4 py-2 text-xs shrink-0 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Thinking...</span>
                        </>
                      ) : (
                        <>
                          <span>Send</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

        </section>
      </main>
      </div>
    </div>
  );
};

export default InterviewPage;
