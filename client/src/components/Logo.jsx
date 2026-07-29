import React from 'react';

const Logo = ({ className = "h-7 w-7", showText = true, textClassName = "text-lg font-bold" }) => {
  return (
    <div className="flex items-center gap-2 select-none">
      {/* SaaS Blue Icon */}
      <div className="bg-blue-600 text-white rounded-lg p-1.5 flex items-center justify-center shadow-sm">
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.71 1.1-1.63 1.1-2.6 0-1.04-.42-2.02-1.15-2.75" />
          <path d="M12 15l-3-3 6.5-6.5a2.12 2.12 0 0 1 3 3L12 15z" />
          <path d="M15 12l2 2" />
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <span className={`${textClassName} tracking-tight text-slate-900`}>
          HireNova<span className="text-blue-600 font-semibold">AI</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
