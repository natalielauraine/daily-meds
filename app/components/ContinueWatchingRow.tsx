"use client";

// Continue Watching row — shown on the homepage for logged-in users only.
// Fetches sessions the user has started but not finished from Supabase user_progress.
// Each card shows a progress bar and clicking it resumes from exactly where they stopped.

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase-browser";
import { MOCK_SESSIONS } from "../../lib/sessions-data";

type ProgressRecord = {
  session_id: string;
  position_seconds: number;
  duration_seconds: number;
  updated_at: string;
};

type ContinueItem = {
  session: typeof MOCK_SESSIONS[0];
  positionSeconds: number;
  percent: number;
};

export default function ContinueWatchingRow() {
  const [items, setItems] = useState<ContinueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProgress() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // Not logged in — nothing to show
      if (!user) { setLoading(false); return; }

      // Fetch in-progress sessions, most recent first
      const { data } = await supabase
        .from("user_progress")
        .select("session_id, position_seconds, duration_seconds, updated_at")
        .eq("user_id", user.id)
        .eq("completed", false)
        .gt("position_seconds", 10)   // Skip sessions barely touched (under 10 seconds)
        .order("updated_at", { ascending: false })
        .limit(10);

      if (!data) { setLoading(false); return; }

      // Match each progress record to its session data
      const matched: ContinueItem[] = [];
      for (const record of data as ProgressRecord[]) {
        const session = MOCK_SESSIONS.find((s) => s.id === record.session_id);
        if (!session) continue;
        const percent = record.duration_seconds > 0
          ? Math.min(99, Math.round((record.position_seconds / record.duration_seconds) * 100))
          : 0;
        matched.push({ session, positionSeconds: record.position_seconds, percent });
      }

      setItems(matched);
      setLoading(false);
    }

    fetchProgress();
  }, []);

  // Return nothing if still loading or no in-progress sessions
  if (loading || items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-base text-white mb-4" style={{ fontWeight: 500 }}>Continue Watching</h2>

      {/* Horizontal scroll — hide scrollbar visually */}
      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map(({ session, positionSeconds, percent }) => (
          <Link
            key={session.id}
            href={`/session/${session.id}?t=${positionSeconds}`}
            className="shrink-0 w-44 rounded-[10px] overflow-hidden hover:scale-[1.02] transition-transform"
            style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
          >
            {/* Gradient thumbnail area */}
            <div
              className="w-full h-24 flex items-center justify-center relative"
              style={{ background: session.gradient }}
            >
              {/* Lotus icon */}
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.9"/>
                <path d="M10 14C10 14 2 18 2 25C2 29.4 5.6 33 10 33C13 33 15.6 31.4 17 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8"/>
                <path d="M38 14C38 14 46 18 46 25C46 29.4 42.4 33 38 33C35 33 32.4 31.4 31 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8"/>
                <path d="M24 28L20 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
                <path d="M24 28L28 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
              </svg>

              {/* Progress percentage badge */}
              <div
                className="absolute top-2 right-2 text-white text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: "rgba(0,0,0,0.55)", fontWeight: 500 }}
              >
                {percent}%
              </div>
            </div>

            {/* Thin progress bar showing how far through */}
            <div className="w-full h-0.5" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-full"
                style={{ width: `${percent}%`, background: session.gradient }}
              />
            </div>

            {/* Title + type */}
            <div className="p-3">
              <p className="text-xs text-white leading-snug line-clamp-2 mb-1" style={{ fontWeight: 500 }}>
                {session.title}
              </p>
              <p className="text-[10px] text-white/40">{session.type} · {session.duration}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
