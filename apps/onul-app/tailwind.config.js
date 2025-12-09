/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // 포인트 컬러
        primary: {
          DEFAULT: "#67c0a1",
          50: "#f0fdf6",
          100: "#dcfce9",
          200: "#bbf7d4",
          300: "#86efb4",
          400: "#67c0a1",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        // 무채색 화이트 계열
        background: "#FFFFFF",
        surface: "#F9FAFB",
        border: "#E5E7EB",
        muted: "#6B7280",
        foreground: "#111827",
      },
    },
  },
  plugins: [],
};
