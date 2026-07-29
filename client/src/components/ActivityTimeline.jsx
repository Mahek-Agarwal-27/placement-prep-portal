import React from 'react';
import { CheckCircle2, FileText, Sparkles, Bot, MessageSquare, Clock } from 'lucide-react';

const getActivityIcon = (type) => {
  switch (type) {
    case 'dsa':
      return { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    case 'resume':
      return { icon: FileText, color: 'text-purple-600 bg-purple-50 border-purple-200' };
    case 'roadmap':
      return { icon: Sparkles, color: 'text-blue-600 bg-blue-50 border-blue-200' };
    case 'assistant':
      return { icon: Bot, color: 'text-blue-600 bg-blue-50 border-blue-200' };
    case 'interview':
      return { icon: MessageSquare, color: 'text-rose-600 bg-rose-50 border-rose-200' };
    default:
      return { icon: CheckCircle2, color: 'text-slate-600 bg-slate-50 border-slate-200' };
  }
};

const ActivityTimeline = ({ activities = [], loading = false }) => {
  if (loading) {
    return <div className="p-6 text-center text-xs text-slate-400">Loading timeline...</div>;
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-2 shadow-sm">
        <Clock className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-xs font-semibold text-slate-700">No activity logged yet</p>
        <p className="text-[11px] text-slate-400">Activity will appear here as you solve problems and use AI features.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
        <Clock className="w-4 h-4 text-blue-600" /> Recent Placement Activity
      </h3>

      <div className="relative border-l-2 border-slate-100 ml-4 space-y-6 pt-2">
        {activities.map((item) => {
          const config = getActivityIcon(item.type);
          const Icon = config.icon;
          return (
            <div key={item._id || item.id} className="relative pl-6">
              <div className={`absolute -left-[17px] top-0.5 w-8 h-8 rounded-full border flex items-center justify-center ${config.color}`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="space-y-0.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-900">{item.title}</span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.createdAt || item.timestamp).toLocaleDateString()}
                  </span>
                </div>
                {item.description && (
                  <p className="text-xs text-slate-500">{item.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityTimeline;
