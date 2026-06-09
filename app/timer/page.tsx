"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "../../lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const DURATIONS = [1, 5, 10, 20, 30];


function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function TimerPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Timer state
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [secondsLeft, setSecondsLeft] = useState(10 * 60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthChecked(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Timer tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  function selectDuration(mins: number) {
    setSelectedDuration(mins);
    setSecondsLeft(mins * 60);
    setRunning(false);
    setFinished(false);
  }

  function handleStart() {
    if (finished) {
      setSecondsLeft(selectedDuration * 60);
      setFinished(false);
    }
    setRunning(true);
  }

  function handleReset() {
    setRunning(false);
    setFinished(false);
    setSecondsLeft(selectedDuration * 60);
  }

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeDisplay = `${pad(mins)}:${pad(secs)}`;
  const progress = 1 - secondsLeft / (selectedDuration * 60);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#131313", color: "#ffffff", fontFamily: "var(--font-manrope)" }}>

      {/* ── FIXED BACKGROUND ──────────────────────────────────────────── */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=1600&h=900&fit=crop&q=60"
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: "cover", filter: "grayscale(60%) brightness(0.35)" }}
        />
        <div className="absolute inset-0" style={{ background: "rgba(0,23,22,0.6)", backdropFilter: "blur(24px)" }} />
      </div>

      {/* Floating glow accents */}
      <div className="fixed top-1/4 -right-20 w-96 h-96 rounded-full pointer-events-none" style={{ background: "rgba(255,65,142,0.08)", filter: "blur(120px)" }} />
      <div className="fixed bottom-1/4 -left-20 w-80 h-80 rounded-full pointer-events-none" style={{ background: "rgba(236,114,61,0.08)", filter: "blur(100px)" }} />

      <Navbar />

      {/* ── MAIN CONTENT ───────────────────────────────────────────────── */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 pt-28 pb-16">

        {/* Micro copy */}
        <div className="mb-10 text-center">
          <span
            className="tracking-[0.4em] text-xs font-bold uppercase block mb-2"
            style={{ color: "#ffb690", opacity: 0.8 }}
          >
            The Daily Meds
          </span>
          <h2
            className="text-lg font-light tracking-wide italic"
            style={{ color: "rgba(246,241,230,0.7)", fontFamily: "var(--font-lexend)" }}
          >
            Your ritual, recorded.
          </h2>
        </div>

        {/* ── TIMER SECTION ──────────────────────────────────────────── */}
        <div className="flex flex-col items-center w-full max-w-4xl">

          {/* Big timer display */}
          <div className="relative group cursor-default mb-14">
            <div
              className="absolute pointer-events-none"
              style={{
                inset: "-2.5rem",
                background: "rgba(255,65,142,0.05)",
                filter: "blur(100px)",
                borderRadius: "9999px",
                opacity: running ? 1 : 0.5,
                transition: "opacity 0.5s",
              }}
            />
            {/* Progress ring */}
            <svg
              className="absolute pointer-events-none"
              style={{ inset: "-24px", width: "calc(100% + 48px)", height: "calc(100% + 48px)" }}
              viewBox="0 0 400 160"
            >
              <rect x="0" y="0" width="400" height="160" fill="none" />
            </svg>
            <h1
              className="font-black leading-none text-white drop-shadow-2xl"
              style={{
                fontFamily: "var(--font-lexend)",
                fontSize: "clamp(5rem, 18vw, 14rem)",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.05em",
                fontWeight: 100,
                color: finished ? "#aaee20" : "#ffffff",
                transition: "color 0.5s",
              }}
            >
              {timeDisplay}
            </h1>
            {finished && (
              <p className="text-center text-sm mt-2 font-bold uppercase tracking-widest" style={{ color: "#aaee20", fontFamily: "var(--font-lexend)" }}>
                Session complete ✓
              </p>
            )}
          </div>

          {/* Duration selection */}
          <div className="flex flex-wrap justify-center gap-4 mb-14">
            {DURATIONS.map((d) => {
              const active = d === selectedDuration;
              return (
                <button
                  key={d}
                  onClick={() => selectDuration(d)}
                  className="px-8 py-4 rounded-xl transition-all active:scale-95"
                  style={{
                    background: active ? "rgba(255,255,255,0.12)" : "rgba(0,23,22,0.4)",
                    backdropFilter: "blur(24px)",
                    border: active ? "1px solid rgba(255,65,142,0.4)" : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span
                    className="block text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color: active ? "#ff41b3" : "rgba(255,255,255,0.4)", fontFamily: "var(--font-lexend)" }}
                  >
                    Duration
                  </span>
                  <span className="block text-xl font-bold text-white" style={{ fontFamily: "var(--font-lexend)" }}>
                    {d} min
                  </span>
                </button>
              );
            })}
          </div>

          {/* Auth gate — if not logged in, show lock overlay */}
          {authChecked && !user ? (
            <div className="w-full max-w-md text-center">
              <div
                className="p-8 rounded-2xl mb-6"
                style={{
                  background: "rgba(0,23,22,0.6)",
                  backdropFilter: "blur(24px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-black uppercase mb-2" style={{ fontFamily: "var(--font-lexend)" }}>
                  Create a free account to use the timer
                </h3>
                <p className="text-sm mb-6" style={{ color: "rgba(246,241,230,0.6)" }}>
                  The breathing timer is free for everyone — just sign up with your email to get started.
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/signup"
                    className="w-full py-4 rounded-2xl text-base font-black uppercase tracking-wide transition-all hover:opacity-90 text-center"
                    style={{ background: "#ff41b3", color: "#fff", fontFamily: "var(--font-lexend)", boxShadow: "0 0 20px rgba(255,65,142,0.3)" }}
                  >
                    Create Free Account
                  </Link>
                  <Link
                    href="/login"
                    className="w-full py-4 rounded-2xl text-base font-bold uppercase tracking-wide transition-all hover:bg-white/5 text-center"
                    style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(246,241,230,0.7)", fontFamily: "var(--font-lexend)" }}
                  >
                    Log In
                  </Link>
                </div>
              </div>
            </div>
          ) : authChecked && user ? (
            /* Action buttons — logged in */
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-md">
              <button
                onClick={running ? () => setRunning(false) : handleStart}
                className="w-full py-5 px-12 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95"
                style={{
                  background: running ? "rgba(255,65,142,0.3)" : "#ff4991",
                  color: running ? "#ff4991" : "#fff",
                  border: running ? "1px solid rgba(255,65,142,0.5)" : "none",
                  fontFamily: "var(--font-lexend)",
                  boxShadow: running ? "none" : "0 0 20px rgba(255,65,142,0.3)",
                }}
              >
                {running ? (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    PAUSE
                  </>
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    {finished ? "AGAIN" : "START"}
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className="w-full py-5 px-12 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95 hover:bg-white/5"
                style={{
                  background: "rgba(0,23,22,0.4)",
                  backdropFilter: "blur(24px)",
                  border: "1px solid rgba(255,182,144,0.2)",
                  color: "#ffb690",
                  fontFamily: "var(--font-lexend)",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
                RESET
              </button>
            </div>
          ) : null}
        </div>

        {/* ── SIGN UP BOX (only if not logged in) ───────────────────── */}
        {authChecked && !user && (
          <section className="w-full max-w-2xl mt-16">
            <div
              className="rounded-2xl p-10 text-center relative overflow-hidden"
              style={{
                background: "rgba(0,23,22,0.6)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(170,238,32,0.1) 0%, transparent 70%)", filter: "blur(40px)" }} />
              <div className="absolute bottom-0 left-0 w-48 h-48 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,65,179,0.1) 0%, transparent 70%)", filter: "blur(40px)" }} />
              <h3 className="text-2xl font-black uppercase mb-3" style={{ fontFamily: "var(--font-lexend)" }}>
                Want the full experience?
              </h3>
              <p className="text-sm mb-8 leading-relaxed" style={{ color: "rgba(246,241,230,0.6)" }}>
                Get access to 200+ meditations and the full audio library. Just £9.99/month.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/signup"
                  className="px-10 py-4 rounded-full font-black uppercase tracking-wide text-sm transition-all hover:scale-105 text-center"
                  style={{ backgroundColor: "#aaee20", color: "#1a2600", fontFamily: "var(--font-lexend)" }}
                >
                  Start Free Today
                </Link>
                <Link
                  href="/pricing"
                  className="px-10 py-4 rounded-full font-bold uppercase tracking-wide text-sm transition-all hover:bg-white/5 text-center"
                  style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(246,241,230,0.7)", fontFamily: "var(--font-lexend)" }}
                >
                  See Pricing
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
