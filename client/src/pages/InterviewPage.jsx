import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import interviewService from '../services/interviewService';
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
  Trash2
} from 'lucide-react';

const InterviewPage = () => {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Setup State
  const [type, setType] = useState('Technical');
  const [topic, setTopic] = useState('');
  
  // Active Session State
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
      setError(e.response?.data?.message || 'Failed to initialize interview session.');
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
    if (!window.confirm('Finish the interview and request AI evaluation?')) return;
    
    setIsEnding(true);
    setError('');
    
    try {
      const res = await interviewService.endAndEvaluate(activeSession._id);
      if (res.success) {
        setActiveSession(res.data);
        fetchHistory();
      }
    } catch (e) {
      setError('Failed to grade the interview transcript.');
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

  const handleDeleteSession = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this past interview session?')) return;
    try {
      await interviewService.deleteInterview(id);
      if (activeSession?._id === id) {
        setActiveSession(null);
      }
      fetchHistory();
    } catch (err) {
      setError('Failed to delete interview session.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col h-screen overflow-hidden">
      <Navbar />

      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Session History */}
        <aside className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-slate-200">
            <button 
              onClick={() => setActiveSession(null)} 
              className="btn-primary w-full flex items-center justify-center gap-2 text-xs py-2.5"
            >
              <Plus className="w-4 h-4" /> Start New Interview
            </button>
          </div>
          
          <div className="p-4 flex-1">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">Past Interviews</h3>
            {loadingHistory ? (
              <div className="text-center py-6 text-xs text-slate-400">Loading history...</div>
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
                            {item.feedback?.score}%
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
            <div className="p-3 mx-6 mt-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center shrink-0 z-10">
              {error}
            </div>
          )}

          {!activeSession ? (
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
                    onChange={(e) => setType(e.target.value)}
                    className="input-field py-2 text-xs"
                  >
                    <option value="Technical">Technical Round</option>
                    <option value="Behavioral">Behavioral / HR Round</option>
                    <option value="System Design">System Design Round</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Focus Topic / Tech Stack</label>
                  <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. React & Node.js, Java DSA, System Design, HR"
                    className="input-field py-2 text-xs"
                  />
                </div>

                <button 
                  onClick={handleStart}
                  disabled={isStarting}
                  className="btn-primary w-full py-2.5 text-xs font-semibold"
                >
                  {isStarting ? (
                    <span className="flex items-center gap-2">
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
                      Mock Interview: {activeSession.topic}
                      {activeSession.status === 'active' && (
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      )}
                    </h2>
                    <p className="text-[11px] text-slate-400">{activeSession.type} Round • AI Corporate Recruiter</p>
                  </div>
                </div>

                {activeSession.status === 'active' && (
                  <button 
                    onClick={handleEndInterview} 
                    disabled={isEnding}
                    className="btn-secondary text-xs py-1.5 px-3 border-slate-200 hover:border-slate-300"
                  >
                    {isEnding ? 'Evaluating...' : 'Finish & Grade'}
                  </button>
                )}
              </div>

              {/* Chat Message Transcript */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                {activeSession.messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-start gap-3 ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'} animate-fade-in`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed border shadow-sm ${
                      msg.role === 'assistant'
                        ? 'bg-white border-slate-200 text-slate-800 rounded-tl-none'
                        : 'bg-blue-600 text-white border-blue-600 rounded-tr-none'
                    }`}>
                      {msg.role === 'assistant' && (
                        <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider mb-1">AI Recruiter</p>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1 font-semibold text-xs border border-slate-300">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                ))}

                {isSending && (
                  <div className="flex items-center gap-3 justify-start animate-fade-in">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
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
                        {activeSession.feedback.score}/100
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
                          {activeSession.feedback.strengths?.map((s, i) => (
                            <li key={i}>• {s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <p className="font-semibold text-amber-700 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" /> Areas for Improvement
                        </p>
                        <ul className="space-y-1 text-slate-600">
                          {activeSession.feedback.weaknesses?.map((w, i) => (
                            <li key={i}>• {w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              {activeSession.status === 'active' && (
                <div className="p-4 border-t border-slate-200 bg-white shrink-0">
                  <div className="flex gap-2 max-w-4xl mx-auto">
                    <input 
                      type="text" 
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your response here..."
                      className="input-field text-xs py-2.5"
                      disabled={isSending}
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={isSending || !inputMessage.trim()}
                      className="btn-primary px-4 py-2 text-xs shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </section>
      </main>
    </div>
  );
};

export default InterviewPage;
