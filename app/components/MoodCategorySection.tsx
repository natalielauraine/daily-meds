"use client";

// Mood category section — "CHOOSE WHAT YOU WANT TO EXPLORE"
// A 4-column grid of glass cards (2-col on mobile) using the neon brand gradients.
// Matches the Stitch design: large cards with gradient backgrounds and mood labels.

import { useState } from "react";
import Link from "next/link";
import { MOOD_CATEGORIES, MOOD_GRADIENTS } from "@/lib/design-tokens";

/** Extract the first hex color from a gradient string for glow effects */
function extractFirstColor(gradient: string): string {
  const match = gradient.match(/#[0-9a-fA-F]{6}/);
  return match ? match[0] : "#ff41b3";
}

const MOOD_DESCRIPTIONS: Record<string, string> = {
  "Everyday Moods": "For the regular ups and downs",
  "Sleep": "Wind down and drift off",
  "Heavy Emotions": "When it hits hard",
  "Own Your Shadow": "Face what you've been avoiding",
  "Daily Practice": "Build your daily ritual",
  "Self Love & Celebration": "Celebrate who you are",
  "Crisis Emergencies": "When you need help now",
  "Relationships": "Navigate love and connection",
  "Situationships": "The complicated ones",
  "Communication & Boundaries": "Say what you need to say",
  "Vulnerable Stuff": "Permission to feel",
  "Sexual Scenarios": "Intimacy and desire",
  "Career & Work": "Workplace pressure and ambition",
  "Life Moments": "Big transitions and milestones",
  "Grief & Loss": "Holding space for what's gone",
  "Forgiveness": "Letting go of what weighs you down",
  "Addiction": "Breaking patterns with compassion",
  "Party Recovery": "The morning after",
  "Plant Medicine": "Integration and reflection",
  "On The Road": "Meditate wherever you are",
  "Founder Stress": "For the ones building something",
  "Spirituality": "Connect to something bigger",
  "Seasonal": "Seasonal shifts and transitions",
  "Morning Meds": "Start the day right",
  "Evening Meds": "Close the day gently",
};

const MOOD_CARDS = MOOD_CATEGORIES.map((label) => {
  const gradient = MOOD_GRADIENTS[label] || "linear-gradient(135deg, #ff41b3, #ec723d)";
  return {
    label,
    description: MOOD_DESCRIPTIONS[label] || label,
    gradient,
    glowColor: extractFirstColor(gradient),
    href: `/library?mood=${encodeURIComponent(label)}`,
  };
});

// Small lotus icon used inside each card
function LotusIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.9" />
      <path d="M10 14C10 14 2 18 2 25C2 29.4 5.6 33 10 33C13 33 15.6 31.4 17 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
      <path d="M38 14C38 14 46 18 46 25C46 29.4 42.4 33 38 33C35 33 32.4 31.4 31 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
      <path d="M24 28L20 36" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M24 28L28 36" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
      <circle cx="24" cy="28" r="2" fill="white" opacity="0.85" />
    </svg>
  );
}

export default function MoodCategorySection() {
  const [activeMood, setActiveMood] = useState<string | null>(null);

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-14" style={{ background: "#131313" }}>
      <div className="max-w-7xl mx-auto">

        {/* Section heading */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p
              className="text-xs uppercase tracking-widest mb-2"
              style={{
                fontFamily: "var(--font-space-grotesk)",
                fontWeight: 500,
                color: "rgba(246,241,230,0.65)",
              }}
            >
              Browse by mood
            </p>
            <h2
              className="uppercase"
              style={{
                fontFamily: "var(--font-plus-jakarta)",
                fontWeight: 800,
                fontSize: "clamp(1.2rem, 3vw, 1.75rem)",
                letterSpacing: "-0.01em",
                color: "#f6f1e6",
              }}
            >
              Choose what you want to explore
            </h2>
          </div>
          <Link
            href="/library"
            className="text-xs uppercase tracking-widest hidden sm:flex items-center gap-1.5 transition-colors duration-200"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontWeight: 500,
              color: "rgba(246,241,230,0.65)",
            }}
          >
            See all
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
            </svg>
          </Link>
        </div>

        {/* ── 4-column mood grid (2-col on mobile, 3-col on tablet) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {MOOD_CARDS.map((mood) => {
            const isActive = activeMood === mood.label;
            return (
              <button
                key={mood.label}
                onClick={() => setActiveMood(isActive ? null : mood.label)}
                className="group relative overflow-hidden rounded-xl text-left transition-all duration-200"
                style={{
                  height: "130px",
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                  boxShadow: isActive ? `0 0 24px ${mood.glowColor}60` : "none",
                }}
                aria-pressed={isActive}
              >
                {/* Gradient background */}
                <div
                  className="absolute inset-0 transition-opacity duration-200"
                  style={{
                    background: mood.gradient,
                    opacity: isActive ? 1 : 0.75,
                  }}
                />

                {/* Glass overlay at bottom — darkens so text is readable */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-2/3"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)" }}
                />

                {/* Active glow overlay */}
                {isActive && (
                  <div
                    className="absolute inset-0"
                    style={{ background: "rgba(255,255,255,0.08)", borderRadius: "12px" }}
                  />
                )}

                {/* Icon — top right */}
                <div className="absolute top-3 right-3 opacity-60 group-hover:opacity-80 transition-opacity">
                  <LotusIcon size={20} />
                </div>

                {/* Mood name + description — bottom left */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p
                    className="text-white uppercase leading-tight mb-0.5"
                    style={{
                      fontFamily: "var(--font-plus-jakarta)",
                      fontWeight: 800,
                      fontSize: "13px",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {mood.label}
                  </p>
                  <p
                    className="text-cream/70 leading-tight"
                    style={{
                      fontFamily: "var(--font-space-grotesk)",
                      fontSize: "10px",
                    }}
                  >
                    {mood.description}
                  </p>
                </div>

                {/* Active tick */}
                {isActive && (
                  <div
                    className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.9)" }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#131313">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Active mood filter banner */}
        {activeMood && (
          <div
            className="mt-5 flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p
              className="text-sm"
              style={{ fontFamily: "var(--font-space-grotesk)", color: "rgba(246,241,230,0.8)" }}
            >
              Showing sessions for: <span className="text-white font-medium">{activeMood}</span>
            </p>
            <Link
              href={`/library?mood=${encodeURIComponent(activeMood)}`}
              className="text-xs uppercase tracking-widest px-4 py-1.5 rounded-full transition-all duration-200"
              style={{
                fontFamily: "var(--font-space-grotesk)",
                fontWeight: 700,
                background: "#ff41b3",
                color: "white",
                fontSize: "10px",
              }}
            >
              View all
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
