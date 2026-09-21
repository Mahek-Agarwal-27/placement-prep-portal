import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import UnifiedBackground from '../components/UnifiedBackground';
import { Code2, FileText, Mic, Sparkles, Calendar, BarChart2, ArrowRight, ArrowLeft } from 'lucide-react';

const FeaturesPage = () => {
  const featuresList = [
    {
      title: 'AI Placement Coach',
      desc: 'Get tailored daily study plans, weakness detection, and proactive guidance to maximize interview readiness.',
      icon: Sparkles,
    },
    {
      title: 'DSA Practice Tracker',
      desc: 'Track solved problems across LeetCode, Codeforces & GFG. Categorize by topic and monitor completion percentages.',
      icon: Code2,
    },
    {
      title: 'AI Notes & Roadmaps',
      desc: 'Generate, summarize, and organize revision notes with automated AI bullet points and action items.',
      icon: FileText,
    },
    {
      title: 'Study Planner & Timer',
      desc: 'Maintain daily study streaks, log focus sessions with a built-in stopwatch, and manage placement tasks.',
      icon: Calendar,
    },
    {
      title: 'ATS Resume Analyzer',
      desc: 'Scan your PDF resume against target job roles to get instant Gemini AI evaluation and ATS match scores.',
      icon: FileText,
    },
    {
      title: 'AI Mock Interviews',
      desc: 'Practice technical & HR interview questions with real-time AI grading, feedback, and confidence scoring.',
      icon: Mic,
    },
    {
      title: 'Progress & Analytics',
      desc: 'Visualize weekly study hours, DSA distribution charts, and overall placement readiness metrics.',
      icon: BarChart2,
    },
  ];

  return (
    <div className="relative min-h-screen text-[#1A1A2E] flex flex-col font-sans overflow-hidden">
      {/* Premium Landing Page Background */}
      <UnifiedBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header Navbar */}
        <header className="max-w-7xl mx-auto w-full px-6 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 rounded-2xl bg-white/80 backdrop-blur-md border border-purple-200 text-[#6C47FF] hover:bg-white transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link to="/" className="hover:opacity-90 transition-opacity">
              <Logo showText={true} textClassName="text-2xl font-black" />
            </Link>
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
        <main className="max-w-7xl mx-auto w-full px-6 -mt-10 pb-10 flex-1 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#6C47FF] bg-purple-100/80 px-3.5 py-1 rounded-full border border-purple-200">
              Powerful Modules
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1A1A2E]">
              Comprehensive Tools Built for Placement Success
            </h1>
            <p className="text-base text-gray-600 font-medium">
              Everything you need to streamline DSA practice, resume optimization, and interview preparation in one unified workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresList.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/40 dark:border-white/10 shadow-md space-y-3 hover:-translate-y-1 transition-transform">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100/80 text-[#6C47FF] flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-[#1A1A2E]">{item.title}</h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl p-8 rounded-3xl border border-white/40 dark:border-white/10 text-center max-w-2xl mx-auto space-y-4 shadow-md">
            <h2 className="text-2xl font-black text-[#1A1A2E]">Ready to start practicing?</h2>
            <p className="text-xs text-gray-600 font-medium">Create your free account today and unlock your personalized placement roadmap.</p>
            <Link to="/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#6C47FF] text-white font-bold text-xs hover:bg-[#5A36EC] shadow-md">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FeaturesPage;
