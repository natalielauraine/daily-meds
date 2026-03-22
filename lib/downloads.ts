// Saved sessions helpers — lets users save sessions for quick access within the app.
// Sessions are only saved inside Daily Meds (localStorage for now, Supabase later).
// Nothing is ever downloaded to the user's device.

const STORAGE_KEY = "dailymeds_saved";

// Get all saved session IDs
export function getSaved(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

// Check if a session is saved
export function isSaved(sessionId: string): boolean {
  return getSaved().includes(sessionId);
}

// Save a session — does nothing if already saved. Returns true when saved.
export function saveSession(sessionId: string): boolean {
  const all = getSaved();
  if (all.includes(sessionId)) return true;
  all.push(sessionId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return true;
}

// Remove a session from saved. Returns false (no longer saved).
export function unsaveSession(sessionId: string): boolean {
  const all = getSaved().filter((id) => id !== sessionId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return false;
}

// Toggle saved state — returns the new state (true = saved, false = removed)
export function toggleSaved(sessionId: string): boolean {
  if (isSaved(sessionId)) {
    return unsaveSession(sessionId);
  } else {
    return saveSession(sessionId);
  }
}
