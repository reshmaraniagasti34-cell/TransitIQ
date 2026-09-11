/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070c1a',
          900: '#0b1329',
          850: '#111c38',
          800: '#19284d',
          700: '#233766',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
        },
        accent: {
          orange: '#f97316',
          amber: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
}
