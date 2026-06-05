"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase-browser";
import Logo from "./components/Logo";
import Footer from "./components/Footer";
import LandingEmailForm from "./components/LandingEmailForm";
import LandingFAQ from "./components/LandingFAQ";
import { LibraryCard } from "./components/LibraryCard";
import type { LibrarySession } from "./components/LibraryCard";
import dynamic from "next/dynamic";
import { Hero as AnimatedHero } from "../components/ui/animated-hero";

const CircularGallery = dynamic(() => import("../components/ui/circular-gallery").then(m => m.CircularGallery), { ssr: false });
import type { GalleryItem } from "../components/ui/circular-gallery";

const ReferralTracker = dynamic(() => import("./components/ReferralTracker"), { ssr: false });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";

const FACE_REALITY = [
  { title: "Guilt", gradient: "linear-gradient(135deg, #0d0015 0%, #7c3aed 100%)" },
  { title: "No Money", gradient: "linear-gradient(135deg, #150000 0%, #dc2626 100%)" },
  { title: "Stressed", gradient: "linear-gradient(135deg, #150800 0%, #ea580c 100%)" },
  { title: "Sober", gradient: "linear-gradient(135deg, #001510 0%, #059669 100%)" },
];

const REASONS = [
  {
    icon: <path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"/>,
    title: "Watch on any Device",
    body: "From your phone to your laptop, your peace follows you everywhere you go.",
  },
  {
    icon: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>,
    title: "Feel Your Feelings",
    body: "We don't hide from the dark stuff. We sit with it until it turns into light.",
  },
];

const NAV_LINKS = [
  { label: "Home",     href: "/" },
  { label: "Live",     href: "/live" },
  { label: "Pricing",  href: "/pricing" },
  { label: "About",    href: "/about" },
  { label: "Login",    href: "/login" },
];

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [trendingSessions, setTrendingSessions] = useState<any[]>([]);
  const [comingSoonSessions, setComingSoonSessions] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (window.location.hash.includes("error_code=otp_expired")) {
      router.replace("/login?error=expired");
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace("/home");
      } else {
        setAuthChecked(true);
      }
    });

    supabase.from('sessions')
      .select('*')
      .eq('status', 'published')
      .eq('is_coming_soon', false)
      .limit(4)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setTrendingSessions(data); });

    supabase.from('sessions')
      .select('*')
      .eq('status', 'published')
      .eq('is_coming_soon', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setComingSoonSessions(data); });
  }, [router]);

  if (!authChecked) return null;

  async function handleTrial() {
    setTrialLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "trial" }),
      });
      const data = await res.json();
      if (data.url) router.push(data.url);
    } catch {
      router.push("/pricing");
    } finally {
      setTrialLoading(false);
    }
  }

  return (
    <div style={{ backgroundColor: "#010101", color: "#ffffff", fontFamily: "var(--font-manrope)" }}>
      <ReferralTracker />

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{ backgroundColor: "rgba(1,1,1,0.85)", backdropFilter: "blur(20px)", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <Logo href="/" size="md" />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-xs uppercase tracking-widest font-bold transition-colors hover:text-[#aaee20]"
                style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-lexend)" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-bold uppercase transition-transform hover:scale-105 whitespace-nowrap"
              style={{ background: "linear-gradient(90deg, #ff41b3 0%, #ec723d 100%)", color: "#ffffff", fontFamily: "var(--font-lexend)" }}
            >
              Get Started
            </Link>
            {/* Mobile hamburger */}
            <button
              className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <span className="block w-5 h-0.5 transition-all" style={{ backgroundColor: mobileOpen ? "#aaee20" : "rgba(255,255,255,0.6)", transform: mobileOpen ? "rotate(45deg) translate(3px, 3px)" : "none" }} />
              <span className="block w-5 h-0.5 transition-all" style={{ backgroundColor: mobileOpen ? "transparent" : "rgba(255,255,255,0.6)", opacity: mobileOpen ? 0 : 1 }} />
              <span className="block w-5 h-0.5 transition-all" style={{ backgroundColor: mobileOpen ? "#aaee20" : "rgba(255,255,255,0.6)", transform: mobileOpen ? "rotate(-45deg) translate(3px, -3px)" : "none" }} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <nav
            className="md:hidden flex flex-col px-6 pb-6 gap-4"
            style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}
          >
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm uppercase tracking-widest font-bold py-2 transition-colors hover:text-[#aaee20]"
                style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-lexend)" }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center justify-center px-4 py-3 rounded-full text-sm font-bold uppercase"
              style={{ background: "linear-gradient(90deg, #ff41b3 0%, #ec723d 100%)", color: "#ffffff", fontFamily: "var(--font-lexend)" }}
            >
              Get Started
            </Link>
          </nav>
        )}
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section
        className="relative pt-20 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #080808 0%, #010101 50%, #090500 100%)" }}
      >
        {/* Glow orbs */}
        <div
          className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(170,238,32,0.07) 0%, transparent 70%)", filter: "blur(60px)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,65,179,0.06) 0%, transparent 70%)", filter: "blur(50px)" }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, transparent 40%, #010101 100%)" }}
        />
        <div className="relative z-10">
          <AnimatedHero />
        </div>
      </section>

      {/* ── TRIAL BANNER ──────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-12 pb-4" style={{ backgroundColor: "#010101" }}>
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1a0010 0%, #1f1f1f 50%, #0d0010 100%)",
            border: "1.5px solid rgba(255,65,179,0.3)",
            boxShadow: "0 0 60px rgba(255,65,179,0.08)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 15% 50%, rgba(255,65,179,0.1) 0%, transparent 60%)" }}
          />
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 p-7 sm:p-8">
            <div className="text-center sm:text-left">
              <h2
                className="uppercase mb-1"
                style={{ fontFamily: "var(--font-lexend)", fontWeight: 900, fontSize: "clamp(1.2rem, 3vw, 1.6rem)", color: "#E2E2E2" }}
              >
                Try the full experience
              </h2>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                A new way of sitting with your emotions. No spiritual fluff.
              </p>
            </div>
            <Link
              href="/login"
              className="shrink-0 px-8 py-3.5 rounded-full text-sm transition-all duration-200 hover:scale-105 whitespace-nowrap"
              style={{
                fontFamily: "var(--font-lexend)",
                fontWeight: 700,
                background: "linear-gradient(90deg, #ff41b3, #ec723d)",
                color: "#fff",
                boxShadow: "0 0 28px rgba(255,65,179,0.4)",
              }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRENDING MEDS ──────────────────────────────────────────────── */}
      {trendingSessions.length > 0 && (
        <section className="py-12" style={{ backgroundColor: "#010101" }}>
          <div className="px-6 md:px-12">
            <div className="flex justify-between items-end mb-8">
              <h2
                className="text-2xl uppercase tracking-widest"
                style={{ fontFamily: "var(--font-lexend)", fontWeight: 900, color: "#aaee20" }}
              >
                Trending Meds
              </h2>
              <Link href="/library" className="text-xs uppercase tracking-widest font-bold hover:underline" style={{ color: "#aaee20", fontFamily: "var(--font-lexend)" }}>
                See All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {trendingSessions.map((session: any) => (
                <LibraryCard key={session.id} session={session as LibrarySession} isPaidMember={false} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── COMING SOON ──────────────────────────────────────────────── */}
      {comingSoonSessions.length > 0 && (
        <section className="py-12" style={{ backgroundColor: "#010101" }}>
          <div className="px-6 md:px-12">
            <div className="flex justify-between items-end mb-8">
              <h2
                className="text-2xl uppercase tracking-widest"
                style={{ fontFamily: "var(--font-lexend)", fontWeight: 900, color: "#ffffff" }}
              >
                Coming Soon
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: "#ff41b3", fontFamily: "var(--font-lexend)" }}>New Drops Weekly</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {comingSoonSessions.map((session: any) => (
                <LibraryCard key={session.id} session={session as LibrarySession} isPaidMember={false} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FACE REALITY ───────────────────────────────────────────────── */}
      <section className="py-12" style={{ backgroundColor: "#010101" }}>
        <div className="px-6 md:px-12 max-w-3xl">
          <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            {FACE_REALITY.map((item, i) => (
              <span key={item.title}>
                <Link href="/library" className="hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {item.title}
                </Link>
                {i < FACE_REALITY.length - 1 && <span style={{ color: "rgba(255,255,255,0.2)" }}> · </span>}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* ── MORE REASONS TO JOIN ───────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: "#0e0e0e" }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <h2
            className="text-3xl md:text-4xl uppercase tracking-tighter mb-12 text-center"
            style={{ fontFamily: "var(--font-lexend)", fontWeight: 900 }}
          >
            More Reasons To Join
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {REASONS.map((item, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl flex flex-col gap-4"
                style={{ backgroundColor: "#1a1919", border: "0.5px solid rgba(255,255,255,0.05)" }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="#aaee20">
                  {item.icon}
                </svg>
                <h3
                  className="text-xl uppercase font-bold"
                  style={{ fontFamily: "var(--font-lexend)" }}
                >
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#adaaaa" }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: "#010101" }}>
        <div className="max-w-3xl mx-auto px-6">
          <h2
            className="text-3xl md:text-4xl uppercase tracking-tighter mb-12 text-center"
            style={{ fontFamily: "var(--font-lexend)", fontWeight: 900 }}
          >
            Frequently Asked Questions
          </h2>
          <LandingFAQ />
        </div>
      </section>

      {/* ── BOTTOM CTA ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ backgroundColor: "#010101" }}>
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
          <span
            className="text-[10px] px-3 py-1 rounded-full uppercase tracking-widest"
            style={{ background: "rgba(255,65,179,0.1)", border: "0.5px solid rgba(255,65,179,0.25)", color: "#ff41b3", fontFamily: "var(--font-lexend)", fontWeight: 700 }}
          >
            Limited time offer
          </span>
          <h2
            className="uppercase"
            style={{ fontFamily: "var(--font-lexend)", fontWeight: 900, fontSize: "clamp(1.8rem, 5vw, 3rem)", color: "#E2E2E2", lineHeight: 1.1 }}
          >
            Your toolkit for
            <br />
            <span style={{ background: "linear-gradient(90deg, #ff41b3, #ec723d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              real life.
            </span>
          </h2>
          <p style={{ color: "#ffffff", lineHeight: 1.7, maxWidth: "480px" }}>
            Full audio library access — new drops every week — for 14 days. Then £9.99/mo. Cancel before day 7 and pay nothing more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <Link
              href="/login"
              className="px-10 py-4 rounded-full text-sm transition-all duration-200 hover:scale-105"
              style={{
                fontFamily: "var(--font-lexend)",
                fontWeight: 900,
                background: "linear-gradient(90deg, #ff41b3, #ec723d)",
                color: "#fff",
                boxShadow: "0 0 40px rgba(255,65,179,0.4)",
              }}
            >
              Get Started
            </Link>
            <Link
              href="/free"
              className="text-sm transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-lexend)" }}
            >
              Or try free sessions →
            </Link>
          </div>
          <p className="text-xs" style={{ color: "#ffffff" }}>
            No commitment. Cancel any time before day 7.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
