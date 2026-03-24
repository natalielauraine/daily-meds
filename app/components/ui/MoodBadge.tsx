// Gradient pill badge for mood categories.
// Each mood maps to one of the three brand gradient families.

const MOOD_GRADIENTS: Record<string, string> = {
  "Hungover":        "linear-gradient(135deg, #6B21E8, #22D3EE)",
  "After The Sesh":  "linear-gradient(135deg, #F43F5E, #FACC15)",
  "On A Comedown":   "linear-gradient(135deg, #10B981, #D9F100)",
  "Feeling Empty":   "linear-gradient(135deg, #6B21E8, #22D3EE)",
  "Can't Sleep":     "linear-gradient(135deg, #8B3CF7, #6366F1)",
  "Anxious":         "linear-gradient(135deg, #F43F5E, #F97316)",
  "Heartbroken":     "linear-gradient(135deg, #EC4899, #D946EF)",
  "Overwhelmed":     "linear-gradient(135deg, #F97316, #FACC15)",
  "Low Energy":      "linear-gradient(135deg, #10B981, #22C55E)",
  "Morning Reset":   "linear-gradient(135deg, #F43F5E, #FACC15)",
  "Focus Mode":      "linear-gradient(135deg, #6B21E8, #6366F1)",
};

// Fall back to purple/blue if the mood isn't in the list
const DEFAULT_GRADIENT = "linear-gradient(135deg, #6B21E8, #22D3EE)";

export default function MoodBadge({ mood, className = "" }: { mood: string; className?: string }) {
  const gradient = MOOD_GRADIENTS[mood] ?? DEFAULT_GRADIENT;

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs text-white ${className}`}
      style={{ background: gradient, fontWeight: 500 }}
    >
      {mood}
    </span>
  );
}
