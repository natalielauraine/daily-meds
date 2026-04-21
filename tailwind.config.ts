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

        // ── Velvet Hour Material 3 Design System (from natallie-2.html) ───────
        "surface-variant": "#262626", 
        "surface-container-highest": "#262626", 
        "on-tertiary-fixed-variant": "#722700", 
        "secondary-dim": "#42d419", 
        "on-surface": "#e5e5e5", 
        "tertiary-fixed-dim": "#ff8c5b", 
        "surface-container-high": "#1f1f1f", 
        "surface-dim": "#0e0e0e", 
        "on-tertiary-container": "#632100", 
        "on-secondary-container": "#30bd00", 
        "surface-tint": "#ff6a9e", 
        "on-tertiary-fixed": "#3f1200", 
        "on-error": "#490013", 
        "inverse-primary": "#bb005f", 
        "surface-container": "#191919", 
        "on-primary-fixed": "#550028", 
        "on-surface-variant": "#ababab", 
        "error-dim": "#c8475d", 
        "tertiary-fixed": "#ffa17b", 
        "tertiary-container": "#ffa17b", 
        "on-secondary-fixed-variant": "#176a00", 
        "on-secondary-fixed": "#0e4a00", 
        "tertiary-dim": "#ef7f4e", 
        "inverse-on-surface": "#555555", 
        "primary-container": "#ff418e", 
        "background": "#0e0e0e", 
        "error-container": "#8a1632", 
        "outline": "#757575", 
        "inverse-surface": "#f9f9f9", 
        "on-background": "#e5e5e5", 
        "primary-fixed-dim": "#ff92b3", 
        "on-secondary": "#0e4b00", 
        "primary": "#ff6a9e", 
        "outline-variant": "#484848", 
        "error": "#fd6f85", 
        "secondary": "#52e32c", 
        "primary-dim": "#ff6a9e", 
        "primary-fixed": "#ffa8c0", 
        "surface-bright": "#2c2c2c", 
        "secondary-fixed": "#7aff55", 
        "secondary-fixed-dim": "#61f13b", 
        "secondary-container": "#052d00", 
        "on-primary-fixed-variant": "#8c0045", 
        "on-error-container": "#ff97a3", 
        "tertiary": "#ffb598", 
        "on-primary-container": "#1e000a", 
        "on-primary": "#470020", 
        "surface-container-lowest": "#000000", 
        "surface-container-low": "#131313", 
        "on-tertiary": "#732700", 
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
