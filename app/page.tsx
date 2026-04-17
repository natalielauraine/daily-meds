"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "./components/Logo";
import LandingEmailForm from "./components/LandingEmailForm";
import LandingFAQ from "./components/LandingFAQ";
import dynamic from "next/dynamic";
import { Hero as AnimatedHero } from "../components/ui/animated-hero";

const CircularGallery = dynamic(() => import("../components/ui/circular-gallery").then(m => m.CircularGallery), { ssr: false });
import type { GalleryItem } from "../components/ui/circular-gallery";

const ReferralTracker = dynamic(() => import("./components/ReferralTracker"), { ssr: false });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";

const TRENDING = [
  { title: "Hungover", badge: "Essential", gradient: "linear-gradient(160deg, #2a0800 0%, #ec723d 100%)", href: "/free", image: "https://uuglprtvwvumucnkrshj.supabase.co/storage/v1/object/public/share%20cards/Exhausted.png" },
  { title: "Anxious", badge: "High Intensity", gradient: "linear-gradient(160deg, #2a0018 0%, #ff41b3 100%)", href: "/free", image: "https://uuglprtvwvumucnkrshj.supabase.co/storage/v1/object/public/share%20cards/Hacked.png" },
  { title: "Guilty", badge: "Deep Dive", gradient: "linear-gradient(160deg, #1a1500 0%, #f4e71d 100%)", href: "/free", image: "https://uuglprtvwvumucnkrshj.supabase.co/storage/v1/object/public/share%20cards/High%20AF.png" },
  { title: "Daily Ritual", badge: "Morning", gradient: "linear-gradient(160deg, #0a1800 0%, #aaee20 100%)", href: "/free", image: "https://uuglprtvwvumucnkrshj.supabase.co/storage/v1/object/public/share%20cards/Smoking.png" },
  { title: "Snuggle Down", badge: "Sleep", gradient: "linear-gradient(160deg, #00050f 0%, #3b82f6 100%)", href: "/free", image: "https://uuglprtvwvumucnkrshj.supabase.co/storage/v1/object/public/share%20cards/Working%20Latehausted.png" },
];

const GALLERY_ITEMS: GalleryItem[] = [
  { common: "Exhausted", binomial: "Guided Release · 20 min", photo: { url: "https://uuglprtvwvumucnkrshj.supabase.co/storage/v1/object/public/share%20cards/Exhausted.png", text: "Exhausted session", by: "The Daily Meds" } },
  { common: "Hacked", binomial: "Breathwork · 18 min", photo: { url: "https://uuglprtvwvumucnkrshj.supabase.co/storage/v1/object/public/share%20cards/Hacked.png", text: "Hacked session", by: "The Daily Meds" } },
  { common: "High AF", binomial: "Guided Meditation · 15 min", photo: { url: "https://uuglprtvwvumucnkrshj.supabase.co/storage/v1/object/public/share%20cards/High%20AF.png", text: "High AF session", by: "The Daily Meds" } },
  { common: "Smoking", binomial: "Morning Reset · 10 min", photo: { url: "https://uuglprtvwvumucnkrshj.supabase.co/storage/v1/object/public/share%20cards/Smoking.png", text: "Smoking session", by: "The Daily Meds" } },
  { common: "Working Late", binomial: "Sleep Audio · 45 min", photo: { url: "https://uuglprtvwvumucnkrshj.supabase.co/storage/v1/object/public/share%20cards/Working%20Latehausted.png", text: "Working Late session", by: "The Daily Meds" } },
];

const FACE_REALITY = [
  { title: "Guilt", gradient: "linear-gradient(135deg, #0d0015 0%, #7c3aed 100%)" },
  { title: "No Money", gradient: "linear-gradient(135deg, #150000 0%, #dc2626 100%)" },
  { title: "Stressed", gradient: "linear-gradient(135deg, #150800 0%, #ea580c 100%)" },
  { title: "Sober", gradient: "linear-gradient(135deg, #001510 0%, #059669 100%)" },
];

const REASONS = [
  {
    icon: <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>,
    title: "Meditate with Friends",
    body: "Join live sessions and feel the collective energy of a community breathing as one.",
  },
  {
    icon: <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/>,
    title: "Screen Share to your TV",
    body: "Turn your living room into a sanctuary. Support for AirPlay and Chromecast built-in.",
  },
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
  {
    icon: <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>,
    title: "Earn With Us",
    body: "Earn 20% commission every month when you sign up a friend. Share the calm, get rewarded.",
  },
];

const NAV_LINKS = [
  { label: "Home",     href: "/" },
  { label: "Library",  href: "/library" },
  { label: "Pricing",  href: "/pricing" },
  { label: "Breathe",  href: "/timer" },
  { label: "About",    href: "/about" },
  { label: "Login",    href: "/login" },
];

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);
  const router = useRouter();

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
              href="/signup"
              className="px-4 py-2 rounded-full text-xs font-bold uppercase transition-transform hover:scale-105 whitespace-nowrap"
              style={{ background: "linear-gradient(90deg, #ff41b3 0%, #ec723d 100%)", color: "#ffffff", fontFamily: "var(--font-lexend)" }}
            >
              Sign In
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

      {/* ── £1 TRIAL BANNER ────────────────────────────────────────────── */}
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
              <span
                className="inline-block text-[10px] px-3 py-1 rounded-full uppercase tracking-widest mb-3"
                style={{ background: "linear-gradient(90deg, #ff41b3, #ec723d)", color: "#fff", fontFamily: "var(--font-lexend)", fontWeight: 700 }}
              >
                Try everything free for 7 days
              </span>
              <h2
                className="uppercase mb-1"
                style={{ fontFamily: "var(--font-lexend)", fontWeight: 900, fontSize: "clamp(1.2rem, 3vw, 1.6rem)", color: "#E2E2E2" }}
              >
                Start your £1 trial
              </h2>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                Full Premium access for 7 days. Then £19.99/mo. Cancel before day 7 and pay nothing more.
              </p>
            </div>
            <button
              onClick={handleTrial}
              disabled={trialLoading}
              className="shrink-0 px-8 py-3.5 rounded-full text-sm transition-all duration-200 hover:scale-105 disabled:opacity-60 disabled:scale-100 whitespace-nowrap"
              style={{
                fontFamily: "var(--font-lexend)",
                fontWeight: 700,
                background: "linear-gradient(90deg, #ff41b3, #ec723d)",
                color: "#fff",
                boxShadow: "0 0 28px rgba(255,65,179,0.4)",
                cursor: trialLoading ? "wait" : "pointer",
              }}
            >
              {trialLoading ? "Redirecting…" : "Start for £1"}
            </button>
          </div>
        </div>
      </section>

      {/* ── TRENDING MEDS ──────────────────────────────────────────────── */}
      <section className="py-12" style={{ backgroundColor: "#010101" }}>
        <div className="px-6 md:px-12">
          <h2
            className="text-2xl uppercase tracking-widest mb-8"
            style={{ fontFamily: "var(--font-lexend)", fontWeight: 900, color: "#aaee20" }}
          >
            Trending Meds
          </h2>
          <div
            className="flex gap-4 pb-6"
            style={{ overflowX: "auto", scrollSnapType: "x mandatory" }}
          >
            {TRENDING.map((item) => (
              <Link
                key={item.title}
                href="/signup"
                className="group shrink-0"
                style={{ minWidth: "260px", scrollSnapAlign: "start" }}
              >
                <div
                  className="relative overflow-hidden rounded-xl"
                  style={{ aspectRatio: "2/3", border: "0.5px solid rgba(255,255,255,0.08)" }}
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" style={{ background: item.gradient }} />
                  )}
                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)" }}
                  >
                    <span
                      className="self-start text-[10px] font-black px-2 py-1 rounded mb-2 uppercase tracking-tighter"
                      style={{ backgroundColor: "#aaee20", color: "#1a2600" }}
                    >
                      {item.badge}
                    </span>
                    <h3
                      className="text-xl uppercase italic"
                      style={{ fontFamily: "var(--font-lexend)", fontWeight: 900 }}
                    >
                      {item.title}
                    </h3>
                  </div>
                  {/* Always-visible label */}
                  <div
                    className="absolute bottom-0 left-0 right-0 p-4"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)" }}
                  >
                    <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>{item.title}</p>
                  </div>
                </div>
                <p
                  className="mt-3 text-sm uppercase tracking-wide font-bold group-hover:text-[#aaee20] transition-colors"
                  style={{ fontFamily: "var(--font-lexend)" }}
                >
                  {item.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CIRCULAR GALLERY ──────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#010101", height: "600px", overflow: "hidden" }}>
        <CircularGallery items={GALLERY_ITEMS} radius={500} autoRotateSpeed={0.03} />
      </section>

      {/* ── FACE REALITY ───────────────────────────────────────────────── */}
      <section className="py-12" style={{ backgroundColor: "#010101" }}>
        <div className="px-6 md:px-12 max-w-3xl">
          <h2
            className="text-2xl uppercase tracking-widest mb-6"
            style={{ fontFamily: "var(--font-lexend)", fontWeight: 900, color: "#ff6a9e" }}
          >
            Face Reality
          </h2>
          <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            {FACE_REALITY.map((item, i) => (
              <span key={item.title}>
                <Link href="/signup" className="hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.55)" }}>
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
          <p style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: "480px" }}>
            Full Premium access — live sessions, the entire library, group rooms — for 7 days. Then £19.99/mo. Cancel before day 7 and pay nothing more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <button
              onClick={handleTrial}
              disabled={trialLoading}
              className="px-10 py-4 rounded-full text-sm transition-all duration-200 hover:scale-105 disabled:opacity-60"
              style={{
                fontFamily: "var(--font-lexend)",
                fontWeight: 900,
                background: "linear-gradient(90deg, #ff41b3, #ec723d)",
                color: "#fff",
                boxShadow: "0 0 40px rgba(255,65,179,0.4)",
                cursor: trialLoading ? "wait" : "pointer",
              }}
            >
              {trialLoading ? "Redirecting…" : "Start for £1"}
            </button>
            <Link
              href="/free"
              className="text-sm transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-lexend)" }}
            >
              Or try free sessions →
            </Link>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            No commitment. Cancel any time before day 7.
          </p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer
        className="py-12 px-6"
        style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)", color: "#adaaaa" }}
      >
        <div className="max-w-[1200px] mx-auto flex flex-col gap-8">
          <p className="text-sm">Questions? Contact us.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {[
              { label: "FAQ", href: "/free" },
              { label: "Help Center", href: "/about" },
              { label: "Account", href: "/profile" },
              { label: "Media Center", href: "/about" },
              { label: "Partnerships", href: "/partnerships" },
              { label: "Affiliate", href: "/affiliate" },
              { label: "Terms of Use", href: "/about" },
              { label: "Privacy", href: "/about" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="underline underline-offset-4 hover:text-[#aaee20] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-4 gap-4">
            <Logo href="/" size="sm" />
            <p className="text-[10px]">© {new Date().getFullYear()} The Daily Meds. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
