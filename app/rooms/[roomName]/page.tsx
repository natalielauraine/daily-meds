"use client";

// Group meditation room page.
// Shows a shared countdown timer at the top, the Daily.co room embed in the middle,
// and emoji reaction buttons at the bottom.
// Timer starts when the user clicks "Start" and counts down to zero, playing a bell.

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const EMOJIS = ["🙏", "✨", "💜", "🌿", "🌊", "🔥", "😌", "💫"];

type FloatingEmoji = {
  id: number;
  emoji: string;
  x: number; // percent from left
};

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const roomName = params?.roomName as string;
  const duration = parseInt(searchParams?.get("duration") ?? "10", 10);
  const sessionName = searchParams?.get("name") ?? "Meditation Room";
  const gradient = searchParams?.get("gradient") ?? "linear-gradient(135deg, #6B21E8, #22D3EE)";

  const dailyDomain = process.env.NEXT_PUBLIC_DAILY_DOMAIN;
  const roomUrl = dailyDomain ? `https://${dailyDomain}/${roomName}` : null;

  // Timer state
  const [secondsLeft, setSecondsLeft] = useState(duration * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [joined, setJoined] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Emoji reaction state
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const emojiIdRef = useRef(0);

  // Bell sound — a simple oscillator played via Web Audio API when the timer ends
  const playBell = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(528, ctx.currentTime); // 528 Hz — calming tone
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 3);
    } catch {
      // Web Audio not available — skip bell
    }
  }, []);

  // Start / stop the countdown timer
  function startTimer() {
    if (timerRunning) return;
    setTimerRunning(true);
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setTimerRunning(false);
          setTimerDone(true);
          playBell();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerRunning(false);
    setTimerDone(false);
    setSecondsLeft(duration * 60);
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Fire an emoji that floats upward from a random x position
  function fireEmoji(emoji: string) {
    const id = ++emojiIdRef.current;
    const x = 10 + Math.random() * 80; // 10–90% from left
    setFloatingEmojis((prev) => [...prev, { id, emoji, x }]);
    // Remove after animation completes (2.5s)
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
    }, 2500);
  }

  // Format seconds as m:ss
  function fmt(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  const progressPercent = ((duration * 60 - secondsLeft) / (duration * 60)) * 100;

  // No Daily domain configured
  if (!dailyDomain) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center" style={{ backgroundColor: "#0D0D1A" }}>
        <p className="text-white/40 text-sm mb-4">Daily.co not configured.</p>
        <Link href="/rooms" className="text-white/50 hover:text-white text-sm transition-colors">← Back to rooms</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>

      {/* ── TOP BAR ────────────────────────────────────────────── */}
      <div
        className="shrink-0 px-4 sm:px-6 py-3 flex items-center justify-between"
        style={{ backgroundColor: "#1A1A2E", borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}
      >
        <Link
          href="/rooms"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Leave
        </Link>
        <p className="text-sm text-white/60 truncate mx-4" style={{ fontWeight: 500 }}>{sessionName}</p>
        <div className="w-12" /> {/* spacer */}
      </div>

      {/* ── TIMER PANEL ────────────────────────────────────────── */}
      <div
        className="shrink-0 px-4 sm:px-6 py-5"
        style={{ backgroundColor: "#0D0D1A", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
      >
        {/* Progress bar */}
        <div className="w-full h-0.5 rounded-full mb-4" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%`, background: gradient }}
          />
        </div>

        <div className="flex items-center justify-between">
          {/* Time display */}
          <div>
            {timerDone ? (
              <p className="text-2xl text-white" style={{ fontWeight: 500 }}>Session complete 🙏</p>
            ) : (
              <p
                className="text-4xl tabular-nums"
                style={{
                  fontWeight: 300,
                  background: timerRunning ? gradient : "rgba(255,255,255,0.5)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "-0.02em",
                }}
              >
                {fmt(secondsLeft)}
              </p>
            )}
            <p className="text-xs text-white/25 mt-1">{duration} min session</p>
          </div>

          {/* Timer controls */}
          <div className="flex items-center gap-2">
            {!timerDone && (
              <button
                onClick={timerRunning ? () => { clearInterval(timerRef.current!); setTimerRunning(false); } : startTimer}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm text-white transition-opacity hover:opacity-80"
                style={{ background: gradient, fontWeight: 500 }}
              >
                {timerRunning ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                    Pause
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style={{ marginLeft: "1px" }}>
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    {secondsLeft === duration * 60 ? "Start" : "Resume"}
                  </>
                )}
              </button>
            )}
            <button
              onClick={resetTimer}
              className="p-2.5 rounded-full text-white/30 hover:text-white/60 transition-colors"
              style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}
              aria-label="Reset timer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── PRE-JOIN SCREEN ─────────────────────────────────────── */}
      {!joined ? (
        <div className="flex-1 flex items-center justify-center px-4 py-10">
          <div
            className="w-full max-w-sm p-8 rounded-[10px] text-center"
            style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: gradient }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white" opacity={0.9}>
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
            <h2 className="text-white text-xl mb-2" style={{ fontWeight: 500 }}>Join the room</h2>
            <p className="text-sm text-white/40 mb-1">{sessionName}</p>
            <p className="text-xs text-white/25 mb-8">{duration} min · Start the timer when everyone is ready</p>
            <button
              onClick={() => setJoined(true)}
              className="w-full py-3.5 rounded-[10px] text-sm text-white transition-opacity hover:opacity-80"
              style={{ background: gradient, fontWeight: 500 }}
            >
              Enter Room
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ── DAILY.CO IFRAME ──────────────────────────────────── */}
          <div className="flex-1 relative" style={{ minHeight: "300px" }}>
            <iframe
              src={`${roomUrl}?theme=dark`}
              allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
              className="absolute inset-0 w-full h-full"
              style={{ border: "none" }}
              title="Group Meditation Room"
            />

            {/* Floating emoji layer — sits above the iframe pointer-events-none */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {floatingEmojis.map((e) => (
                <span
                  key={e.id}
                  className="absolute text-2xl animate-float-up"
                  style={{ left: `${e.x}%`, bottom: "0", animationDuration: "2.5s" }}
                >
                  {e.emoji}
                </span>
              ))}
            </div>
          </div>

          {/* ── EMOJI REACTIONS BAR ──────────────────────────────── */}
          <div
            className="shrink-0 px-4 py-3 flex items-center justify-center gap-2 flex-wrap"
            style={{ backgroundColor: "#1A1A2E", borderTop: "0.5px solid rgba(255,255,255,0.08)" }}
          >
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => fireEmoji(emoji)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-transform hover:scale-125 active:scale-95"
                style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                aria-label={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Float-up animation — injected as a style tag */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(-300px) scale(1.3); opacity: 0; }
        }
        .animate-float-up {
          animation: floatUp 2.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
