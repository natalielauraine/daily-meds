"use client";

// Playlists page — shows all the user's custom playlists.
// Each playlist can be expanded to see its sessions.
// Sessions can be removed from a playlist by clicking the X button.

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  getPlaylists,
  deletePlaylist,
  removeFromPlaylist,
  createPlaylist,
  type Playlist,
} from "../../lib/playlists";

// ── MOCK SESSIONS ─────────────────────────────────────────────────────────────
// Needed to look up session details by ID. Replace with Supabase query later.
const MOCK_SESSIONS = [
  { id: "1", title: "Hungover & Overwhelmed", type: "Guided Meditation", duration: "18 min", gradient: "linear-gradient(135deg, #6B21E8 0%, #8B3CF7 25%, #6366F1 60%, #3B82F6 80%, #22D3EE 100%)" },
  { id: "2", title: "Come Down Slowly", type: "Breathwork", duration: "22 min", gradient: "linear-gradient(135deg, #10B981 0%, #22C55E 35%, #84CC16 70%, #D9F100 100%)" },
  { id: "3", title: "3am Brain", type: "Sleep Audio", duration: "14 min", gradient: "linear-gradient(135deg, #8B3CF7 0%, #6366F1 100%)" },
  { id: "4", title: "Anxiety First Aid", type: "Breathwork", duration: "8 min", gradient: "linear-gradient(135deg, #F43F5E 0%, #F97316 100%)" },
  { id: "5", title: "The Morning After", type: "Guided Meditation", duration: "12 min", gradient: "linear-gradient(135deg, #F43F5E 0%, #EC4899 20%, #D946EF 35%, #F97316 65%, #EAB308 85%, #FACC15 100%)" },
];

function getSessionById(id: string) {
  return MOCK_SESSIONS.find((s) => s.id === id);
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  // Load playlists on mount
  useEffect(() => {
    setPlaylists(getPlaylists());
  }, []);

  // Refresh the list after any mutation
  function refresh() {
    setPlaylists(getPlaylists());
  }

  function handleDelete(playlistId: string) {
    deletePlaylist(playlistId);
    if (expandedId === playlistId) setExpandedId(null);
    refresh();
  }

  function handleRemoveSession(playlistId: string, sessionId: string) {
    removeFromPlaylist(playlistId, sessionId);
    refresh();
  }

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    const p = createPlaylist(name);
    setExpandedId(p.id);
    setNewName("");
    setCreating(false);
    refresh();
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-24">

        {/* Back button */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-8">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back
        </Link>

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl text-white mb-1" style={{ fontWeight: 500 }}>Playlists</h1>
            <p className="text-sm text-white/40">{playlists.length} playlist{playlists.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            New
          </button>
        </div>

        {/* New playlist input */}
        {creating && (
          <div
            className="flex gap-2 mb-4 p-4 rounded-[10px]"
            style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.1)" }}
          >
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
              placeholder="Playlist name"
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
            />
            <button
              onClick={handleCreate}
              className="px-4 py-1.5 rounded-lg text-sm text-white"
              style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
            >
              Create
            </button>
            <button
              onClick={() => { setCreating(false); setNewName(""); }}
              className="text-white/40 hover:text-white/70 transition-colors text-sm px-2"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Empty state */}
        {playlists.length === 0 && !creating && (
          <div
            className="flex flex-col items-center justify-center py-16 rounded-[10px] text-center"
            style={{ border: "0.5px dashed rgba(255,255,255,0.1)" }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)" className="mb-3">
              <path d="M3 6h18v2H3zm0 5h12v2H3zm0 5h18v2H3z"/>
            </svg>
            <p className="text-sm text-white/30 mb-1">No playlists yet</p>
            <p className="text-xs text-white/20">Hit New to create your first one</p>
          </div>
        )}

        {/* Playlist list */}
        <div className="flex flex-col gap-3">
          {playlists.map((playlist) => {
            const isOpen = expandedId === playlist.id;
            return (
              <div
                key={playlist.id}
                className="rounded-[10px] overflow-hidden"
                style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
              >
                {/* Playlist header row */}
                <div className="flex items-center gap-3 px-4 py-4">
                  {/* Gradient icon */}
                  <div
                    className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #8B5CF6, #6366F1)" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" opacity={0.9}>
                      <path d="M3 6h18v2H3zm0 5h12v2H3zm0 5h18v2H3z"/>
                    </svg>
                  </div>

                  {/* Name + count */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate" style={{ fontWeight: 500 }}>{playlist.name}</p>
                    <p className="text-xs text-white/35">{playlist.sessionIds.length} session{playlist.sessionIds.length !== 1 ? "s" : ""}</p>
                  </div>

                  {/* Expand + Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setExpandedId(isOpen ? null : playlist.id)}
                      className="text-white/30 hover:text-white/70 transition-colors p-1.5"
                      aria-label={isOpen ? "Collapse" : "Expand"}
                    >
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
                        style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                      >
                        <path d="M7 10l5 5 5-5z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(playlist.id)}
                      className="text-white/20 hover:text-red-400 transition-colors p-1.5"
                      aria-label="Delete playlist"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded sessions list */}
                {isOpen && (
                  <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
                    {playlist.sessionIds.length === 0 ? (
                      <p className="text-xs text-white/25 text-center py-5">
                        No sessions yet — go to a session and tap &quot;Add to playlist&quot;
                      </p>
                    ) : (
                      playlist.sessionIds.map((sessionId) => {
                        const s = getSessionById(sessionId);
                        if (!s) return null;
                        return (
                          <div
                            key={sessionId}
                            className="flex items-center gap-3 px-4 py-3"
                            style={{ borderBottom: "0.5px solid rgba(255,255,255,0.04)" }}
                          >
                            {/* Session dot */}
                            <div
                              className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
                              style={{ background: s.gradient }}
                            >
                              <svg width="14" height="14" viewBox="0 0 48 48" fill="none">
                                <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.9"/>
                              </svg>
                            </div>

                            {/* Title + type */}
                            <Link
                              href={`/session/${s.id}`}
                              className="flex-1 min-w-0 hover:opacity-70 transition-opacity"
                            >
                              <p className="text-sm text-white/80 truncate" style={{ fontWeight: 500 }}>{s.title}</p>
                              <p className="text-xs text-white/30">{s.type} · {s.duration}</p>
                            </Link>

                            {/* Remove from playlist */}
                            <button
                              onClick={() => handleRemoveSession(playlist.id, sessionId)}
                              className="text-white/20 hover:text-white/60 transition-colors p-1 shrink-0"
                              aria-label="Remove from playlist"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                              </svg>
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </main>

      <Footer />
    </div>
  );
}
