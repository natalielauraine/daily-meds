// Live session helpers — reads and writes live sessions to Supabase.
// All functions are async because they talk to the database.
// Used by the admin live page to schedule sessions and go live.
// The /api/email/live-reminder cron reads from the same live_sessions table.

import { createClient } from "./supabase-browser";

export type LiveSession = {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;       // ISO date string (maps to scheduled_at in DB)
  isLive: boolean;           // true when Natalie is actively streaming (maps to is_live)
  dailyRoomName: string;     // Daily.co room name (maps to daily_room_name)
  dailyRoomUrl: string;      // Full Daily.co room URL (maps to daily_room_url)
  vimeoLiveUrl: string;      // Optional Vimeo live stream URL (maps to vimeo_live_url)
  type: "audio" | "video";
  duration: string;          // e.g. "30 min"
  gradient: string;          // Mood gradient for the card
};

// Convert a Supabase row (snake_case columns) to our LiveSession type (camelCase)
function rowToSession(row: Record<string, unknown>): LiveSession {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) || "",
    scheduledAt: row.scheduled_at as string,
    isLive: (row.is_live as boolean) || false,
    dailyRoomName: (row.daily_room_name as string) || "",
    dailyRoomUrl: (row.daily_room_url as string) || "",
    vimeoLiveUrl: (row.vimeo_live_url as string) || "",
    type: (row.type as "audio" | "video") || "audio",
    duration: (row.duration as string) || "30 min",
    gradient: (row.gradient as string) || "linear-gradient(135deg, #6B21E8 0%, #22D3EE 100%)",
  };
}

// Get all live sessions from Supabase, ordered by scheduled date
export async function getLiveSessions(): Promise<LiveSession[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("live_sessions")
    .select("*")
    .order("scheduled_at", { ascending: true });

  if (error || !data) return [];
  return data.map(rowToSession);
}

// Create a new scheduled session in Supabase
export async function createLiveSession(
  title: string,
  description: string,
  scheduledAt: string,
  type: "audio" | "video",
  duration: string,
  gradient: string
): Promise<void> {
  const supabase = createClient();
  await supabase.from("live_sessions").insert({
    title,
    description,
    scheduled_at: scheduledAt,
    is_live: false,
    daily_room_name: "",
    daily_room_url: "",
    vimeo_live_url: "",
    type,
    duration,
    gradient,
  });
}

// Mark a session as live and attach its Daily.co room details
export async function setSessionLive(
  sessionId: string,
  dailyRoomName: string,
  dailyRoomUrl: string
): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("live_sessions")
    .update({ is_live: true, daily_room_name: dailyRoomName, daily_room_url: dailyRoomUrl })
    .eq("id", sessionId);
}

// Mark a session as no longer live (ended)
export async function endLiveSession(sessionId: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("live_sessions")
    .update({ is_live: false })
    .eq("id", sessionId);
}

// Delete a session entirely
export async function deleteLiveSession(sessionId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("live_sessions").delete().eq("id", sessionId);
}

// Format a date string into a friendly display like "Tue 25 Mar · 10:00am"
export function formatSessionDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }) + " · " + date.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });
}
