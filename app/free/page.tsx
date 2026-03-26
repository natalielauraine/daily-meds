"use client";

// Free sessions page — publicly accessible, no login required.
// Shows all sessions where is_free = true from the Supabase sessions table.
// This is the taster page for new visitors to try before subscribing.

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase-browser";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Gradient for each mood category — matches the design system
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

// A single free session card
type FreeSession = {
  id: string;
  title: string;
  description: string;
  type: string;
  duration: string;
  mood_category: string;
  gradient: string;
  media_type: string;
};

function SessionCard({ session }: { session: FreeSession }) {
  const gradient = session.gradient || MOOD_GRADIENTS[session.mood_category] || "linear-gradient(135deg, #8B5CF6, #6366F1)";

  return (
    <Link href={`/session/${session.id}`}>
      <div
        className="rounded-[10px] p-4 flex gap-4 items-start hover:scale-[1.01] transition-transform cursor-pointer"
        style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
      >
        {/* Gradient icon */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
          style={{ background: gradient }}
        >
          {/* Audio icon */}
          {session.media_type === "audio" ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </div>

        {/* Session details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] px-1.5 py-0.5 rounded text-white shrink-0"
              style={{ backgroundColor: "rgba(16,185,129,0.8)", fontWeight: 500 }}
            >
              FREE
            </span>
            <span className="text-[10px] text-white/30 truncate">{session.mood_category}</span>
          </div>
          <h3 className="text-sm text-white truncate" style={{ fontWeight: 500 }}>{session.title}</h3>
          <p className="text-xs text-white/40 mt-0.5 line-clamp-2 leading-relaxed">{session.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-white/30">{session.type}</span>
            <span className="text-white/15">·</span>
            <span className="text-xs text-white/30">{session.duration}</span>
          </div>
        </div>

        {/* Play arrow */}
        <div className="shrink-0 mt-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
    </Link>
  );
}

export default function FreePage() {
  const supabase = createClient();

  const [sessions, setSessions] = useState<FreeSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all free sessions from Supabase on mount
  useEffect(() => {
    async function loadFreeSessions() {
      const { data } = await supabase
        .from("sessions")
        .select("id, title, description, type, duration, mood_category, gradient, media_type")
        .eq("is_free", true)
        .order("created_at", { ascending: false });

      if (data) setSessions(data as FreeSession[]);
      setLoading(false);
    }

    loadFreeSessions();
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 pb-24">

        {/* Page header */}
        <div className="mb-10">
          <div
            className="inline-block text-[10px] px-2.5 py-1 rounded-full mb-3 text-white"
            style={{ background: "linear-gradient(135deg, #10B981, #22C55E)", fontWeight: 500 }}
          >
            No account needed
          </div>
          <h1 className="text-3xl text-white mb-3" style={{ fontWeight: 500 }}>
            Try Daily Meds for free
          </h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-lg">
            Audio for emotional emergencies. These sessions are completely free — no sign up, no card.
            Just press play.
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-[10px] animate-pulse"
                style={{ backgroundColor: "#1A1A2E" }}
              />
            ))}
          </div>
        )}

        {/* Sessions list */}
        {!loading && sessions.length > 0 && (
          <div className="flex flex-col gap-3 mb-12">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}

        {/* Empty state — shown only if no free sessions are in the database yet */}
        {!loading && sessions.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-20 rounded-[10px] text-center"
            style={{ border: "0.5px dashed rgba(255,255,255,0.1)" }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" className="mb-4">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            <p className="text-sm text-white/30 mb-1">Free sessions coming soon</p>
            <p className="text-xs text-white/20">Check back shortly</p>
          </div>
        )}

        {/* Upgrade prompt at the bottom */}
        <div
          className="rounded-[10px] p-6 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(107,33,232,0.15), rgba(99,102,241,0.1))",
            border: "0.5px solid rgba(139,92,246,0.2)",
          }}
        >
          <h2 className="text-white text-base mb-2" style={{ fontWeight: 500 }}>
            Want the full library?
          </h2>
          <p className="text-white/40 text-sm mb-5">
            Unlock every session — including ones for heartbreak, comedowns, 3am anxiety and more.
          </p>
          <Link
            href="/pricing"
            className="inline-block px-6 py-2.5 rounded-md text-sm text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
          >
            See pricing
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
