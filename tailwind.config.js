/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f3efe7',
        paperSoft: '#ece8de',
        paperDeep: '#e8e1d0',
        ink: '#101010',
        inkMuted: '#3a3936',
        risoRed: '#ff3a2f',
        risoRedDeep: '#c81f15',
        risoCyan: '#1ad0d4',
        risoCyanDeep: '#0fa6a9',
        canary: '#ffd400',
        canarySoft: '#ffe9b8',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        riso: '6px 6px 0 #ff3a2f, -6px -6px 0 #1ad0d4',
        risoRed: '4px 4px 0 #ff3a2f',
        risoCyan: '-4px -4px 0 #1ad0d4',
        inkSoft: '0 28px 60px rgba(16, 16, 16, 0.14)',
      },
      transitionTimingFunction: {
        'ease-out-riso': 'cubic-bezier(0.2, 0.9, 0.2, 1)',
        'ease-soft': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
