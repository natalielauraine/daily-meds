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

export const MOOD_CATEGORIES = [
  "Everyday Moods", "Sleep", "Heavy Emotions", "Own Your Shadow",
  "Daily Practice", "Self Love & Celebration", "Crisis Emergencies",
  "Relationships", "Situationships", "Communication & Boundaries",
  "Vulnerable Stuff", "Sexual Scenarios", "Career & Work",
  "Life Moments", "Grief & Loss", "Forgiveness", "Addiction",
  "Party Recovery", "Plant Medicine", "On The Road",
  "Founder Stress", "Spirituality", "Seasonal",
  "Morning Meds", "Evening Meds",
] as const;

export const MOOD_GRADIENTS: Record<string, string> = {
  "Everyday Moods":              "linear-gradient(135deg, #ec723d, #f4e71d)",
  "Sleep":                       "linear-gradient(135deg, #7b5ea7, #ff41b3)",
  "Heavy Emotions":              "linear-gradient(135deg, #ff41b3, #ec723d)",
  "Own Your Shadow":             "linear-gradient(135deg, #1a1a2e, #ec723d)",
  "Daily Practice":              "linear-gradient(135deg, #adf225, #f4e71d)",
  "Self Love & Celebration":     "linear-gradient(135deg, #ff41b3, #f4e71d)",
  "Crisis Emergencies":          "linear-gradient(135deg, #ec723d, #ff41b3)",
  "Relationships":               "linear-gradient(135deg, #ff41b3, #f4e71d)",
  "Situationships":              "linear-gradient(135deg, #ff41b3, #adf225)",
  "Communication & Boundaries":  "linear-gradient(135deg, #f4e71d, #adf225)",
  "Vulnerable Stuff":            "linear-gradient(135deg, #ff41b3, #ec723d)",
  "Sexual Scenarios":            "linear-gradient(135deg, #ff41b3, #7b5ea7)",
  "Career & Work":               "linear-gradient(135deg, #f4e71d, #ec723d)",
  "Life Moments":                "linear-gradient(135deg, #adf225, #ff41b3)",
  "Grief & Loss":                "linear-gradient(135deg, #7b5ea7, #ff41b3)",
  "Forgiveness":                 "linear-gradient(135deg, #adf225, #f4e71d)",
  "Addiction":                   "linear-gradient(135deg, #ec723d, #ff41b3)",
  "Party Recovery":              "linear-gradient(135deg, #ff41b3, #ec723d)",
  "Plant Medicine":              "linear-gradient(135deg, #adf225, #ec723d)",
  "On The Road":                 "linear-gradient(135deg, #f4e71d, #ff41b3)",
  "Founder Stress":              "linear-gradient(135deg, #ec723d, #f4e71d)",
  "Spirituality":                "linear-gradient(135deg, #adf225, #7b5ea7)",
  "Seasonal":                    "linear-gradient(135deg, #f4e71d, #adf225)",
  "Morning Meds":                "linear-gradient(135deg, #f4e71d, #ec723d)",
  "Evening Meds":                "linear-gradient(135deg, #7b5ea7, #1a1a2e)",
  // Old categories (kept for backward compat during transition)
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
  "Friendships":      "linear-gradient(135deg, #adf225, #ff41b3)",
  "Family":           "linear-gradient(135deg, #ec723d, #ff41b3)",
  "Work":             "linear-gradient(135deg, #f4e71d, #ec723d)",
};
