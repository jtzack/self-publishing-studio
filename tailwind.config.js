/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#08111F',
          900: '#0C1929',
          800: '#142539',
          700: '#1E3550',
          600: '#2A4566',
          500: '#3E5C82',
          400: '#5A78A0',
          300: '#8AA0C0',
          200: '#B5C4D9',
          100: '#DDE5F0',
        },
        butter: {
          700: '#B8A648',
          600: '#D8C25A',
          500: '#EFE183',
          400: '#F4E89A',
          300: '#F8F0B8',
          200: '#FBF6D6',
          100: '#FDFBEA',
        },
        paper: {
          100: '#FBF7EC',
          200: '#F5EEDA',
          300: '#ECE2C2',
          400: '#D9CC9F',
        },
        rust: {
          500: '#B8633A',
          400: '#D17B4B',
        },
      },
      fontFamily: {
        display: ['"Barlow Semi Condensed"', 'Oswald', 'Impact', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Newsreader', '"Iowan Old Style"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      maxWidth: {
        container: '1200px',
        narrow: '760px',
      },
      boxShadow: {
        hard: '8px 8px 0 #08111F',
        'hard-sm': '6px 6px 0 #08111F',
        'hard-lg': '12px 12px 0 #08111F',
      },
      letterSpacing: {
        display: '-0.005em',
        caps: '0.06em',
        'caps-lg': '0.02em',
      },
      lineHeight: {
        display: '0.88',
      },
    },
  },
  plugins: [],
}
