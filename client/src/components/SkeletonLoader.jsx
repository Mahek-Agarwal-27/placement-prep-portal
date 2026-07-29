import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
      <div className="h-4 bg-slate-100 rounded w-1/6"></div>
    </div>
    <div className="h-7 bg-slate-200 rounded w-1/2"></div>
    <div className="h-3 bg-slate-100 rounded w-2/3"></div>
  </div>
);

export const HistorySkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-3 bg-slate-100 rounded w-1/5"></div>
        </div>
        <div className="h-5 bg-slate-200 rounded w-3/4"></div>
        <div className="h-12 bg-slate-100 rounded w-full"></div>
      </div>
    ))}
  </div>
);

export const ProfileSkeleton = () => (
  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 animate-pulse">
    <div className="flex items-center gap-5 border-b border-slate-100 pb-6">
      <div className="w-16 h-16 rounded-full bg-slate-200 shrink-0"></div>
      <div className="space-y-2 flex-1">
        <div className="h-5 bg-slate-200 rounded w-1/3"></div>
        <div className="h-3 bg-slate-100 rounded w-1/4"></div>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-4">
      <div className="h-16 bg-slate-100 rounded-lg"></div>
      <div className="h-16 bg-slate-100 rounded-lg"></div>
      <div className="h-16 bg-slate-100 rounded-lg"></div>
    </div>
  </div>
);
