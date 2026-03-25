// Types and helpers for the Crew feature.
// A Crew is a private group of friends who meditate together
// and can see each other's activity — but never what they listened to.

export type Crew = {
  id: string;
  name: string;
  invite_code: string;
  created_by: string | null;
  created_at: string;
};

export type CrewMember = {
  id: string;
  crew_id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  role: "admin" | "member";
  joined_at: string;
};

export type CrewActivity = {
  id: string;
  crew_id: string;
  user_id: string;
  display_name: string;
  // Types: "joined" | "completed" | "streak"
  // Never stores session titles — only activity type and optional numbers
  activity_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

// Generates a random 8-character invite code (e.g. "A3K9X2MQ")
export function generateCrewCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// Turns an activity record into a human-readable string.
// IMPORTANT: never mentions the session title — only activity type.
export function formatActivity(activity: CrewActivity): string {
  switch (activity.activity_type) {
    case "completed":
      return `${activity.display_name} completed a meditation`;
    case "streak":
      return `${activity.display_name} hit a ${activity.metadata?.streak ?? ""}‑day streak`;
    case "joined":
      return `${activity.display_name} joined the crew`;
    default:
      return `${activity.display_name} was active`;
  }
}

// Formats a timestamp as "just now", "5m ago", "2h ago", "3d ago"
export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
