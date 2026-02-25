/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // OLD LIGHT THEME COLORS (keep if you want)
        "lms-cream": "#F9F7F7",
        "lms-light-blue": "#DBE2EF",
        "lms-blue": "#3F72AF",
        "lms-dark-blue": "#112D4E",

        // ✅ NEW DARK THEME PALETTE (ColorHunt)
        "dark-bg": "#222831",
        "dark-card": "#393E46",
        "dark-muted": "#948979",
        "dark-accent": "#DFD0B8",
      },
    },
  },
  plugins: [],
};