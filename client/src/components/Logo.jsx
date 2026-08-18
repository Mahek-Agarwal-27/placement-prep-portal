import React from 'react';

const Logo = ({ className = "h-9 w-9", showText = true, textClassName = "text-2xl font-bold", subtitle = null }) => {
  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Official HireNovaAI Brand Logo Vector matching exact user image */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg className={className} viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="hn_logo_grad" x1="0" y1="0" x2="100" y2="115" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7E47FF" />
              <stop offset="100%" stopColor="#5D26ED" />
            </linearGradient>
          </defs>
          {/* Left Vertical Pillar */}
          <rect x="20" y="10" width="22" height="75" rx="11" fill="url(#hn_logo_grad)" />
          {/* Right Vertical Pillar with Upward Arrow Head */}
          <path d="M58 20 C 58 14, 63 10, 70 10 C 77 10, 80 14, 80 20 L 80 75 C 80 81, 74 85, 69 85 C 62 85, 58 81, 58 75 Z" fill="url(#hn_logo_grad)" />
          {/* Diagonal Bridge Connecting Left and Right */}
          <path d="M 20 62 C 20 48, 42 42, 58 26 L 68 20 L 68 34 C 54 48, 32 54, 20 74 Z" fill="url(#hn_logo_grad)" />
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`${textClassName} tracking-tight font-extrabold text-[#1A1A2E]`}>
            HireNova<span className="text-[#6C47FF]">AI</span>
          </span>
          {subtitle && (
            <span className="text-[10px] font-semibold tracking-wide text-[#6C47FF] uppercase">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
