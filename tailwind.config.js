/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        midnight: {
          950: '#04070e',
          900: '#070b14',
          800: '#0c1220',
          700: '#121b2f',
        },
        editorial: {
          bg: '#fbfbf9',
          card: '#ffffff',
          dark: '#0e141a',
          subtle: '#737373',
          border: '#e5e5e0',
        },
      },
    },
  },
  plugins: [],
}
