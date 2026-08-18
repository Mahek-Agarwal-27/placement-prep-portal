import React from 'react';

/**
 * UnifiedBackground — The exact premium background system from the HireNovaAI Landing Page.
 * Renders base gradient, top-right/center/bottom-left/bottom-right glows, mesh grid, 
 * SVG wave shapes, and floating animated particles (pulse, ping, bounce).
 */
const UnifiedBackground = () => {
  return (
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

      {/* Bottom Right Glow */}
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
  );
};

export default UnifiedBackground;
