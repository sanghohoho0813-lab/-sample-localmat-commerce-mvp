import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand greens
        leaf: {
          50: "#F2F7EF",
          100: "#E3EFDD",
          200: "#C6DFBB",
          300: "#9FC78E",
          400: "#74AB60",
          500: "#4F8C3F",
          600: "#3D7231",
          700: "#335C2B",
          800: "#2B4A25",
          900: "#233D1F",
          950: "#152613",
        },
        // Warm accent orange
        tangerine: {
          50: "#FEF5EC",
          100: "#FCE8D4",
          200: "#F8CEA4",
          300: "#F3AE6C",
          400: "#EE9040",
          500: "#E67420",
          600: "#D05F14",
          700: "#AC4A13",
          800: "#8A3C16",
          900: "#703315",
        },
        // Cream / ivory surfaces
        cream: {
          50: "#FDFBF6",
          100: "#FAF6EC",
          200: "#F4EDDD",
          300: "#EBE0C8",
        },
        // Warm grays for text/borders
        bark: {
          100: "#F0EEE9",
          200: "#E3E0D8",
          300: "#CFCBC0",
          400: "#A8A399",
          500: "#7E7A70",
          600: "#5C584F",
          700: "#44413A",
          800: "#2E2C27",
          900: "#1F1E1A",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "'Helvetica Neue'",
          "'Segoe UI'",
          "'Apple SD Gothic Neo'",
          "'Noto Sans KR'",
          "'Malgun Gothic'",
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "16px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 1px 3px rgba(46, 44, 39, 0.05), 0 4px 16px rgba(46, 44, 39, 0.06)",
        lift: "0 2px 6px rgba(46, 44, 39, 0.07), 0 10px 28px rgba(46, 44, 39, 0.10)",
        header: "0 1px 0 rgba(46, 44, 39, 0.06)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(12px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "pop": {
          "0%": { transform: "scale(1)" },
          "45%": { transform: "scale(1.25)" },
          "100%": { transform: "scale(1)" },
        },
        "check-pop": {
          "0%": { transform: "scale(0.4)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "toast-in": "toast-in 0.25s ease-out both",
        pop: "pop 0.3s ease-out",
        "check-pop": "check-pop 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
