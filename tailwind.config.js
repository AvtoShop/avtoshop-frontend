/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#090909',
        coal: '#111111',
        steel: '#1d1d1d',
        surface: '#161616',
        line: '#2a2a2a',
        copy: '#f3f0ea',
        muted: '#a39c93',
        accent: '#d97706',
        accentSoft: '#f59e0b'
      },
      fontFamily: {
        sans: ['"Segoe UI"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        display: ['Rubik', '"Segoe UI"', 'Arial', 'sans-serif']
      },
      boxShadow: {
        glow: '0 22px 60px rgba(0, 0, 0, 0.32)',
        panel: '0 14px 40px rgba(0, 0, 0, 0.24)'
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)'
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease-out both',
        pulseline: 'pulseLine 5s ease-in-out infinite'
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseLine: {
          '0%, 100%': { opacity: '0.25' },
          '50%': { opacity: '0.8' }
        }
      }
    }
  },
  plugins: []
};
