"use client";

// Mini player bar — pinned to the bottom of every page.
// Appears whenever a session is loaded in the global player.
// Lets the user control playback while browsing the rest of the app.
// Hides itself automatically when no session is loaded.

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
    togglePlay,
    seek,
    closePlayer,
  } = usePlayer();

  // Don't render anything if no session is loaded
  if (!currentSession) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 px-4 sm:px-6"
      style={{
        backgroundColor: "#1A1A2E",
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
            <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.9"/>
          </svg>
        </div>

        {/* Title + time */}
        <div className="min-w-0">
          <p className="text-sm text-white truncate" style={{ fontWeight: 500 }}>
            {currentSession.title}
          </p>
          <p className="text-xs text-white/35">
            {formatTime(currentTime)} · {currentSession.duration}
          </p>
        </div>
      </Link>

      {/* Controls — right side */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Skip back 15s — hidden on very small screens */}
        <button
          onClick={() => seek(Math.max(0, currentTime - 15))}
          className="hidden sm:block text-white/50 hover:text-white transition-colors p-1"
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
          className="hidden sm:block text-white/50 hover:text-white transition-colors p-1"
          aria-label="Skip forward 15 seconds"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.01 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
          </svg>
        </button>

        {/* Close button */}
        <button
          onClick={closePlayer}
          className="text-white/30 hover:text-white/70 transition-colors p-2.5 ml-1"
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
