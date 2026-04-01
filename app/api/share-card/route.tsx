// Share card API — generates a 1080x1080 branded image after a session completes.
// Used by the ShareSessionModal to give users a downloadable/shareable card.
// Parameters: title, mood, duration, streak
// Usage: /api/share-card?title=Hungover+%26+Overwhelmed&mood=Hungover&duration=18+min&streak=7

import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// Mood → brand gradient colours (matches the app design system exactly)
const MOOD_COLORS: Record<string, { from: string; via?: string; to: string }> = {
  "Hungover":        { from: "#ff41b3", to: "#ec723d" },
  "After The Sesh":  { from: "#ff41b3", to: "#f4e71d" },
  "On A Comedown":   { from: "#adf225", to: "#f4e71d" },
  "Feeling Empty":   { from: "#ff41b3", to: "#ec723d" },
  "Can't Sleep":     { from: "#ff41b3", to: "#adf225" },
  "Anxious":         { from: "#ec723d", to: "#f4e71d" },
  "Heartbroken":     { from: "#ff41b3", to: "#ec723d" },
  "Overwhelmed":     { from: "#ec723d", to: "#f4e71d" },
  "Low Energy":      { from: "#adf225", to: "#f4e71d" },
  "Morning Reset":   { from: "#ff41b3", via: "#ec723d", to: "#f4e71d" },
  "Focus Mode":      { from: "#adf225", to: "#ec723d" },
};

const DEFAULT_COLORS = { from: "#ff41b3", to: "#ec723d" };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title    = searchParams.get("title")    ?? "Session Complete";
  const mood     = searchParams.get("mood")     ?? "";
  const duration = searchParams.get("duration") ?? "";
  const streak   = parseInt(searchParams.get("streak") ?? "1");

  const c = MOOD_COLORS[mood] ?? DEFAULT_COLORS;
  const gradientCss = c.via
    ? `linear-gradient(135deg, ${c.from}, ${c.via}, ${c.to})`
    : `linear-gradient(135deg, ${c.from}, ${c.to})`;

  // Truncate very long titles so they don't overflow
  const displayTitle = title.length > 50 ? title.substring(0, 48) + "…" : title;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* ── GRADIENT BACKGROUND ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: gradientCss,
            display: "flex",
          }}
        />

        {/* ── DARK OVERLAY — makes text readable ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.38)",
            display: "flex",
          }}
        />

        {/* ── TOP BAR — Daily Meds wordmark ── */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
          }}
        >
          {/* Lotus mark */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
              <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.95"/>
              <path d="M24 28L20 35" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M24 28L28 35" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="24" cy="28" r="2" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <span
            style={{
              color: "white",
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              opacity: 0.9,
            }}
          >
            Daily Meds
          </span>
        </div>

        {/* ── CENTRE CONTENT ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
            marginTop: -40,
          }}
        >
          {/* Big lotus icon circle */}
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              border: "1.5px solid rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 48,
            }}
          >
            <svg width="80" height="80" viewBox="0 0 48 48" fill="none">
              <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.95"/>
              <path d="M10 14C10 14 2 18 2 25C2 29.4 5.6 33 10 33C13 33 15.6 31.4 17 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85"/>
              <path d="M38 14C38 14 46 18 46 25C46 29.4 42.4 33 38 33C35 33 32.4 31.4 31 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85"/>
              <path d="M24 28L20 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75"/>
              <path d="M24 28L28 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75"/>
              <circle cx="24" cy="28" r="2" fill="white" opacity="0.9"/>
            </svg>
          </div>

          {/* Session title */}
          <div
            style={{
              color: "white",
              fontSize: displayTitle.length > 30 ? 56 : 68,
              fontWeight: 600,
              textAlign: "center",
              lineHeight: 1.15,
              maxWidth: 820,
              marginBottom: 32,
              textShadow: "0 2px 20px rgba(0,0,0,0.3)",
            }}
          >
            {displayTitle}
          </div>

          {/* Mood + duration row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginBottom: 48,
            }}
          >
            {/* Mood pill */}
            <div
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.35)",
                borderRadius: 24,
                padding: "10px 24px",
                color: "white",
                fontSize: 26,
                fontWeight: 500,
              }}
            >
              {mood || "Meditation"}
            </div>

            {/* Dot separator */}
            {duration && (
              <>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.4)", display: "flex" }} />
                {/* Duration */}
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 26 }}>
                  {duration}
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div
            style={{
              width: 80,
              height: 1,
              background: "rgba(255,255,255,0.25)",
              marginBottom: 40,
              display: "flex",
            }}
          />

          {/* Streak */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 28,
            }}
          >
            <span style={{ fontSize: 44 }}>🔥</span>
            <span style={{ color: "white", fontSize: 36, fontWeight: 600 }}>
              {streak} day streak
            </span>
          </div>

          {/* Tagline */}
          <div
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 28,
              fontStyle: "italic",
              letterSpacing: "0.01em",
            }}
          >
            I just meditated with Daily Meds
          </div>
        </div>

        {/* ── BOTTOM — website ── */}
        <div
          style={{
            position: "absolute",
            bottom: 56,
            color: "rgba(255,255,255,0.45)",
            fontSize: 22,
            letterSpacing: "0.04em",
            display: "flex",
          }}
        >
          thedailymeds.com
        </div>
      </div>
    ),
    { width: 1080, height: 1080 }
  );
}
