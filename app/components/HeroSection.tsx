"use client";

import Link from "next/link";
import { useState } from "react";


// The featured session shown in the hero — placeholder until real content is added
const FEATURED_SESSION = {
  title: "Hungover & Overwhelmed",
  description: "A gentle reset for when your body and mind are paying the price. No spiritual waffle — just calm.",
  duration: "18 min",
  type: "Guided Meditation",
  moodGradient: "linear-gradient(135deg, #6B21E8 0%, #8B3CF7 25%, #6366F1 60%, #3B82F6 80%, #22D3EE 100%)",
};

// The cinematic hero section — the first thing visitors see on the homepage.
export default function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress] = useState(32);

  return (
    <section className="relative w-full">
      {/* ── CINEMATIC HERO BACKGROUND ── */}
      <div className="relative w-full overflow-hidden">

        {/* Dark base */}
        <div className="absolute inset-0 bg-[#0D0D1A]" />

        {/* Ambient glow orbs — cinematic lighting effect */}
        <div
          className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, #8B3CF7 0%, #6B21E8 40%, transparent 72%)",
            opacity: 0.4,
            filter: "blur(90px)",
          }}
        />
        <div
          className="absolute -top-10 -right-10 w-[550px] h-[550px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, #F43F5E 0%, #D946EF 40%, transparent 72%)",
            opacity: 0.3,
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, #22D3EE 0%, #3B82F6 50%, transparent 80%)",
            opacity: 0.15,
            filter: "blur(70px)",
          }}
        />

        {/* Bottom fade into content below */}
        <div
          className="absolute bottom-0 left-0 right-0 h-56 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent 0%, #0D0D1A 100%)" }}
        />

        {/* ── HERO CONTENT ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20">

          {/* Personalised greeting */}
          <p className="text-white/40 text-sm mb-10 tracking-wide">
            Good morning — ready for your reset?
          </p>

          {/* Two-column layout on desktop: headline left, player right */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* ── LEFT: Headline + tagline + CTAs ── */}
            {/* On mobile this appears below the player card (order-2), on desktop it sits left */}
            <div className="flex-1 text-center lg:text-left max-w-xl order-2 lg:order-1">
              <div
                className="inline-block text-xs px-3 py-1 rounded-full mb-6 tracking-widest uppercase"
                style={{ background: "rgba(139,92,246,0.2)", color: "#A78BFA" }}
              >
                Featured Session
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl text-white mb-5 leading-tight">
                Audio for{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #F43F5E, #D946EF, #F97316, #FACC15)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  emotional emergencies
                </span>
              </h1>
              <p className="text-white/50 text-base sm:text-lg leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
                Meditation for life's most awkward moments. Practical, grounded, no spiritual waffle.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-2 text-white text-sm px-7 py-3.5 rounded-md hover:opacity-90 transition-opacity"
                  style={{ background: "linear-gradient(135deg, #8B3CF7, #6366F1)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Start free
                </Link>
                <Link
                  href="/free"
                  className="flex items-center justify-center gap-2 text-white/70 text-sm px-7 py-3.5 rounded-md border border-white/20 hover:text-white hover:border-white/40 transition-colors"
                >
                  Browse sessions
                </Link>
              </div>
            </div>

            {/* ── RIGHT: Audio player card ── */}
            {/* On mobile this appears first (order-1), on desktop it sits right */}
            <div className="w-full lg:w-auto lg:flex-shrink-0 order-1 lg:order-2" style={{ maxWidth: "420px" }}>
              {/* Gradient border wrapper */}
              <div
                className="rounded-2xl p-px"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(139,92,246,0.7) 0%, rgba(99,102,241,0.4) 50%, rgba(34,211,238,0.3) 100%)",
                }}
              >
                <div
                  className="rounded-2xl p-5 sm:p-7 flex flex-col items-center gap-6 w-full"
                  style={{
                    backgroundColor: "rgba(13,13,26,0.92)",
                    backdropFilter: "blur(24px)",
                  }}
                >
                  {/* Gradient lotus icon */}
                  <div className="relative">
                    <div
                      className="absolute inset-0 rounded-full scale-110"
                      style={{
                        background: FEATURED_SESSION.moodGradient,
                        opacity: 0.5,
                        filter: "blur(24px)",
                      }}
                    />
                    <div
                      className="relative w-24 h-24 rounded-full flex items-center justify-center"
                      style={{ background: FEATURED_SESSION.moodGradient }}
                    >
                      <svg width="50" height="50" viewBox="0 0 48 48" fill="none">
                        <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.95" />
                        <path d="M10 14C10 14 2 18 2 25C2 29.4 5.6 33 10 33C13 33 15.6 31.4 17 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
                        <path d="M38 14C38 14 46 18 46 25C46 29.4 42.4 33 38 33C35 33 32.4 31.4 31 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
                        <path d="M24 28C24 28 20 33 18 37C17 39 18 41 20 42" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75" />
                        <path d="M24 28C24 28 28 33 30 37C31 39 30 41 28 42" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75" />
                        <circle cx="24" cy="28" r="2" fill="white" opacity="0.9" />
                      </svg>
                    </div>
                  </div>

                  {/* Session info */}
                  <div className="text-center w-full">
                    <div className="flex items-center justify-center gap-2 mb-2.5">
                      <span
                        className="text-xs px-2.5 py-0.5 rounded-full"
                        style={{ background: "rgba(139,92,246,0.25)", color: "#A78BFA" }}
                      >
                        {FEATURED_SESSION.type}
                      </span>
                      <span className="text-white/35 text-xs">{FEATURED_SESSION.duration}</span>
                    </div>
                    <h2 className="text-xl text-white mb-2">{FEATURED_SESSION.title}</h2>
                    <p className="text-white/45 text-sm leading-relaxed">{FEATURED_SESSION.description}</p>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full flex flex-col gap-1.5">
                    <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden cursor-pointer">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${progress}%`,
                          background: "linear-gradient(90deg, #8B3CF7 0%, #22D3EE 100%)",
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-white/30 text-xs">
                      <span>5:42</span>
                      <span>18:00</span>
                    </div>
                  </div>

                  {/* Player controls */}
                  <div className="flex items-center gap-8">
                    {/* Skip back 15s */}
                    <button
                      className="flex flex-col items-center gap-1 text-white/40 hover:text-white/70 transition-colors p-3"
                      aria-label="Skip back 15 seconds"
                    >
                      {/* Back arrow: two triangles pointing left */}
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
                      </svg>
                      <span className="text-white/40" style={{ fontSize: "9px", lineHeight: 1 }}>15s</span>
                    </button>

                    {/* Play / Pause */}
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                      style={{ background: "linear-gradient(135deg, #8B3CF7, #6366F1)" }}
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style={{ marginLeft: "2px" }}>
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>

                    {/* Skip forward 15s */}
                    <button
                      className="flex flex-col items-center gap-1 text-white/40 hover:text-white/70 transition-colors p-3"
                      aria-label="Skip forward 15 seconds"
                    >
                      {/* Forward arrow: two triangles pointing right */}
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 18l8.5-6L6 6v12zm2.5-6L16 6v12z" />
                      </svg>
                      <span className="text-white/40" style={{ fontSize: "9px", lineHeight: 1 }}>15s</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
