import { useTheme } from '../context/ThemeContext';

/**
 * ThemeToggle — A premium sun/moon toggle button for the navbar.
 * Reads and toggles the global theme via ThemeContext.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
      className="relative w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300 hover:scale-105 active:scale-95"
      style={{
        background: isDark
          ? 'rgba(79, 70, 229, 0.1)'
          : 'rgba(245, 158, 11, 0.1)',
        borderColor: isDark
          ? 'rgba(79, 70, 229, 0.25)'
          : 'rgba(245, 158, 11, 0.3)',
        color: isDark ? '#818cf8' : '#f59e0b',
        boxShadow: isDark
          ? '0 0 12px rgba(79, 70, 229, 0.15)'
          : '0 0 12px rgba(245, 158, 11, 0.2)',
      }}
    >
      <span
        className="transition-all duration-300"
        style={{
          opacity: 1,
          transform: 'scale(1)',
        }}
      >
        {isDark ? (
          /* Sun icon */
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
        ) : (
          /* Moon icon */
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </span>
    </button>
  );
}
