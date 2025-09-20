/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 600:'#0c6cf3', 500:'#2f87ff', 400:'#5ea5ff' },
        gold: { 500:'#d4b559' },
        dark: '#0b1220',
      },
      boxShadow:{ xlsoft:'0 25px 50px -12px rgba(0,0,0,.35)' },
    },
  },
  plugins: [],
}
