import React, { useState, useEffect } from 'react';
import focusService from '../services/focusService';
import { Target, CheckCircle2, Sparkles, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

const TodaysFocusCard = () => {
  const [focusData, setFocusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFocus = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await focusService.getTodaysFocus();
      if (res.success) {
        setFocusData(res.data);
      }
    } catch (err) {
      setError('Unable to load Today\'s Focus recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFocus();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-1/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-100 rounded w-3/4"></div>
          <div className="h-4 bg-slate-100 rounded w-2/3"></div>
          <div className="h-4 bg-slate-100 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !focusData) return null;

  return (
    <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-50 rounded-full blur-2xl opacity-60"></div>

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                🎯 Today's Focus
              </h3>
              <p className="text-[11px] text-slate-500">Personalized daily action plan based on your live progress</p>
            </div>
          </div>

          <button
            onClick={fetchFocus}
            className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg transition-colors"
            title="Refresh recommendations"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Items List */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Recommended Action Items:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {focusData.tasks && focusData.tasks.map((task, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{task}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Targeted Suggestion Box */}
        {focusData.aiSuggestion && (
          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs flex items-start gap-3">
            <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-purple-900 text-xs">AI Smart Suggestion</span>
              <p className="text-purple-800 text-xs mt-0.5 leading-relaxed">
                "{focusData.aiSuggestion}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaysFocusCard;
