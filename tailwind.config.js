/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Event palette — tweak freely for your project
        sand: {
          50: "#faf8f3",
          100: "#f1ecdf",
        },
        night: {
          800: "#13151c",
          900: "#0b0d12",
          950: "#050507",
        },
        // Track 4 — Decision Intelligence accent
        accent: {
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
        },
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        glow: "glow 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
