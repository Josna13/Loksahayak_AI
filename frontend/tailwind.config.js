/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gov-navy': {
          DEFAULT: '#183153',
          dark: '#0F1E33',
          light: '#234775',
          lighter: '#EBF1F8'
        },
        'gov-green': {
          DEFAULT: '#176B45',
          dark: '#0E4B2F',
          light: '#EAF5EF'
        },
        'gov-orange': {
          DEFAULT: '#E98A24',
          dark: '#C86E12',
          light: '#FEF6EC'
        },
        'gov-bg': '#F3F5F7',
        'gov-border': '#D9E0E7',
        'gov-text': '#25313C',
        'gov-muted': '#657383',
        'gov-red': {
          DEFAULT: '#B42318',
          light: '#FEE4E2'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
