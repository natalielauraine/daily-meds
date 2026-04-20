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

// ── PLACEHOLDER VIDEO CARDS ───────────────────────────────────────────────────
// These represent slots where new video sessions will be uploaded.

const PLACEHOLDER_VIDEOS = [
  { label: "Hungover & Overwhelmed",   gradient: "linear-gradient(135deg, #1a0a18, #0d1220)", accent: "#ff41b3", duration: "12 min" },
  { label: "After The Sesh",           gradient: "linear-gradient(135deg, #0f1a0a, #1a150d)", accent: "#aaee20", duration: "18 min" },
  { label: "Can't Sleep",              gradient: "linear-gradient(135deg, #0a1020, #18100a)", accent: "#ec723d", duration: "22 min" },
  { label: "Anxious & Overstimulated", gradient: "linear-gradient(135deg, #1a0a10, #0a0f1a)", accent: "#ff41b3", duration: "15 min" },
  { label: "Morning Reset",            gradient: "linear-gradient(135deg, #151a0a, #0d1a18)", accent: "#aaee20", duration: "10 min" },
  { label: "Heartbroken",              gradient: "linear-gradient(135deg, #1a0a14, #150a1a)", accent: "#ec723d", duration: "20 min" },
  { label: "Focus Mode",               gradient: "linear-gradient(135deg, #0a181a, #100a1a)", accent: "#ff41b3", duration: "25 min" },
  { label: "On A Comedown",            gradient: "linear-gradient(135deg, #1a120a, #0a1a14)", accent: "#aaee20", duration: "16 min" },
];

function PlaceholderCard({ item }: { item: typeof PLACEHOLDER_VIDEOS[number] }) {
  return (
    <div className="flex flex-col opacity-50">
      <div
        className="relative rounded-[10px] overflow-hidden mb-3"
        style={{
          aspectRatio: "16/9",
          background: item.gradient,
          border: "1px dashed rgba(255,255,255,0.12)",
        }}
      >
        {/* Centre icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ border: `1px dashed ${item.accent}40`, background: `${item.accent}10` }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={item.accent} opacity={0.5}>
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          </div>
        </div>

        {/* Coming Soon badge */}
        <div
          className="absolute top-2 left-2 text-[9px] px-2 py-0.5 rounded uppercase tracking-widest font-bold"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)", border: "0.5px solid rgba(255,255,255,0.1)" }}
        >
          Coming Soon
        </div>

        {/* Duration */}
        <div
          className="absolute bottom-2 left-2 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1"
          style={{ background: "rgba(0,0,0,0.4)", color: "rgba(255,255,255,0.4)" }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
          </svg>
          {item.duration}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        <span
          className="text-[9px] px-2 py-0.5 rounded-full self-start uppercase"
          style={{ background: `${item.accent}20`, color: item.accent, fontWeight: 700, letterSpacing: "0.04em" }}
        >
          {item.label}
        </span>
        <div className="h-3.5 rounded w-3/4" style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="h-2.5 rounded w-1/2" style={{ background: "rgba(255,255,255,0.04)" }} />
      </div>
    </div>
  );
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

  // Load sessions and subscription status in parallel on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // Fetch sessions and the logged-in user's subscription at the same time
      const [{ data: sessionsData, error }, { data: { user } }] = await Promise.all([
        supabase
          .from("sessions")
          .select("id, title, description, duration, type, mood_category, media_type, is_free, gradient")
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
    // Search — case-insensitive title match
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    // Mood category
    if (activeMood !== "All" && s.mood_category !== activeMood) return false;
    // Duration
    if (!matchesDuration(s, activeDuration)) return false;
    // Media type
    if (activeType !== "all" && s.media_type !== activeType) return false;
    return true;
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
            {/* Placeholder slots — shown when no filters are active so the grid always looks populated */}
            {!search && activeMood === "All" && activeDuration === "all" && activeType === "all" &&
              PLACEHOLDER_VIDEOS.map((item) => (
                <PlaceholderCard key={item.label} item={item} />
              ))
            }
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
