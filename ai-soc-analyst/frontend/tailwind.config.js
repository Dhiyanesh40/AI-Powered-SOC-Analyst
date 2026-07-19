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
          bg: "#0B1220",
          surface: "#172033",
          border: "rgba(255,255,255,0.05)",
          primary: "#2563EB",
          accent: "#06B6D4",
          success: "#10B981",
          warning: "#F59E0B",
          critical: "#EF4444",
        },
      },
    },
  },
  plugins: [],
};
