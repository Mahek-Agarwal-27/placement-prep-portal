import React from 'react';
import { BookOpen, Rocket, MessageSquare, Trash2, Eye, Calendar, Clock } from 'lucide-react';

const AIHistoryCard = ({ item, onView, onDelete }) => {
  const getCategoryBadge = () => {
    switch (item.category) {
      case 'note':
        return {
          label: 'AI Notes',
          icon: BookOpen,
          bgColor: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'roadmap':
        return {
          label: 'AI Roadmap',
          icon: Rocket,
          bgColor: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'chat':
        return {
          label: 'AI Chat',
          icon: MessageSquare,
          bgColor: 'bg-slate-100 text-slate-700 border-slate-200',
        };
      default:
        return {
          label: 'AI Record',
          icon: BookOpen,
          bgColor: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  const badge = getCategoryBadge();
  const Icon = badge.icon;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
      <div>
        <div className="flex justify-between items-start gap-2 mb-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bgColor}`}>
            <Icon className="w-3.5 h-3.5" />
            {badge.label}
          </span>

          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>

        {item.duration && (
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" /> Duration: <strong className="text-slate-800">{item.duration}</strong>
          </p>
        )}

        {item.content && (
          <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono">
            {item.content}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
        {onView && (
          <button
            onClick={() => onView(item)}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" /> View
          </button>
        )}
        <button
          onClick={() => onDelete(item._id)}
          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AIHistoryCard;
