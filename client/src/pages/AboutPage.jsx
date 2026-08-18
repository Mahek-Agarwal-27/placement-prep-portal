import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import UnifiedBackground from '../components/UnifiedBackground';
import { CheckCircle2, ArrowRight, ArrowLeft, Target, Cpu, Trophy } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="relative min-h-screen text-[#1A1A2E] flex flex-col font-sans overflow-hidden">
      {/* Premium Landing Page Background */}
      <UnifiedBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header Navbar */}
        <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 rounded-2xl bg-white/80 backdrop-blur-md border border-purple-200 text-[#6C47FF] hover:bg-white transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Logo showText={true} textClassName="text-2xl font-black" />
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="px-5 py-2 rounded-2xl bg-white/80 backdrop-blur-md border border-purple-200 text-[#1A1A2E] font-semibold text-xs hover:bg-white">
              Log in
            </Link>
            <Link to="/signup" className="px-5 py-2 rounded-2xl bg-[#6C47FF] text-white font-semibold text-xs hover:bg-[#5A36EC]">
              Sign up
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto w-full px-6 py-10 space-y-12 flex-1">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#6C47FF] bg-purple-100/80 px-3.5 py-1 rounded-full border border-purple-200">
              Our Mission
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1A1A2E]">
              Empowering Job Seekers with AI-Driven Clarity
            </h1>
            <p className="text-base text-gray-600 font-medium">
              HireNovaAI unifies scattered placement preparation resources into a smart, automated assistant.
            </p>
          </div>

          {/* Problem & Solution Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/40 dark:border-white/10 shadow-md space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100/80 text-[#6C47FF] flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#1A1A2E]">What is HireNovaAI?</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                HireNovaAI is an all-in-one placement preparation portal that tracks DSA problem solving, analyzes ATS resumes, simulates AI mock interviews, and guides daily study schedules.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/40 dark:border-white/10 shadow-md space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100/80 text-[#6C47FF] flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#1A1A2E]">The Problem We Solve</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Students waste hours switching between spreadsheets, resume checkers, and random study sheets. HireNovaAI brings structure, consistency, and automated progress insights.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/40 dark:border-white/10 shadow-md space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100/80 text-[#6C47FF] flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#1A1A2E]">How AI Helps You</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Using Gemini AI algorithms, HireNovaAI provides personalized topic recommendations, instant resume keyword scoring, and constructive interview feedback.
              </p>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl p-8 rounded-3xl border border-white/40 dark:border-white/10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-[#1A1A2E]">Built for Engineers & Candidates</h3>
              <div className="space-y-1 text-xs font-semibold text-gray-700">
                <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#6C47FF]" /> Structured topic-wise DSA roadmaps</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#6C47FF]" /> ATS Resume scoring & project suggestions</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#6C47FF]" /> Real-time study streak analytics</p>
              </div>
            </div>
            <Link to="/signup" className="px-6 py-3 rounded-2xl bg-[#6C47FF] text-white font-bold text-xs hover:bg-[#5A36EC] shadow-md shrink-0">
              Join HireNovaAI Today
            </Link>
          </div>

        </main>
      </div>
    </div>
  );
};

export default AboutPage;
