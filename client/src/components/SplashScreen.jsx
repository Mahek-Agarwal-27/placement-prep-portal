import React, { useEffect, useState } from 'react';
import Logo from './Logo';

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 800);
    const t3 = setTimeout(() => setPhase(3), 1800);
    const t4 = setTimeout(() => onDone(), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8FAFC',
        transition: 'opacity 0.4s ease',
        opacity: phase === 3 ? 0 : 1,
        pointerEvents: phase === 3 ? 'none' : 'all',
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        transform: phase >= 1 ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.95)',
        opacity: phase >= 1 ? 1 : 0,
        transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.5s ease',
      }}>
        <div style={{ transform: 'scale(1.5)', transformOrigin: 'center' }}>
          <Logo />
        </div>

        <p style={{
          marginTop: 12,
          color: '#64748B',
          fontSize: '12px',
          letterSpacing: '0.1em',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          opacity: phase >= 2 ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}>
          AI-POWERED PLACEMENT COMPANION
        </p>
      </div>

      <div style={{
        position: 'absolute',
        bottom: 60,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 140,
        height: 3,
        borderRadius: 99,
        background: '#E2E8F0',
        overflow: 'hidden',
        opacity: phase >= 1 ? 1 : 0,
      }}>
        <div style={{
          height: '100%',
          width: phase >= 2 ? '100%' : '0%',
          background: '#2563EB',
          borderRadius: 99,
          transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
    </div>
  );
}
