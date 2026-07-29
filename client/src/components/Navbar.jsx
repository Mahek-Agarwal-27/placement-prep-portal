import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import NotificationsDropdown from './NotificationsDropdown';
import { 
  LayoutDashboard, 
  Code2, 
  FileText, 
  Sparkles, 
  MessageSquare, 
  BarChart3, 
  User, 
  LogOut 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'DSA Tracker', path: '/dsa-tracker', icon: Code2 },
    { name: 'Resume Analyzer', path: '/resume-analyzer', icon: FileText },
    { name: 'AI Roadmap', path: '/notes', icon: Sparkles },
    { name: 'Interview Prep', path: '/mock-interview', icon: MessageSquare },
    { name: 'AI History', path: '/ai-history', icon: Sparkles },
    { name: 'Settings', path: '/settings', icon: User },
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Logo />
            </Link>
          </div>

          {/* Center: Main Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right: Notifications Dropdown & User Profile */}
          <div className="flex items-center gap-3">
            <NotificationsDropdown />

            <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <Link 
                to="/profile" 
                className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors p-1 rounded-md"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-medium text-slate-800 hidden sm:inline">
                  {user?.name || 'User'}
                </span>
              </Link>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Nav sub-bar */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2 border-t border-slate-100 gap-1 bg-slate-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap font-medium transition-colors ${
                isActive
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </header>
  );
};

export default Navbar;
