import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import interviewService from '../services/interviewService';

const InterviewPage = () => {
  const { user, logout } = useAuth();
  
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Setup State
  const [type, setType] = useState('Technical');
  const [topic, setTopic] = useState('');
  
  // Active Interview State
  const [activeSession, setActiveSession] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [error, setError] = useState('');
  
  const chatEndRef = useRef(null);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await interviewService.getInterviews();
      if (res.success) {
        setHistory(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isSending]);

  const handleStart = async () => {
    if (!topic.trim()) {
      setError('Please provide an interview topic (e.g. React, Java, DSA, HR).');
      return;
    }
    
    setIsStarting(true);
    setError('');
    
    try {
      const res = await interviewService.startInterview({ type, topic });
      if (res.success) {
        setActiveSession(res.data);
        fetchHistory();
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to initialize interview. Ensure Gemini API key is configured.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeSession) return;
    
    const textToSend = inputMessage;
    setInputMessage('');
    setIsSending(true);
    setError('');
    
    // Optimistic UI updates
    const updatedMessages = [...activeSession.messages, { role: 'user', content: textToSend }];
    setActiveSession({ ...activeSession, messages: updatedMessages });
    
    try {
      const res = await interviewService.submitResponse(activeSession._id, textToSend);
      if (res.success) {
        setActiveSession(res.data);
      }
    } catch (e) {
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleEndInterview = async () => {
    if (!activeSession) return;
    if (!window.confirm('Finish the interview and request AI grading evaluation?')) return;
    
    setIsEnding(true);
    setError('');
    
    try {
      const res = await interviewService.endAndEvaluate(activeSession._id);
      if (res.success) {
        setActiveSession(res.data);
        fetchHistory();
      }
    } catch (e) {
      setError('Failed to grade the interview transcript. Ensure your Gemini API Key is valid.');
    } finally {
      setIsEnding(false);
    }
  };

  const handleSelectPastSession = async (session) => {
    setError('');
    try {
      const res = await interviewService.getInterviewById(session._id);
      if (res.success) {
        setActiveSession(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

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
          <Link to="/notes" className="text-slate-400 hover:text-white transition-colors">AI Notes</Link>
          <Link to="/resume-analyzer" className="text-slate-400 hover:text-white transition-colors">Resume Analyzer</Link>
          <Link to="/mock-interview" className="text-rose-400 border-b-2 border-rose-500 pb-1">Mock Interview</Link>
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-slate-300 text-sm hidden md:inline">Hi, <strong className="text-white">{user?.name}</strong></span>
          <button onClick={logout} className="btn-secondary px-4 py-2 text-xs">Sign Out</button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar History */}
        <aside className="w-72 border-r border-slate-800 bg-slate-900/40 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-slate-800">
            <button 
              onClick={() => setActiveSession(null)} 
              className="btn-primary w-full justify-center flex items-center gap-2 bg-rose-600 hover:bg-rose-500 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Interview
            </button>
          </div>
          
          <div className="p-4 flex-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-1">Interview Sessions</h3>
            {loadingHistory ? (
              <div className="text-center py-4 text-sm text-slate-500">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="text-center py-4 text-sm text-slate-500">No previous sessions.</div>
            ) : (
              <ul className="space-y-2">
                {history.map(item => (
                  <li key={item._id}>
                    <button 
                      onClick={() => handleSelectPastSession(item)}
                      className={`w-full text-left p-3 rounded-xl transition-all border flex flex-col gap-1.5 ${
                        activeSession?._id === item._id 
                          ? 'bg-rose-500/10 border-rose-500/50' 
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-semibold text-white truncate w-3/4">{item.topic}</span>
                        {item.status === 'completed' ? (
                          <span className="text-xs font-bold text-rose-400">{item.feedback?.score}%</span>
                        ) : (
                          <span className="text-[10px] bg-amber-950 text-amber-400 font-bold px-1.5 py-0.2 rounded border border-amber-900">Active</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 flex justify-between w-full">
                        <span>{item.type}</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Workspace */}
        <section className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500 rounded-full blur-[150px] opacity-5 pointer-events-none"></div>

          {error && (
            <div className="p-4 mx-6 mt-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-sm text-center shrink-0 z-10">
              {error}
            </div>
          )}

          {!activeSession ? (
            // Setup / Intro Screen
            <div className="max-w-xl mx-auto my-auto p-6 space-y-8 animate-fade-in relative z-10 w-full">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-3">
                  <span className="text-4xl">🎙️</span> AI Mock Recruiter
                </h1>
                <p className="text-slate-450 text-sm">Practice technical, behavioral, or system design interviews. Get questions generated dynamically by Gemini AI and receive grading metrics.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider">Interview Type</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="input-field py-3"
                  >
                    <option value="Technical">Technical Round</option>
                    <option value="Behavioral">Behavioral / HR Round</option>
                    <option value="System Design">System Design Round</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider">Focus Topic / Tech Stack</label>
                  <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. React & Node, Java Algorithms, General HR, System Architecture"
                    className="input-field py-3"
                  />
                </div>

                <button 
                  onClick={handleStart}
                  disabled={isStarting}
                  className="btn-primary w-full justify-center py-4 bg-rose-600 hover:bg-rose-500 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)] font-bold text-base disabled:opacity-50"
                >
                  {isStarting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Starting Interview...
                    </span>
                  ) : 'Start Interview'}
                </button>
              </div>
            </div>
          ) : activeSession.status === 'active' ? (
            // Active Interview Room Chat
            <div className="flex-1 flex flex-col overflow-hidden relative z-10 h-full">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/40 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="font-bold text-white flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Mock Interview: {activeSession.topic}
                  </h2>
                  <p className="text-xs text-slate-450 font-semibold">{activeSession.type} Round • Interviewer: Recruiter Bot</p>
                </div>
                <button 
                  onClick={handleEndInterview} 
                  disabled={isEnding}
                  className="btn-secondary text-rose-450 hover:bg-rose-950/20 border-rose-500/30 px-4 py-2 text-xs flex items-center gap-2 font-bold"
                >
                  {isEnding ? 'Grading...' : 'Finish & Grade'}
                </button>
              </div>

              {/* Chat Log */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeSession.messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'} animate-fade-in`}
                  >
                    <div className={`max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed border shadow-md ${
                      msg.role === 'assistant'
                        ? 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none'
                        : 'bg-rose-600/10 border-rose-500/30 text-rose-100 rounded-tr-none'
                    }`}>
                      {msg.role === 'assistant' && (
                        <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider mb-1">AI Recruiter</p>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                
                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-4 max-w-[75%] flex items-center gap-2">
                      <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">AI Recruiter is typing</span>
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce delay-200"></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/20 shrink-0 flex gap-3 items-end">
                <textarea 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="input-field min-h-[50px] max-h-[120px] resize-none py-3 px-4 flex-1 text-sm bg-slate-950 border-slate-800"
                  placeholder="Type your response here... (Press Enter to Send)"
                  disabled={isSending}
                ></textarea>
                <button 
                  onClick={handleSendMessage}
                  disabled={isSending || !inputMessage.trim()}
                  className="btn-primary p-3 bg-rose-600 hover:bg-rose-500 border-rose-500 shrink-0 shadow-[0_0_10px_rgba(244,63,94,0.3)] disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            // Completed Interview / Results View
            <div className="flex-1 overflow-y-auto p-6 md:p-10 relative z-10">
              <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-800 pb-6">
                  <div>
                    <h2 className="text-3xl font-extrabold text-white">Interview Feedback Report</h2>
                    <p className="text-slate-450 text-sm mt-1">Topic: <span className="font-semibold text-white">{activeSession.topic}</span> • Round: {activeSession.type}</p>
                    <span className="inline-block mt-3 text-[10px] bg-rose-950 text-rose-450 font-bold px-2 py-0.5 rounded border border-rose-800">
                      Evaluation Complete
                    </span>
                  </div>
                  
                  {/* Score Ring */}
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-rose-900 border-t-rose-500 bg-rose-950/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                      <span className="text-3xl font-extrabold">{activeSession.feedback?.score}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-2 font-bold">Overall Rating</span>
                  </div>
                </div>

                {/* Recruiter Summary */}
                {activeSession.feedback?.generalTips && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="text-rose-400">💡</span> Recruiter Summary
                    </h3>
                    <p className="text-slate-350 text-sm leading-relaxed whitespace-pre-line">
                      {activeSession.feedback.generalTips}
                    </p>
                  </div>
                )}

                {/* Strengths & Weaknesses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="text-emerald-400">🔥</span> Key Strengths
                    </h3>
                    <ul className="space-y-3">
                      {activeSession.feedback?.strengths?.map((item, idx) => (
                        <li key={idx} className="text-sm text-slate-350 flex items-start gap-2.5">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                      {(!activeSession.feedback?.strengths || activeSession.feedback.strengths.length === 0) && (
                        <li className="text-sm text-slate-500">No strengths documented.</li>
                      )}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="text-rose-450">⚠️</span> Areas to Improve
                    </h3>
                    <ul className="space-y-3">
                      {activeSession.feedback?.weaknesses?.map((item, idx) => (
                        <li key={idx} className="text-sm text-slate-350 flex items-start gap-2.5">
                          <span className="text-rose-500 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                      {(!activeSession.feedback?.weaknesses || activeSession.feedback.weaknesses.length === 0) && (
                        <li className="text-sm text-slate-500">No weaknesses documented.</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Transcript Review Accordion */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Full Transcript Review</h3>
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 border-t border-slate-800 pt-4">
                    {activeSession.messages.map((msg, idx) => (
                      <div key={idx} className="text-sm">
                        <span className={`font-bold ${msg.role === 'assistant' ? 'text-rose-400' : 'text-slate-400'}`}>
                          {msg.role === 'assistant' ? 'Interviewer' : 'You'}:
                        </span>
                        <p className="text-slate-350 mt-1 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default InterviewPage;
