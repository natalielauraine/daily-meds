"use client";

import Link from "next/link";
import { useState } from "react";

// The shape of a single session — used across all content rows
export type Session = {
  id: string;
  title: string;
  description: string;
  duration: string;           // e.g. "18 min"
  type: string;               // e.g. "Guided Meditation", "Breathwork", "Sleep"
  moodCategory: string;       // e.g. "Hungover", "Anxious"
  gradient: string;           // CSS gradient string for the thumbnail
  glowColor: string;          // Single colour for the glow effect
  isFree: boolean;            // Whether this session is free or premium
};

// Maps mood category names to their brand gradients — used on mood badge
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

// A single session card — shown in horizontal scrolling rows.
// Has a gradient thumbnail, play button on hover, title, mood badge and duration.
export default function SessionCard({ session }: { session: Session }) {
  // Show the play button overlay when the user hovers
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/session/${session.id}`}
      className="shrink-0 cursor-pointer group block"
      style={{ width: "240px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── THUMBNAIL ── */}
      <div
        className="relative rounded-[10px] overflow-hidden mb-3 transition-transform duration-200"
        style={{
          height: "130px",
          transform: hovered ? "scale(1.03)" : "scale(1)",
          border: "0.5px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Gradient background — placeholder for real thumbnails later */}
        <div
          className="absolute inset-0"
          style={{ background: session.gradient }}
        />

        {/* Subtle dark overlay at the bottom so text is readable if added */}
        <div
          className="absolute bottom-0 left-0 right-0 h-12"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)" }}
        />

        {/* Lotus icon — centred in the thumbnail */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }}
          >
            <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
              <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.95" />
              <path d="M10 14C10 14 2 18 2 25C2 29.4 5.6 33 10 33C13 33 15.6 31.4 17 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
              <path d="M38 14C38 14 46 18 46 25C46 29.4 42.4 33 38 33C35 33 32.4 31.4 31 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
              <path d="M24 28L20 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75" />
              <path d="M24 28L28 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75" />
              <circle cx="24" cy="28" r="2" fill="white" opacity="0.9" />
            </svg>
          </div>
        </div>

        {/* Play button — fades in on hover */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
          style={{ opacity: hovered ? 1 : 0 }}
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: "rgba(139,92,246,0.9)", backdropFilter: "blur(4px)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ marginLeft: "2px" }}>
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Free badge — top left corner */}
        {session.isFree && (
          <div
            className="absolute top-2 left-2 text-white text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: "rgba(16,185,129,0.85)", fontWeight: 500 }}
          >
            FREE
          </div>
        )}

        {/* Duration — bottom right corner */}
        <div
          className="absolute bottom-2 right-2 text-white/80 text-[10px] px-1.5 py-0.5 rounded"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          {session.duration}
        </div>
      </div>

      {/* ── SESSION INFO ── */}
      <div>
        {/* Mood category badge */}
        <div className="mb-1.5">
          <span
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{
              background: MOOD_GRADIENTS[session.moodCategory] ?? "linear-gradient(135deg, #6B21E8, #22D3EE)",
              color: "white",
              fontWeight: 500,
            }}
          >
            {session.moodCategory}
          </span>
        </div>

        {/* Session title */}
        <h3
          className="text-sm text-white leading-snug mb-0.5 transition-colors duration-200"
          style={{
            fontWeight: 500,
            color: hovered ? "white" : "rgba(255,255,255,0.85)",
            // Clamp to 2 lines max
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {session.title}
        </h3>

        {/* Session type */}
        <p className="text-[11px] text-white/35">{session.type}</p>
      </div>
    </Link>
  );
}
