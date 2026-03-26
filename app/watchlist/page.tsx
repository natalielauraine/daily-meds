"use client";

// Saved sessions page — shows sessions the user has bookmarked.
// Reads from the Supabase `watchlist` table (user_id, session_id, created_at)
// joined with the sessions table for full session details.

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase-browser";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Shape of a session row returned from the joined query
type WatchlistSession = {
  watchlist_id: string;
  session_id: string;
  title: string;
  type: string;
  duration: string;
  mood_category: string;
  gradient: string;
  is_free: boolean;
};

export default function SavedPage() {
  const supabase = createClient();

  const [sessions, setSessions] = useState<WatchlistSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch the user's saved sessions from Supabase on mount
  useEffect(() => {
    async function loadWatchlist() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Join watchlist with sessions to get full session details in one query
      const { data } = await supabase
        .from("watchlist")
        .select("id, session_id, sessions(title, type, duration, mood_category, gradient, is_free)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        // Flatten the nested sessions object into a flat array
        const flat: WatchlistSession[] = data
          .filter((row) => row.sessions)
          .map((row) => {
            const s = row.sessions as unknown as {
              title: string; type: string; duration: string;
              mood_category: string; gradient: string; is_free: boolean;
            };
            return {
              watchlist_id: row.id,
              session_id: row.session_id,
              title: s.title,
              type: s.type,
              duration: s.duration,
              mood_category: s.mood_category,
              gradient: s.gradient,
              is_free: s.is_free,
            };
          });
        setSessions(flat);
      }
      setLoading(false);
    }

    loadWatchlist();
  }, []);

  // Remove a session from the watchlist — deletes the row from Supabase
  async function handleUnsave(watchlistId: string) {
    // Optimistically remove from UI first so it feels instant
    setSessions((prev) => prev.filter((s) => s.watchlist_id !== watchlistId));
    await supabase.from("watchlist").delete().eq("id", watchlistId);
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-24">

        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back
        </Link>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl text-white mb-1" style={{ fontWeight: 500 }}>Saved</h1>
          <p className="text-sm text-white/40">
            {loading ? "Loading…" : `${sessions.length} session${sessions.length !== 1 ? "s" : ""} saved`}
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-[10px] animate-pulse"
                style={{ backgroundColor: "#1A1A2E" }}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && sessions.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16 rounded-[10px] text-center"
            style={{ border: "0.5px dashed rgba(255,255,255,0.1)" }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" className="mb-3">
              <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
            </svg>
            <p className="text-sm text-white/30 mb-1">Nothing saved yet</p>
            <p className="text-xs text-white/20">Tap the bookmark on any session to save it here</p>
          </div>
        )}

        {/* Saved sessions list */}
        {!loading && sessions.length > 0 && (
          <div className="flex flex-col gap-3">
            {sessions.map((session) => (
              <div
                key={session.watchlist_id}
                className="flex items-center gap-4 p-4 rounded-[10px]"
                style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
              >
                {/* Gradient icon */}
                <Link href={`/session/${session.session_id}`} className="shrink-0">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: session.gradient || "linear-gradient(135deg, #8B5CF6, #6366F1)" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                      <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.9"/>
                    </svg>
                  </div>
                </Link>

                {/* Session info */}
                <Link href={`/session/${session.session_id}`} className="flex-1 min-w-0 hover:opacity-70 transition-opacity">
                  <p className="text-sm text-white truncate" style={{ fontWeight: 500 }}>{session.title}</p>
                  <p className="text-xs text-white/35 mt-0.5">{session.type} · {session.duration}</p>
                  <p className="text-xs text-white/25 mt-0.5">{session.mood_category}</p>
                </Link>

                {/* Free badge + remove button */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {session.is_free && (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: "rgba(16,185,129,0.8)", fontWeight: 500 }}
                    >
                      FREE
                    </span>
                  )}
                  <button
                    onClick={() => handleUnsave(session.watchlist_id)}
                    className="text-white/25 hover:text-white/60 transition-colors"
                    aria-label="Remove from saved"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
