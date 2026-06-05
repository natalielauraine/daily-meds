"use client";

// Full meditation library — members only (protected by middleware).
// Loads all sessions from Supabase and lets users filter by mood, duration and type.
// Also supports a search bar that filters by title in real time.

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import EmptyState from "../components/ui/EmptyState";
import { createClient } from "../../lib/supabase-browser";
import { LibraryCard, LibrarySession, MOOD_GRADIENTS } from "../components/LibraryCard";

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const MOOD_CATEGORIES = [
  "All",
  "Hungover",
  "After The Sesh",
  "On A Comedown",
  "Feeling Empty",
  "Can't Sleep",
  "Anxious",
  "Heartbroken",
  "Overwhelmed",
  "Low Energy",
  "Morning Reset",
  "Focus Mode",
];

const DURATION_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Under 10 mins", value: "short" },
  { label: "10–20 mins", value: "medium" },
  { label: "20+ mins", value: "long" },
];

const TYPE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Audio", value: "audio" },
  { label: "Video", value: "video" },
];

// MOOD_GRADIENTS and LibrarySession are imported from app/components/LibraryCard

// ── HELPERS ───────────────────────────────────────────────────────────────────

// Parse the minute number out of a duration string like "18 min" → 18
function parseMins(duration: string): number {
  return parseInt(duration) || 0;
}

// Check whether a session matches the selected duration filter
function matchesDuration(session: LibrarySession, filter: string): boolean {
  if (filter === "all") return true;
  const mins = parseMins(session.duration);
  if (filter === "short") return mins < 10;
  if (filter === "medium") return mins >= 10 && mins <= 20;
  if (filter === "long") return mins > 20;
  return true;
}

// ── FILTER PILL ───────────────────────────────────────────────────────────────
// Small pill button used for mood, duration, and type filters.

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 px-3 py-1.5 rounded-full text-xs transition-all"
      style={{
        backgroundColor: active ? "#ff41b3" : "rgba(255,255,255,0.06)",
        border: active ? "0.5px solid #ff41b3" : "0.5px solid rgba(255,255,255,0.1)",
        color: active ? "white" : "rgba(255,255,255,0.5)",
        fontFamily: "var(--font-space-grotesk)",
        fontWeight: active ? 700 : 400,
      }}
    >
      {label}
    </button>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const supabase = createClient();

  const [sessions, setSessions] = useState<LibrarySession[]>([]);
  const [loading, setLoading] = useState(true);
  // Whether the logged-in user has an active paid subscription
  const [isPaidMember, setIsPaidMember] = useState(false);

  // Filter state
  const [search, setSearch] = useState("");
  const [activeMood, setActiveMood] = useState("All");
  const [activeDuration, setActiveDuration] = useState("all");
  const [activeType, setActiveType] = useState("all");

  // On mount, check if there's a ?mood= query param from the homepage feeling chips
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qMood = params.get("mood");
    if (qMood) {
      // Find a matching mood from the categories to handle exact casing, or just set it
      const match = MOOD_CATEGORIES.find(m => m.toLowerCase() === qMood.toLowerCase());
      if (match) setActiveMood(match);
      else setActiveMood(qMood);
    }
  }, []);

  // Load sessions and subscription status in parallel on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // Fetch sessions and the logged-in user's subscription at the same time
      const [{ data: sessionsData, error }, { data: { user } }] = await Promise.all([
        supabase
          .from("sessions")
          .select("id, title, description, duration, type, mood_category, media_type, is_free, is_coming_soon, gradient, thumbnail")
          .order("created_at", { ascending: false }),
        supabase.auth.getUser(),
      ]);

      if (!error && sessionsData) setSessions(sessionsData as LibrarySession[]);

      // If user is logged in, check their subscription tier
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("subscription_status")
          .eq("id", user.id)
          .single();
        if (profile?.subscription_status && profile.subscription_status !== "free") {
          setIsPaidMember(true);
        }
      }

      setLoading(false);
    }
    loadData();
  }, []);

  // Apply all active filters to the session list
  const filtered = sessions.filter((s) => {
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeMood !== "All" && s.mood_category !== activeMood) return false;
    if (!matchesDuration(s, activeDuration)) return false;
    if (activeType !== "all" && s.media_type !== activeType) return false;
    return true;
  }).sort((a, b) => {
    if (!isPaidMember) {
      if (a.is_free && !b.is_free) return -1;
      if (!a.is_free && b.is_free) return 1;
    }
    return 0;
  });

  // Count how many filters are active (excludes search)
  const activeFilterCount = [
    activeMood !== "All",
    activeDuration !== "all",
    activeType !== "all",
  ].filter(Boolean).length;

  function clearAllFilters() {
    setSearch("");
    setActiveMood("All");
    setActiveDuration("all");
    setActiveType("all");
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#131313" }}>
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-28">

        {/* ── PAGE HEADER ── */}
        <div className="mb-8">
          <h1
            className="text-2xl sm:text-3xl text-white mb-1 uppercase"
            style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800, letterSpacing: "-0.01em" }}
          >
            Library
          </h1>
          <p className="text-sm text-white/40" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            {loading ? "Loading sessions…" : `${sessions.length} session${sessions.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* ── SEARCH BAR ── */}
        <div className="relative mb-6">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            width="15" height="15" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)"
          >
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sessions…"
            className="w-full pl-10 pr-4 py-3 rounded-[10px] text-sm text-white outline-none placeholder:text-white/25"
            style={{
              backgroundColor: "#1F1F1F",
              border: "0.5px solid rgba(255,255,255,0.1)",
              fontFamily: "var(--font-space-grotesk)",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          )}
        </div>

        {/* ── FILTERS ── */}
        <div className="flex flex-col gap-3 mb-8">

          {/* Mood pills — horizontally scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
            {MOOD_CATEGORIES.map((mood) => (
              <FilterPill
                key={mood}
                label={mood}
                active={activeMood === mood}
                onClick={() => setActiveMood(mood)}
              />
            ))}
          </div>

          {/* Duration + Type filters in a row */}
          <div className="flex gap-4 items-center flex-wrap">
            {/* Duration */}
            <div className="flex gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <FilterPill
                  key={opt.value}
                  label={opt.label}
                  active={activeDuration === opt.value}
                  onClick={() => setActiveDuration(opt.value)}
                />
              ))}
            </div>

            {/* Divider */}
            <div className="h-4 w-px bg-white/10 hidden sm:block" />

            {/* Type */}
            <div className="flex gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <FilterPill
                  key={opt.value}
                  label={opt.label}
                  active={activeType === opt.value}
                  onClick={() => setActiveType(opt.value)}
                />
              ))}
            </div>

            {/* Clear filters button — only shown when filters are active */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-white/35 hover:text-white/60 transition-colors ml-auto"
              >
                Clear filters ({activeFilterCount})
              </button>
            )}
          </div>
        </div>

        {/* ── SESSION GRID ── */}
        {loading ? (
          // Loading skeleton — 8 placeholder cards in a grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div
                  className="rounded-[10px] animate-pulse w-full"
                  style={{ aspectRatio: "16/9", backgroundColor: "#1F1F1F" }}
                />
                <div className="h-3 rounded animate-pulse w-16" style={{ backgroundColor: "#1F1F1F" }} />
                <div className="h-4 rounded animate-pulse w-3/4" style={{ backgroundColor: "#1F1F1F" }} />
                <div className="h-3 rounded animate-pulse w-1/2" style={{ backgroundColor: "#1F1F1F" }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 && (search || activeFilterCount > 0) ? (
          <EmptyState
            message="No sessions match your filters"
            action="Clear all filters"
            onClick={clearAllFilters}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((session) => (
              <LibraryCard key={session.id} session={session} isPaidMember={isPaidMember} />
            ))}
          </div>
        )}

        {/* Result count when filtered */}
        {!loading && filtered.length > 0 && (search || activeFilterCount > 0) && (
          <p className="text-xs text-white/25 text-center mt-8">
            Showing {filtered.length} of {sessions.length} sessions
          </p>
        )}

      </main>

      <Footer />
    </div>
  );
}
