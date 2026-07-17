/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        soc: {
          bg: "#0F172A",
          surface: "#1E293B",
          border: "#334155",
          critical: "#EF4444",
          warning: "#F59E0B",
          info: "#3B82F6",
          success: "#10B981",
          accent: "#06B6D4",
        },
      },
    },
  },
  plugins: [],
};
