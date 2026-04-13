/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#2e7a42', light: '#e8f5e0', dark: '#1a5a2e' },
        accent:    { DEFAULT: '#c85a1a', light: '#fff3ee' },
        navy:      { DEFAULT: '#1a4a8a', light: '#e8f0ff' },
        warn:      { DEFAULT: '#d4a020', light: '#fff8e0' },
        surface:   { DEFAULT: '#faf9f7', card: '#ffffff', border: '#e8e4dc' },
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'sans-serif'],
        display: ['"M PLUS Rounded 1c"', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn .4s ease both',
        'slide-up':   'slideUp .5s ease both',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 },                  to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'none' } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: .6 } },
      },
    },
  },
  plugins: [],
}
