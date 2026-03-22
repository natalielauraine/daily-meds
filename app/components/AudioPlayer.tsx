"use client";

// Audio player UI — the full-size player shown on the session page.
// All actual audio playback is handled by the global PlayerContext (lib/player-context.tsx).
// This component is purely the controls UI — it reads state from the context and calls actions on it.

import { usePlayer } from "../../lib/player-context";
import type { PlayerSession } from "../../lib/player-context";

type AudioPlayerProps = {
  session: PlayerSession;   // The session to play — passed from the session page
  gradient: string;         // Mood gradient — used on the seek bar and play button
};

// Turns seconds into "m:ss" format — e.g. 342 → "5:42"
function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const SPEEDS = [0.75, 1, 1.25, 1.5];

export default function AudioPlayer({ session, gradient }: AudioPlayerProps) {
  const {
    currentSession,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    speed,
    playSession,
    togglePlay,
    seek,
    skipBack,
    skipForward,
    setVolume,
    setIsMuted,
    setSpeed,
  } = usePlayer();

  // Whether this session is the one currently loaded in the global player
  const isThisSession = currentSession?.id === session.id;

  // The time and duration shown — only meaningful if this session is loaded
  const displayTime = isThisSession ? currentTime : 0;
  const displayDuration = isThisSession ? duration : 0;
  const displayPlaying = isThisSession && isPlaying;
  const progressPercent = displayDuration > 0 ? (displayTime / displayDuration) * 100 : 0;

  // Handle seek — only works if this is the active session
  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isThisSession) return;
    seek(Number(e.target.value));
  }

  // Handle volume change
  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    setVolume(val);
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
  }

  return (
    <div className="w-full">

      {/* ── SEEK BAR ─────────────────────────────────────────── */}
      <div className="mb-3">
        <div className="relative w-full h-1 rounded-full mb-2" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
          {/* Filled portion */}
          <div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ width: `${progressPercent}%`, background: gradient }}
          />
          {/* Invisible range input sitting on top for interaction */}
          <input
            type="range"
            min={0}
            max={displayDuration || 0}
            step={0.1}
            value={displayTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ margin: 0 }}
          />
        </div>
        {/* Time markers */}
        <div className="flex justify-between">
          <span className="text-xs text-white/40">{formatTime(displayTime)}</span>
          <span className="text-xs text-white/25">{formatTime(displayDuration)}</span>
        </div>
      </div>

      {/* ── MAIN CONTROLS ────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-6 mb-6">

        {/* Skip back 15s */}
        <button
          onClick={skipBack}
          className="flex flex-col items-center gap-1 text-white/50 hover:text-white transition-colors"
          aria-label="Skip back 15 seconds"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
          <span className="text-[10px]" style={{ fontWeight: 500 }}>15s</span>
        </button>

        {/* Play / Pause */}
        <button
          onClick={() => {
            if (isThisSession) {
              togglePlay();
            } else {
              playSession(session);
            }
          }}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-opacity hover:opacity-90"
          style={{ background: gradient }}
          aria-label={displayPlaying ? "Pause" : "Play"}
        >
          {displayPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style={{ marginLeft: "3px" }}>
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        {/* Skip forward 15s */}
        <button
          onClick={skipForward}
          className="flex flex-col items-center gap-1 text-white/50 hover:text-white transition-colors"
          aria-label="Skip forward 15 seconds"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.01 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
          </svg>
          <span className="text-[10px]" style={{ fontWeight: 500 }}>15s</span>
        </button>
      </div>

      {/* ── VOLUME + SPEED ────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">

        {/* Volume */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-white/50 hover:text-white transition-colors shrink-0"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
            ) : volume < 0.5 ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            )}
          </button>

          {/* Volume slider */}
          <div className="relative flex-1 h-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
            <div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ width: `${(isMuted ? 0 : volume) * 100}%`, backgroundColor: "rgba(255,255,255,0.4)" }}
            />
            <input
              type="range" min={0} max={1} step={0.01}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              style={{ margin: 0 }}
            />
          </div>
        </div>

        {/* Speed buttons */}
        <div
          className="flex items-center rounded-full overflow-hidden shrink-0"
          style={{ border: "0.5px solid rgba(255,255,255,0.12)" }}
        >
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className="px-3 py-1.5 text-xs transition-colors"
              style={{
                backgroundColor: speed === s ? "rgba(139,92,246,0.8)" : "transparent",
                color: speed === s ? "white" : "rgba(255,255,255,0.4)",
                fontWeight: speed === s ? 500 : 400,
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
