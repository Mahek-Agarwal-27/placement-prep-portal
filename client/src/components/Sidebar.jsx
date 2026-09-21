import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import {
  LayoutDashboard,
  Code2,
  Calendar,
  Sparkles,
  Mic,
  FileText,
  BarChart2,
  Settings,
  History,
  X
} from 'lucide-react';

const Sidebar = ({ isCollapsed = false }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Listen for mobile sidebar toggle events from Navbar
  useEffect(() => {
    const handleToggle = () => setMobileOpen((prev) => !prev);
    const handleClose = () => setMobileOpen(false);

    window.addEventListener('toggle-mobile-sidebar', handleToggle);
    window.addEventListener('close-mobile-sidebar', handleClose);

    return () => {
      window.removeEventListener('toggle-mobile-sidebar', handleToggle);
      window.removeEventListener('close-mobile-sidebar', handleClose);
    };
  }, []);

  // Auto-close mobile drawer whenever route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

  // Navigation items sequence requested by user:
  // 1. Dashboard, 2. DSA Practice, 3. Study Planner, 4. AI Notes, 5. Mock Interviews, 6. Resume Analyzer, 7. Progress
  const mainNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'DSA Tracker', path: '/dsa-tracker', icon: Code2 },
    { name: 'Study Planner', path: '/study-planner', icon: Calendar },
    { name: 'AI Notes', path: '/notes', icon: Sparkles },
    { name: 'Mock Interviews', path: '/mock-interview', icon: Mic },
    { name: 'Resume Analyzer', path: '/resume-analyzer', icon: FileText },
    { name: 'Progress', path: '/analytics', icon: BarChart2 },
  ];

  // Settings & AI History in the exact location/sequence where Settings exists
  const secondaryNav = [
    { name: 'AI History', path: '/ai-history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const checkActive = (path) => {
    if (path === '/dsa-tracker') {
      return location.pathname === '/dsa' || location.pathname === '/dsa-tracker';
    }
    if (path === '/resume-analyzer') {
      return location.pathname === '/resume' || location.pathname === '/resume-analyzer';
    }
    if (path === '/mock-interview') {
      return location.pathname === '/interview' || location.pathname === '/mock-interview';
    }
    if (path === '/study-planner') {
      return location.pathname === '/planner' || location.pathname === '/study-planner';
    }
    return location.pathname === path;
  };

  const navContent = (isMobileView = false) => (
    <div className="flex flex-col h-full justify-between py-6">
      <div>
        {/* Top Brand Logo - Clicking navigates to Landing Page */}
        <div className="px-6 pb-6 mb-2 border-b border-purple-100/80 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" title="Go to Home / Landing Page">
            <Logo showText={isMobileView || !isCollapsed} textClassName="text-xl font-extrabold" />
          </Link>
          {isMobileView && (
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-xl text-gray-500 hover:text-[#6C47FF] hover:bg-purple-50 transition-colors md:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Main Navigation Links */}
        <div className="px-4 space-y-1.5">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const active = checkActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-[#EAE5FF] text-[#6C47FF] shadow-sm font-bold'
                    : 'text-gray-700 hover:text-[#6C47FF] hover:bg-purple-50/70'
                }`}
                title={!isMobileView && isCollapsed ? item.name : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-[#6C47FF]' : 'text-purple-400'}`} />
                {(isMobileView || !isCollapsed) && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation (AI History & Settings) */}
      <div className="px-4 pt-4 border-t border-purple-100/80 space-y-1.5">
        {secondaryNav.map((item) => {
          const Icon = item.icon;
          const active = checkActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-[#EAE5FF] text-[#6C47FF] font-bold'
                  : 'text-gray-700 hover:text-[#6C47FF] hover:bg-purple-50/70'
              }`}
              title={!isMobileView && isCollapsed ? item.name : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-[#6C47FF]' : 'text-purple-400'}`} />
              {(isMobileView || !isCollapsed) && <span>{item.name}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR (Identical to previous design on md+ screens) ── */}
      <aside
        className={`hidden md:flex bg-white border-r border-purple-200/70 flex-col justify-between transition-all duration-300 z-30 shrink-0 min-h-screen ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {navContent(false)}
      </aside>

      {/* ── MOBILE SIDEBAR DRAWER (Slide-over for screens < md) ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in"
            aria-hidden="true"
          />

          {/* Slide-out Drawer */}
          <aside className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl z-50 flex flex-col justify-between border-r border-purple-200/70 animate-slide-right overflow-y-auto">
            {navContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
