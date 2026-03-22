"use client";

import { useState } from "react";

// Each mood category — label, its brand gradient, and a short description
const MOOD_CATEGORIES = [
  {
    label: "Hungover",
    description: "Gentle recovery sessions",
    gradient: "linear-gradient(135deg, #6B21E8 0%, #8B3CF7 40%, #22D3EE 100%)",
    glowColor: "#8B3CF7",
  },
  {
    label: "After The Sesh",
    description: "Come back to yourself",
    gradient: "linear-gradient(135deg, #F43F5E 0%, #EC4899 20%, #D946EF 35%, #F97316 65%, #FACC15 100%)",
    glowColor: "#F43F5E",
  },
  {
    label: "On A Comedown",
    description: "Grounding and steady",
    gradient: "linear-gradient(135deg, #10B981 0%, #22C55E 35%, #84CC16 70%, #D9F100 100%)",
    glowColor: "#22C55E",
  },
  {
    label: "Feeling Empty",
    description: "Fill the quiet inside",
    gradient: "linear-gradient(135deg, #6B21E8 0%, #6366F1 60%, #22D3EE 100%)",
    glowColor: "#6366F1",
  },
  {
    label: "Can't Sleep",
    description: "Drift off with ease",
    gradient: "linear-gradient(135deg, #8B3CF7 0%, #6366F1 100%)",
    glowColor: "#8B3CF7",
  },
  {
    label: "Anxious",
    description: "Slow your system down",
    gradient: "linear-gradient(135deg, #F43F5E 0%, #F97316 100%)",
    glowColor: "#F43F5E",
  },
  {
    label: "Heartbroken",
    description: "Feel it. Then release it.",
    gradient: "linear-gradient(135deg, #EC4899 0%, #D946EF 100%)",
    glowColor: "#EC4899",
  },
  {
    label: "Overwhelmed",
    description: "One breath at a time",
    gradient: "linear-gradient(135deg, #F97316 0%, #FACC15 100%)",
    glowColor: "#F97316",
  },
  {
    label: "Low Energy",
    description: "Gentle lift, no pressure",
    gradient: "linear-gradient(135deg, #10B981 0%, #22C55E 100%)",
    glowColor: "#10B981",
  },
  {
    label: "Morning Reset",
    description: "Start the day right",
    gradient: "linear-gradient(135deg, #F43F5E 0%, #F97316 60%, #FACC15 100%)",
    glowColor: "#F97316",
  },
  {
    label: "Focus Mode",
    description: "Quiet the noise. Go deep.",
    gradient: "linear-gradient(135deg, #6B21E8 0%, #6366F1 100%)",
    glowColor: "#6B21E8",
  },
];

// Lotus/meditation figure SVG — used inside each mood icon circle
function LotusIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Top petal */}
      <path
        d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z"
        fill="white"
        opacity="0.95"
      />
      {/* Left petal */}
      <path
        d="M10 14C10 14 2 18 2 25C2 29.4 5.6 33 10 33C13 33 15.6 31.4 17 29"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      {/* Right petal */}
      <path
        d="M38 14C38 14 46 18 46 25C46 29.4 42.4 33 38 33C35 33 32.4 31.4 31 29"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      {/* Left leg */}
      <path
        d="M24 28C24 28 20 33 18 37C17 39 18 41 20 42"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
      {/* Right leg */}
      <path
        d="M24 28C24 28 28 33 30 37C31 39 30 41 28 42"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
      {/* Centre dot (head) */}
      <circle cx="24" cy="28" r="2" fill="white" opacity="0.9" />
    </svg>
  );
}

// The mood category browsing section — shown below the hero on the homepage.
// Each mood has its own gradient colour from the brand palette.
// Clicking a mood highlights it (will filter content rows in a future phase).
export default function MoodCategorySection() {
  const [activeMood, setActiveMood] = useState<string | null>(null);

  return (
    <section className="bg-[#0D0D1A] px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-lg text-white">How are you feeling?</h2>
          <span className="text-white/35 text-xs">
            {activeMood ? `Showing: ${activeMood}` : "Tap a mood to filter"}
          </span>
        </div>

        {/* Horizontally scrollable mood card row */}
        <div
          className="flex gap-3 overflow-x-auto pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {MOOD_CATEGORIES.map((mood) => {
            const isActive = activeMood === mood.label;

            return (
              <button
                key={mood.label}
                onClick={() => setActiveMood(isActive ? null : mood.label)}
                className="shrink-0 flex flex-col items-center gap-3 group"
                style={{ width: "110px" }}
                aria-pressed={isActive}
              >
                {/* Gradient icon circle */}
                <div className="relative">
                  {/* Glow behind the icon — more visible when active */}
                  <div
                    className="absolute inset-0 rounded-full transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle, ${mood.glowColor} 0%, transparent 70%)`,
                      opacity: isActive ? 0.6 : 0,
                      filter: "blur(12px)",
                      transform: "scale(1.4)",
                    }}
                  />
                  {/* Icon circle */}
                  <div
                    className="relative rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                    style={{
                      width: "72px",
                      height: "72px",
                      background: mood.gradient,
                      boxShadow: isActive
                        ? `0 0 28px ${mood.glowColor}70`
                        : "none",
                    }}
                  >
                    <LotusIcon size={30} />
                  </div>

                  {/* Active tick badge */}
                  {isActive && (
                    <div
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: mood.gradient }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Mood label */}
                <span
                  className="text-center text-xs leading-tight transition-colors duration-200"
                  style={{
                    color: isActive ? "white" : "rgba(255,255,255,0.55)",
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {mood.label}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
