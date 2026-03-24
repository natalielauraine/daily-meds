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
import { toggleWatchlist, isInWatchlist } from "../../lib/watchlist";
import AddToPlaylistModal from "../components/AddToPlaylistModal";

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

// Gradient for each mood badge
const MOOD_GRADIENTS: Record<string, string> = {
  Hungover: "linear-gradient(135deg, #6B21E8, #22D3EE)",
  "After The Sesh": "linear-gradient(135deg, #F43F5E, #FACC15)",
  "On A Comedown": "linear-gradient(135deg, #10B981, #D9F100)",
  "Feeling Empty": "linear-gradient(135deg, #6B21E8, #22D3EE)",
  "Can't Sleep": "linear-gradient(135deg, #8B3CF7, #6366F1)",
  Anxious: "linear-gradient(135deg, #F43F5E, #F97316)",
  Heartbroken: "linear-gradient(135deg, #EC4899, #D946EF)",
  Overwhelmed: "linear-gradient(135deg, #F97316, #FACC15)",
  "Low Energy": "linear-gradient(135deg, #10B981, #22C55E)",
  "Morning Reset": "linear-gradient(135deg, #F43F5E, #FACC15)",
  "Focus Mode": "linear-gradient(135deg, #6B21E8, #6366F1)",
};

// ── TYPES ─────────────────────────────────────────────────────────────────────

type LibrarySession = {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: string;
  mood_category: string;
  media_type: "audio" | "video";
  is_free: boolean;
  gradient: string;
};

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

// ── LIBRARY CARD ──────────────────────────────────────────────────────────────
// Grid-specific session card — adapts to any column width (unlike the horizontal row card).

function LibraryCard({ session }: { session: LibrarySession }) {
  const [hovered, setHovered] = useState(false);
  const [hearted, setHearted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Read watchlist state from localStorage on mount
  useEffect(() => {
    setHearted(isInWatchlist(session.id));
  }, [session.id]);

  // Close the three-dot menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  function handleHeart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggleWatchlist(session.id);
    setHearted(nowSaved);
  }

  const moodGradient = MOOD_GRADIENTS[session.mood_category] ?? "linear-gradient(135deg, #6B21E8, #22D3EE)";

  return (
    <>
      <div
        className="cursor-pointer group flex flex-col"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* ── THUMBNAIL ── */}
        <div
          className="relative rounded-[10px] overflow-hidden mb-3 transition-transform duration-200"
          style={{
            aspectRatio: "16/9",
            transform: hovered && !showMenu ? "scale(1.02)" : "scale(1)",
            border: "0.5px solid rgba(255,255,255,0.08)",
          }}
        >
          <Link href={`/session/${session.id}`} className="absolute inset-0 block">
            {/* Gradient background */}
            <div className="absolute inset-0" style={{ background: session.gradient }} />

            {/* Bottom fade */}
            <div
              className="absolute bottom-0 left-0 right-0 h-14"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)" }}
            />

            {/* Lotus icon — centre */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.22)", backdropFilter: "blur(4px)" }}
              >
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                  <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.95"/>
                  <path d="M10 14C10 14 2 18 2 25C2 29.4 5.6 33 10 33C13 33 15.6 31.4 17 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85"/>
                  <path d="M38 14C38 14 46 18 46 25C46 29.4 42.4 33 38 33C35 33 32.4 31.4 31 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85"/>
                  <path d="M24 28L20 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75"/>
                  <path d="M24 28L28 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75"/>
                  <circle cx="24" cy="28" r="2" fill="white" opacity="0.9"/>
                </svg>
              </div>
            </div>

            {/* Play button — appears on hover */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
              style={{ opacity: hovered && !showMenu ? 1 : 0 }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "rgba(139,92,246,0.9)", backdropFilter: "blur(4px)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ marginLeft: "2px" }}>
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>

            {/* Free badge — top left */}
            {session.is_free && (
              <div
                className="absolute top-2 left-2 text-white text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: "rgba(16,185,129,0.85)", fontWeight: 500 }}
              >
                FREE
              </div>
            )}

            {/* Duration — bottom left */}
            <div
              className="absolute bottom-2 left-2 text-white/80 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1"
              style={{ background: "rgba(0,0,0,0.5)" }}
            >
              {/* Audio/Video icon */}
              {session.media_type === "video" ? (
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
              ) : (
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                </svg>
              )}
              {session.duration}
            </div>
          </Link>

          {/* Heart button — top right */}
          <button
            onClick={handleHeart}
            className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(4px)",
              opacity: hovered || hearted ? 1 : 0,
            }}
            aria-label={hearted ? "Remove from watchlist" : "Save to watchlist"}
          >
            {hearted ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#F43F5E">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            )}
          </button>
        </div>

        {/* ── CARD INFO ── */}
        <Link href={`/session/${session.id}`} className="flex flex-col gap-1">
          {/* Mood badge */}
          <span
            className="text-[10px] px-2 py-0.5 rounded-full self-start"
            style={{ background: moodGradient, color: "white", fontWeight: 500 }}
          >
            {session.mood_category}
          </span>

          {/* Title */}
          <h3
            className="text-sm text-white/85 leading-snug transition-colors group-hover:text-white"
            style={{
              fontWeight: 500,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {session.title}
          </h3>

          {/* Type */}
          <p className="text-[11px] text-white/35">{session.type}</p>
        </Link>
      </div>

      {showPlaylistModal && (
        <AddToPlaylistModal
          sessionId={session.id}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </>
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
        backgroundColor: active ? "#8B5CF6" : "rgba(255,255,255,0.06)",
        border: active ? "0.5px solid #8B5CF6" : "0.5px solid rgba(255,255,255,0.1)",
        color: active ? "white" : "rgba(255,255,255,0.5)",
        fontWeight: active ? 500 : 400,
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

  // Filter state
  const [search, setSearch] = useState("");
  const [activeMood, setActiveMood] = useState("All");
  const [activeDuration, setActiveDuration] = useState("all");
  const [activeType, setActiveType] = useState("all");

  // Load all sessions from Supabase on mount
  useEffect(() => {
    async function loadSessions() {
      setLoading(true);
      const { data, error } = await supabase
        .from("sessions")
        .select("id, title, description, duration, type, mood_category, media_type, is_free, gradient")
        .order("created_at", { ascending: false });
      if (!error && data) setSessions(data as LibrarySession[]);
      setLoading(false);
    }
    loadSessions();
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
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-28">

        {/* ── PAGE HEADER ── */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl text-white mb-1" style={{ fontWeight: 500 }}>Library</h1>
          <p className="text-sm text-white/40">
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
              backgroundColor: "#1A1A2E",
              border: "0.5px solid rgba(255,255,255,0.1)",
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
                  style={{ aspectRatio: "16/9", backgroundColor: "#1A1A2E" }}
                />
                <div className="h-3 rounded animate-pulse w-16" style={{ backgroundColor: "#1A1A2E" }} />
                <div className="h-4 rounded animate-pulse w-3/4" style={{ backgroundColor: "#1A1A2E" }} />
                <div className="h-3 rounded animate-pulse w-1/2" style={{ backgroundColor: "#1A1A2E" }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            message={
              search || activeFilterCount > 0
                ? "No sessions match your filters"
                : "No sessions in the library yet"
            }
            action={search || activeFilterCount > 0 ? "Clear all filters" : undefined}
            onClick={search || activeFilterCount > 0 ? clearAllFilters : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((session) => (
              <LibraryCard key={session.id} session={session} />
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
