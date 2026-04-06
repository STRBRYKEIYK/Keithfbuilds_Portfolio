/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic palette (avoid generic Tailwind palette names)
        bg: '#050A07',
        bg2: '#0C1410',
        card: '#0F1A12',
        text: '#E8F5F0',
        textMuted: '#7A9E8C',
        textDim: '#4A6B57',
        green: '#16C172',
        greenDim: '#0D8A50',
        greenGlow: 'rgba(22, 193, 114, 0.15)',
        greenBorder: 'rgba(22, 193, 114, 0.2)',
      },
      boxShadow: {
        // Used for subtle tactile glow
        greenSoft: '0 0 18px rgba(22, 193, 114, 0.22)',
      },
      transitionTimingFunction: {
        'ease-soft': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}

