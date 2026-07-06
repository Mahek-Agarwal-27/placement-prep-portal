/**
 * pages/DashboardPage.jsx — Dashboard Landing
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navbar Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-wider gradient-text">
            PlacementPro
          </span>
          <span className="text-xs bg-indigo-950 text-indigo-300 font-semibold px-2 py-0.5 rounded border border-indigo-800">
            Beta
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-300 text-sm hidden md:inline">
            Hello, <strong className="text-white">{user?.name}</strong>
          </span>
          <button onClick={logout} className="btn-secondary px-4 py-2 text-xs">
            Sign Out
          </button>
        </div>
      </header>

      {/* Hero Welcome Banner */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8 space-y-8 animate-fade-in">
        <section className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Ready for your next step, {user?.name}?
            </h2>
            <p className="text-slate-400 max-w-xl text-sm md:text-base">
              Welcome to the placement portal. Start tracking your DSA questions, prepare structured calendar study tasks, analyze resumes, and generate AI-driven roadmap lists.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="card text-center py-4 px-6 border-slate-800 bg-slate-900/80">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">
                Streak
              </p>
              <p className="text-3xl font-extrabold text-amber-500">
                🔥 {user?.streak?.currentStreak || 0} days
              </p>
            </div>
          </div>
        </section>

        {/* Temporary Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              DSA Solved
            </h3>
            <p className="text-4xl font-extrabold text-white">
              {user?.stats?.totalDSASolved || 0} <span className="text-lg text-slate-500 font-normal">problems</span>
            </p>
          </div>
          <div className="card">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              Tasks Completed
            </h3>
            <p className="text-4xl font-extrabold text-white">
              {user?.stats?.totalTasksDone || 0} <span className="text-lg text-slate-500 font-normal">done</span>
            </p>
          </div>
          <div className="card">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              Study Time
            </h3>
            <p className="text-4xl font-extrabold text-white">
              {user?.stats?.totalStudyHours || 0} <span className="text-lg text-slate-500 font-normal">hours</span>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
