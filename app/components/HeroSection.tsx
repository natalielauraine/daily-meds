"use client";

// Cinematic hero section — the first thing visitors see on the homepage.
// Full-bleed dark background with neon pink/orange/green glow orbs.
// Left-aligned session headline + inline audio player (Stitch design pattern).

import Link from "next/link";
import { useState } from "react";

// The featured session shown in the hero — placeholder until real content is wired up
const FEATURED_SESSION = {
  title: "Too Many Bills",
  description: "If you pressed play, something's on your mind.",
  duration: "12:00",
  currentTime: "04:20",
  progress: 36,
  type: "Guided Release",
  author: "Natalie Lauraine",
  // Neon pink → orange for this session
  gradient: "linear-gradient(135deg, #ff41b3 0%, #ec723d 100%)",
  glowColor: "#ff41b3",
};

export default function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="relative w-full overflow-hidden">

      {/* ── BACKGROUND: dark base + neon glow orbs ── */}
      <div className="absolute inset-0 bg-[#131313]" />

      {/* Neon pink glow — top left */}
      <div
        className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, #ff41b3 0%, rgba(255,65,179,0.3) 40%, transparent 70%)",
          opacity: 0.35,
          filter: "blur(100px)",
        }}
      />

      {/* Orange glow — top right */}
      <div
        className="absolute -top-20 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, #ec723d 0%, rgba(236,114,61,0.2) 50%, transparent 75%)",
          opacity: 0.25,
          filter: "blur(80px)",
        }}
      />

      {/* Neon green glow — bottom right */}
      <div
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, #adf225 0%, rgba(173,242,37,0.15) 50%, transparent 80%)",
          opacity: 0.2,
          filter: "blur(80px)",
        }}
      />

      {/* Bottom fade into section below */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent 0%, #131313 100%)" }}
      />

      {/* ── HERO CONTENT ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">

        {/* Small label above the title */}
        <p
          className="text-xs uppercase tracking-widest mb-4"
          style={{
            fontFamily: "var(--font-space-grotesk)",
            fontWeight: 500,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          Featured Session
        </p>

        {/* ── BIG SESSION TITLE — cinematic, all caps, neon glow ── */}
        <h1
          className="mb-3 leading-none uppercase"
          style={{
            fontFamily: "var(--font-plus-jakarta)",
            fontWeight: 800,
            fontSize: "clamp(2.8rem, 8vw, 7rem)",
            letterSpacing: "-0.02em",
            color: "#E2E2E2",
            textShadow: "0 0 60px rgba(255,65,179,0.2)",
          }}
        >
          {FEATURED_SESSION.title}
        </h1>

        {/* Author + type */}
        <div className="flex items-center gap-3 mb-8">
          <span
            className="text-sm uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontWeight: 500,
              color: "#ff41b3",
            }}
          >
            {FEATURED_SESSION.author}
          </span>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
          <span
            className="text-sm uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontWeight: 400,
              color: "rgba(255,255,255,0.4)",
            }}
          >
            {FEATURED_SESSION.type}
          </span>
        </div>

        {/* ── INLINE AUDIO PLAYER ── */}
        {/* Matches the Stitch design: progress bar + timestamp + play button in one row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-10 max-w-2xl">

          {/* Play / Pause button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 active:scale-95"
            style={{
              background: "#ff41b3",
              boxShadow: isPlaying
                ? "0 0 32px rgba(255,65,179,0.7)"
                : "0 0 16px rgba(255,65,179,0.4)",
            }}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ marginLeft: "2px" }}>
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Progress bar + timestamps */}
          <div className="flex-1 flex flex-col gap-2">
            {/* Progress track */}
            <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${FEATURED_SESSION.progress}%`,
                  background: "linear-gradient(90deg, #ff41b3 0%, #ec723d 100%)",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            {/* Timestamps */}
            <div className="flex justify-between">
              <span
                style={{
                  fontFamily: "var(--font-space-grotesk)",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {FEATURED_SESSION.currentTime}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-space-grotesk)",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {FEATURED_SESSION.duration}
              </span>
            </div>
          </div>
        </div>

        {/* Tagline + CTAs */}
        <p
          className="text-base mb-8 max-w-md"
          style={{
            fontFamily: "var(--font-inter)",
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.6,
          }}
        >
          {FEATURED_SESSION.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Primary CTA */}
          <Link
            href="/signup"
            className="flex items-center justify-center gap-2 text-white text-sm px-7 py-3.5 rounded-full transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontWeight: 700,
              fontSize: "12px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              background: "#ff41b3",
              boxShadow: "0 0 20px rgba(255,65,179,0.4)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
            Start for free
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/library"
            className="flex items-center justify-center gap-2 text-sm px-7 py-3.5 rounded-full transition-all duration-200"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontWeight: 500,
              fontSize: "12px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.6)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Browse sessions
          </Link>
        </div>

      </div>
    </section>
  );
}
