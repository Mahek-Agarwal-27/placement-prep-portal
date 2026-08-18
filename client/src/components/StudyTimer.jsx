import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Clock, Sparkles, Code2, FileText, MessageSquare, BookOpen } from 'lucide-react';
import activityTrackerService from '../services/activityTrackerService';

const ACTIVITY_OPTIONS = [
  { id: 'dsa', label: 'DSA Practice', icon: Code2, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'resume', label: 'Resume Analysis', icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'interview', label: 'Mock Interview', icon: MessageSquare, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { id: 'notes', label: 'AI Notes / Roadmap', icon: Sparkles, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'general', label: 'General Study', icon: BookOpen, color: 'text-slate-600 bg-slate-50 border-slate-200' },
];

const formatTime = (totalSeconds) => {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const StudyTimer = ({ onSessionChange }) => {
  const [selectedType, setSelectedType] = useState('dsa');
  const [activeSession, setActiveSession] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  // Check for existing active session on mount (Session Recovery on Refresh)
  useEffect(() => {
    let isMounted = true;
    const fetchActive = async () => {
      try {
        const res = await activityTrackerService.getActiveActivity();
        if (isMounted && res.success && res.data?.activeSession) {
          const session = res.data.activeSession;
          setActiveSession(session);
          setSelectedType(session.activityType || 'dsa');
          setElapsedSeconds(res.data.elapsedSeconds || 0);
        }
      } catch (err) {
        console.error('Error recovering active session:', err);
      }
    };
    fetchActive();
    return () => { isMounted = false; };
  }, []);

  // Timer Ticking interval with Tab Visibility (Idle Detection)
  useEffect(() => {
    if (activeSession) {
      timerRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          setElapsedSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession]);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await activityTrackerService.startActivity(selectedType);
      if (res.success && res.data?.session) {
        setActiveSession(res.data.session);
        setElapsedSeconds(res.data.elapsedSeconds || 0);
        if (onSessionChange) onSessionChange();
      }
    } catch (err) {
      console.error('Error starting session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!activeSession) return;
    setLoading(true);
    try {
      const res = await activityTrackerService.stopActivity(activeSession._id || activeSession.id);
      if (res.success) {
        setActiveSession(null);
        setElapsedSeconds(0);
        if (onSessionChange) onSessionChange();
      }
    } catch (err) {
      console.error('Error stopping session:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeOption = ACTIVITY_OPTIONS.find((a) => a.id === (activeSession?.activityType || selectedType)) || ACTIVITY_OPTIONS[0];
  const IconComp = activeOption.icon || Clock;

  return (
    <div className={`rounded-2xl p-4 border transition-all duration-300 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 ${
      activeSession
        ? 'bg-gradient-to-r from-blue-900 to-indigo-900 border-blue-700 text-white shadow-md shadow-blue-900/20'
        : 'bg-white border-slate-200/80 text-slate-900'
    }`}>
      {/* Left: Info & Type selector */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
          activeSession ? 'bg-white/10 text-white' : activeOption.color
        }`}>
          <IconComp className="w-5 h-5" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              activeSession ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse' : 'bg-slate-100 text-slate-500'
            }`}>
              {activeSession ? '● Tracking Live' : 'Preparation Timer'}
            </span>
          </div>

          {activeSession ? (
            <p className="font-bold text-sm text-white mt-0.5">
              {activeOption.label} Session Active
            </p>
          ) : (
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="mt-0.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {ACTIVITY_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Right: Clock & Action Button */}
      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-200/20 pt-3 sm:pt-0">
        <div className="text-right">
          <span className={`text-2xl font-black font-mono tracking-tight ${
            activeSession ? 'text-emerald-400' : 'text-slate-800'
          }`}>
            {formatTime(elapsedSeconds)}
          </span>
          <span className={`block text-[10px] font-semibold ${
            activeSession ? 'text-blue-200' : 'text-slate-400'
          }`}>
            {activeSession ? 'Actual Preparation Time' : 'Ready to start'}
          </span>
        </div>

        {activeSession ? (
          <button
            onClick={handleStop}
            disabled={loading}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
          >
            <Square className="w-4 h-4 fill-white" />
            Stop & Save
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all shrink-0 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            Start Session
          </button>
        )}
      </div>
    </div>
  );
};

export default StudyTimer;
