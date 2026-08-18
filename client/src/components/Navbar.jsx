import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationsDropdown from './NotificationsDropdown';
import { LogOut, User, ArrowLeft } from 'lucide-react';

const Navbar = ({ title = null, subtitle = null }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboard = location.pathname === '/dashboard';
  const isLandingPage = location.pathname === '/';
  const userName = user?.name ? user.name.split(' ')[0] : '';
  const isNewUser = location.state?.isNewUser || false;

  // Determine welcome heading vs normal page title
  const getHeading = () => {
    if (title) return title;
    if (isDashboard) {
      if (isNewUser) {
        return `Welcome${userName ? `, ${userName}` : ''} 🎉`;
      }
      return `Welcome Back${userName ? `, ${userName}` : ''} 👋`;
    }
    return null;
  };

  const getSubheading = () => {
    if (subtitle) return subtitle;
    if (isDashboard) {
      return isNewUser 
        ? "Let's kickstart your placement preparation journey." 
        : "Let's continue your placement preparation journey.";
    }
    return null;
  };

  const pageHeading = getHeading();
  const pageSubheading = getSubheading();

  return (
    <header className="w-full bg-[#EFE9FE] py-5 px-8 flex items-center justify-between z-20 gap-4">
      
      {/* Universal Back Button (Shown on all pages except Dashboard & Landing) */}
      {!isDashboard && !isLandingPage && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-[#6C47FF] bg-white px-3.5 py-2 rounded-2xl border border-purple-200 shadow-xs hover:bg-purple-50 transition-all shrink-0"
          title="Go Back"
        >
          <ArrowLeft className="w-4 h-4 text-[#6C47FF]" />
          <span>Back</span>
        </button>
      )}

      {/* Title / Greeting Display (Greeting ONLY on Dashboard or when title passed) */}
      <div className="flex-1">
        {pageHeading && (
          <h1 className="text-2xl font-black text-[#1A1A2E] flex items-center gap-2">
            {pageHeading}
          </h1>
        )}
        {pageSubheading && (
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {pageSubheading}
          </p>
        )}
      </div>

      {/* Right Utility Bar: Notifications Dropdown Pill & User Avatar */}
      <div className="flex items-center gap-4 ml-auto shrink-0">
        {/* Notification Pill Button */}
        <div className="relative">
          <NotificationsDropdown />
        </div>

        {/* User Profile Pill & Logout */}
        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            className="w-10 h-10 rounded-full bg-[#8B5CF6] text-white font-bold flex items-center justify-center text-sm shadow-md hover:opacity-90 transition-opacity overflow-hidden border border-purple-200"
            title="Profile"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : user?.name ? (
              user.name.charAt(0).toUpperCase()
            ) : (
              <User className="w-5 h-5" />
            )}
          </Link>

          <button
            onClick={logout}
            className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
