"use client";

// Live sessions page — shows currently live sessions at the top,
// then upcoming scheduled sessions below.
// When a session is live, users click Join to enter the Daily.co room.

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getLiveSessions, formatSessionDate, type LiveSession } from "../../lib/live-sessions";

export default function LivePage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);

  // Load sessions on mount (localStorage is client-only)
  useEffect(() => {
    setSessions(getLiveSessions());
  }, []);

  const liveSessions = sessions.filter((s) => s.isLive);
  const upcomingSessions = sessions.filter((s) => !s.isLive);

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-24">

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl text-white" style={{ fontWeight: 500 }}>Live Sessions</h1>
            {liveSessions.length > 0 && (
              <span
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: "#F43F5E", fontWeight: 500 }}
              >
                {/* Pulsing dot */}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                LIVE NOW
              </span>
            )}
          </div>
          <p className="text-sm text-white/40">
            Join Natalie live for guided meditation and breathwork sessions.
          </p>
        </div>

        {/* ── LIVE NOW SECTION ─────────────────────────────────── */}
        {liveSessions.length > 0 && (
          <div className="mb-10">
            <div className="flex flex-col gap-4">
              {liveSessions.map((session) => (
                <LiveSessionCard key={session.id} session={session} isLive />
              ))}
            </div>
          </div>
        )}

        {/* ── UPCOMING SESSIONS ────────────────────────────────── */}
        <div>
          <h2 className="text-sm text-white/50 mb-4" style={{ fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "11px" }}>
            Upcoming
          </h2>

          {upcomingSessions.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-14 rounded-[10px] text-center"
              style={{ border: "0.5px dashed rgba(255,255,255,0.1)" }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(255,255,255,0.12)" className="mb-3">
                <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
              </svg>
              <p className="text-sm text-white/25 mb-1">No sessions scheduled yet</p>
              <p className="text-xs text-white/15">Check back soon</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingSessions.map((session) => (
                <LiveSessionCard key={session.id} session={session} isLive={false} />
              ))}
            </div>
          )}
        </div>

        {/* ── HOW IT WORKS ─────────────────────────────────────── */}
        <div
          className="mt-10 p-5 rounded-[10px]"
          style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.07)" }}
        >
          <h3 className="text-sm text-white/60 mb-3" style={{ fontWeight: 500 }}>How live sessions work</h3>
          <div className="flex flex-col gap-2.5">
            {[
              { icon: "📅", text: "Sessions are scheduled in advance — check back here for the latest." },
              { icon: "🎙️", text: "Natalie goes live with audio or video — you join right here in the app." },
              { icon: "🔇", text: "You join on mute by default. The session is guided — no need to speak." },
              { icon: "⏱️", text: "Recordings are available after each live session for members." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-base">{item.icon}</span>
                <p className="text-xs text-white/35 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}

// ── SESSION CARD ──────────────────────────────────────────────────────────────

function LiveSessionCard({ session, isLive }: { session: LiveSession; isLive: boolean }) {
  return (
    <div
      className="rounded-[10px] overflow-hidden"
      style={{
        backgroundColor: "#1A1A2E",
        border: isLive
          ? "0.5px solid rgba(244,63,94,0.4)"
          : "0.5px solid rgba(255,255,255,0.08)",
        boxShadow: isLive ? "0 0 24px rgba(244,63,94,0.08)" : "none",
      }}
    >
      {/* Gradient top bar */}
      <div className="h-1 w-full" style={{ background: session.gradient }} />

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Gradient icon */}
          <div
            className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center"
            style={{ background: session.gradient }}
          >
            {session.type === "video" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" opacity={0.9}>
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" opacity={0.9}>
                <path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
              </svg>
            )}
          </div>

          {/* Session info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-white text-base" style={{ fontWeight: 500 }}>{session.title}</h3>
              {isLive && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded text-white shrink-0"
                  style={{ backgroundColor: "#F43F5E", fontWeight: 500 }}
                >
                  LIVE
                </span>
              )}
            </div>
            <p className="text-xs text-white/40 mb-2 leading-relaxed">{session.description}</p>
            <div className="flex items-center gap-3 text-xs text-white/30">
              <span>{session.type === "video" ? "Video" : "Audio only"}</span>
              <span>·</span>
              <span>{session.duration}</span>
              {!isLive && (
                <>
                  <span>·</span>
                  <span>{formatSessionDate(session.scheduledAt)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Join button — only shown when live */}
        {isLive && session.dailyRoomName && (
          <Link
            href={`/live/${session.dailyRoomName}`}
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-[10px] text-sm text-white transition-opacity hover:opacity-80"
            style={{ background: session.gradient, fontWeight: 500 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            Join Live Session
          </Link>
        )}

        {/* Not live yet — show scheduled date prominently */}
        {!isLive && (
          <div
            className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-[10px]"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.06)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)">
              <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
            </svg>
            <span className="text-xs text-white/35">{formatSessionDate(session.scheduledAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
