import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        "site-bg": "#0D0D1A",
        "card-bg": "#1A1A2E",
        "logo-bg": "#000000",

        // Text
        "text-primary": "#F0F0F0",
        "text-muted": "rgba(255,255,255,0.5)",

        // Purple / Blue family (Calm, Sleep, Focus)
        "purple-deep": "#6B21E8",
        "purple-mid": "#8B3CF7",
        "purple-accent": "#8B5CF6",
        "indigo-blue": "#6366F1",
        "bright-blue": "#3B82F6",
        "cyan-blue": "#22D3EE",

        // Pink / Orange / Yellow family (Energy, Morning, After The Sesh)
        "hot-pink": "#F43F5E",
        "deep-pink": "#EC4899",
        "magenta": "#D946EF",
        "orange": "#F97316",
        "golden-yellow": "#EAB308",
        "bright-yellow": "#FACC15",

        // Green / Lime family (Nature, Grounding, Comedown)
        "teal-green": "#10B981",
        "mid-green": "#22C55E",
        "lime-green": "#84CC16",
        "yellow-lime": "#D9F100",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        card: "10px",
      },
      keyframes: {
        // Used by EmojiReactionToast — emoji floats upward and fades out
        floatUp: {
          "0%":   { opacity: "1", transform: "translateY(0) scale(1)" },
          "60%":  { opacity: "1", transform: "translateY(-80px) scale(1.2)" },
          "100%": { opacity: "0", transform: "translateY(-160px) scale(0.8)" },
        },
      },
      animation: {
        "float-up": "floatUp 2.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
