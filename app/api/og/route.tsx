// OG image generator — produces a 1200×630 social share image for every page.
// Usage: /api/og?title=My+Page&mood=Anxious&description=Short+desc
// Called automatically via the root layout metadata and individual page overrides.

import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const MOOD_COLORS: Record<string, string[]> = {
  Anxious:        ["#ec723d", "#f4e71d"],
  Hungover:       ["#ff41b3", "#ec723d"],
  "Can't Sleep":  ["#ff41b3", "#adf225"],
  Overwhelmed:    ["#ec723d", "#f4e71d"],
  Heartbroken:    ["#ff41b3", "#ec723d"],
  "After The Sesh": ["#ff41b3", "#f4e71d"],
  "On A Comedown":  ["#adf225", "#f4e71d"],
  "Focus Mode":   ["#adf225", "#ec723d"],
  Default:        ["#ff41b3", "#ec723d"],
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title       = searchParams.get("title")       ?? "Daily Meds";
  const description = searchParams.get("description") ?? "Audio for Emotional Emergencies";
  const mood        = searchParams.get("mood")        ?? "Default";
  const label       = searchParams.get("label")       ?? "";

  const [colorA, colorB] = MOOD_COLORS[mood] ?? MOOD_COLORS.Default;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0e0e0e",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow blobs */}
        <div style={{
          position: "absolute",
          top: -120,
          left: -120,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colorA}22 0%, transparent 70%)`,
        }} />
        <div style={{
          position: "absolute",
          bottom: -100,
          right: -100,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colorB}1a 0%, transparent 70%)`,
        }} />

        {/* Top noise texture simulation — horizontal lines */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 3px)`,
        }} />

        {/* Content */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          height: "100%",
          position: "relative",
        }}>

          {/* Top: logo + label */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Logo mark */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${colorA}, ${colorB})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {/* Droplet SVG simplified */}
                <div style={{
                  width: 16,
                  height: 20,
                  background: "white",
                  borderRadius: "50% 50% 40% 40% / 60% 60% 40% 40%",
                  opacity: 0.95,
                }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{
                  color: "white",
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  textTransform: "uppercase",
                  lineHeight: 1,
                }}>
                  Daily Meds
                </span>
                <span style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 12,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginTop: 3,
                }}>
                  thedailymeds.com
                </span>
              </div>
            </div>

            {/* Mood / label pill */}
            {(mood !== "Default" || label) && (
              <div style={{
                padding: "8px 20px",
                borderRadius: 999,
                background: `linear-gradient(135deg, ${colorA}30, ${colorB}20)`,
                border: `1px solid ${colorA}50`,
                color: colorA,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}>
                {label || mood}
              </div>
            )}
          </div>

          {/* Middle: title + description */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
            <div style={{
              fontSize: title.length > 40 ? 60 : title.length > 25 ? 72 : 86,
              fontWeight: 900,
              color: "white",
              lineHeight: 0.92,
              letterSpacing: "-0.05em",
              textTransform: "uppercase",
            }}>
              {title}
            </div>
            {description && (
              <div style={{
                fontSize: 22,
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.5,
                maxWidth: 700,
                fontWeight: 400,
              }}>
                {description}
              </div>
            )}
          </div>

          {/* Bottom: gradient bar */}
          <div style={{
            width: "100%",
            height: 4,
            borderRadius: 2,
            background: `linear-gradient(90deg, ${colorA}, ${colorB})`,
          }} />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
