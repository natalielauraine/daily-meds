// Playlist helpers — create, read, update and delete playlists in localStorage.
// Will be replaced with Supabase playlists table when real content is uploaded.

const STORAGE_KEY = "dailymeds_playlists";

export type Playlist = {
  id: string;
  name: string;
  sessionIds: string[];
  createdAt: string;
};

// Get all playlists
export function getPlaylists(): Playlist[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

// Save all playlists back to localStorage
function savePlaylists(playlists: Playlist[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
}

// Create a new playlist with a given name
export function createPlaylist(name: string): Playlist {
  const playlist: Playlist = {
    id: Date.now().toString(),
    name: name.trim(),
    sessionIds: [],
    createdAt: new Date().toISOString(),
  };
  const all = getPlaylists();
  all.push(playlist);
  savePlaylists(all);
  return playlist;
}

// Add a session to a playlist — does nothing if already in it
export function addToPlaylist(playlistId: string, sessionId: string) {
  const all = getPlaylists();
  const playlist = all.find((p) => p.id === playlistId);
  if (!playlist) return;
  if (!playlist.sessionIds.includes(sessionId)) {
    playlist.sessionIds.push(sessionId);
    savePlaylists(all);
  }
}

// Remove a session from a playlist
export function removeFromPlaylist(playlistId: string, sessionId: string) {
  const all = getPlaylists();
  const playlist = all.find((p) => p.id === playlistId);
  if (!playlist) return;
  playlist.sessionIds = playlist.sessionIds.filter((id) => id !== sessionId);
  savePlaylists(all);
}

// Delete an entire playlist
export function deletePlaylist(playlistId: string) {
  const all = getPlaylists().filter((p) => p.id !== playlistId);
  savePlaylists(all);
}

// Check if a session is in a specific playlist
export function isInPlaylist(playlistId: string, sessionId: string): boolean {
  const playlist = getPlaylists().find((p) => p.id === playlistId);
  return playlist?.sessionIds.includes(sessionId) ?? false;
}

// Get all playlist IDs that contain a given session
export function getPlaylistsForSession(sessionId: string): string[] {
  return getPlaylists()
    .filter((p) => p.sessionIds.includes(sessionId))
    .map((p) => p.id);
}
