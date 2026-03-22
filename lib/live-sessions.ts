// Live session helpers — stores scheduled and currently live sessions.
// Uses localStorage for now. Will be replaced with Supabase live_sessions table
// once the DB is connected. The shape matches the Supabase schema exactly
// so swapping later requires minimal changes.

const STORAGE_KEY = "dailymeds_live_sessions";

export type LiveSession = {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;       // ISO date string
  isLive: boolean;           // true when Natalie is actively streaming
  dailyRoomName: string;     // Daily.co room name (used in the URL)
  dailyRoomUrl: string;      // Full Daily.co room URL
  type: "audio" | "video";   // Whether it's audio-only or video
  duration: string;          // e.g. "30 min"
  gradient: string;          // Mood gradient for the card
};

// Sample upcoming sessions — shown before Natalie creates real ones
const SAMPLE_SESSIONS: LiveSession[] = [
  {
    id: "live-1",
    title: "Sunday Morning Reset",
    description: "Start your Sunday gently. A 30-minute live guided meditation to ease you into the week ahead.",
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days from now
    isLive: false,
    dailyRoomName: "",
    dailyRoomUrl: "",
    type: "audio",
    duration: "30 min",
    gradient: "linear-gradient(135deg, #6B21E8 0%, #8B3CF7 25%, #6366F1 60%, #3B82F6 80%, #22D3EE 100%)",
  },
  {
    id: "live-2",
    title: "Friday Wind Down",
    description: "The week is done. Join Natalie live for a breathwork session to decompress and let it all go.",
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days from now
    isLive: false,
    dailyRoomName: "",
    dailyRoomUrl: "",
    type: "video",
    duration: "45 min",
    gradient: "linear-gradient(135deg, #F43F5E 0%, #EC4899 20%, #D946EF 35%, #F97316 65%, #EAB308 85%, #FACC15 100%)",
  },
];

// Get all live sessions from localStorage, or return sample data if empty
export function getLiveSessions(): LiveSession[] {
  if (typeof window === "undefined") return SAMPLE_SESSIONS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return SAMPLE_SESSIONS;
    return JSON.parse(stored);
  } catch {
    return SAMPLE_SESSIONS;
  }
}

// Save all sessions back to localStorage
function saveLiveSessions(sessions: LiveSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

// Create a new scheduled session (called from the admin page)
export function createLiveSession(
  title: string,
  description: string,
  scheduledAt: string,
  type: "audio" | "video",
  duration: string,
  gradient: string
): LiveSession {
  const session: LiveSession = {
    id: Date.now().toString(),
    title,
    description,
    scheduledAt,
    isLive: false,
    dailyRoomName: "",
    dailyRoomUrl: "",
    type,
    duration,
    gradient,
  };
  const all = getLiveSessions().filter((s) => !SAMPLE_SESSIONS.find((ss) => ss.id === s.id));
  all.push(session);
  saveLiveSessions(all);
  return session;
}

// Mark a session as live and attach its Daily.co room details
export function setSessionLive(
  sessionId: string,
  dailyRoomName: string,
  dailyRoomUrl: string
): void {
  const all = getLiveSessions();
  const session = all.find((s) => s.id === sessionId);
  if (!session) return;
  session.isLive = true;
  session.dailyRoomName = dailyRoomName;
  session.dailyRoomUrl = dailyRoomUrl;
  saveLiveSessions(all.filter((s) => !SAMPLE_SESSIONS.find((ss) => ss.id === s.id)));
}

// Mark a session as no longer live (ended)
export function endLiveSession(sessionId: string): void {
  const all = getLiveSessions();
  const session = all.find((s) => s.id === sessionId);
  if (!session) return;
  session.isLive = false;
  saveLiveSessions(all.filter((s) => !SAMPLE_SESSIONS.find((ss) => ss.id === s.id)));
}

// Delete a session entirely
export function deleteLiveSession(sessionId: string): void {
  const all = getLiveSessions().filter(
    (s) => s.id !== sessionId && !SAMPLE_SESSIONS.find((ss) => ss.id === s.id)
  );
  saveLiveSessions(all);
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
