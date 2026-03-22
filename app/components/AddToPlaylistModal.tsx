"use client";

// Modal that lets the user add a session to one of their playlists or create a new one.
// Appears when the user taps "Add to playlist" on a session page or session card.
// All playlist data is stored in Supabase.

import { useState, useEffect } from "react";
import {
  getPlaylists,
  createPlaylist,
  addToPlaylist,
  removeFromPlaylist,
  type Playlist,
} from "../../lib/playlists";

type Props = {
  sessionId: string;    // The session being added
  onClose: () => void;  // Called when the modal should close
};

export default function AddToPlaylistModal({ sessionId, onClose }: Props) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState<string | null>(null); // playlistId currently being toggled

  // Load playlists from Supabase when the modal opens
  useEffect(() => {
    getPlaylists().then((data) => {
      setPlaylists(data);
      setLoading(false);
    });
  }, []);

  // Toggle the session in/out of a playlist, then refresh the list
  async function handleToggle(playlistId: string) {
    setSaving(playlistId);
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist) return;

    if (playlist.sessionIds.includes(sessionId)) {
      await removeFromPlaylist(playlistId, sessionId);
    } else {
      await addToPlaylist(playlistId, sessionId);
    }

    // Refresh from Supabase to show the updated state
    const updated = await getPlaylists();
    setPlaylists(updated);
    setSaving(null);
  }

  // Create a new playlist and immediately add this session to it
  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;

    const playlist = await createPlaylist(name);
    if (playlist) {
      await addToPlaylist(playlist.id, sessionId);
    }

    const updated = await getPlaylists();
    setPlaylists(updated);
    setNewName("");
    setCreating(false);
  }

  return (
    // Backdrop — click outside to close
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      {/* Modal panel — stop click bubbling so clicking inside doesn't close */}
      <div
        className="w-full sm:w-96 rounded-t-2xl sm:rounded-2xl p-6"
        style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white text-base" style={{ fontWeight: 500 }}>Add to playlist</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-purple-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Existing playlists */}
            <div className="flex flex-col gap-2 mb-4 max-h-64 overflow-y-auto">
              {playlists.length === 0 && !creating && (
                <p className="text-sm text-white/30 text-center py-4">No playlists yet. Create one below.</p>
              )}
              {playlists.map((p) => {
                const included = p.sessionIds.includes(sessionId);
                const isSaving = saving === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleToggle(p.id)}
                    disabled={isSaving}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-[10px] text-left transition-colors hover:bg-white/[0.04] disabled:opacity-60"
                    style={{ border: "0.5px solid rgba(255,255,255,0.07)" }}
                  >
                    {/* Checkbox */}
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors"
                      style={{
                        backgroundColor: included ? "#8B5CF6" : "transparent",
                        border: included ? "none" : "1.5px solid rgba(255,255,255,0.25)",
                      }}
                    >
                      {included && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-white/80 flex-1">{p.name}</span>
                    <span className="text-xs text-white/25">{p.sessionIds.length} sessions</span>
                  </button>
                );
              })}
            </div>

            {/* Create new playlist */}
            {creating ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
                  placeholder="Playlist name"
                  className="flex-1 rounded-lg px-3 py-2 text-sm text-white outline-none"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.07)",
                    border: "0.5px solid rgba(255,255,255,0.15)",
                  }}
                />
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 rounded-lg text-sm text-white transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
                >
                  Create
                </button>
                <button
                  onClick={() => setCreating(false)}
                  className="px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="flex items-center gap-2 w-full px-4 py-3 rounded-[10px] text-sm text-white/50 hover:text-white transition-colors"
                style={{ border: "0.5px dashed rgba(255,255,255,0.15)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                New playlist
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
