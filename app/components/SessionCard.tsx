"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import AddToPlaylistModal from "./AddToPlaylistModal";

// The shape of a single session — used across all content rows
export type Session = {
  id: string;
  title: string;
  description: string;
  duration: string;           // e.g. "18 min"
  type: string;               // e.g. "Guided Meditation", "Breathwork", "Sleep"
  moodCategory: string;       // e.g. "Hungover", "Anxious"
  gradient: string;           // CSS gradient string for the thumbnail background
  glowColor: string;          // Single colour for the glow effect
  isFree: boolean;            // Whether this session is free or premium
};

// Neon brand gradients — maps mood category names to their gradient
// Uses the confirmed brand colours: pink #ff41b3, green #adf225, yellow #f4e71d, orange #ec723d
const MOOD_GRADIENTS: Record<string, string> = {
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

// A single session card — shown in horizontal scrolling content rows.
// Glass-card thumbnail with neon gradient bg, pink play button on hover.
export default function SessionCard({ session }: { session: Session }) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <>
      <div
        className="shrink-0 cursor-pointer group block"
        style={{ width: "220px" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* ── THUMBNAIL ── */}
        <div
          className="relative overflow-hidden mb-3 transition-transform duration-200"
          style={{
            height: "130px",
            borderRadius: "12px",
            transform: hovered && !menuOpen ? "scale(1.03)" : "scale(1)",
          }}
        >
          <Link href={`/session/${session.id}`} className="absolute inset-0">
            {/* Neon gradient background */}
            <div className="absolute inset-0" style={{ background: session.gradient }} />

            {/* Dark overlay at bottom for text readability */}
            <div
              className="absolute bottom-0 left-0 right-0 h-14"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)" }}
            />

            {/* Lotus icon — centred */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }}
              >
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                  <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.95" />
                  <path d="M10 14C10 14 2 18 2 25C2 29.4 5.6 33 10 33C13 33 15.6 31.4 17 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
                  <path d="M38 14C38 14 46 18 46 25C46 29.4 42.4 33 38 33C35 33 32.4 31.4 31 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
                  <path d="M24 28L20 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75" />
                  <path d="M24 28L28 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75" />
                  <circle cx="24" cy="28" r="2" fill="white" opacity="0.9" />
                </svg>
              </div>
            </div>

            {/* Play button — slides in on hover */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
              style={{ opacity: hovered && !menuOpen ? 1 : 0 }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: "#ff41b3", boxShadow: "0 0 20px rgba(255,65,179,0.6)" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="white" style={{ marginLeft: "2px" }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            {/* FREE badge */}
            {session.isFree && (
              <div
                className="absolute top-2 left-2 text-white text-[9px] px-1.5 py-0.5 rounded"
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

            {/* Duration badge */}
            <div
              className="absolute bottom-2 right-2 text-white/80 text-[10px] px-1.5 py-0.5 rounded"
              style={{
                background: "rgba(0,0,0,0.5)",
                fontFamily: "var(--font-space-grotesk)",
              }}
            >
              {session.duration}
            </div>
          </Link>

          {/* Three-dot menu — top right, appears on hover */}
          <div ref={menuRef} className="absolute top-2 right-2">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen((o) => !o); }}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity"
              style={{
                background: "rgba(0,0,0,0.55)",
                opacity: hovered || menuOpen ? 1 : 0,
              }}
              aria-label="More options"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>

            {menuOpen && (
              <div
                className="absolute top-8 right-0 rounded-xl py-1 z-50 min-w-[150px]"
                style={{
                  background: "rgba(31,31,31,0.97)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                }}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuOpen(false);
                    setShowPlaylistModal(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors hover:bg-white/[0.05] text-left"
                  style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-space-grotesk)" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 6h18v2H3zm0 5h12v2H3zm0 5h18v2H3zm16-3v-3h-2v3h-3v2h3v3h2v-3h3v-2z" />
                  </svg>
                  Save to playlist
                </button>
                <Link
                  href={`/session/${session.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors hover:bg-white/[0.05]"
                  style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-space-grotesk)" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Play session
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── SESSION INFO ── */}
        <Link href={`/session/${session.id}`}>
          <div>
            {/* Mood badge — neon gradient pill */}
            <div className="mb-1.5">
              <span
                className="text-[9px] px-2 py-0.5 rounded-full text-white"
                style={{
                  background: MOOD_GRADIENTS[session.moodCategory] ?? "linear-gradient(135deg, #ff41b3, #ec723d)",
                  fontFamily: "var(--font-space-grotesk)",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {session.moodCategory}
              </span>
            </div>

            {/* Title */}
            <h3
              className="text-sm leading-snug mb-0.5 transition-colors duration-200"
              style={{
                fontFamily: "var(--font-plus-jakarta)",
                fontWeight: 700,
                color: hovered ? "#E2E2E2" : "rgba(226,226,226,0.85)",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {session.title}
            </h3>

            {/* Session type */}
            <p
              className="text-[10px] uppercase tracking-wider"
              style={{
                fontFamily: "var(--font-space-grotesk)",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              {session.type}
            </p>
          </div>
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
