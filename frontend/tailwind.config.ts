import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: [
          "var(--font-noto-serif-kr)",
          "Noto Serif KR",
          "Georgia",
          "serif",
        ],
        ui: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Apple SD Gothic Neo",
          "Pretendard",
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "12px",
        base: "8px",
      },
    },
  },
  plugins: [],
} satisfies Config;
