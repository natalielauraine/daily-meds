"use client";

// /home — the logged-in homepage.
// Shown after login/signup. Redirects to /login if not authenticated.

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import Logo from "../components/Logo";
import { createClient } from "../../lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

const CardCarousel = dynamic(
  () => import("@/components/ui/card-carousel-wrapper"),
  { ssr: false }
);

const PINK_ORANGE = "linear-gradient(135deg, #ff41b3 0%, #ec723d 100%)";
const LIME = "#aaee20";

// ── DATA ─────────────────────────────────────────────────────────────────────

const TRENDING = [
  { title: "Hungover", duration: "20 min", tag: "Essential", gradient: "linear-gradient(160deg, #2a0800 0%, #ec723d 100%)", locked: true },
  { title: "Anxious", duration: "18 min", tag: "High Intensity", gradient: "linear-gradient(160deg, #2a0018 0%, #ff41b3 100%)", locked: true },
  { title: "Guilty", duration: "15 min", tag: "Deep Dive", gradient: "linear-gradient(160deg, #1a1000 0%, #f4b21d 100%)", locked: true },
  { title: "Daily Ritual", duration: "10 min", tag: "Morning", gradient: "linear-gradient(160deg, #001800 0%, #aaee20 100%)", locked: true },
  { title: "Snuggle Down", duration: "45 min", tag: "Sleep", gradient: "linear-gradient(160deg, #00050f 0%, #3b82f6 100%)", locked: true },
  { title: "Heartbroken", duration: "22 min", tag: "Emotional", gradient: "linear-gradient(160deg, #200010 0%, #ff41b3 100%)", locked: true },
];

const TRENDING_IMAGES = [
  { src: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500&h=750&fit=crop&q=80", alt: "Hungover — Guided Release" },
  { src: "https://images.unsplash.com/photo-1474223960279-c596b5ac7c0c?w=500&h=750&fit=crop&q=80", alt: "Anxious — Breathwork" },
  { src: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&h=750&fit=crop&q=80", alt: "Guilty — Guided Meditation" },
  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=750&fit=crop&q=80", alt: "Daily Ritual — Morning Reset" },
  { src: "https://images.unsplash.com/photo-1531353826977-0941b4779a1c?w=500&h=750&fit=crop&q=80", alt: "Snuggle Down — Sleep Audio" },
  { src: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=500&h=750&fit=crop&q=80", alt: "Heartbroken — Emotional Release" },
];

const FREE_SESSIONS = [
  { title: "Snuggle Down", duration: "10 min", gradient: "linear-gradient(160deg, #00050f 0%, #3b82f6 100%)" },
  { title: "Hungover", duration: "8 min", gradient: "linear-gradient(160deg, #2a0800 0%, #ec723d 100%)" },
  { title: "Anxious", duration: "12 min", gradient: "linear-gradient(160deg, #2a0018 0%, #ff41b3 100%)" },
  { title: "Just Breathe", duration: "6 min", gradient: "linear-gradient(160deg, #001800 0%, #aaee20 100%)" },
];

const MOODS = [
  { emoji: "🌙", label: "Rest & Sleep" },
  { emoji: "🌿", label: "Calm & Ground" },
  { emoji: "🔥", label: "Energy & Activation" },
  { emoji: "🚨", label: "Emergency Crisis" },
  { emoji: "💛", label: "Emotional Support" },
  { emoji: "🌊", label: "Release & Let Go" },
  { emoji: "🧠", label: "Focus & Clarity" },
  { emoji: "💫", label: "Connection & Expansion" },
  { emoji: "🌅", label: "Morning Rituals" },
  { emoji: "🤍", label: "Audio Hugs" },
  { emoji: "🌀", label: "Breathwork Journeys" },
  { emoji: "🌍", label: "Transmissions" },
];

// ── COMPONENT ────────────────────────────────────────────────────────────────

export default function LoggedInHome() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(33);
  const [search, setSearch] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  // Fake play progress
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => Math.min(p + 0.2, 100));
      }, 200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) router.push(`/library?q=${encodeURIComponent(search.trim())}`);
    else router.push("/library");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0e0e0e" }}>
        <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-[#aaee20] animate-spin" />
      </div>
    );
  }

  const displayName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Home";

  return (
    <div style={{ backgroundColor: "#0e0e0e", color: "#ffffff", fontFamily: "var(--font-manrope)", paddingBottom: "80px" }} className="font-body">

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16"
        style={{ backgroundColor: "rgba(14,14,14,0.85)", backdropFilter: "blur(20px)", borderBottom: "0.5px solid rgba(255,255,255,0.05)" }}
      >
        {/* Logo */}
        <Logo href="/home" size="sm" />

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-7">
          {[
            { label: "Home", href: "/home", active: true },
            { label: "Library", href: "/library" },
            { label: "Live", href: "/live" },
            { label: "Breath", href: "/timer" },
            { label: "Group Meds", href: "/rooms" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xs font-bold uppercase tracking-widest transition-colors"
              style={{
                color: item.active ? LIME : "rgba(255,255,255,0.45)",
                fontFamily: "var(--font-lexend)",
                borderBottom: item.active ? `1.5px solid ${LIME}` : "none",
                paddingBottom: item.active ? "2px" : "0",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Link href="/library">
            <button className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10" style={{ color: LIME }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </button>
          </Link>
          <Link href="/profile">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: PINK_ORANGE }}
            >
              {displayName[0]?.toUpperCase()}
            </div>
          </Link>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative flex items-end pt-16 pb-16 px-6 md:px-12 overflow-hidden"
        style={{ minHeight: "520px", background: "linear-gradient(160deg, #080808 0%, #0e0e0e 60%, #0a0500 100%)" }}
      >
        {/* Glow orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(170,238,32,0.08) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,65,179,0.07) 0%, transparent 70%)", filter: "blur(50px)" }} />
        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent 50%, #0e0e0e 100%)" }} />

        <div className="relative z-10 max-w-2xl">
          <h1
            className="uppercase leading-none tracking-tighter mb-4"
            style={{ fontFamily: "var(--font-lexend)", fontWeight: 900, fontSize: "clamp(3rem, 8vw, 6rem)", textShadow: `0 0 40px rgba(170,238,32,0.3)` }}
          >
            Welcome Home
          </h1>
          <p className="text-lg mb-8" style={{ color: "#adaaaa", maxWidth: "480px" }}>
            Feeling anxious? Listen to this frequency-tuned guidance designed to anchor your nervous system.
          </p>

          {/* Glass audio player */}
          <div
            className="rounded-xl p-5 max-w-sm"
            style={{ background: "rgba(14,14,14,0.7)", backdropFilter: "blur(20px)", border: "0.5px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setPlaying(!playing)}
                className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-transform hover:scale-105 active:scale-95"
                style={{ background: LIME }}
              >
                {playing ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1a2600"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1a2600"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: LIME }}>Live Transmission</p>
                <p className="text-sm font-bold truncate">Anxiety Anchor Phase 01</p>
              </div>
            </div>
            {/* Progress bar */}
            <div
              className="relative h-1 rounded-full overflow-hidden cursor-pointer"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setProgress(((e.clientX - rect.left) / rect.width) * 100);
              }}
            >
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: LIME }} />
            </div>
            <div className="flex justify-between mt-2 text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              <span>{Math.floor((progress / 100) * 24)}:{String(Math.floor(((progress / 100) * 24 * 60) % 60)).padStart(2, "0")}</span>
              <span>24:00</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRENDING MEDS ────────────────────────────────────────────────── */}
      <section className="py-12" style={{ backgroundColor: "#000000" }}>
        <div className="px-6 md:px-12 mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl uppercase tracking-tighter font-black" style={{ fontFamily: "var(--font-lexend)" }}>
              Trending Meds
            </h2>
            <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "#adaaaa" }}>Premium Frequency Experiences</p>
          </div>
          <Link href="/library" className="text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: LIME }}>
            See All
          </Link>
        </div>
        <CardCarousel
          images={TRENDING_IMAGES}
          autoplayDelay={2000}
          showPagination={true}
          showNavigation={true}
        />
      </section>

      {/* ── SEARCH ───────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 md:px-12 flex flex-col items-center text-center" style={{ backgroundColor: "#0e0e0e" }}>
        <h2
          className="text-3xl md:text-4xl uppercase font-black tracking-tighter mb-8"
          style={{ fontFamily: "var(--font-lexend)" }}
        >
          What are you looking for?
        </h2>
        <form onSubmit={handleSearch} className="w-full max-w-2xl relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Deep sleep, focus, or emotional relief..."
            className="w-full bg-transparent text-xl py-4 pr-12 focus:outline-none placeholder-white/20"
            style={{
              borderBottom: `1.5px solid rgba(255,255,255,0.15)`,
              color: "#ffffff",
              fontFamily: "var(--font-manrope)",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderBottomColor = LIME)}
            onBlur={(e) => (e.target.style.borderBottomColor = "rgba(255,255,255,0.15)")}
          />
          <button type="submit" className="absolute right-0 bottom-3" style={{ color: LIME }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
        </form>
      </section>

      {/* ── ALWAYS FREE ──────────────────────────────────────────────────── */}
      <section className="py-12" style={{ backgroundColor: "#141313" }}>
        <div className="px-6 md:px-12 mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl uppercase tracking-tighter font-black" style={{ fontFamily: "var(--font-lexend)" }}>
              Always Free
            </h2>
            <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "#adaaaa" }}>Cinematic Basics for Everyone</p>
          </div>
          <Link href="/free" className="text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: LIME }}>
            See All
          </Link>
        </div>
        <div className="flex gap-5 px-6 md:px-12 pb-2" style={{ overflowX: "auto", scrollSnapType: "x mandatory" }}>
          {FREE_SESSIONS.map((item) => (
            <Link
              key={item.title}
              href="/library"
              className="group shrink-0"
              style={{ minWidth: "min(340px, 85vw)", scrollSnapAlign: "start" }}
            >
              <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "16/9", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" style={{ background: item.gradient }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)" }} />
                <div className="absolute bottom-5 left-5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest"
                      style={{ backgroundColor: LIME, color: "#1a2600" }}
                    >
                      Free
                    </span>
                    <span className="text-[10px] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>{item.duration}</span>
                  </div>
                  <h3
                    className="text-xl uppercase font-black tracking-tighter"
                    style={{ fontFamily: "var(--font-lexend)" }}
                  >
                    {item.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CHOOSE YOUR STATE ────────────────────────────────────────────── */}
      <section className="py-16 px-6 md:px-12" style={{ backgroundColor: "#0e0e0e" }}>
        <h2
          className="text-2xl md:text-3xl uppercase font-black tracking-tighter mb-10 text-center"
          style={{ fontFamily: "var(--font-lexend)" }}
        >
          Choose your state…
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-w-5xl mx-auto">
          {MOODS.map((mood) => (
            <Link
              key={mood.label}
              href={`/library?mood=${encodeURIComponent(mood.label)}`}
              className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl transition-all hover:scale-105 active:scale-95 group"
              style={{ backgroundColor: "#1a1919", border: "0.5px solid rgba(255,255,255,0.05)" }}
            >
              <span className="text-3xl">{mood.emoji}</span>
              <span
                className="text-[9px] font-bold uppercase tracking-widest text-center leading-tight group-hover:text-white transition-colors"
                style={{ color: "#adaaaa" }}
              >
                {mood.label}
              </span>
            </Link>
          ))}
          <Link
            href="/library"
            className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl transition-all hover:scale-105"
            style={{ backgroundColor: "#1a1919", border: "0.5px solid rgba(255,255,255,0.05)" }}
          >
            <span className="text-3xl">···</span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-center" style={{ color: LIME }}>
              Explore All
            </span>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer
        className="py-10 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ backgroundColor: "#010101", borderTop: "0.5px solid rgba(255,255,255,0.05)" }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: LIME }}>
          © {new Date().getFullYear()} The Daily Meds. Immersive Mindfulness.
        </p>
        <div className="flex gap-8">
          {["Instagram", "Twitter", "YouTube"].map((s) => (
            <a key={s} href="#" className="text-[10px] uppercase tracking-widest transition-colors hover:text-white" style={{ color: "#adaaaa" }}>
              {s}
            </a>
          ))}
        </div>
        <p className="text-lg font-black uppercase italic tracking-tight" style={{ color: LIME, fontFamily: "var(--font-lexend)" }}>
          The Daily Meds
        </p>
      </footer>

      {/* ── MOBILE BOTTOM NAV ────────────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around px-2 py-3"
        style={{ backgroundColor: "rgba(14,14,14,0.96)", backdropFilter: "blur(16px)", borderTop: "0.5px solid rgba(255,255,255,0.06)" }}
      >
        {[
          { label: "Home", href: "/home", active: true, icon: <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/> },
          { label: "Library", href: "/library", icon: <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/> },
          { label: "Live", href: "/live", icon: <path d="M8 5v14l11-7z"/> },
          { label: "Breathe", href: "/timer", icon: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9V8h2v9zm4 0h-2V8h2v9z"/> },
          { label: "Groups", href: "/rooms", icon: <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/> },
        ].map((item) => (
          <Link key={item.label} href={item.href} className="flex flex-col items-center gap-0.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill={item.active ? LIME : "rgba(255,255,255,0.35)"}>
              {item.icon}
            </svg>
            <span className="text-[9px]" style={{ color: item.active ? LIME : "rgba(255,255,255,0.35)" }}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
