/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#04070e',
          900: '#070b14',
          800: '#0c1220',
          700: '#121b2f',
        },
      },
    },
  },
  plugins: [],
}
