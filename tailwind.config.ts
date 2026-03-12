import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // OGQ Primary — 그린 계열 (메인 브랜드 컬러)
        primary: {
          "010": "#f5fdfb",
          50: "#dff4ea",
          "080": "#cbecdf",
          100: "#b5e5d7",
          200: "#9bdfcc",
          300: "#71dec1",
          400: "#58dab1",
          500: "#32d29d", // ★ 핵심 Primary. CTA·강조
          600: "#00c389",
          700: "#00b57f",
          800: "#00996e",
          900: "#007a58",
          950: "#006147",
        },
        // OGQ Secondary — 퍼플 계열
        secondary: {
          "010": "#fbfbfe",
          "030": "#f8f6fe",
          50: "#ebe8fc",
          "080": "#e0dafb",
          100: "#d2cbf9",
          200: "#bfb0f2",
          300: "#a793ec",
          400: "#947be5",
          500: "#7e5ae2", // ★ 핵심 Secondary
          600: "#703fe4",
          700: "#5b1dcd",
          800: "#4917a6",
          900: "#37117e",
          950: "#290d5e",
        },
        // OGQ Mono — 그레이스케일
        mono: {
          0: "#FFFFFF",
          "010": "#fcfdfd",
          "030": "#f9fbfb",
          50: "#f4f6f6",
          "080": "#eef1f1",
          100: "#d8cfdf",
          200: "#a7b6b9",
          300: "#89989c",
          400: "#7d8d92",
          500: "#76888f",
          600: "#6c7e84",
          700: "#57767b",
          800: "#425052",
          900: "#262d2e",
          950: "#040606",
        },
        // OGQ Accent Red
        red: {
          "030": "#ffeeef",
          50: "#ffe2e4",
          100: "#ffd0d3",
          200: "#e33861",
          300: "#e21235", // ★ 에러 / 위험 / 삭제
        },
        // OGQ Accent Blue
        blue: {
          "030": "#f0f8ff",
          50: "#d9ecfe",
          100: "#a4d9ff",
          200: "#75c2fa",
          300: "#1384d7", // ★ 정보 / 링크
          400: "#3b7cf3",
        },
        // 기능적 액센트 (OGQ 공식 스펙 외 — UI 상태용)
        accent: {
          red: "#e21235",
          green: "#32d29d",
          orange: "#FFA94D",
          yellow: "#FFD43B",
          cyan: "#22B8CF",
          pink: "#F06595",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
