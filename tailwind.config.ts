import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Surfaces (dark cinematic layers) ──────────────────────────────────
        "site-bg":        "#131313",   // page background
        "surface":        "#131313",   // base layer
        "surface-low":    "#1B1B1B",   // section separator bg
        "card-bg":        "#1F1F1F",   // primary cards / panels
        "card-high":      "#2A2A2A",   // elevated cards
        "card-highest":   "#353535",   // hover / active state
        "surface-bright": "#393939",   // floating / glass elements

        // ── Text ──────────────────────────────────────────────────────────────
        "text-primary": "#E2E2E2",
        "text-muted":   "rgba(255,255,255,0.5)",

        // ── Brand Accent Colours (neon — confirmed from brand folder) ─────────
        "neon-pink":   "#ff41b3",   // primary CTA, highlights, wordmark
        "neon-green":  "#adf225",   // secondary accent, progress, icons
        "neon-yellow": "#f4e71d",   // tags, energy, warmth
        "neon-orange": "#ec723d",   // warm accent, session cards, wordmark

        // ── Legacy ────────────────────────────────────────────────────────────
        "logo-bg": "#010101",
      },

      fontFamily: {
        // Plus Jakarta Sans — headlines & display (weight 800, uppercase)
        headline: ["var(--font-plus-jakarta)", "sans-serif"],
        // Space Grotesk — labels, metadata, stats, timestamps
        label:    ["var(--font-space-grotesk)", "sans-serif"],
        // Inter — body copy and descriptions
        sans:     ["var(--font-inter)", "sans-serif"],
      },

      borderRadius: {
        card: "12px",
      },

      keyframes: {
        // Breathing animation — used on the Re-Center breathing tool
        breath: {
          "0%, 100%": { transform: "scale(1)",    opacity: "1" },
          "50%":       { transform: "scale(0.85)", opacity: "0.5" },
        },
        // Emoji floats up and fades — used by EmojiReactionToast
        floatUp: {
          "0%":   { opacity: "1", transform: "translateY(0) scale(1)" },
          "60%":  { opacity: "1", transform: "translateY(-80px) scale(1.2)" },
          "100%": { opacity: "0", transform: "translateY(-160px) scale(0.8)" },
        },
        // Neon glow pulse on primary buttons
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 12px rgba(255,65,179,0.4)" },
          "50%":       { boxShadow: "0 0 28px rgba(255,65,179,0.7)" },
        },
      },

      animation: {
        "breath":     "breath 8s ease-in-out infinite",
        "float-up":   "floatUp 2.5s ease-out forwards",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
