"use client";

// Live room page — embeds the Daily.co room so users can join a live session.
// The roomName comes from the URL (e.g. /live/sunday-morning-reset).
// Daily.co room URL is built from NEXT_PUBLIC_DAILY_DOMAIN + roomName.
// No API key needed on the client — the iframe handles auth via Daily.co.

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";

export default function LiveRoomPage() {
  const params = useParams();
  const roomName = params?.roomName as string;

  const dailyDomain = process.env.NEXT_PUBLIC_DAILY_DOMAIN;
  const [micAllowed, setMicAllowed] = useState(false);
  const [camAllowed, setCamAllowed] = useState(false);
  const [joined, setJoined] = useState(false);

  // Build the Daily.co room URL
  // Format: https://your-domain.daily.co/room-name
  const roomUrl = dailyDomain
    ? `https://${dailyDomain}/${roomName}`
    : null;

  // Track permission state to show the right pre-join UI
  useEffect(() => {
    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((result) => {
        setMicAllowed(result.state === "granted");
      })
      .catch(() => {});
  }, []);

  // No Daily domain configured yet — show setup instructions
  if (!dailyDomain) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div
            className="w-full max-w-md p-8 rounded-[10px] text-center"
            style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.1)" }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "linear-gradient(135deg, #6B21E8, #22D3EE)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
            <h2 className="text-white text-lg mb-2" style={{ fontWeight: 500 }}>Daily.co not configured</h2>
            <p className="text-sm text-white/40 leading-relaxed mb-6">
              Add your Daily.co domain to <code className="text-white/60 bg-white/[0.06] px-1.5 py-0.5 rounded text-xs">.env.local</code> to enable live sessions.
            </p>
            <div
              className="text-left p-4 rounded-lg mb-6 text-xs text-white/50 font-mono"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)" }}
            >
              <p className="text-white/30 mb-1"># .env.local</p>
              <p>NEXT_PUBLIC_DAILY_DOMAIN=your-name.daily.co</p>
              <p>DAILY_API_KEY=your-api-key</p>
            </div>
            <Link
              href="/live"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Back to Live Sessions
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
      <Navbar />

      <main className="flex-1 flex flex-col">

        {/* Top bar */}
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-3"
          style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
        >
          <Link
            href="/live"
            className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Back
          </Link>

          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
            </span>
            <span className="text-xs text-white/50" style={{ fontWeight: 500 }}>LIVE</span>
          </div>
        </div>

        {/* Pre-join screen — shown before entering the room */}
        {!joined ? (
          <div className="flex-1 flex items-center justify-center px-4 py-10">
            <div
              className="w-full max-w-sm p-8 rounded-[10px] text-center"
              style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
            >
              {/* Pulsing live icon */}
              <div
                className="relative w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: "linear-gradient(135deg, #F43F5E, #F97316)" }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                </svg>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                </span>
              </div>

              <h2 className="text-white text-xl mb-2" style={{ fontWeight: 500 }}>Ready to join?</h2>
              <p className="text-sm text-white/40 mb-1">Room: <span className="text-white/60">{roomName}</span></p>
              <p className="text-xs text-white/25 mb-8 leading-relaxed">
                You&apos;ll join on mute. This is a guided session — just sit back and listen.
              </p>

              {/* Mic note */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-lg mb-6 text-left"
                style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.07)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)">
                  <path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                </svg>
                <p className="text-xs text-white/35">
                  Your browser may ask for microphone access. You&apos;ll start muted automatically.
                </p>
              </div>

              {/* Join button */}
              <button
                onClick={() => setJoined(true)}
                className="w-full py-3.5 rounded-[10px] text-sm text-white transition-opacity hover:opacity-80"
                style={{ background: "linear-gradient(135deg, #F43F5E, #F97316)", fontWeight: 500 }}
              >
                Join Live Session
              </button>
            </div>
          </div>
        ) : (
          // ── DAILY.CO IFRAME ──────────────────────────────────────────────────
          // The iframe loads the Daily.co prebuilt UI.
          // Daily.co handles all camera/mic permissions, chat, and controls.
          <div className="flex-1 relative" style={{ minHeight: "calc(100vh - 120px)" }}>
            <iframe
              src={`${roomUrl}?theme=dark`}
              allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
              className="absolute inset-0 w-full h-full"
              style={{ border: "none" }}
              title="Daily Meds Live Session"
            />
          </div>
        )}

      </main>
    </div>
  );
}
