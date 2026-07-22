/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ['"Plus Jakarta Sans"', "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,23,42,0.04), 0 10px 30px -12px rgba(15,23,42,0.15)",
        "soft-lg": "0 2px 6px rgba(15,23,42,0.05), 0 28px 60px -20px rgba(15,23,42,0.25)",
        "soft-dark": "0 1px 2px rgba(0,0,0,0.3), 0 18px 40px -18px rgba(0,0,0,0.6)",
      },
      keyframes: {
        blob: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -30px) scale(1.08)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.94)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        blob: "blob 20s ease-in-out infinite",
        "blob-slow": "blob 28s ease-in-out infinite",
        float: "float 8s ease-in-out infinite",
        shimmer: "shimmer 1.8s infinite",
      },
    },
  },
  plugins: [],
};
