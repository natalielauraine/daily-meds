// Shared design tokens — used across affiliate, partnerships, community, podcasts pages.
// Import these instead of re-defining C and HEADLINE in each file.

import React from "react";

export const C = {
  primary: "#ff6a9e",
  primaryCont: "#ff418e",
  secondary: "#52e32c",
  tertiary: "#ef7f4e",
  surfaceDim: "#0e0e0e",
  surfaceLow: "#131313",
  surface: "#191919",
  surfaceHigh: "#1f1f1f",
  surfaceHighest: "#262626",
  onSurfaceVar: "#ababab",
  onSurface: "#e5e5e5",
} as const;

export const HEADLINE: React.CSSProperties = {
  fontFamily: "var(--font-lexend)",
  fontWeight: 900,
  letterSpacing: "-0.05em",
  textTransform: "uppercase",
};

export const MOOD_GRADIENTS: Record<string, string> = {
  "Hungover":         "linear-gradient(135deg, #ff41b3, #ec723d)",
  "After The Sesh":   "linear-gradient(135deg, #ff41b3, #f4e71d)",
  "On A Comedown":    "linear-gradient(135deg, #adf225, #f4e71d)",
  "Feeling Empty":    "linear-gradient(135deg, #ff41b3, #ec723d)",
  "Can't Sleep":      "linear-gradient(135deg, #ff41b3, #adf225)",
  "Anxious":          "linear-gradient(135deg, #ec723d, #f4e71d)",
  "Heartbroken":      "linear-gradient(135deg, #ff41b3, #ec723d)",
  "Overwhelmed":      "linear-gradient(135deg, #ec723d, #f4e71d)",
  "Low Energy":       "linear-gradient(135deg, #adf225, #f4e71d)",
  "Morning Reset":    "linear-gradient(135deg, #ff41b3, #f4e71d)",
  "Focus Mode":       "linear-gradient(135deg, #adf225, #ec723d)",
};
