"use client";

// Breathing timer page.
// Supports box breathing, 4-7-8, and custom patterns.
// Animated circle expands on inhale and contracts on exhale.
// Ambient sounds (rain, bowls, nature) are generated via Web Audio API — no audio files needed.
// A gentle bell plays when the session ends.

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ── BREATHING PATTERNS ────────────────────────────────────────────────────────
// All durations are in seconds. holdOut: 0 means skip that phase.

const PATTERNS = {
  box: { label: "Box", sub: "4 · 4 · 4 · 4", in: 4, holdIn: 4, out: 4, holdOut: 4 },
  "4-7-8": { label: "4-7-8", sub: "4 · 7 · 8", in: 4, holdIn: 7, out: 8, holdOut: 0 },
  custom: { label: "Custom", sub: "Set your own", in: 4, holdIn: 4, out: 4, holdOut: 0 },
} as const;

type PatternKey = keyof typeof PATTERNS;
type Phase = "inhale" | "holdIn" | "exhale" | "holdOut";
type AmbientType = "silence" | "rain" | "bowls" | "nature";

const SESSION_LENGTHS = [5, 10, 15, 20, 30];

const PHASE_LABEL: Record<Phase, string> = {
  inhale:  "Breathe in",
  holdIn:  "Hold",
  exhale:  "Breathe out",
  holdOut: "Rest",
};

// Circle pixel sizes
const MIN_SIZE = 140;
const MAX_SIZE = 260;

// ── WEB AUDIO HELPERS ─────────────────────────────────────────────────────────

// Play a gentle 528Hz bell tone — called when the session ends
function playBell(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(528, ctx.currentTime);
  osc.type = "sine";
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 4);
}

// Create a looping rain sound — white noise through a lowpass filter
function startRain(ctx: AudioContext): AudioNode {
  const bufferSize = 2 * ctx.sampleRate;
  const buf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const source = ctx.createBufferSource();
  source.buffer = buf;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 600;

  const gain = ctx.createGain();
  gain.gain.value = 0.25;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
  return gain; // return so we can disconnect later
}

// Create singing bowl tones — multiple sine waves at harmonic frequencies
function startBowls(ctx: AudioContext): OscillatorNode[] {
  const freqs = [396, 528, 639, 741];
  return freqs.map((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.045 - i * 0.006; // quieter for higher harmonics
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    return osc;
  });
}

// Create brown noise for a nature / forest sound
function startNature(ctx: AudioContext): AudioNode {
  const bufferSize = 2 * ctx.sampleRate;
  const buf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + 0.02 * white) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5;
  }

  const source = ctx.createBufferSource();
  source.buffer = buf;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1200;
  filter.Q.value = 0.4;

  const gain = ctx.createGain();
  gain.gain.value = 0.18;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
  return gain;
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export default function BreathePage() {
  const [patternKey, setPatternKey] = useState<PatternKey>("box");
  const [custom, setCustom] = useState({ in: 4, holdIn: 4, out: 4, holdOut: 0 });
  const [sessionMinutes, setSessionMinutes] = useState(10);
  const [ambient, setAmbient] = useState<AmbientType>("silence");
  const [showCustom, setShowCustom] = useState(false);

  // Timer state
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [phase, setPhase] = useState<Phase>("inhale");
  const [phaseProgress, setPhaseProgress] = useState(0); // 0–1 within current phase
  const [secondsLeft, setSecondsLeft] = useState(sessionMinutes * 60);
  const [breathCount, setBreathCount] = useState(0);

  // Refs for values needed inside the setInterval callback
  const phaseRef = useRef<Phase>("inhale");
  const phaseElapsedRef = useRef(0); // seconds elapsed in current phase
  const secondsLeftRef = useRef(sessionMinutes * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientNodeRef = useRef<AudioNode | OscillatorNode[] | null>(null);

  // Get the active pattern object (merging custom counts when custom is selected)
  const pattern = patternKey === "custom"
    ? { ...PATTERNS.custom, ...custom }
    : PATTERNS[patternKey];

  // How long the current phase lasts in seconds
  function getPhaseDuration(p: Phase): number {
    switch (p) {
      case "inhale":  return pattern.in;
      case "holdIn":  return pattern.holdIn;
      case "exhale":  return pattern.out;
      case "holdOut": return pattern.holdOut;
    }
  }

  // Which phase comes after the current one
  function getNextPhase(p: Phase): Phase {
    switch (p) {
      case "inhale":  return pattern.holdIn  > 0 ? "holdIn"  : "exhale";
      case "holdIn":  return "exhale";
      case "exhale":  return pattern.holdOut > 0 ? "holdOut" : "inhale";
      case "holdOut": return "inhale";
    }
  }

  // Circle size — grows on inhale, stays big on holdIn, shrinks on exhale, stays small on holdOut
  function getCircleSize(): number {
    switch (phase) {
      case "inhale":  return MIN_SIZE + (MAX_SIZE - MIN_SIZE) * phaseProgress;
      case "holdIn":  return MAX_SIZE;
      case "exhale":  return MAX_SIZE - (MAX_SIZE - MIN_SIZE) * phaseProgress;
      case "holdOut": return MIN_SIZE;
    }
  }

  // Stop ambient sound
  const stopAmbient = useCallback(() => {
    if (!ambientNodeRef.current) return;
    if (Array.isArray(ambientNodeRef.current)) {
      ambientNodeRef.current.forEach((osc) => { try { osc.stop(); } catch {} });
    } else {
      try { ambientNodeRef.current.disconnect(); } catch {}
    }
    ambientNodeRef.current = null;
  }, []);

  // Start ambient sound
  const startAmbient = useCallback((type: AmbientType) => {
    stopAmbient();
    if (type === "silence") return;
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    const ctx = audioCtxRef.current;
    if (type === "rain")    ambientNodeRef.current = startRain(ctx);
    if (type === "bowls")   ambientNodeRef.current = startBowls(ctx);
    if (type === "nature")  ambientNodeRef.current = startNature(ctx);
  }, [stopAmbient]);

  // Start the timer
  function handleStart() {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    phaseRef.current = "inhale";
    phaseElapsedRef.current = 0;
    secondsLeftRef.current = sessionMinutes * 60;
    setPhase("inhale");
    setPhaseProgress(0);
    setSecondsLeft(sessionMinutes * 60);
    setBreathCount(0);
    setDone(false);
    setRunning(true);
    startAmbient(ambient);
  }

  // Pause / resume
  function handleTogglePause() {
    if (running) {
      setRunning(false);
      stopAmbient();
    } else {
      setRunning(true);
      startAmbient(ambient);
    }
  }

  // Reset everything
  function handleReset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    stopAmbient();
    setRunning(false);
    setDone(false);
    setPhase("inhale");
    setPhaseProgress(0);
    setSecondsLeft(sessionMinutes * 60);
    setBreathCount(0);
    phaseRef.current = "inhale";
    phaseElapsedRef.current = 0;
    secondsLeftRef.current = sessionMinutes * 60;
  }

  // Main timer tick — runs every 100ms when running
  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      const TICK = 0.1; // seconds per tick

      // Decrement overall session countdown
      secondsLeftRef.current = Math.max(0, secondsLeftRef.current - TICK);
      setSecondsLeft(Math.ceil(secondsLeftRef.current));

      // Session done
      if (secondsLeftRef.current <= 0) {
        clearInterval(intervalRef.current!);
        setRunning(false);
        setDone(true);
        stopAmbient();
        if (audioCtxRef.current) playBell(audioCtxRef.current);
        return;
      }

      // Advance phase elapsed
      phaseElapsedRef.current += TICK;
      const phaseDur = getPhaseDuration(phaseRef.current);
      const progress = Math.min(phaseElapsedRef.current / phaseDur, 1);
      setPhaseProgress(progress);

      // Move to next phase when current one finishes
      if (phaseElapsedRef.current >= phaseDur) {
        const next = getNextPhase(phaseRef.current);
        // Count a breath every time we complete a full inhale
        if (next === "inhale") setBreathCount((n) => n + 1);
        phaseRef.current = next;
        phaseElapsedRef.current = 0;
        setPhase(next);
        setPhaseProgress(0);
      }
    }, 100);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, patternKey, custom]);

  // When session length changes while not running, reset the countdown display
  useEffect(() => {
    if (!running && !done) {
      setSecondsLeft(sessionMinutes * 60);
      secondsLeftRef.current = sessionMinutes * 60;
    }
  }, [sessionMinutes, running, done]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopAmbient();
    };
  }, [stopAmbient]);

  const circleSize = getCircleSize();
  const sessionProgress = 1 - secondsLeft / (sessionMinutes * 60);

  // Format seconds as m:ss
  function fmt(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  const started = running || done || secondsLeft < sessionMinutes * 60;

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
      <Navbar />

      <main className="flex-1 w-full max-w-lg mx-auto px-4 sm:px-6 py-8 pb-24 flex flex-col">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-8">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back
        </Link>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl text-white" style={{ fontWeight: 500 }}>Breathing Timer</h1>
          <p className="text-sm text-white/40 mt-1">Calm your nervous system. No fluff.</p>
        </div>

        {/* ── PATTERN SELECTOR ─────────────────────────────────── */}
        {!started && (
          <div className="mb-8">
            <p className="text-xs text-white/40 mb-3" style={{ letterSpacing: "0.05em", textTransform: "uppercase" }}>Pattern</p>
            <div className="flex gap-2">
              {(Object.keys(PATTERNS) as PatternKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => { setPatternKey(key); setShowCustom(key === "custom"); }}
                  className="flex-1 py-3 rounded-[10px] text-sm transition-colors"
                  style={{
                    backgroundColor: patternKey === key ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)",
                    border: patternKey === key ? "0.5px solid rgba(139,92,246,0.5)" : "0.5px solid rgba(255,255,255,0.08)",
                    color: patternKey === key ? "#C4B5FD" : "rgba(255,255,255,0.45)",
                    fontWeight: patternKey === key ? 500 : 400,
                  }}
                >
                  <span className="block">{PATTERNS[key].label}</span>
                  <span className="block text-[11px] mt-0.5 opacity-60">{PATTERNS[key].sub}</span>
                </button>
              ))}
            </div>

            {/* Custom pattern inputs */}
            {showCustom && (
              <div
                className="mt-3 p-4 rounded-[10px] grid grid-cols-4 gap-3"
                style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)" }}
              >
                {(["in", "holdIn", "out", "holdOut"] as const).map((field) => (
                  <div key={field} className="flex flex-col items-center gap-1.5">
                    <label className="text-[10px] text-white/30 text-center leading-tight">
                      {field === "in" ? "In" : field === "holdIn" ? "Hold in" : field === "out" ? "Out" : "Hold out"}
                    </label>
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => setCustom((c) => ({ ...c, [field]: Math.min(20, c[field] + 1) }))}
                        className="text-white/40 hover:text-white transition-colors text-lg leading-none"
                      >+</button>
                      <span className="text-white text-lg tabular-nums" style={{ fontWeight: 500 }}>{custom[field]}</span>
                      <button
                        onClick={() => setCustom((c) => ({ ...c, [field]: Math.max(0, c[field] - 1) }))}
                        className="text-white/40 hover:text-white transition-colors text-lg leading-none"
                      >−</button>
                    </div>
                    <span className="text-[10px] text-white/20">sec</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ANIMATED CIRCLE ──────────────────────────────────── */}
        <div className="flex flex-col items-center justify-center flex-1 py-6">

          {/* Outer glow ring */}
          <div className="relative flex items-center justify-center" style={{ width: MAX_SIZE + 80, height: MAX_SIZE + 80 }}>

            {/* Subtle pulsing ring behind the circle */}
            {running && (
              <div
                className="absolute rounded-full"
                style={{
                  width: circleSize + 40,
                  height: circleSize + 40,
                  background: "rgba(139,92,246,0.06)",
                  transition: "width 0.1s linear, height 0.1s linear",
                }}
              />
            )}

            {/* Main breathing circle */}
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: circleSize,
                height: circleSize,
                background: done
                  ? "linear-gradient(135deg, #10B981, #22C55E)"
                  : "linear-gradient(135deg, #6B21E8 0%, #8B3CF7 25%, #6366F1 60%, #3B82F6 80%, #22D3EE 100%)",
                boxShadow: running
                  ? `0 0 ${circleSize * 0.3}px rgba(139,92,246,0.25)`
                  : "none",
                transition: "width 0.1s linear, height 0.1s linear, box-shadow 0.5s ease",
              }}
            >
              {/* Phase text inside circle */}
              <div className="text-center px-4">
                {done ? (
                  <>
                    <p className="text-2xl">🙏</p>
                    <p className="text-white text-sm mt-1" style={{ fontWeight: 500 }}>Done</p>
                  </>
                ) : running ? (
                  <>
                    <p className="text-white text-sm" style={{ fontWeight: 500 }}>{PHASE_LABEL[phase]}</p>
                    <p className="text-white/60 text-xs mt-0.5">{Math.ceil(getPhaseDuration(phase) - getPhaseDuration(phase) * phaseProgress)}s</p>
                  </>
                ) : (
                  <p className="text-white/60 text-sm">Ready</p>
                )}
              </div>
            </div>
          </div>

          {/* Session time remaining */}
          <div className="flex items-center gap-4 mt-6">
            <p
              className="text-3xl tabular-nums text-white"
              style={{ fontWeight: 300, letterSpacing: "-0.02em" }}
            >
              {fmt(secondsLeft)}
            </p>
            {running && (
              <p className="text-xs text-white/30">
                {breathCount} breath{breathCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Session progress bar */}
          <div className="w-full max-w-xs mt-4 h-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${sessionProgress * 100}%`,
                background: "linear-gradient(90deg, #6B21E8, #22D3EE)",
              }}
            />
          </div>
        </div>

        {/* ── CONTROLS ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-5 mt-4">

          {/* Start / Pause / Reset buttons */}
          <div className="flex gap-3">
            {!started ? (
              <button
                onClick={handleStart}
                className="flex-1 py-4 rounded-[10px] text-white text-sm transition-opacity hover:opacity-80"
                style={{ background: "linear-gradient(135deg, #6B21E8, #22D3EE)", fontWeight: 500 }}
              >
                Start Session
              </button>
            ) : done ? (
              <button
                onClick={handleReset}
                className="flex-1 py-4 rounded-[10px] text-white text-sm transition-opacity hover:opacity-80"
                style={{ background: "linear-gradient(135deg, #10B981, #22C55E)", fontWeight: 500 }}
              >
                Start Again
              </button>
            ) : (
              <>
                <button
                  onClick={handleTogglePause}
                  className="flex-1 py-4 rounded-[10px] text-white text-sm transition-opacity hover:opacity-80"
                  style={{
                    background: running
                      ? "rgba(255,255,255,0.08)"
                      : "linear-gradient(135deg, #6B21E8, #22D3EE)",
                    border: running ? "0.5px solid rgba(255,255,255,0.12)" : "none",
                    fontWeight: 500,
                  }}
                >
                  {running ? "Pause" : "Resume"}
                </button>
                <button
                  onClick={handleReset}
                  className="px-5 py-4 rounded-[10px] text-white/40 hover:text-white/70 transition-colors"
                  style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}
                  aria-label="Reset"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Session length + ambient sound — only shown before starting */}
          {!started && (
            <>
              {/* Session length */}
              <div>
                <p className="text-xs text-white/40 mb-3" style={{ letterSpacing: "0.05em", textTransform: "uppercase" }}>Session length</p>
                <div className="flex gap-2">
                  {SESSION_LENGTHS.map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setSessionMinutes(mins)}
                      className="flex-1 py-2.5 rounded-full text-sm transition-colors"
                      style={{
                        backgroundColor: sessionMinutes === mins ? "#8B5CF6" : "rgba(255,255,255,0.05)",
                        color: sessionMinutes === mins ? "white" : "rgba(255,255,255,0.4)",
                        border: sessionMinutes === mins ? "none" : "0.5px solid rgba(255,255,255,0.08)",
                        fontWeight: sessionMinutes === mins ? 500 : 400,
                      }}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Ambient sound */}
              <div>
                <p className="text-xs text-white/40 mb-3" style={{ letterSpacing: "0.05em", textTransform: "uppercase" }}>Ambient sound</p>
                <div className="grid grid-cols-4 gap-2">
                  {(["silence", "rain", "bowls", "nature"] as AmbientType[]).map((type) => {
                    const icons: Record<AmbientType, string> = {
                      silence: "🔇",
                      rain:    "🌧️",
                      bowls:   "🎵",
                      nature:  "🌿",
                    };
                    const labels: Record<AmbientType, string> = {
                      silence: "Silence",
                      rain:    "Rain",
                      bowls:   "Bowls",
                      nature:  "Nature",
                    };
                    return (
                      <button
                        key={type}
                        onClick={() => setAmbient(type)}
                        className="flex flex-col items-center gap-1.5 py-3 rounded-[10px] transition-colors"
                        style={{
                          backgroundColor: ambient === type ? "rgba(139,92,246,0.18)" : "rgba(255,255,255,0.04)",
                          border: ambient === type ? "0.5px solid rgba(139,92,246,0.45)" : "0.5px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <span className="text-xl">{icons[type]}</span>
                        <span className="text-[11px]" style={{ color: ambient === type ? "#C4B5FD" : "rgba(255,255,255,0.35)", fontWeight: ambient === type ? 500 : 400 }}>
                          {labels[type]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
