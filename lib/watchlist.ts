// Watchlist helpers — save and retrieve sessions the user has hearted.
// Uses localStorage for now. Will be replaced with Supabase watchlist table later.

const STORAGE_KEY = "dailymeds_watchlist";

// Get the full list of saved session IDs from localStorage
export function getWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

// Check if a specific session is in the watchlist
export function isInWatchlist(sessionId: string): boolean {
  return getWatchlist().includes(sessionId);
}

// Add or remove a session from the watchlist — returns true if now saved, false if removed
export function toggleWatchlist(sessionId: string): boolean {
  const list = getWatchlist();
  const index = list.indexOf(sessionId);

  if (index > -1) {
    // Already saved — remove it
    list.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return false;
  } else {
    // Not saved — add it
    list.push(sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  }
}
