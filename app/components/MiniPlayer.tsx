"use client";

// Mini player bar — pinned to the bottom of every page.
// Appears whenever a session is loaded in the global player.
// Lets the user control playback while browsing the rest of the app.
// Hides itself automatically when no session is loaded.

import { useState } from "react";
import Link from "next/link";
import { usePlayer } from "../../lib/player-context";

// Converts seconds to "m:ss" format
function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function MiniPlayer() {
  const {
    currentSession,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    seek,
    setVolume,
    setIsMuted,
    closePlayer,
  } = usePlayer();

  const [showVolume, setShowVolume] = useState(false);

  // Don't render anything if no session is loaded
  if (!currentSession) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 px-4 sm:px-6"
      style={{
        backgroundColor: "#1F1F1F",
        borderTop: "0.5px solid rgba(255,255,255,0.1)",
        height: "64px",
      }}
    >
      {/* Progress bar — thin line at the very top of the mini player */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
      >
        {/* Clickable seek area */}
        <div className="relative w-full h-full">
          <div
            className="h-full transition-none"
            style={{ width: `${progressPercent}%`, background: currentSession.gradient }}
          />
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.5}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ margin: 0 }}
          />
        </div>
      </div>

      {/* Session artwork + info — links to the full session page */}
      <Link
        href={`/session/${currentSession.id}`}
        className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
      >
        {/* Small gradient circle */}
        <div
          className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center"
          style={{ background: currentSession.gradient }}
        >
          <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
            <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.95"/>
            <path d="M10 14C10 14 2 18 2 25C2 29.4 5.6 33 10 33C13 33 15.6 31.4 17 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8"/>
            <path d="M38 14C38 14 46 18 46 25C46 29.4 42.4 33 38 33C35 33 32.4 31.4 31 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8"/>
            <path d="M24 28L20 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
            <path d="M24 28L28 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
            <circle cx="24" cy="28" r="2" fill="white" opacity="0.9"/>
          </svg>
        </div>

        {/* Title + time */}
        <div className="min-w-0">
          <p className="text-sm text-white truncate" style={{ fontWeight: 500 }}>
            {currentSession.title}
          </p>
          <p className="text-xs text-cream/65">
            {formatTime(currentTime)} · {currentSession.duration}
          </p>
        </div>
      </Link>

      {/* Controls — right side */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Skip back 15s — hidden on very small screens */}
        <button
          onClick={() => seek(Math.max(0, currentTime - 15))}
          className="hidden sm:block text-cream/60 hover:text-white transition-colors p-1"
          aria-label="Skip back 15 seconds"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
        </button>

        {/* Play / Pause — main button */}
        <button
          onClick={togglePlay}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
          style={{ background: currentSession.gradient }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ marginLeft: "2px" }}>
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        {/* Skip forward 15s — hidden on very small screens */}
        <button
          onClick={() => seek(Math.min(duration, currentTime + 15))}
          className="hidden sm:block text-cream/60 hover:text-white transition-colors p-1"
          aria-label="Skip forward 15 seconds"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.01 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
          </svg>
        </button>

        {/* Volume */}
        <div className="relative">
          <button
            onClick={() => setShowVolume((v) => !v)}
            className="text-cream/60 hover:text-white transition-colors p-1"
            aria-label="Volume"
          >
            {isMuted || volume === 0 ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
              </svg>
            )}
          </button>
          {showVolume && (
            <div
              className="absolute bottom-12 left-1/2 -translate-x-1/2 p-3 rounded-xl"
              style={{ background: "rgba(14,14,14,0.95)", border: "1px solid rgba(255,255,255,0.1)", width: "120px" }}
            >
              <input
                type="range" min={0} max={1} step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => { const v = Number(e.target.value); setVolume(v); setIsMuted(v === 0); }}
                className="w-full accent-[#FF418E]"
              />
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={closePlayer}
          className="text-cream/60 hover:text-cream/80 transition-colors p-2.5 ml-1"
          aria-label="Close player"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
