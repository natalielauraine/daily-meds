// Playlist helpers — create, read, update and delete playlists in Supabase.
// All functions are async. Session order is stored as a text[] array in Supabase.

import { createClient } from "./supabase-browser";

export type Playlist = {
  id: string;
  name: string;
  sessionIds: string[];
  createdAt: string;
};

// Get all playlists for the currently logged-in user
export async function getPlaylists(): Promise<Playlist[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("playlists")
    .select("id, name, session_ids, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    sessionIds: row.session_ids ?? [],
    createdAt: row.created_at,
  }));
}

// Create a new empty playlist with the given name
export async function createPlaylist(name: string): Promise<Playlist | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("playlists")
    .insert({ user_id: user.id, name: name.trim(), session_ids: [] })
    .select("id, name, session_ids, created_at")
    .single();

  if (!data) return null;
  return { id: data.id, name: data.name, sessionIds: data.session_ids ?? [], createdAt: data.created_at };
}

// Add a session to a playlist — does nothing if it's already there
export async function addToPlaylist(playlistId: string, sessionId: string): Promise<void> {
  const supabase = createClient();

  // Fetch the current session_ids first so we can append
  const { data } = await supabase
    .from("playlists")
    .select("session_ids")
    .eq("id", playlistId)
    .single();

  if (!data) return;
  const ids: string[] = data.session_ids ?? [];
  if (ids.includes(sessionId)) return;

  await supabase
    .from("playlists")
    .update({ session_ids: [...ids, sessionId], updated_at: new Date().toISOString() })
    .eq("id", playlistId);
}

// Remove a session from a playlist
export async function removeFromPlaylist(playlistId: string, sessionId: string): Promise<void> {
  const supabase = createClient();

  const { data } = await supabase
    .from("playlists")
    .select("session_ids")
    .eq("id", playlistId)
    .single();

  if (!data) return;
  const ids: string[] = (data.session_ids ?? []).filter((id: string) => id !== sessionId);

  await supabase
    .from("playlists")
    .update({ session_ids: ids, updated_at: new Date().toISOString() })
    .eq("id", playlistId);
}

// Save a new session order after the user has reordered via drag and drop
export async function updatePlaylistOrder(playlistId: string, sessionIds: string[]): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("playlists")
    .update({ session_ids: sessionIds, updated_at: new Date().toISOString() })
    .eq("id", playlistId);
}

// Delete an entire playlist
export async function deletePlaylist(playlistId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("playlists").delete().eq("id", playlistId);
}

// Rename a playlist
export async function renamePlaylist(playlistId: string, name: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("playlists")
    .update({ name: name.trim(), updated_at: new Date().toISOString() })
    .eq("id", playlistId);
}
