"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const C = {
  primary:        "#ff6a9e",
  primaryCont:    "#ff418e",
  secondary:      "#52e32c",
  tertiary:       "#ef7f4e",
  surfaceDim:     "#0e0e0e",
  surfaceLow:     "#131313",
  surface:        "#191919",
  surfaceHigh:    "#1f1f1f",
  surfaceHighest: "#262626",
  onSurfaceVar:   "#d9d1c1",
  onSurface:      "#f6f1e6",
};

const HEADLINE: React.CSSProperties = {
  fontFamily: "var(--font-lexend)",
  fontWeight: 900,
  letterSpacing: "-0.05em",
  textTransform: "uppercase",
};

// ── DATA ───────────────────────────────────────────────────────────────────────

const AUDIENCE_PLATFORMS = [
  { key: "instagram", label: "Instagram followers",     placeholder: "e.g. 12,000" },
  { key: "tiktok",    label: "TikTok followers",        placeholder: "e.g. 45,000" },
  { key: "youtube",   label: "YouTube subscribers",     placeholder: "e.g. 8,000"  },
  { key: "podcast",   label: "Podcast listeners/month", placeholder: "e.g. 2,000"  },
  { key: "email",     label: "Email / mailing list",    placeholder: "e.g. 3,500"  },
  { key: "twitter",   label: "Twitter / X followers",   placeholder: "e.g. 6,000"  },
];

const WHY_CARDS = [
  {
    color: C.primaryCont,
    icon: "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z",
    title: "20% recurring monthly commission",
    body: "Every subscriber you refer earns you 20% of their subscription — every single month they stay. No cap. No limits. Just steady, passive income that grows as your network grows.",
  },
  {
    color: C.secondary,
    icon: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
    title: "Support your audience where it counts",
    body: "Whether you're touring, creating, hustling, or just trying to hold it together, so is your audience. Daily Meds gives them fast, grounding tools for the hard moments — and you become the person who actually showed up for them.",
  },
  {
    color: C.tertiary,
    icon: "M17 8C8 10 5.9 16.17 3.82 19.01L5.71 20l1-2.3A4.49 4.49 0 008 18c4 0 4-2 8-2s4 2 8 2v-2c-4 0-4-2-8-2-.46 0-.86.05-1.24.12C14.91 10.41 17 8 17 8z",
    title: "Zero effort. Fits anywhere.",
    body: "Drop your link in your Instagram bio, Linktree, stories, Discord, email list, or WhatsApp groups. That's it.",
  },
  {
    color: C.primaryCont,
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z",
    title: "Real content. Real moments.",
    body: "The library covers what people actually feel — Feeling Anxious, Hungover, Lonely, Nervous, Just Got Dumped — short, voice-led sessions designed to regulate the nervous system in minutes.",
  },
  {
    color: C.secondary,
    icon: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
    title: "Perfect for anyone",
    body: "Whether you're a coach, creator, or just a fan — our programme fits any community size.",
  },
  {
    color: C.tertiary,
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z",
    title: "Actual emotional support",
    body: "Sharing a tool that actually works creates deeper trust between you and your audience.",
  },
];

const COMMISSION_POINTS = [
  { title: "20% Monthly Recurring Commission", body: "Per subscriber — every month they stay." },
  { title: "Monthly Payments, No Minimum Threshold", body: "Payouts happen automatically. No chasing invoices, no hurdles." },
  { title: "Full Tracking Dashboard", body: "Clicks, conversions, and active subscribers — all in one place." },
];

const STEPS = [
  { num: "1", label: "Apply Below",     body: "Tell us about your audience and apply below. We review every application personally.", color: C.primaryCont },
  { num: "2", label: "Share Your Link", body: "Once approved, share your link anywhere your audience hangs out.",                      color: C.secondary   },
  { num: "3", label: "Earn Every Month", body: "Earn 20% every month, automatically, for every subscriber you refer.",                color: C.tertiary    },
];

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function AffiliatePage() {
  return (
    <div style={{ backgroundColor: "#131313", color: C.onSurface, fontFamily: "var(--font-manrope)", minHeight: "100vh" }}>

      <Navbar />

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section
        className="relative flex items-center justify-center text-center pt-24 overflow-hidden"
        style={{ minHeight: 870 }}
      >
        <div
          className="absolute inset-0 z-0"
          style={{ background: `linear-gradient(to bottom, rgba(255,65,142,0.1) 0%, #000000 70%)` }}
        />
        <div className="container mx-auto px-6 relative z-10">
          <h1
            className="text-5xl md:text-8xl leading-tight mb-8"
            style={{ ...HEADLINE, color: "#ffffff" }}
          >
            Artist{" "}
            <span style={{ color: C.primaryCont, textShadow: "0 0 12px rgba(255,65,142,0.4)" }}>
              Partner
            </span>{" "}
            Programme
          </h1>
          <p
            className="text-xl md:text-2xl max-w-3xl mx-auto mb-6"
            style={{ color: C.onSurfaceVar }}
          >
            For artists, creators, and people with larger audiences
          </p>
          <p
            className="text-lg max-w-2xl mx-auto mb-12"
            style={{ color: "rgba(171,171,171,0.7)" }}
          >
            Every Daily Meds member automatically earns 10% on referrals. Apply here to unlock 20% — reserved for artists, creators, and community leaders.
          </p>
          <a href="#apply" className="flex justify-center">
            <svg className="animate-bounce" width="48" height="48" viewBox="0 0 24 24" fill={C.primary}>
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
            </svg>
          </a>
        </div>
      </section>

      {/* ── INTRO GLASS ─────────────────────────────────────────────────────── */}
      <section className="relative py-32 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1400&h=800&fit=crop"
          alt="DJ booth dark club"
          fill
          sizes="100vw"
          style={{ objectFit: "cover", opacity: 0.6 }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, #000000 30%, rgba(0,0,0,0.4) 100%)" }}
        />
        <div className="container mx-auto px-6 relative z-10">
          <div
            className="max-w-2xl p-12 rounded-xl"
            style={{
              background: "rgba(14,14,14,0.7)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <h2 className="text-3xl md:text-4xl mb-6 text-white" style={HEADLINE}>
              Daily Meds is built for{" "}
              <span style={{ color: C.secondary }}>Real Life</span>.
            </h2>
            <p className="text-lg leading-relaxed mb-4" style={{ color: C.onSurface }}>
              Daily Meds is the first meditation platform built for real people and their real-life awkward moments — artists, DJs, promoters, travellers, and anyone who needs fast emotional support without the fluffy spiritual language.
            </p>
            <p className="text-lg leading-relaxed mb-8" style={{ color: C.onSurfaceVar }}>
              The only difference between us is the music we love. Our emotions are the same.
            </p>
            <div
              className="inline-flex items-center gap-4 px-6 py-4 rounded-full"
              style={{ background: "rgba(239,127,78,0.2)", border: "1px solid rgba(239,127,78,0.3)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={C.tertiary}>
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
              <span className="text-xl" style={{ ...HEADLINE, color: C.tertiary }}>
                20% Recurring Revenue
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY JOIN ────────────────────────────────────────────────────────── */}
      <section id="benefits" className="py-32" style={{ backgroundColor: C.surfaceDim }}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl mb-4 text-white" style={HEADLINE}>Why Apply?</h2>
            <p className="max-w-xl mx-auto" style={{ color: C.onSurfaceVar }}>
              Your audience already trusts you. We make that trust rewarding — 20% recurring commission for every subscriber you bring in.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {WHY_CARDS.map((card) => (
              <div
                key={card.title}
                className="p-8 rounded-xl transition-all duration-500 cursor-default"
                style={{ backgroundColor: C.surfaceHigh }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.surfaceHighest)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.surfaceHigh)}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill={card.color} style={{ marginBottom: 24 }}>
                  <path d={card.icon} />
                </svg>
                <h3 className="text-xl mb-4 text-white" style={HEADLINE}>{card.title}</h3>
                <p className="leading-relaxed" style={{ color: C.onSurfaceVar }}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMISSION STRUCTURE ────────────────────────────────────────────── */}
      <section
        id="commission"
        className="py-32"
        style={{ backgroundColor: C.surfaceLow, borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-4xl md:text-5xl mb-8 text-white" style={HEADLINE}>
                What You<br />
                <span style={{ color: C.primaryCont }}>Get</span>
              </h2>
              <div className="flex flex-col gap-6">
                {COMMISSION_POINTS.map((point) => (
                  <div key={point.title} className="flex items-start gap-4">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={C.primary} style={{ flexShrink: 0, marginTop: 2 }}>
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                    <div>
                      <h4 className="text-lg text-white" style={HEADLINE}>{point.title}</h4>
                      <p style={{ color: C.onSurfaceVar }}>{point.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: C.primaryCont, filter: "blur(100px)", opacity: 0.1, transition: "opacity 0.3s" }}
              />
              <div
                className="relative z-10 p-12 text-center rounded-2xl"
                style={{ backgroundColor: C.surface, border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <p className="text-sm mb-2" style={{ ...HEADLINE, color: C.primary }}>Our Standard Payout</p>
                <p className="text-white" style={{ ...HEADLINE, fontSize: "8rem", lineHeight: 1 }}>20%</p>
                <p className="text-xl mt-4" style={{ ...HEADLINE, color: C.onSurfaceVar }}>Lifetime Revenue Share</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ─────────────────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl mb-4 text-white" style={HEADLINE}>Who It&apos;s For</h2>
          <p className="mb-10 text-sm" style={{ color: "rgba(171,171,171,0.6)" }}>Artists, creators, and community leaders with established audiences — apply for 20%.</p>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {[
              "DJs", "Producers", "Promoters", "Wellness practitioners",
              "Yoga teachers", "Podcasters", "Fitness coaches",
              "Event organisers", "Anyone with an audience that trusts them",
            ].map((item) => (
              <span
                key={item}
                className="px-5 py-2.5 rounded-full text-sm font-bold"
                style={{
                  backgroundColor: C.surfaceHigh,
                  border: `1px solid rgba(255,65,142,0.2)`,
                  color: C.onSurface,
                  fontFamily: "var(--font-manrope)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TO GET STARTED ──────────────────────────────────────────────── */}
      <section className="py-32" style={{ backgroundColor: C.surfaceDim }}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl text-center mb-20 text-white" style={HEADLINE}>How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {STEPS.map((step) => (
                <div key={step.num} className="text-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{
                      backgroundColor: C.surfaceHigh,
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: step.color,
                      ...HEADLINE,
                      fontSize: "1.5rem",
                    }}
                  >
                    {step.num}
                  </div>
                  <h4 className="mb-4 text-white" style={HEADLINE}>{step.label}</h4>
                  <p style={{ color: C.onSurfaceVar }}>{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMING SOON — APPLICATION ────────────────────────────────────── */}
      <section id="apply" className="py-32 relative overflow-hidden" style={{ backgroundColor: "#0a0a0a" }}>
        <div
          className="absolute right-0 top-0 w-1/2 h-full pointer-events-none -z-10"
          style={{ background: `rgba(255,65,142,0.05)`, filter: "blur(150px)" }}
        />
        <div className="container mx-auto px-6">
          <div
            className="max-w-3xl mx-auto p-12 rounded-2xl text-center"
            style={{ backgroundColor: C.surfaceLow, border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <h2 className="text-3xl md:text-5xl mb-4 text-white" style={HEADLINE}>Applications Opening Soon</h2>
            <p className="mb-6 max-w-lg mx-auto leading-relaxed" style={{ color: C.onSurfaceVar }}>
              The Artist Partner Programme is launching soon. Every Daily Meds member automatically earns 10% on referrals. Artist partners will earn 20% — reserved for creators, artists, and community leaders with established audiences.
            </p>
            <p className="text-sm" style={{ color: "rgba(171,171,171,0.5)" }}>
              Want to be notified when applications open?{" "}
              <Link href="/login" className="transition-colors hover:text-white" style={{ color: C.primaryCont }}>
                Create your free account
              </Link>{" "}
              and we&apos;ll let you know.
            </p>
          </div>
        </div>
      </section>

      {/*
      ========================================================================
      APPLICATION FORM — COMMENTED OUT FOR PHASE 1
      Restore this section when ready to accept artist partner applications.
      Also restore the useState imports and form state at the top of the component.
      ========================================================================

      <section id="apply" className="py-32 relative overflow-hidden" style={{ backgroundColor: "#000000" }}>
        <div className="absolute right-0 top-0 w-1/2 h-full pointer-events-none -z-10" style={{ background: `rgba(255,65,142,0.05)`, filter: "blur(150px)" }} />
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto p-12 rounded-2xl" style={{ backgroundColor: C.surfaceLow, border: "1px solid rgba(255,255,255,0.05)" }}>
            {submitted ? (
              <div className="text-center py-12">
                <h3 className="mb-3 text-white text-3xl" style={HEADLINE}>Application Received</h3>
                <p className="text-sm mb-8 max-w-sm mx-auto leading-relaxed" style={{ color: C.onSurfaceVar }}>
                  We review every artist application personally. You'll hear back within 48 hours.
                </p>
                <Link href="/affiliate/dashboard" className="inline-block px-8 py-3 text-sm" style={{ ...HEADLINE, backgroundColor: C.primaryCont, color: "#1e000a" }}>
                  View My Dashboard
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-3xl md:text-5xl mb-4 text-white" style={HEADLINE}>Apply for 20% Commission</h2>
                <p className="mb-12" style={{ color: C.onSurfaceVar }}>Tell us about your audience.</p>
                {error && <div className="px-4 py-3 rounded-xl mb-6 text-sm" style={{ background: "rgba(244,63,94,0.08)", color: "#fca5a5" }}>{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-8">
                  ... (form fields were here — see git history for full form)
                  <button type="submit" disabled={loading} className="w-full py-6 text-xl" style={{ ...HEADLINE, backgroundColor: C.primaryCont, color: "#1e000a" }}>
                    {loading ? "Submitting…" : "Submit Application"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
      */}

      <Footer />
    </div>
  );
}
