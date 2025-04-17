/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "all",
  content: ["./src/**/*.{rs,html,css}", "./dist/**/*.html"],
  theme: {
    extend: {
      maxWidth: {
        '6xl': '72rem',
      },
    },
  },
  plugins: [],
};
