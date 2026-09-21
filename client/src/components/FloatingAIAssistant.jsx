import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Sparkles, X, Send, Bot, MessageSquare } from 'lucide-react';

const FloatingAIAssistant = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm your HireNovaAI companion. How can I help you with your placement prep today?`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = { id: Date.now().toString(), sender: 'user', text: inputValue };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await api.post('/ai/chat', {
        message: userMsg.text,
        history: messages.slice(-10)
      });

      const aiMsg = { id: Date.now().toString() + 'ai', sender: 'ai', text: res.data.data.text };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = {
        id: Date.now().toString() + 'err',
        sender: 'ai',
        text: 'Sorry, I encountered an error connecting to AI. Please try again.'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end pointer-events-none">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <div className="relative group pointer-events-auto">
          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-violet-500/30 blur-lg sm:blur-xl scale-110 sm:scale-125 opacity-70 group-hover:opacity-100 transition duration-300" />

          <button
            onClick={() => setIsOpen(true)}
            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center border border-white/20 shadow-lg hover:scale-105 sm:hover:scale-110 transition-all duration-300 cursor-pointer"
            aria-label="Open AI Assistant"
            title="Open AI Assistant"
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Desktop Tooltip (Hidden on mobile touch screens) */}
          <div className="hidden sm:block absolute right-16 top-1/2 -translate-y-1/2 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
            <div className="relative bg-[#111827]/95 backdrop-blur-md text-white px-4 py-2 rounded-xl border border-white/10 shadow-xl whitespace-nowrap">
              <p className="text-sm font-medium">✨ HireNova AI</p>
              <p className="text-xs text-gray-300">Your AI Placement Companion</p>

              {/* Arrow */}
              <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-[#111827] border-r border-b border-white/10"></div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window Box */}
      {isOpen && (
        <div className="pointer-events-auto w-[360px] max-w-[calc(100vw-28px)] h-[480px] sm:h-[520px] max-h-[75vh] sm:max-h-[80vh] flex flex-col bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-purple-100 animate-fade-in">

          {/* Header Bar */}
          <div className="bg-white border-b border-purple-100 p-3.5 sm:p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-purple-50 border border-purple-100 text-[#6C47FF] rounded-xl flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900">HireNova AI Assistant</h3>
                <p className="text-[10px] text-gray-400 font-medium">Placement Preparation Companion</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 bg-purple-50/20">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#6C47FF] text-white rounded-tr-none shadow-xs'
                      : 'bg-white text-slate-800 border border-purple-100 rounded-tl-none shadow-xs'
                  }`}
                >
                  {msg.sender === 'ai' ? (
                    <div className="prose prose-sm max-w-none text-xs text-slate-800">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-purple-100 rounded-2xl rounded-tl-none px-3.5 py-2.5 flex gap-1 items-center shadow-xs">
                  <div className="w-1.5 h-1.5 bg-[#6C47FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-[#6C47FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-[#6C47FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="p-3 bg-white border-t border-purple-100 shrink-0">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about DSA, resumes, or interview prep..."
                disabled={isTyping}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-purple-200 text-xs font-medium outline-none focus:border-[#6C47FF] bg-white"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-2 p-1.5 text-[#6C47FF] disabled:text-gray-300 hover:text-[#5A36EC] transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
};

export default FloatingAIAssistant;
