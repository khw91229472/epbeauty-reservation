/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        blush: {
          50: '#fdf6f7',
          100: '#fbe9ec',
          200: '#f6d0d7',
          300: '#eeb0bc',
          400: '#e28a9c',
          500: '#d16a80',
          600: '#b85068',
          700: '#963f54',
        },
        sand: {
          50: '#fbf8f3',
          100: '#f5eee3',
          200: '#ebdcc6',
          300: '#dcc4a3',
          400: '#c9a77e',
          500: '#a8835a',
        },
        ink: {
          DEFAULT: '#2b2326',
          soft: '#6b5f63',
        },
      },
      fontFamily: {
        sans: ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(150, 63, 84, 0.18)',
        card: '0 2px 20px -6px rgba(43, 35, 38, 0.08)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        toastIn: {
          '0%': { opacity: 0, transform: 'translateY(-12px) scale(.96)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        pop: {
          '0%': { transform: 'scale(0)' },
          '70%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp .6s cubic-bezier(.2,.8,.2,1) both',
        'toast-in': 'toastIn .35s cubic-bezier(.2,.8,.2,1) both',
        pop: 'pop .5s cubic-bezier(.2,.8,.2,1) both',
      },
    },
  },
  plugins: [],
};
