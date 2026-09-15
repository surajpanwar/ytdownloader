import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0f0f0f",
        surface: "#171717",
        raised: "#1d1d22",
        edge: "#26262b",
        accent: {
          DEFAULT: "#3b82f6",
          bright: "#60a5fa",
        },
        muted: "#9b9ba3",
        success: "#22c55e",
        danger: "#ef4444",
      },
      boxShadow: {
        glow: "0 0 20px rgba(59,130,246,0.45), 0 0 60px rgba(59,130,246,0.18)",
        "glow-sm": "0 0 14px rgba(59,130,246,0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%,100%": { boxShadow: "0 0 16px rgba(59,130,246,0.28)" },
          "50%": { boxShadow: "0 0 30px rgba(59,130,246,0.55)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-glow": "pulse-glow 2.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;