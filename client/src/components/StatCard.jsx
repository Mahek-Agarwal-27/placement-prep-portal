import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendLabel }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        {Icon && (
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-600">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span className={`font-semibold ${trend.startsWith('+') ? 'text-emerald-600' : 'text-slate-600'}`}>
              {trend}
            </span>
          )}
          <span className="text-slate-500">{subtitle || trendLabel}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
