import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';
import AuthModal from '../components/AuthModal';
import { Code2, FileText, Mic, Sparkles, Calendar, BarChart2, ArrowRight, CheckCircle2, Target, Cpu, Trophy, Mail, Send, Phone, Menu, X } from 'lucide-react';

const LandingPage = ({ defaultAuthOpen = false, defaultAuthMode = 'login', resetToken = '', scrollToTarget = null }) => {
  const navigate = useNavigate();
  const [orbitAngle, setOrbitAngle] = useState(0);

  const [authModalOpen, setAuthModalOpen] = useState(defaultAuthOpen);
  const [authModalMode, setAuthModalMode] = useState(defaultAuthMode);

  // Active section & mobile navigation state
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock observer during programmatic click navigation
  const isNavClickRef = useRef(false);
  const navClickTimeoutRef = useRef(null);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: '', email: '', message: '' });
      setContactSubmitted(false);
    }, 4000);
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    // 1. Immediately change active section underline at click time
    setActiveSection(id);

    // 2. Lock IntersectionObserver updates while smooth scrolling
    isNavClickRef.current = true;
    if (navClickTimeoutRef.current) {
      clearTimeout(navClickTimeoutRef.current);
    }
    navClickTimeoutRef.current = setTimeout(() => {
      isNavClickRef.current = false;
    }, 800);

    // 3. Initiate smooth scroll with exact sticky navbar alignment after drawer unmount
    setTimeout(() => {
      if (id === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const element = document.getElementById(id);
        if (element) {
          const header = document.querySelector('header');
          const headerHeight = header ? header.offsetHeight : 64;
          const elementRect = element.getBoundingClientRect();
          const absoluteElementTop = elementRect.top + window.pageYOffset;
          // Exact flush alignment with bottom of navbar
          const targetPosition = Math.max(0, Math.round(absoluteElementTop - headerHeight + 1));

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    }, 60);
  };

  useEffect(() => {
    const sectionIds = ['home', 'features', 'about', 'contact'];
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -55% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      // Skip observer state changes during programmatic navbar click smooth scrolling
      if (isNavClickRef.current) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (scrollToTarget) {
      setTimeout(() => {
        scrollToSection(scrollToTarget);
      }, 150);
    }
  }, [scrollToTarget]);

  useEffect(() => {
    if (defaultAuthOpen) {
      setAuthModalOpen(true);
      setAuthModalMode(defaultAuthMode);
    }
  }, [defaultAuthOpen, defaultAuthMode]);

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

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

  useEffect(() => {
    let frame;
    let last = performance.now();

    const speed = 360 / 34;

    const animate = (now) => {
      const delta = (now - last) / 1000;
      last = now;

      setOrbitAngle((prev) => (prev + delta * speed) % 360);

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="min-h-screen bg-[#0F0C20] text-[#1E184D] flex flex-col font-sans selection:bg-[#6C47FF] selection:text-white relative overflow-x-clip"
    >
      {/* ---------- STICKY UNIFIED NAVBAR ACROSS ALL SECTIONS ---------- */}
      <header className="sticky top-0 z-50 w-full bg-white/100 backdrop-blur-xl border-b border-purple-100/80 shadow-xs transition-all duration-300">
        <div className="max-w-[2000px] mx-auto px-4 sm:px-8 lg:px-12 py-3 sm:py-4 flex items-center justify-between">
          <div onClick={() => scrollToSection('home')} className="cursor-pointer">
            <Logo
              showText={true}
              subtitle="AI Powered • Resume • DSA • Interviews"
              className="h-9 w-9 sm:h-12 sm:w-12"
              textClassName="text-2xl sm:text-3xl font-extrabold text-[#000000]"
            />
          </div>

          {/* Desktop Center Nav Links */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-12 font-medium">
            {[
              { id: 'home', label: 'Home' },
              { id: 'features', label: 'Features' },
              { id: 'about', label: 'About' },
              { id: 'contact', label: 'Contact' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative px-1 py-1 text-lg lg:text-xl font-bold transition-colors duration-100 cursor-pointer ${activeSection === item.id
                  ? 'text-[#653AFB]'
                  : 'text-[#1E174B] hover:text-[#653AFB]'
                  }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeSectionUnderline"
                    className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#653AFB] rounded-full shadow-[0_0_10px_rgba(101,58,251,0.5)]"
                    transition={{ duration: 0.1, ease: "easeOut" }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Right Auth Action Buttons */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <button
              onClick={() => openAuthModal('login')}
              className="px-5 lg:px-7 py-2.5 rounded-2xl bg-white border border-[#1E174B]/15 text-[#1E174B] font-semibold text-base lg:text-lg hover:bg-slate-50 hover:border-[#653AFB]/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              Log in
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="px-5 lg:px-7 py-2.5 rounded-2xl bg-gradient-to-r from-[#653AFB] to-[#7A52FF] text-white font-semibold text-base lg:text-lg transition-all duration-300 shadow-lg shadow-[#653AFB]/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#653AFB]/35 active:scale-95 cursor-pointer"
            >
              Sign up
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-2xl bg-purple-100/80 text-[#653AFB] cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-b border-purple-100 px-4 py-4 space-y-3 shadow-xl z-50 relative"
          >
            <div className="flex flex-col space-y-1.5 w-full">
              {[
                { id: 'home', label: 'Home' },
                { id: 'features', label: 'Features' },
                { id: 'about', label: 'About' },
                { id: 'contact', label: 'Contact' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-2xl font-bold text-base transition-all cursor-pointer ${activeSection === item.id
                    ? 'bg-purple-100/80 text-[#653AFB] border-l-4 border-[#653AFB]'
                    : 'text-slate-700 hover:bg-purple-50'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-purple-100 flex flex-col gap-2.5 w-full">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="w-full py-2.5 rounded-2xl bg-slate-100 text-[#1E174B] font-bold text-sm text-center cursor-pointer hover:bg-slate-200 transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('signup');
                }}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#653AFB] to-[#7A52FF] text-white font-bold text-sm text-center shadow-md cursor-pointer hover:opacity-95 transition-opacity"
              >
                Sign up
              </button>
            </div>
          </motion.div>
        )}
      </header>

      {/* ---------- HERO SECTION (HOME) ---------- */}
      <div id="home" className="relative min-h-screen flex flex-col justify-between overflow-hidden">
        {/* ---------- HERO PREMIUM BACKGROUND SYSTEM (LIGHT + DARK) ---------- */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">

          {/* Base Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-[#F7F4FF] to-[#F1EBFF] dark:from-[#07070A] dark:via-[#0B1020] dark:to-[#111827]" />

          {/* Top Right Glow */}
          <div className="
    absolute -top-32 -right-32 w-[850px] h-[850px] rounded-full blur-[120px]
    bg-gradient-to-br from-[#DBC7FF]/55 to-[#C9B0FF]/20
    dark:from-[#7C3AED]/25 dark:to-[#4F46E5]/10
  " />

          {/* Center Glow */}
          <div className="
    absolute top-[18%] left-[28%] w-[650px] h-[650px] rounded-full blur-[130px]
    bg-white/40
    dark:bg-[#8B5CF6]/10
  " />

          {/* Bottom Left Glow */}
          <div className="
    absolute top-[58%] -left-36 w-[760px] h-[760px] rounded-full blur-[120px]
    bg-[#E3D3FF]/45
    dark:bg-[#4338CA]/15
  " />

          {/* Extra Bottom Right Glow */}
          <div className="
    absolute bottom-[-250px] right-[-180px] w-[700px] h-[700px]
    rounded-full blur-[120px]
    bg-[#CDB4FF]/25
    dark:bg-[#7C3AED]/12
  " />

          {/* Mesh Grid */}
          <div
            className="
      absolute inset-0
      bg-[radial-gradient(#653AFB_1px,transparent_1px)]
      [background-size:32px_32px]
      opacity-[0.06]
      dark:bg-[radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)]
      dark:opacity-[0.04]
    "
          />

          {/* Wave Shapes */}
          <svg
            className="absolute inset-0 w-full h-full text-[#C8B2FF] dark:text-[#6D5BFF]"
            viewBox="0 0 1440 900"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0 420 C 360 280, 720 580, 1080 380 C 1290 260, 1395 440, 1440 400 L1440 900 L0 900 Z"
              fill="currentColor"
              className="opacity-40 dark:opacity-10"
            />
            <path
              d="M0 520 C 430 400, 790 680, 1200 460 C 1350 370, 1415 540, 1440 500 L1440 900 L0 900 Z"
              fill="currentColor"
              className="opacity-25 dark:opacity-5"
            />
          </svg>

          {/* Floating Glow Particles */}

          <div className="
    absolute top-[15%] left-[25%]
    w-2 h-2 rounded-full
    bg-[#653AFB]/25
    dark:bg-[#A78BFA]
    shadow-[0_0_25px_rgba(124,58,237,0.8)]
    animate-pulse
  " />

          <div className="
    absolute top-[45%] left-[12%]
    w-1.5 h-1.5 rounded-full
    bg-[#9855FF]/25
    dark:bg-[#C4B5FD]
    shadow-[0_0_20px_rgba(139,92,246,0.8)]
    animate-ping
  " />

          <div className="
    absolute top-[35%] right-[22%]
    w-2.5 h-2.5 rounded-full
    bg-[#653AFB]/20
    dark:bg-[#8B5CF6]
    shadow-[0_0_28px_rgba(99,102,241,0.9)]
    animate-bounce
  " />

          <div className="
    absolute top-[75%] right-[30%]
    w-1.5 h-1.5 rounded-full
    bg-[#8A5BFF]/30
    dark:bg-[#DDD6FE]
    shadow-[0_0_18px_rgba(167,139,250,0.9)]
    animate-pulse
  " />

        </div>

        {/* ---------- HERO SECTION ---------- */}
        <main className="max-w-[1600px] mx-auto w-full px-4 sm:px-8 lg:px-12 py-0 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-3 items-start z-10 overflow-visible">
          {/* Left Column: Hero Text */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-5 flex flex-col justify-start items-start space-y-4 sm:space-y-6 lg:pr-6 pt-6 sm:pt-10 lg:pt-14"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-[68px] font-extrabold leading-[1.1] sm:leading-[1.05] tracking-[-0.03em] text-[#000000FF]">
              Prepare Smarter.
              <br />
              <span className="text-[#000000FF]">Get Placed </span>
              <span className="bg-gradient-to-r from-[#653AFB] to-[#9554FF] bg-clip-text text-transparent">
                Faster.
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-[#000000FF] max-w-[560px]">
              HireNovaAI helps you track your progress, improve consistently, and get
              AI-powered guidance tailored just for your placement journey.
            </p>

            <div className="pt-1">
              <button
                onClick={() => openAuthModal('signup')}
                className="relative group overflow-hidden px-7 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-[#653AFB] to-[#5229EC] text-white font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-[#653AFB]/25 hover:-translate-y-1 active:translate-y-0 flex items-center gap-3 cursor-pointer"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative z-10">Get Started for Free</span>
                <span className="relative z-10 text-xl transition-transform duration-300 group-hover:translate-x-1.5">
                  →
                </span>
              </button>
            </div>

            <p className="flex items-center gap-2 pt-2 sm:pt-4 text-sm sm:text-base lg:text-lg font-medium text-[#000000]">
              <span className="text-[#653AFB] text-lg sm:text-xl">✦</span>
              AI-Powered Tools for Smarter Placement Preparation
            </p>
          </motion.div>

          {/* Right Column: Hero Graphic Canvas — Flexbox Centered Orbit */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="lg:col-span-7 relative w-full flex items-center justify-center overflow-visible select-none pt-0 pb-4 sm:pb-12 translate-y-0 sm:-translate-y-12 group/hero-right"
          >
            {/* Orbit Wrapper — Uniform Rotating Orbit on Mobile, Tablet & Desktop */}
            <div className="relative w-[680px] h-[680px] flex items-center justify-center overflow-visible mx-auto scale-[0.50] min-[370px]:scale-[0.54] min-[400px]:scale-[0.60] min-[460px]:scale-[0.68] sm:scale-[0.85] lg:scale-100 origin-center -my-36 min-[370px]:-my-32 min-[400px]:-my-28 min-[460px]:-my-20 sm:my-0 translate-y-0 sm:-translate-y-10 group/orbit">
              {/* Futuristic AI SVG Orbit Paths & Directional Arrows */}
              <div className="flex absolute inset-0 pointer-events-none items-center justify-center">

                {/* Rotating SVG Orbit Circle Layer */}
                <svg
                  className="w-[540px] h-[540px] overflow-visible transition-opacity duration-500 group-hover/hero-right:opacity-100 opacity-80 animate-spin-slow group-hover/orbit:[animation-play-state:paused]"
                  style={{ animationDuration: '34s' }}
                  viewBox="0 0 540 540"
                >
                  <defs>
                    <linearGradient id="orbitGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsla(263, 94%, 61%, 1.00)" stopOpacity="0.25" />
                      <stop offset="50%" stopColor="hsla(263, 94%, 61%, 1.00)" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="hsla(263, 94%, 61%, 1.00)" stopOpacity="0.25" />
                    </linearGradient>
                  </defs>
                  {/* Outer Perfect Circular Orbit Path (r = 240px) */}
                  <circle
                    cx="270" cy="270" r="240"
                    fill="none"
                    stroke="url(#orbitGlowGrad)"
                    strokeWidth="1.5"
                    strokeDasharray="6 8"
                    className="transition-all duration-300 group-hover/hero-right:stroke-[#8B5CF6]/35"
                  />

                  {/* Inner Perfect Circular Orbit Path (r = 175px) */}
                  <circle
                    cx="270" cy="270" r="175"
                    fill="none"
                    stroke="#6628f5ff"
                    strokeOpacity="0.12"
                    strokeWidth="1.5"
                    strokeDasharray="4 6"
                    className="transition-all duration-300 group-hover/hero-right:stroke-opacity-25"
                  />

                  {/* Minimalist Directional Arrowheads */}
                  <g fill="#8B5CF6" opacity="0.3" className="transition-opacity duration-300 group-hover/hero-right:opacity-55">
                    <path d="M 280 30 L 272 26 L 274 30 L 272 34 Z" />
                    <path d="M 510 280 L 514 272 L 510 274 L 506 272 Z" />
                    <path d="M 260 510 L 268 514 L 266 510 L 268 506 Z" />
                    <path d="M 30 260 L 26 268 L 30 266 L 34 268 Z" />
                  </g>

                  {/* Glowing Nodes Along Circular Orbit Path */}
                  <g>
                    <circle cx="270" cy="30" r="5" fill="#5610faff" opacity="0.65" className="animate-pulse" />
                    <circle cx="510" cy="270" r="4.5" fill="#5610faff" opacity="0.75" className="animate-pulse" />
                    <circle cx="270" cy="510" r="3.5" fill="#5610faff" opacity="0.65" className="animate-pulse" />
                    <circle cx="30" cy="270" r="5" fill="#5610faff" opacity="0.8" className="animate-pulse" />
                  </g>
                </svg>

                {/* Ambient Floating Particles */}
                <div className="absolute top-[8%] left-[20%] w-1.5 h-1.5 rounded-full bg-[#8B5CF6]/30 blur-[0.5px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[18%] w-2 h-2 rounded-full bg-[#9554FF]/35 blur-[0.5px] animate-ping" />
                <div className="absolute top-[50%] right-[2%] w-1.5 h-1.5 rounded-full bg-[#653AFB]/25" />
                <div className="absolute top-[50%] left-[2%] w-2 h-2 rounded-full bg-[#8B5CF6]/30" />
              </div>

              {/* Central HireNovaAI Logo Anchor */}
              <motion.div
                className="flex absolute inset-0 items-center justify-center pointer-events-none"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* Soft Ambient Glow */}
                <motion.div
                  className="absolute w-44 h-44 rounded-full bg-[#653AFB]/12 blur-2xl"
                  animate={{ opacity: [0.18, 0.3, 0.18], scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Subtle Halo Ring */}
                <div className="absolute w-44 h-44 rounded-full border border-[#8B5CF6]/20" />

                {/* Logo Container */}
                <motion.div
                  whileHover={{ scale: 1.04, boxShadow: "0 18px 45px rgba(14, 11, 11, 0.28)" }}
                  transition={{ duration: 0.5 }}
                  className="relative z-10 flex items-center justify-center p-2 rounded-full bg-white/75 backdrop-blur-2xl border border-white/70 shadow-[0_15px_40px_rgba(101,58,251,0.22)] pointer-events-auto"
                >
                  <Logo
                    showText={false}
                    className="w-36 h-36 object-contain drop-shadow-[0_15px_25px_rgba(101,58,251,0.28)] translate-y-3"
                  />
                </motion.div>
              </motion.div>

              {/* Rotating Orbit Wheel for All Screen Sizes */}
              <div className="block absolute inset-0 w-full h-full">
                {[
                  {
                    id: 'dsa',
                    angle: 0,
                    icon: '</>',
                    title: 'DSA Tracker',
                    subtitle: 'Smart Coding Progress',
                    bullets: ['Topic Wise Progress', 'Difficulty Analytics', 'AI Recommendations'],
                    footer: 'Code Better Every Day 🚀'
                  },
                  {
                    id: 'planner',
                    angle: 72,
                    icon: '📅',
                    title: 'Study Planner',
                    subtitle: 'Daily Action Items',
                    bullets: ['Daily Tasks & Goals', 'Structured Roadmaps', 'Time & Habit Tracker'],
                    footer: 'Stay Consistent & Focused 🔥'
                  },
                  {
                    id: 'resume',
                    angle: 144,
                    icon: '📄',
                    title: 'Resume Analyzer',
                    subtitle: 'ATS AI Review',
                    bullets: ['ATS Score Analysis', 'Keyword & Skill Check', 'AI Improvement Tips'],
                    footer: 'Optimize your resume ✨'
                  },
                  {
                    id: 'notes',
                    angle: 216,
                    icon: '📝',
                    title: 'AI Notes',
                    subtitle: 'Smart Revision Hub',
                    bullets: ['CS Fundamentals Notes', 'AI Summary & Key Points', 'Custom Note Taking'],
                    footer: 'Learn Smarter, Revise Faster ✨'
                  },
                  {
                    id: 'interview',
                    angle: 288,
                    icon: '🎙️',
                    title: 'AI Mock Interview',
                    subtitle: 'Interview Practice',
                    bullets: ['Text Interview', 'Role Based Questions', 'Instant AI Feedback'],
                    footer: 'Practice. Improve. Succeed 🚀'
                  }
                ].map((card) => {
                  const radius = 240;
                  const angle = ((card.angle + orbitAngle) * Math.PI) / 180;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;

                  return (
                    <div
                      key={card.id}
                      className="absolute z-20 group/card"
                      style={{
                        left: "50%",
                        top: "50%",
                        transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`
                      }}
                    >
                      <div
                        onClick={() => openAuthModal('signup')}
                        className="transition-all duration-300 hover:scale-[1.03] hover:-translate-y-2 hover:shadow-[0_18px_40px_rgba(101,58,251,0.25)] hover:ring-2 hover:ring-[#653AFB]/35 rounded-2xl cursor-pointer"
                      >
                        <div className="bg-white/95 backdrop-blur-[12px] p-4 rounded-2xl border border-white/70 shadow-[0_10px_35px_rgba(101,58,251,0.12)] w-[205px]">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 rounded-full bg-[#6B42FF] text-white flex items-center justify-center text-xs shrink-0 font-bold">
                              {card.icon}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#6B42FF]">
                                {card.title}
                              </h4>
                              <p className="text-[8px] text-[#6B42FF]/60 font-medium">
                                {card.subtitle}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-[9px] font-semibold text-[#382E67] mb-3">
                            {card.bullets.map((b, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 rounded-full bg-[#6B42FF] text-white flex items-center justify-center text-[7px] font-bold shrink-0">✓</span>
                                <span>{b}</span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-purple-100">
                            <p className="text-[9px] font-bold text-[#6B42FF]">
                              {card.footer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </motion.div>
        </main>
      </div>

      {/* ---------- FEATURES SECTION (CUSTOM DISTINCT SAAS BACKGROUND) ---------- */}
      <section id="features" className="scroll-mt-16 sm:scroll-mt-20 relative z-10 overflow-hidden pt-6 sm:pt-14 pb-16 sm:pb-20 bg-gradient-to-b from-[#F5F2FE] via-[#EDE7FE] to-[#F3EEFE] dark:from-[#0B1020] dark:via-[#0F1528] dark:to-[#0B1020]">
        {/* Features Section Ambient Glow Accents */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full blur-[140px] bg-[#7C3AED]/12 dark:bg-[#7C3AED]/16" />
          <div className="absolute inset-0 bg-[radial-gradient(#653AFB_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04] dark:opacity-[0.03]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 lg:px-12 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#6C47FF] bg-purple-100/80 px-3.5 py-1 rounded-full border border-purple-200">
              Powerful Modules
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-[#1A1A2E] dark:text-white">
              Comprehensive Tools Built for Placement Success
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300 font-medium">
              Everything you need to streamline DSA practice, resume optimization, and interview preparation in one unified workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresList.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/60 dark:border-white/10 shadow-md space-y-3 hover:-translate-y-1 transition-transform">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100/80 text-[#6C47FF] flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-[#1A1A2E] dark:text-white">{item.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl p-8 rounded-3xl border border-white/60 dark:border-white/10 text-center max-w-2xl mx-auto space-y-4 shadow-md">
            <h3 className="text-2xl font-black text-[#1A1A2E] dark:text-white">Ready to start practicing?</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Create your free account today and unlock your personalized placement roadmap.</p>
            <button onClick={() => openAuthModal('signup')} className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#6C47FF] text-white font-bold text-xs hover:bg-[#5A36EC] shadow-md cursor-pointer">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ---------- ABOUT SECTION (CUSTOM EDITORIAL SAAS BACKGROUND) ---------- */}
      <section id="about" className="scroll-mt-16 sm:scroll-mt-20 relative z-10 overflow-hidden pt-6 sm:pt-14 pb-16 sm:pb-20 bg-gradient-to-b from-[#F3EEFE] via-[#EBE4FC] to-[#F5F0FF] dark:from-[#0B1020] dark:via-[#131B30] dark:to-[#0B1020]">
        {/* About Section Ambient Glow Accents */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-1/3 right-10 w-[650px] h-[650px] rounded-full blur-[140px] bg-[#8B5CF6]/15 dark:bg-[#8B5CF6]/20" />
          <div className="absolute bottom-10 left-10 w-[550px] h-[550px] rounded-full blur-[130px] bg-[#6366F1]/12 dark:bg-[#6366F1]/16" />
          <div className="absolute inset-0 bg-[radial-gradient(#653AFB_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04] dark:opacity-[0.03]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 lg:px-12 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#6C47FF] bg-purple-100/80 px-3.5 py-1 rounded-full border border-purple-200">
              Our Mission
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-[#1A1A2E] dark:text-white">
              Empowering Job Seekers with AI-Driven Clarity
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300 font-medium">
              HireNovaAI unifies scattered placement preparation resources into a smart, automated assistant.
            </p>
          </div>

          {/* Problem & Solution Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/60 dark:border-white/10 shadow-md space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100/80 text-[#6C47FF] flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#1A1A2E] dark:text-white">What is HireNovaAI?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                HireNovaAI is an all-in-one placement preparation portal that tracks DSA problem solving, analyzes ATS resumes, simulates AI mock interviews, and guides daily study schedules.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/60 dark:border-white/10 shadow-md space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100/80 text-[#6C47FF] flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#1A1A2E] dark:text-white">The Problem We Solve</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Students waste hours switching between spreadsheets, resume checkers, and random study sheets. HireNovaAI brings structure, consistency, and automated progress insights.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/60 dark:border-white/10 shadow-md space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100/80 text-[#6C47FF] flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#1A1A2E] dark:text-white">How AI Helps You</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Using Gemini AI algorithms, HireNovaAI provides personalized topic recommendations, instant resume keyword scoring, and constructive interview feedback.
              </p>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl p-8 rounded-3xl border border-white/60 dark:border-white/10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-[#1A1A2E] dark:text-white">Built for Engineers & Candidates</h3>
              <div className="space-y-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#6C47FF]" /> Structured topic-wise DSA roadmaps</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#6C47FF]" /> ATS Resume scoring & project suggestions</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#6C47FF]" /> Real-time study streak analytics</p>
              </div>
            </div>
            <button onClick={() => openAuthModal('signup')} className="px-6 py-3 rounded-2xl bg-[#6C47FF] text-white font-bold text-xs hover:bg-[#5A36EC] shadow-md shrink-0 cursor-pointer">
              Join HireNovaAI Today
            </button>
          </div>
        </div>
      </section>

      {/* ---------- CONTACT SECTION (CUSTOM CTA FOCUS BACKGROUND) ---------- */}
      <section id="contact" className="scroll-mt-16 sm:scroll-mt-20 relative z-10 overflow-hidden pt-6 sm:pt-14 pb-16 sm:pb-20 bg-gradient-to-b from-[#F5F0FF] via-[#EBE2FC] to-[#E5D8FD] dark:from-[#0B1020] dark:via-[#11162A] dark:to-[#090C16]">
        {/* Contact Section Ambient Glow Accents */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] bg-[#653AFB]/15 dark:bg-[#653AFB]/20" />
          <div className="absolute inset-0 bg-[radial-gradient(#653AFB_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04] dark:opacity-[0.03]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 lg:px-12 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#6C47FF] bg-purple-100/80 px-3.5 py-1 rounded-full border border-purple-200">
              Get In Touch
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-[#1A1A2E] dark:text-white">
              Contact HireNovaAI
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300 font-medium">
              Have questions, feedback, or need help with your account? Send us a message below.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Info Side */}
            <div className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/60 dark:border-white/10 shadow-md space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-[#1A1A2E] dark:text-white">We'd Love to Hear From You</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  Whether you are a student preparing for campus drives or an institution looking for placement solutions, our team is here to assist.
                </p>
              </div>

              <div className="space-y-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#6C47FF] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Email Us</p>
                    <p className="text-slate-900 dark:text-white font-extrabold text-xs">support@hirenovaai.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#6C47FF] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Support</p>
                    <p className="text-slate-900 dark:text-white font-extrabold text-xs">+91 (800) 123-4567</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Side */}
            <div className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/60 dark:border-white/10 shadow-lg space-y-4">
              {contactSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center flex flex-col items-center gap-2 my-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-1" />
                  Thank you! Your message has been received.
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Mahek Agarwal"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-[#6C47FF] outline-none text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="you@college.edu"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-[#6C47FF] outline-none text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider mb-1">Message</label>
                    <textarea
                      required
                      rows="4"
                      placeholder="How can we help you?"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-[#6C47FF] outline-none text-sm font-medium resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-[#6C47FF] text-white font-bold text-sm hover:bg-[#5A36EC] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" /> Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="w-full bg-[#0F0A24] dark:bg-[#07070D] text-white py-12 px-8 lg:px-12 z-10 relative border-t border-purple-900/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-300 dark:text-slate-400">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Logo showText={true} textClassName="text-xl font-bold text-white" />
          </div>

          <div className="flex items-center gap-8 font-semibold">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[#A78BFA] transition-colors cursor-pointer">Home</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-[#A78BFA] transition-colors cursor-pointer">Features</button>
            <button onClick={() => scrollToSection('about')} className="hover:text-[#A78BFA] transition-colors cursor-pointer">About</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-[#A78BFA] transition-colors cursor-pointer">Contact</button>
            <button onClick={() => openAuthModal('login')} className="hover:text-[#A78BFA] transition-colors cursor-pointer">Login</button>
          </div>

          <p className="font-medium text-slate-400">© {new Date().getFullYear()} HireNovaAI. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modal Overlay System */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
        resetToken={resetToken}
      />
    </motion.div>
  );
};

export default LandingPage;
