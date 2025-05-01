/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Adjust default font sizes up by 15%
    fontSize: {
      'xs': '0.8625rem',     // 0.75rem * 1.15
      'sm': '0.9775rem',     // 0.85rem * 1.15
      'base': '1.15rem',     // 1rem * 1.15
      'lg': '1.265rem',      // 1.1rem * 1.15
      'xl': '1.38rem',       // 1.2rem * 1.15
      '2xl': '1.61rem',      // 1.4rem * 1.15
      '3xl': '1.84rem',      // 1.6rem * 1.15
      '4xl': '2.3rem',       // 2rem * 1.15
      '5xl': '2.875rem',     // 2.5rem * 1.15
      '6xl': '3.45rem',      // 3rem * 1.15
    },
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'progress-bar': 'progressBar 1.5s ease-in-out infinite',
        'pulse-bg': 'pulseBackground 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        progressBar: {
          '0%': { width: '0%' },
          '50%': { width: '70%' },
          '100%': { width: '100%' },
        },
        pulseBackground: {
          '0%': { backgroundColor: 'var(--tw-gradient-from)' },
          '50%': { backgroundColor: 'var(--tw-gradient-to)' },
          '100%': { backgroundColor: 'var(--tw-gradient-from)' },
        },
      },
    },
  },
  plugins: [],
};