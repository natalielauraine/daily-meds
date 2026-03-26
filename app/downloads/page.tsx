"use client";

// Downloads page — shows sessions the logged-in user has downloaded for offline use.
// Protected: redirects to login if not signed in.
// Reads from the Supabase `downloads` table (user_id, session_id, downloaded_at)
// joined with sessions for full session details.

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase-browser";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Shape of a downloaded session row after flattening the join
type DownloadedSession = {
  download_id: string;
  session_id: string;
  downloaded_at: string;
  title: string;
  type: string;
  duration: string;
  mood_category: string;
  gradient: string;
  is_free: boolean;
  media_type: string;
};

// Gradient map for mood categories
const MOOD_GRADIENTS: Record<string, string> = {
  Hungover:         "linear-gradient(135deg, #6B21E8, #22D3EE)",
  "After The Sesh": "linear-gradient(135deg, #F43F5E, #FACC15)",
  "On A Comedown":  "linear-gradient(135deg, #10B981, #D9F100)",
  "Feeling Empty":  "linear-gradient(135deg, #6B21E8, #22D3EE)",
  "Can't Sleep":    "linear-gradient(135deg, #8B3CF7, #6366F1)",
  Anxious:          "linear-gradient(135deg, #F43F5E, #F97316)",
  Heartbroken:      "linear-gradient(135deg, #EC4899, #D946EF)",
  Overwhelmed:      "linear-gradient(135deg, #F97316, #FACC15)",
  "Low Energy":     "linear-gradient(135deg, #10B981, #22C55E)",
  "Morning Reset":  "linear-gradient(135deg, #F43F5E, #FACC15)",
  "Focus Mode":     "linear-gradient(135deg, #6B21E8, #6366F1)",
};

// Format a date string into a readable label like "Today", "Yesterday", or "12 Mar 2026"
function formatDownloadDate(dateStr: string): string {
  const date   = new Date(dateStr);
  const today  = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString())     return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function DownloadsPage() {
  const supabase = createClient();
  const router   = useRouter();

  const [downloads, setDownloads] = useState<DownloadedSession[]>([]);
  const [loading, setLoading]     = useState(true);

  // Fetch the user's downloads from Supabase on mount
  useEffect(() => {
    async function loadDownloads() {
      const { data: { user } } = await supabase.auth.getUser();

      // Redirect to login if not signed in
      if (!user) {
        router.push("/login?next=/downloads");
        return;
      }

      // Join downloads with sessions to get full session details
      const { data } = await supabase
        .from("downloads")
        .select("id, session_id, downloaded_at, sessions(title, type, duration, mood_category, gradient, is_free, media_type)")
        .eq("user_id", user.id)
        .order("downloaded_at", { ascending: false });

      if (data) {
        const flat: DownloadedSession[] = data
          .filter((row) => row.sessions)
          .map((row) => {
            const s = row.sessions as unknown as {
              title: string; type: string; duration: string; mood_category: string;
              gradient: string; is_free: boolean; media_type: string;
            };
            return {
              download_id: row.id,
              session_id:  row.session_id,
              downloaded_at: row.downloaded_at,
              title:       s.title,
              type:        s.type,
              duration:    s.duration,
              mood_category: s.mood_category,
              gradient:    s.gradient,
              is_free:     s.is_free,
              media_type:  s.media_type,
            };
          });
        setDownloads(flat);
      }
      setLoading(false);
    }

    loadDownloads();
  }, []);

  // Remove a session from downloads — deletes the row from Supabase
  async function handleRemove(downloadId: string) {
    // Optimistically remove from UI first so it feels instant
    setDownloads((prev) => prev.filter((d) => d.download_id !== downloadId));
    await supabase.from("downloads").delete().eq("id", downloadId);
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-24">

        {/* Back button */}
        <Link
          href="/library"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to library
        </Link>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl text-white mb-1" style={{ fontWeight: 500 }}>Downloads</h1>
          <p className="text-sm text-white/40">
            {loading
              ? "Loading…"
              : `${downloads.length} session${downloads.length !== 1 ? "s" : ""} downloaded`}
          </p>
        </div>

        {/* Info note — annual/lifetime feature */}
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-[10px] mb-6"
          style={{ backgroundColor: "rgba(139,92,246,0.08)", border: "0.5px solid rgba(139,92,246,0.2)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#8B5CF6" className="shrink-0 mt-0.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <p className="text-xs text-white/40 leading-relaxed">
            Downloads are available on Annual and Lifetime plans. Sessions are saved to your device for offline listening.
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
        {!loading && downloads.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16 rounded-[10px] text-center"
            style={{ border: "0.5px dashed rgba(255,255,255,0.1)" }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" className="mb-3">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            <p className="text-sm text-white/30 mb-1">No downloads yet</p>
            <p className="text-xs text-white/20 mb-5">
              Open any session and tap the download icon to save it for offline use
            </p>
            <Link
              href="/library"
              className="text-xs px-4 py-2 rounded-md text-white transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#8B5CF6" }}
            >
              Browse library
            </Link>
          </div>
        )}

        {/* Downloaded sessions list */}
        {!loading && downloads.length > 0 && (
          <div className="flex flex-col gap-3">
            {downloads.map((session) => {
              const gradient = session.gradient || MOOD_GRADIENTS[session.mood_category] || "linear-gradient(135deg, #8B5CF6, #6366F1)";
              return (
                <div
                  key={session.download_id}
                  className="flex items-center gap-4 p-4 rounded-[10px]"
                  style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
                >
                  {/* Gradient icon */}
                  <Link href={`/session/${session.session_id}`} className="shrink-0">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: gradient }}
                    >
                      {session.media_type === "audio" ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      )}
                    </div>
                  </Link>

                  {/* Session info */}
                  <Link href={`/session/${session.session_id}`} className="flex-1 min-w-0 hover:opacity-70 transition-opacity">
                    <p className="text-sm text-white truncate" style={{ fontWeight: 500 }}>{session.title}</p>
                    <p className="text-xs text-white/35 mt-0.5">{session.type} · {session.duration}</p>
                    <p className="text-xs text-white/25 mt-0.5">
                      Downloaded {formatDownloadDate(session.downloaded_at)}
                    </p>
                  </Link>

                  {/* Offline badge + remove */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(16,185,129,0.8)">
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                      </svg>
                      <span className="text-[10px] text-green-400/70">Offline</span>
                    </div>
                    <button
                      onClick={() => handleRemove(session.download_id)}
                      className="text-white/25 hover:text-white/60 transition-colors"
                      aria-label="Remove download"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
