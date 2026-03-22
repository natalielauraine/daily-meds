// OG image API route — generates a branded Open Graph share image for each session.
// Stripe calls this automatically when a session link is shared on WhatsApp, iMessage, Twitter etc.
// The image shows the session title, mood category, and Daily Meds branding.
// Usage: /api/og?title=Session+Name&mood=Anxious&duration=8+min

import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// Map mood categories to their brand colours
const MOOD_COLORS: Record<string, { from: string; to: string }> = {
  "Hungover":        { from: "#6B21E8", to: "#22D3EE" },
  "After The Sesh":  { from: "#F43F5E", to: "#FACC15" },
  "On A Comedown":   { from: "#10B981", to: "#D9F100" },
  "Feeling Empty":   { from: "#6B21E8", to: "#22D3EE" },
  "Can't Sleep":     { from: "#8B3CF7", to: "#6366F1" },
  "Anxious":         { from: "#F43F5E", to: "#F97316" },
  "Heartbroken":     { from: "#EC4899", to: "#D946EF" },
  "Overwhelmed":     { from: "#F97316", to: "#FACC15" },
  "Low Energy":      { from: "#10B981", to: "#22C55E" },
  "Morning Reset":   { from: "#F43F5E", to: "#FACC15" },
  "Focus Mode":      { from: "#6B21E8", to: "#6366F1" },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title    = searchParams.get("title")    ?? "Daily Meds";
  const mood     = searchParams.get("mood")     ?? "";
  const duration = searchParams.get("duration") ?? "";

  const colors = MOOD_COLORS[mood] ?? { from: "#8B5CF6", to: "#22D3EE" };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#0D0D1A",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          padding: "60px",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.from}18 0%, transparent 70%)`,
          }}
        />

        {/* Gradient circle icon */}
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
            marginBottom: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Simple lotus silhouette */}
          <svg width="50" height="50" viewBox="0 0 48 48" fill="none">
            <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.95"/>
            <path d="M24 28L20 35" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M24 28L28 35" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="24" cy="28" r="2" fill="white" opacity="0.9"/>
          </svg>
        </div>

        {/* Mood badge */}
        {mood ? (
          <div
            style={{
              background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
              color: "white",
              padding: "6px 18px",
              borderRadius: 20,
              fontSize: 18,
              marginBottom: 24,
              fontWeight: 500,
            }}
          >
            {mood}
          </div>
        ) : null}

        {/* Session title */}
        <div
          style={{
            color: "white",
            fontSize: title.length > 30 ? 48 : 60,
            fontWeight: 500,
            textAlign: "center",
            marginBottom: 16,
            maxWidth: 900,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>

        {/* Duration */}
        {duration ? (
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 24, marginBottom: 0 }}>
            {duration}
          </div>
        ) : null}

        {/* Brand footer */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
            }}
          />
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 20 }}>
            thedailymeds.com
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
