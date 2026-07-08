/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // Support class-based dark mode
  theme: {
    extend: {
      colors: {
        // Branding Palette
        primary: {
          DEFAULT: '#4F46E5',
          light: '#6366F1',
          dark: '#3730A3',
        },
        secondary: {
          DEFAULT: '#7C3AED',
          light: '#8B5CF6',
          dark: '#5B21B6',
        },
        accent: {
          DEFAULT: '#06B6D4',
          light: '#22D3EE',
          dark: '#0891B2',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        
        // Background and Card Layout Specs
        lightBg: '#F8FAFC',
        darkBg: '#0F172A',
        cardLight: '#FFFFFF',
        cardDark: '#1E293B',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 4px 20px -2px rgba(79, 70, 229, 0.1)',
        glow: '0 0 24px rgba(79, 70, 229, 0.25)',
      }
    },
  },
  plugins: [],
};
