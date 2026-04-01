"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "../components/Logo";

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
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#ff41b3"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
    ),
    title: "Predictable passive income",
    body: "Secure 20% recurring commission on every subscription you bring in, month after month.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#aaee20"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
    ),
    title: "Support mental health",
    body: "Give your community access to meditations designed for actual emotional survival and growth.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#ef7f4e"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
    ),
    title: "Increase your value",
    body: "Align yourself with a premium brand that prioritises authenticity over generic wellness tropes.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#ff41b3"><path d="M17 8C8 10 5.9 16.17 3.82 19.01L5.71 20l1-2.3A4.49 4.49 0 008 18c4 0 4-2 8-2s4 2 8 2v-2c-4 0-4-2-8-2-.46 0-.86.05-1.24.12C14.91 10.41 17 8 17 8z"/></svg>
    ),
    title: "Zero effort",
    body: "We provide all the creative assets, tracking links, and dashboard access. You just share.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#aaee20"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
    ),
    title: "Perfect for anyone",
    body: "Whether you're a coach, creator, or just a fan — our programme fits any community size.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#ef7f4e"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
    ),
    title: "Actual emotional support",
    body: "Sharing a tool that actually works creates deeper trust between you and your audience.",
  },
];

const COMMISSION_POINTS = [
  { title: "20% Recurring", body: "Earn on every payment, for as long as they stay subscribed." },
  { title: "Monthly Payments", body: "Payouts happen like clockwork. No chasing invoices." },
  { title: "No Minimums", body: "Earn from your very first referral. No arbitrary hurdles." },
  { title: "Full Tracking", body: "A dedicated dashboard to see clicks, conversions, and earnings in real-time." },
];

const STEPS = [
  { num: "1", label: "Apply Below", body: "Fill out our short application form. We review within 48 hours.", color: "#ff41b3" },
  { num: "2", label: "Get Your Link", body: "Access your dashboard and grab your unique tracking link and assets.", color: "#aaee20" },
  { num: "3", label: "Start Earning", body: "Share with your tribe and watch the recurring commissions grow.", color: "#ef7f4e" },
];

export default function AffiliatePage() {
  const [form, setForm] = useState({ name: "", email: "", socialHandles: "", whyJoin: "" });
  const [audienceSize, setAudienceSize] = useState("Under 1,000");
  const [audience, setAudience] = useState<Record<string, string>>({
    instagram: "", tiktok: "", youtube: "", podcast: "", email: "", twitter: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) {
      setError("Please fill in your name and email.");
      return;
    }
    setError("");
    setLoading(true);
    const audienceSummary = AUDIENCE_PLATFORMS
      .filter((p) => audience[p.key])
      .map((p) => `${p.label}: ${audience[p.key]}`)
      .join(" | ");
    try {
      const res = await fetch("/api/affiliate/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, platform: "multiple", audienceSize: audienceSummary || audienceSize }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      setSubmitted(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ backgroundColor: "#000000", color: "#e5e5e5", fontFamily: "var(--font-manrope)", minHeight: "100vh" }}>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-8 py-4"
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
      >
        <Logo href="/" size="md" />
        <div className="hidden md:flex items-center gap-8">
          {["Benefits", "Commission", "Terms", "Support"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-bold uppercase tracking-widest transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-lexend)" }}
            >
              {item}
            </a>
          ))}
        </div>
        <a
          href="#apply"
          className="px-6 py-2 text-sm font-bold uppercase tracking-widest transition-all hover:scale-105"
          style={{ background: "#ff41b3", color: "#fff", borderRadius: 4, fontFamily: "var(--font-lexend)" }}
        >
          Apply Now
        </a>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section
        className="relative flex items-center justify-center text-center pt-24 overflow-hidden"
        style={{ minHeight: 870 }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(255,65,142,0.08) 0%, #000 60%)" }}
        />
        <div className="relative z-10 px-6 max-w-5xl mx-auto">
          <h1
            className="uppercase leading-none tracking-tight mb-8"
            style={{
              fontFamily: "var(--font-nyata), var(--font-lexend)",
              fontWeight: 900,
              fontSize: "clamp(2.8rem, 8vw, 7rem)",
              color: "#ffffff",
            }}
          >
            Become a{" "}
            <span style={{ color: "#ff41b3", textShadow: "0 0 40px rgba(255,65,142,0.4)" }}>
              Daily Meds
            </span>{" "}
            Affiliate
          </h1>
          <p
            className="text-xl md:text-2xl max-w-3xl mx-auto mb-12"
            style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-lexend)" }}
          >
            Earn Monthly Income While Supporting Your Community&apos;s Mental Health
          </p>
          <a href="#apply">
            <svg className="animate-bounce mx-auto" width="40" height="40" viewBox="0 0 24 24" fill="rgba(255,65,142,0.7)">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
            </svg>
          </a>
        </div>
      </section>

      {/* ── INTRO GLASS ─────────────────────────────────────────────────────── */}
      <section className="relative py-32 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1400&h=800&fit=crop"
          alt="moody atmospheric music environment"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.45 }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #000 30%, rgba(0,0,0,0.3) 100%)" }} />
        <div className="container mx-auto px-6 relative z-10">
          <div
            className="max-w-2xl p-10 md:p-12 rounded-2xl"
            style={{
              background: "rgba(14,14,14,0.7)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <h2
              className="uppercase tracking-tight mb-6"
              style={{ fontFamily: "var(--font-nyata), var(--font-lexend)", fontWeight: 900, fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }}
            >
              Meditation for{" "}
              <span style={{ color: "#aaee20" }}>Real Life</span>.
            </h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.7)" }}>
              We built Daily Meds for the people often left out of the wellness conversation. For the DJs, the night owls, the creatives, and the high-performance seekers who need emotional support that feels honest.
            </p>
            <div
              className="inline-flex items-center gap-4 px-6 py-4 rounded-full"
              style={{ background: "rgba(239,127,78,0.15)", border: "1px solid rgba(239,127,78,0.3)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#ef7f4e">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
              <span
                className="text-xl uppercase tracking-tight font-bold"
                style={{ color: "#ef7f4e", fontFamily: "var(--font-lexend)" }}
              >
                20% Recurring Revenue
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY JOIN ────────────────────────────────────────────────────────── */}
      <section id="benefits" className="py-32" style={{ backgroundColor: "#0e0e0e" }}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2
              className="uppercase tracking-tight mb-4"
              style={{ fontFamily: "var(--font-nyata), var(--font-lexend)", fontWeight: 900, fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
            >
              Why Join Us?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)", maxWidth: 480, margin: "0 auto" }}>
              If you pressed play, something&apos;s on your mind. We make sharing that feeling rewarding.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {WHY_CARDS.map((card) => (
              <div
                key={card.title}
                className="p-8 rounded-2xl transition-all duration-300"
                style={{ backgroundColor: "#1f1f1f", border: "1px solid rgba(255,255,255,0.06)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#262626")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1f1f1f")}
              >
                <div className="mb-6">{card.icon}</div>
                <h3
                  className="uppercase mb-3 text-sm font-bold"
                  style={{ color: "#ffffff", fontFamily: "var(--font-lexend)", letterSpacing: "0.05em" }}
                >
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMISSION STRUCTURE ────────────────────────────────────────────── */}
      <section
        id="commission"
        className="py-32"
        style={{ backgroundColor: "#131313", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
            <div>
              <h2
                className="uppercase tracking-tight mb-8"
                style={{ fontFamily: "var(--font-nyata), var(--font-lexend)", fontWeight: 900, fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
              >
                Commission<br />
                <span style={{ color: "#ff41b3" }}>Structure</span>
              </h2>
              <div className="flex flex-col gap-6">
                {COMMISSION_POINTS.map((point) => (
                  <div key={point.title} className="flex items-start gap-4">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#ff41b3" style={{ flexShrink: 0, marginTop: 2 }}>
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                    <div>
                      <h4
                        className="uppercase text-sm font-bold mb-1"
                        style={{ color: "#ffffff", fontFamily: "var(--font-lexend)" }}
                      >
                        {point.title}
                      </h4>
                      <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{point.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: "#ff41b3", filter: "blur(100px)", opacity: 0.08 }}
              />
              <div
                className="relative z-10 rounded-2xl p-12 text-center"
                style={{ backgroundColor: "#191919", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <p
                  className="text-sm uppercase tracking-widest mb-2"
                  style={{ color: "#ff41b3", fontFamily: "var(--font-lexend)" }}
                >
                  Our Standard Payout
                </p>
                <p
                  className="leading-none font-black"
                  style={{ fontFamily: "var(--font-nyata), var(--font-lexend)", fontSize: "8rem", color: "#ffffff" }}
                >
                  20%
                </p>
                <p
                  className="text-xl uppercase mt-4"
                  style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-lexend)", fontWeight: 700 }}
                >
                  Lifetime Revenue Share
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW TO GET STARTED ──────────────────────────────────────────────── */}
      <section className="py-32" style={{ backgroundColor: "#0e0e0e" }}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2
              className="uppercase text-center mb-20"
              style={{ fontFamily: "var(--font-nyata), var(--font-lexend)", fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            >
              How to Get Started
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {STEPS.map((step) => (
                <div key={step.num} className="text-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black"
                    style={{
                      backgroundColor: "#1f1f1f",
                      border: `1px solid ${step.color}30`,
                      color: step.color,
                      fontFamily: "var(--font-lexend)",
                    }}
                  >
                    {step.num}
                  </div>
                  <h4
                    className="uppercase font-bold mb-3"
                    style={{ color: "#ffffff", fontFamily: "var(--font-lexend)" }}
                  >
                    {step.label}
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── APPLICATION FORM ────────────────────────────────────────────────── */}
      <section id="apply" className="py-32 relative overflow-hidden" style={{ backgroundColor: "#000000" }}>
        <div
          className="absolute right-0 top-0 w-1/2 h-full pointer-events-none"
          style={{ background: "rgba(255,65,142,0.04)", filter: "blur(150px)" }}
        />
        <div className="container mx-auto px-6 relative z-10">
          <div
            className="max-w-3xl mx-auto p-10 md:p-12 rounded-2xl"
            style={{ backgroundColor: "#131313", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {submitted ? (
              <div className="text-center py-12">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: "linear-gradient(135deg, #aaee20, #f4e71d)" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <h3
                  className="uppercase mb-3"
                  style={{ fontFamily: "var(--font-nyata), var(--font-lexend)", fontWeight: 900, fontSize: "2rem" }}
                >
                  Application received
                </h3>
                <p className="text-sm mb-8 max-w-sm mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                  We review every application personally. You&apos;ll hear back within 48 hours. If approved, your dashboard will be waiting.
                </p>
                <Link
                  href="/affiliate/dashboard"
                  className="inline-block px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wide transition-all hover:scale-105"
                  style={{ background: "#ff41b3", color: "#fff", fontFamily: "var(--font-lexend)" }}
                >
                  View my dashboard
                </Link>
              </div>
            ) : (
              <>
                <h2
                  className="uppercase tracking-tight mb-2"
                  style={{ fontFamily: "var(--font-nyata), var(--font-lexend)", fontWeight: 900, fontSize: "clamp(2rem, 4vw, 3rem)" }}
                >
                  Ready to Join?
                </h2>
                <p className="mb-10 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Submit your application below and let&apos;s start supporting your community together.
                </p>

                {error && (
                  <div
                    className="px-4 py-3 rounded-xl mb-6 text-sm"
                    style={{ background: "rgba(244,63,94,0.08)", border: "0.5px solid rgba(244,63,94,0.25)", color: "#fca5a5" }}
                  >
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: "Full Name", field: "name", type: "text" },
                      { label: "Email Address", field: "email", type: "email" },
                    ].map(({ label, field, type }) => (
                      <div key={field}>
                        <label
                          className="block text-xs uppercase tracking-widest mb-2"
                          style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-lexend)" }}
                        >
                          {label}
                        </label>
                        <input
                          type={type}
                          value={form[field as keyof typeof form]}
                          onChange={(e) => updateField(field, e.target.value)}
                          className="w-full px-4 py-3.5 rounded-xl text-sm text-white outline-none"
                          style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        className="block text-xs uppercase tracking-widest mb-2"
                        style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-lexend)" }}
                      >
                        Social Handles
                      </label>
                      <input
                        type="text"
                        value={form.socialHandles}
                        onChange={(e) => updateField("socialHandles", e.target.value)}
                        placeholder="Instagram, TikTok, YouTube..."
                        className="w-full px-4 py-3.5 rounded-xl text-sm text-white outline-none"
                        style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs uppercase tracking-widest mb-2"
                        style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-lexend)" }}
                      >
                        Audience Size
                      </label>
                      <select
                        value={audienceSize}
                        onChange={(e) => setAudienceSize(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl text-sm text-white outline-none appearance-none"
                        style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        {["Under 1,000", "1,000 - 10,000", "10,000 - 50,000", "50,000 - 100,000", "100,000+"].map((o) => (
                          <option key={o} style={{ backgroundColor: "#1f1f1f" }}>{o}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-xs uppercase tracking-widest mb-3"
                      style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-lexend)" }}
                    >
                      Your audience — fill in any that apply
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {AUDIENCE_PLATFORMS.map((p) => (
                        <div key={p.key}>
                          <label className="block text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>{p.label}</label>
                          <input
                            type="text"
                            value={audience[p.key]}
                            onChange={(e) => setAudience((prev) => ({ ...prev, [p.key]: e.target.value }))}
                            placeholder={p.placeholder}
                            className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                            style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 rounded-xl text-base font-black uppercase tracking-tight transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                    style={{ background: "#ff41b3", color: "#fff", fontFamily: "var(--font-lexend)" }}
                  >
                    {loading ? "Submitting…" : "Submit Application"}
                  </button>

                  <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.2)" }}>
                    Already applied?{" "}
                    <Link href="/affiliate/dashboard" className="transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.4)" }}>
                      View your dashboard →
                    </Link>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer
        className="px-8 md:px-12 py-16 grid grid-cols-1 md:grid-cols-2 gap-10"
        style={{ backgroundColor: "#0e0e0e", borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div>
          <p
            className="text-sm font-bold uppercase mb-3"
            style={{ color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-lexend)" }}
          >
            Daily Meds
          </p>
          <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
            Meditation for real life. Created with love by Natalie Lauraine.
          </p>
          <p className="text-xs" style={{ color: "#ff41b3", fontFamily: "var(--font-lexend)" }}>
            © {new Date().getFullYear()} I AM Sound Ltd, Trading as Daily Meds.
          </p>
        </div>
        <div className="flex flex-col md:items-end gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-3 justify-start md:justify-end">
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Affiliate Terms", href: "/terms" },
              { label: "Contact Us", href: "mailto:joy@thedailymeds.com" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-xs uppercase tracking-widest transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-lexend)" }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
