import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import focusService from '../services/focusService';
import {
  Target,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  FileText,
  MessageSquare,
  Map,
  AlertCircle,
} from 'lucide-react';

// Onboarding fallback when user has no data yet
const ONBOARDING_TASKS = [
  'Log your first solved DSA problem in the DSA Tracker',
  'Upload and analyze your resume with Gemini AI',
  'Take your first AI Mock Interview session',
];
const ONBOARDING_SUGGESTION =
  'Welcome to HireNovaAI! Start by solving a DSA problem, then scan your resume to get personalized insights.';

const TodaysFocusCard = ({ refetchKey }) => {
  const [focusData, setFocusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchFocus = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const res = await focusService.getTodaysFocus();
      if (res.success) {
        setFocusData(res.data);
      } else {
        setError('Could not load recommendations.');
      }
    } catch (err) {
      setError('Could not load recommendations.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Re-fetch whenever refetchKey changes (navigation back to dashboard)
  useEffect(() => {
    fetchFocus();
  }, [refetchKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Skeleton loader ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-pulse space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-lg bg-slate-200" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="h-14 bg-slate-100 rounded-lg" />
          <div className="h-14 bg-slate-100 rounded-lg" />
          <div className="h-14 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-12 bg-purple-50 rounded-xl" />
      </div>
    );
  }

  // Use onboarding tasks if error or empty
  const tasks = focusData?.tasks?.length ? focusData.tasks : ONBOARDING_TASKS;
  const aiSuggestion = focusData?.aiSuggestion || ONBOARDING_SUGGESTION;
  const isOnboarding = !focusData || error;

  return (
    <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-blue-50 rounded-full blur-2xl opacity-60 pointer-events-none" />

      <div className="relative space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">🎯 Today's Focus</h3>
              <p className="text-[11px] text-slate-400">
                {isOnboarding
                  ? 'Complete these steps to get started'
                  : 'Personalized daily plan based on your live progress'}
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchFocus(true)}
            disabled={refreshing}
            className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh recommendations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Error notice (non-blocking) */}
        {error && (
          <div className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Showing onboarding tips — refresh to retry.</span>
          </div>
        )}

        {/* Action Items */}
        <div className="space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Recommended Action Items
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {tasks.map((task, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{task}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Smart Suggestion */}
        <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs flex items-start gap-3">
          <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-purple-900 text-xs">AI Smart Suggestion</span>
            <p className="text-purple-800 text-xs mt-0.5 leading-relaxed">"{aiSuggestion}"</p>
          </div>
        </div>

        {/* Quick jump links when onboarding */}
        {isOnboarding && (
          <div className="flex flex-wrap gap-2 pt-1">
            <Link to="/dsa" className="text-[11px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
              Open DSA Tracker →
            </Link>
            <Link to="/resume" className="text-[11px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
              <FileText className="w-3 h-3" /> Analyze Resume →
            </Link>
            <Link to="/interview" className="text-[11px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Mock Interview →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaysFocusCard;
