import React, { useId } from 'react';

const Logo = ({ className = "w-8 h-8 sm:w-9 sm:h-9", showText = true, textClassName = "text-xl sm:text-2xl font-bold", subtitle = null }) => {
  const rawId = useId();
  const gradId = `logo-grad-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <div className="flex items-center gap-2.5 select-none shrink-0">
      {/* Official HireNovaAI Brand Logo Vector */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg 
          className={`${className} shrink-0`} 
          width="36" 
          height="36" 
          viewBox="0 0 100 115" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7E47FF" />
              <stop offset="100%" stopColor="#5D26ED" />
            </linearGradient>
          </defs>
          {/* Left Vertical Pillar */}
          <rect x="20" y="10" width="22" height="75" rx="11" fill={`url(#${gradId})`} />
          {/* Right Vertical Pillar with Upward Arrow Head */}
          <path d="M58 20 C 58 14, 63 10, 70 10 C 77 10, 80 14, 80 20 L 80 75 C 80 81, 74 85, 69 85 C 62 85, 58 81, 58 75 Z" fill={`url(#${gradId})`} />
          {/* Diagonal Bridge Connecting Left and Right */}
          <path d="M 20 62 C 20 48, 42 42, 58 26 L 68 20 L 68 34 C 54 48, 32 54, 20 74 Z" fill={`url(#${gradId})`} />
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
