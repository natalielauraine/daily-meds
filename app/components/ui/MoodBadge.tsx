// Gradient pill badge for mood categories.
// Each mood maps to the neon brand gradient palette.

import { MOOD_GRADIENTS } from "@/lib/design-tokens";

const DEFAULT_GRADIENT = "linear-gradient(135deg, #ff41b3, #ec723d)";

export default function MoodBadge({ mood, className = "" }: { mood: string; className?: string }) {
  const gradient = MOOD_GRADIENTS[mood] ?? DEFAULT_GRADIENT;

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs text-white uppercase ${className}`}
      style={{
        background: gradient,
        fontFamily: "var(--font-space-grotesk)",
        fontWeight: 700,
        letterSpacing: "0.04em",
      }}
    >
      {mood}
    </span>
  );
}
