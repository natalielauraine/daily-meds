"use client";

// Shared session card — used by /library and /free.
// Shows a 16:9 gradient thumbnail, mood badge, title, duration, and watchlist heart.

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { toggleWatchlist, isInWatchlist } from "../../lib/watchlist";
import AddToPlaylistModal from "./AddToPlaylistModal";

export type LibrarySession = {
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

export const MOOD_GRADIENTS: Record<string, string> = {
  Hungover:          "linear-gradient(135deg, #ff41b3, #ec723d)",
  "After The Sesh":  "linear-gradient(135deg, #ff41b3, #f4e71d)",
  "On A Comedown":   "linear-gradient(135deg, #adf225, #f4e71d)",
  "Feeling Empty":   "linear-gradient(135deg, #ff41b3, #ec723d)",
  "Can't Sleep":     "linear-gradient(135deg, #ff41b3, #adf225)",
  Anxious:           "linear-gradient(135deg, #ec723d, #f4e71d)",
  Heartbroken:       "linear-gradient(135deg, #ff41b3, #ec723d)",
  Overwhelmed:       "linear-gradient(135deg, #ec723d, #f4e71d)",
  "Low Energy":      "linear-gradient(135deg, #adf225, #f4e71d)",
  "Morning Reset":   "linear-gradient(135deg, #ff41b3, #f4e71d)",
  "Focus Mode":      "linear-gradient(135deg, #adf225, #ec723d)",
};

export function LibraryCard({ session, isPaidMember }: { session: LibrarySession; isPaidMember: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [hearted, setHearted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHearted(isInWatchlist(session.id));
  }, [session.id]);

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

  const moodGradient = MOOD_GRADIENTS[session.mood_category] ?? "linear-gradient(135deg, #ff41b3, #ec723d)";

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
            <div className="absolute inset-0" style={{ background: session.gradient }} />
            <div
              className="absolute bottom-0 left-0 right-0 h-14"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)" }}
            />
            {/* Lotus icon */}
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
            {/* Play button on hover */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
              style={{ opacity: hovered && !showMenu ? 1 : 0 }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "#ff41b3", boxShadow: "0 0 20px rgba(255,65,179,0.6)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ marginLeft: "2px" }}>
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
            {/* Free badge */}
            {session.is_free && (
              <div
                className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  background: "rgba(173,242,37,0.85)",
                  color: "#131313",
                  fontFamily: "var(--font-space-grotesk)",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                }}
              >
                FREE
              </div>
            )}
            {/* Lock icon for premium sessions for non-members */}
            {!session.is_free && !isPaidMember && (
              <div
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </div>
            )}
            {/* Duration */}
            <div
              className="absolute bottom-2 left-2 text-white/80 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1"
              style={{ background: "rgba(0,0,0,0.5)" }}
            >
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

          {/* Heart / watchlist button */}
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
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#ff41b3">
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
          <span
            className="text-[9px] px-2 py-0.5 rounded-full self-start text-white uppercase"
            style={{
              background: moodGradient,
              fontFamily: "var(--font-space-grotesk)",
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            {session.mood_category}
          </span>
          <h3
            className="text-sm leading-snug transition-colors group-hover:text-white"
            style={{
              fontFamily: "var(--font-plus-jakarta)",
              fontWeight: 700,
              color: "rgba(226,226,226,0.85)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {session.title}
          </h3>
          <p
            className="text-[10px] uppercase tracking-wider"
            style={{ fontFamily: "var(--font-space-grotesk)", color: "rgba(255,255,255,0.3)" }}
          >
            {session.type}
          </p>
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
