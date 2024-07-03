/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/index.html",
    "./scripts/weather.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        'varela': ['Varela Round', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

