// Gradient pill badge for mood categories.
// Each mood maps to the neon brand gradient palette.

const MOOD_GRADIENTS: Record<string, string> = {
  "Hungover":        "linear-gradient(135deg, #ff41b3, #ec723d)",
  "After The Sesh":  "linear-gradient(135deg, #ff41b3, #f4e71d)",
  "On A Comedown":   "linear-gradient(135deg, #adf225, #f4e71d)",
  "Feeling Empty":   "linear-gradient(135deg, #ff41b3, #ec723d)",
  "Can't Sleep":     "linear-gradient(135deg, #ff41b3, #adf225)",
  "Anxious":         "linear-gradient(135deg, #ec723d, #f4e71d)",
  "Heartbroken":     "linear-gradient(135deg, #ff41b3, #ec723d)",
  "Overwhelmed":     "linear-gradient(135deg, #ec723d, #f4e71d)",
  "Low Energy":      "linear-gradient(135deg, #adf225, #f4e71d)",
  "Morning Reset":   "linear-gradient(135deg, #ff41b3, #f4e71d)",
  "Focus Mode":      "linear-gradient(135deg, #adf225, #ec723d)",
};

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
