import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationsDropdown from './NotificationsDropdown';
import { LogOut, User, ArrowLeft, Menu } from 'lucide-react';

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
    <header className="w-full bg-[#EFE9FE] py-2.5 sm:py-4 md:py-5 px-3 sm:px-6 lg:px-8 flex items-center justify-between z-20 gap-2 sm:gap-4 border-b border-purple-200/40 md:border-transparent">
      
      {/* Left Action Area: Mobile Hamburger Button & Universal Back Button */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Mobile Hamburger Toggle Button (Screens < md) */}
        {!isLandingPage && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'))}
            className="md:hidden p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-white border border-purple-200 text-[#6C47FF] hover:bg-purple-50 transition-all shadow-xs flex items-center justify-center cursor-pointer"
            aria-label="Toggle navigation menu"
            title="Menu"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-[#6C47FF]" />
          </button>
        )}

        {/* Universal Back Button (Shown on all pages except Dashboard & Landing) */}
        {!isDashboard && !isLandingPage && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 sm:gap-2 text-xs font-bold text-[#6C47FF] bg-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-purple-200 shadow-xs hover:bg-purple-50 transition-all shrink-0"
            title="Go Back"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6C47FF]" />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}
      </div>

      {/* Title / Greeting Display */}
      <div className="flex-1 min-w-0 pr-1 sm:pr-2">
        {pageHeading && (
          <h1 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-black text-[#1A1A2E] flex items-center gap-1 sm:gap-2 truncate">
            {isDashboard ? (
              <>
                {/* Mobile (< sm): Short and friendly so name always fits */}
                <span className="sm:hidden truncate">
                  Hi, {userName || 'there'} 👋
                </span>
                {/* Tablet / Medium screens (sm to lg): Medium prefix */}
                <span className="hidden sm:inline lg:hidden truncate">
                  Welcome, {userName || 'there'} 👋
                </span>
                {/* Large Desktop (lg+): Full welcome back greeting */}
                <span className="hidden lg:inline truncate">
                  {pageHeading}
                </span>
              </>
            ) : (
              <span className="truncate">{pageHeading}</span>
            )}
          </h1>
        )}
        {pageSubheading && (
          <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5 truncate hidden sm:block">
            {pageSubheading}
          </p>
        )}
      </div>

      {/* Right Utility Bar: Notifications Dropdown Pill & User Avatar */}
      <div className="flex items-center gap-1.5 sm:gap-3 ml-auto shrink-0">
        {/* Notification Pill Button */}
        <div className="relative">
          <NotificationsDropdown />
        </div>

        {/* User Profile Pill & Logout */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/profile"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#8B5CF6] text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-md hover:opacity-90 transition-opacity overflow-hidden border border-purple-200 shrink-0"
            title="Profile"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : user?.name ? (
              user.name.charAt(0).toUpperCase()
            ) : (
              <User className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            )}
          </Link>

          <button
            onClick={logout}
            className="p-1 sm:p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg sm:rounded-xl transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
