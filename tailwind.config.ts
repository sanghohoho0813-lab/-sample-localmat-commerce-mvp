import type { Config } from "tailwindcss";

/**
 * 본문 가독성을 위해 Tailwind 기본 fontSize 스케일을 일괄 1.2배로 재정의합니다.
 * (간격·높이는 그대로 두고 글자 크기만 키웁니다. 줄간격은 커진 글자에 맞춰 함께 확대)
 * 기준: text-sm 14px→16.8px, text-base 16px→19.2px, text-3xl 30px→36px
 */
const fontSize = {
  xs: ["0.9rem", { lineHeight: "1.5rem" }], // 12 → 14.4
  sm: ["1.05rem", { lineHeight: "1.6rem" }], // 14 → 16.8
  base: ["1.2rem", { lineHeight: "1.85rem" }], // 16 → 19.2
  lg: ["1.35rem", { lineHeight: "2.1rem" }], // 18 → 21.6
  xl: ["1.5rem", { lineHeight: "2.1rem" }], // 20 → 24
  "2xl": ["1.8rem", { lineHeight: "2.4rem" }], // 24 → 28.8
  "3xl": ["2.25rem", { lineHeight: "2.7rem" }], // 30 → 36
  "4xl": ["2.7rem", { lineHeight: "3rem" }], // 36 → 43.2
  "5xl": ["3.6rem", { lineHeight: "1.05" }], // 48 → 57.6
  "6xl": ["4.5rem", { lineHeight: "1.05" }], // 60 → 72
  "7xl": ["5.4rem", { lineHeight: "1" }], // 72 → 86.4
  "8xl": ["7.2rem", { lineHeight: "1" }],
  "9xl": ["9.6rem", { lineHeight: "1" }],
} satisfies Record<string, [string, { lineHeight: string }]>;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontSize,
      spacing: {
        // 글자 크기를 1.2배로 올리면서 버튼/입력 높이도 한 단계 넉넉하게 쓸 수 있도록 추가
        13: "3.25rem", // 52px
        15: "3.75rem", // 60px
      },
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
        // 미래에이아이랩 브랜드 컬러 (제작사 크레딧 영역 전용)
        mirae: {
          ink: "#071a22",
          deep: "#003846",
          teal: "#006b78",
          cyan: "#19c6f4",
          sky: "#1fb8ff",
          mist: "#c9d6dc",
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
