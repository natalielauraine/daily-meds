"use client";

// Saved sessions page — shows sessions the user has bookmarked within the app.
// Nothing is ever downloaded to the device. These are stored in the app only.
// Will connect to Supabase later — currently uses localStorage.

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getSaved, unsaveSession } from "../../lib/downloads";

// ── MOCK SESSIONS ─────────────────────────────────────────────────────────────
// Needed to look up session details by ID. Replace with Supabase query later.
const MOCK_SESSIONS = [
  { id: "1", title: "Hungover & Overwhelmed", type: "Guided Meditation", duration: "18 min", moodCategory: "Hungover", gradient: "linear-gradient(135deg, #6B21E8 0%, #8B3CF7 25%, #6366F1 60%, #3B82F6 80%, #22D3EE 100%)", isFree: true },
  { id: "2", title: "Come Down Slowly", type: "Breathwork", duration: "22 min", moodCategory: "On A Comedown", gradient: "linear-gradient(135deg, #10B981 0%, #22C55E 35%, #84CC16 70%, #D9F100 100%)", isFree: false },
  { id: "3", title: "3am Brain", type: "Sleep Audio", duration: "14 min", moodCategory: "Can't Sleep", gradient: "linear-gradient(135deg, #8B3CF7 0%, #6366F1 100%)", isFree: true },
  { id: "4", title: "Anxiety First Aid", type: "Breathwork", duration: "8 min", moodCategory: "Anxious", gradient: "linear-gradient(135deg, #F43F5E 0%, #F97316 100%)", isFree: true },
  { id: "5", title: "The Morning After", type: "Guided Meditation", duration: "12 min", moodCategory: "After The Sesh", gradient: "linear-gradient(135deg, #F43F5E 0%, #EC4899 20%, #D946EF 35%, #F97316 65%, #EAB308 85%, #FACC15 100%)", isFree: false },
];

function getSessionById(id: string) {
  return MOCK_SESSIONS.find((s) => s.id === id);
}

export default function SavedPage() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Load saved IDs on mount (localStorage is client-only)
  useEffect(() => {
    setSavedIds(getSaved());
  }, []);

  // Remove a session from saved and update the list
  function handleUnsave(sessionId: string) {
    unsaveSession(sessionId);
    setSavedIds(getSaved());
  }

  // Turn the list of IDs into full session objects (skip any we can't find)
  const savedSessions = savedIds
    .map((id) => getSessionById(id))
    .filter(Boolean) as typeof MOCK_SESSIONS;

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
        <div className="mb-8">
          <h1 className="text-2xl text-white mb-1" style={{ fontWeight: 500 }}>Saved</h1>
          <p className="text-sm text-white/40">
            {savedSessions.length} session{savedSessions.length !== 1 ? "s" : ""} saved in app
          </p>
        </div>

        {/* Info note */}
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-[10px] mb-6"
          style={{ backgroundColor: "rgba(139,92,246,0.08)", border: "0.5px solid rgba(139,92,246,0.2)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#8B5CF6" className="shrink-0 mt-0.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <p className="text-xs text-white/40 leading-relaxed">
            Sessions are saved within Daily Meds only — nothing is downloaded to your device.
          </p>
        </div>

        {/* Empty state */}
        {savedSessions.length === 0 && (
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
        <div className="flex flex-col gap-3">
          {savedSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center gap-4 p-4 rounded-[10px]"
              style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
            >
              {/* Gradient icon */}
              <Link href={`/session/${session.id}`} className="shrink-0">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: session.gradient }}
                >
                  <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                    <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.9"/>
                  </svg>
                </div>
              </Link>

              {/* Session info */}
              <Link href={`/session/${session.id}`} className="flex-1 min-w-0 hover:opacity-70 transition-opacity">
                <p className="text-sm text-white truncate" style={{ fontWeight: 500 }}>{session.title}</p>
                <p className="text-xs text-white/35 mt-0.5">{session.type} · {session.duration}</p>
                <p className="text-xs text-white/25 mt-0.5">{session.moodCategory}</p>
              </Link>

              {/* Right side — free badge + remove */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                {session.isFree && (
                  <span className="text-[10px] px-2 py-0.5 rounded text-white" style={{ backgroundColor: "rgba(16,185,129,0.8)", fontWeight: 500 }}>
                    FREE
                  </span>
                )}
                <button
                  onClick={() => handleUnsave(session.id)}
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

      </main>

      <Footer />
    </div>
  );
}
