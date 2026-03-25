// Types and helpers for the Challenges feature.

export type Challenge = {
  id: string;
  title: string;
  description: string | null;
  challenge_type: "sessions" | "days" | "minutes" | "mood";
  target_value: number;
  duration_days: number;
  is_official: boolean;
  is_public: boolean;
  created_by: string | null;
  gradient: string | null;
  created_at: string;
};

export type ChallengeParticipant = {
  id: string;
  challenge_id: string;
  user_id: string;
  display_name: string;
  progress_value: number;
  completed: boolean;
  started_at: string;
  completed_at: string | null;
};

// Gradient per challenge type — used when a challenge has no custom gradient
export const TYPE_GRADIENTS: Record<string, string> = {
  days:     "linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%)",
  sessions: "linear-gradient(135deg, #F43F5E 0%, #F97316 100%)",
  minutes:  "linear-gradient(135deg, #22D3EE 0%, #6366F1 100%)",
  mood:     "linear-gradient(135deg, #10B981 0%, #22C55E 50%, #84CC16 100%)",
};

// Icon per challenge type
export const TYPE_ICONS: Record<string, string> = {
  days: "🔥",
  sessions: "🎯",
  minutes: "⏱️",
  mood: "🌈",
};

// Label per challenge type for display
export const TYPE_LABELS: Record<string, string> = {
  days:     "Day streak",
  sessions: "Sessions",
  minutes:  "Minutes",
  mood:     "Mood categories",
};

// Returns the gradient to use for a challenge
export function challengeGradient(challenge: Challenge): string {
  return challenge.gradient ?? TYPE_GRADIENTS[challenge.challenge_type] ?? TYPE_GRADIENTS.sessions;
}

// Returns days remaining in a challenge from when the user joined
export function daysRemaining(startedAt: string, durationDays: number): number {
  const endMs = new Date(startedAt).getTime() + durationDays * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((endMs - Date.now()) / (24 * 60 * 60 * 1000)));
}

// Returns progress as a 0–100 percentage
export function progressPercent(current: number, target: number): number {
  return Math.min(100, Math.round((current / target) * 100));
}

// Formats "3 / 7 sessions", "12 / 30 days" etc
export function progressLabel(challenge: Challenge, current: number): string {
  const label = TYPE_LABELS[challenge.challenge_type] ?? "progress";
  return `${current} / ${challenge.target_value} ${label.toLowerCase()}`;
}
