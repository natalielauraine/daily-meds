"use client";

// The audio player component — handles all playback controls.
// Used inside the session player page for audio-only meditation sessions.
// Controls: play/pause, seek bar, volume with mute, speed (0.75x 1x 1.25x 1.5x)

import { useRef, useState, useEffect } from "react";

type AudioPlayerProps = {
  audioUrl: string;       // The URL of the mp3/m4a file to play
  gradient: string;       // The mood gradient — used on the seek bar fill colour
};

// Turns a number of seconds into "m:ss" format — e.g. 342 → "5:42"
function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({ audioUrl, gradient }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Volume state
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Speed state — one of the four allowed values
  const [speed, setSpeed] = useState(1);
  const SPEEDS = [0.75, 1, 1.25, 1.5];

  // Sync audio element properties whenever state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = speed;
  }, [speed]);

  // Toggle play / pause
  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }

  // Called as the audio plays — updates the seek bar position
  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
  }

  // Called once the audio file metadata loads — gives us the total duration
  function handleLoadedMetadata() {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration);
  }

  // Called when the audio finishes playing
  function handleEnded() {
    setIsPlaying(false);
    setCurrentTime(0);
  }

  // Seek to a specific position when the user drags the seek bar
  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = Number(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }

  // Jump backwards 15 seconds
  function skipBack() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 15);
  }

  // Jump forwards 15 seconds
  function skipForward() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(duration, audio.currentTime + 15);
  }

  // Update volume when the user drags the volume slider
  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  }

  // Toggle mute — remembers the previous volume level
  function toggleMute() {
    setIsMuted(!isMuted);
  }

  // How far through the track we are — as a percentage (0–100)
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full">
      {/* Hidden audio element — all the actual playback logic lives here */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* ── SEEK BAR ─────────────────────────────────────────── */}
      <div className="mb-3">
        <div className="relative w-full h-1 rounded-full mb-2" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
          {/* Filled portion */}
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-none"
            style={{ width: `${progressPercent}%`, background: gradient }}
          />
          {/* Range input — invisible but interactive, sits on top */}
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ margin: 0 }}
          />
        </div>

        {/* Time markers */}
        <div className="flex justify-between">
          <span className="text-xs text-white/40">{formatTime(currentTime)}</span>
          <span className="text-xs text-white/25">{formatTime(duration)}</span>
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

        {/* Play / Pause — the main button */}
        <button
          onClick={togglePlay}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-opacity hover:opacity-90"
          style={{ background: gradient }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            // Pause icon
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          ) : (
            // Play icon — slight right offset so it looks centred visually
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

        {/* Volume control */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Mute toggle button */}
          <button
            onClick={toggleMute}
            className="text-white/50 hover:text-white transition-colors shrink-0"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              // Muted icon
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
            ) : volume < 0.5 ? (
              // Low volume icon
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
              </svg>
            ) : (
              // Full volume icon
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
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              style={{ margin: 0 }}
            />
          </div>
        </div>

        {/* Speed control — four buttons */}
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
