"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "../../lib/supabase-browser";
import Logo from "../components/Logo";
import { generateBrandCode, BRAND_TYPES } from "../../lib/brand-crews";

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
  onSurfaceVar:   "#ababab",
  onSurface:      "#e5e5e5",
};

const HEADLINE: React.CSSProperties = {
  fontFamily: "var(--font-lexend)",
  fontWeight: 900,
  letterSpacing: "-0.05em",
  textTransform: "uppercase",
};

// ── DATA ──────────────────────────────────────────────────────────────────────

const WHAT_YOU_GET = [
  {
    color: C.primaryCont,
    icon: "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z",
    title: "3 Custom Meditations For Your Audience",
    body: "Bespoke, studio-quality sessions built around your community's real emotional moments. Yours to share, gift, and embed across your platforms.",
  },
  {
    color: C.secondary,
    icon: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z",
    title: "Your Own Affiliate Link",
    body: "Share it once across your channels and earn 20% every month for every subscriber you bring in. No cap, no expiry.",
  },
  {
    color: C.tertiary,
    icon: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
    title: "A Mental Health Offering Your Audience Will Actually Use",
    body: "Not a discount code. Not a logo placement. Something that genuinely helps the people who follow you.",
  },
];

const WHY_POINTS = [
  "Science-backed content developed with trauma-informed and neuroscience expertise",
  "Studio-quality spatial audio that elevates any brand experience",
  "An engaged, trust-based community actively investing in their wellbeing",
  "Flexible formats — from single activations to ongoing partnerships",
  "Measurable impact: engagement, conversions, and brand lift reporting",
  "A genuine voice audiences are tired of not hearing from brands",
];

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function PartnershipsPage() {
  const supabase = createClient();

  const [form, setForm] = useState({
    name: "",
    brand_type: "",
    contact_email: "",
    description: "",
    website_url: "",
    instagram: "",
    tiktok: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState("");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.contact_email.trim() || !form.brand_type) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();

    const socialLinks: Record<string, string> = {};
    if (form.instagram.trim()) socialLinks.instagram = form.instagram.trim();
    if (form.tiktok.trim())    socialLinks.tiktok    = form.tiktok.trim();

    const { error: insertErr } = await supabase.from("brand_crews").insert({
      name:          form.name.trim(),
      brand_type:    form.brand_type,
      contact_email: form.contact_email.trim(),
      description:   form.description.trim() || null,
      website_url:   form.website_url.trim()  || null,
      social_links:  socialLinks,
      invite_code:   generateBrandCode(),
      status:        "pending",
      is_verified:   false,
      applied_by:    user?.id ?? null,
    });

    if (insertErr) { setError(insertErr.message); setSubmitting(false); return; }
    setSubmitted(true);
    setSubmitting(false);
  }

  return (
    <div style={{ backgroundColor: "#000000", color: C.onSurface, fontFamily: "var(--font-manrope)", minHeight: "100vh" }}>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-4"
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
      >
        <Logo href="/" size="md" />
        <div className="hidden md:flex items-center gap-10">
          {[
            { label: "Why",   href: "#why"   },
            { label: "How",   href: "#how"   },
            { label: "What",  href: "#offer" },
            { label: "Who",   href: "#who"   },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="transition-colors duration-300 hover:text-white"
              style={{ ...HEADLINE, fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}
            >
              {item.label}
            </a>
          ))}
        </div>
        <a
          href="#apply"
          className="px-6 py-2 transition-transform active:scale-90 hover:brightness-110"
          style={{ ...HEADLINE, fontSize: "0.8rem", backgroundColor: C.primaryCont, color: "#1e000a" }}
        >
          Start a Conversation
        </a>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section
        className="relative flex items-center justify-center text-center pt-24 overflow-hidden"
        style={{ minHeight: 870 }}
      >
        <div
          className="absolute inset-0 z-0"
          style={{ background: "linear-gradient(to bottom, rgba(255,65,142,0.1) 0%, #000000 70%)" }}
        />
        <div className="container mx-auto px-6 relative z-10">
          <p
            className="text-xs uppercase tracking-[0.25em] mb-4"
            style={{ color: C.primaryCont, fontFamily: "var(--font-manrope)", fontWeight: 700 }}
          >
            Brand Partnership Program
          </p>
          <h1
            className="text-5xl md:text-8xl leading-tight mb-8"
            style={{ ...HEADLINE, color: "#ffffff" }}
          >
            Align Your Brand With{" "}
            <span style={{ color: C.primaryCont, textShadow: "0 0 12px rgba(255,65,142,0.4)" }}>
              Wellness.
            </span>{" "}
            Without Compromise.
          </h1>
          <a href="#apply" className="flex justify-center">
            <svg className="animate-bounce" width="48" height="48" viewBox="0 0 24 24" fill={C.primary}>
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
            </svg>
          </a>
        </div>
      </section>

      {/* ── WHY THIS MATTERS ────────────────────────────────────────────────── */}
      <section id="why" className="relative py-32 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1400&h=800&fit=crop"
          alt="atmospheric dark environment"
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
              Why This <span style={{ color: C.secondary }}>Matters</span>
            </h2>
            <p className="text-lg leading-relaxed mb-4" style={{ color: C.onSurface }}>
              People are overwhelmed. Anxiety, burnout, and emotional exhaustion are no longer edge cases. They&apos;re the default setting for modern life. Your audience is feeling it. Your employees are feeling it. And brands that genuinely show up for that moment earn something no ad budget can buy: real trust.
            </p>
            <p className="text-lg leading-relaxed mb-8" style={{ color: C.onSurfaceVar }}>
              Daily Meds exists to give people fast, science-backed emotional support without the spiritual fluff. When your brand is part of that, you&apos;re not just marketing. You&apos;re actually helping.
            </p>
            <div
              className="inline-flex items-center gap-4 px-6 py-4 rounded-full"
              style={{ background: "rgba(239,127,78,0.2)", border: "1px solid rgba(239,127,78,0.3)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={C.tertiary}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span className="text-xl" style={{ ...HEADLINE, color: C.tertiary }}>
                Brands That Actually Help
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW WE WORK ─────────────────────────────────────────────────────── */}
      <section id="how" className="py-32" style={{ backgroundColor: C.surfaceDim }}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl mb-4 text-white" style={HEADLINE}>
                How We <span style={{ color: C.primaryCont }}>Work</span>
              </h2>
              <p style={{ color: C.onSurfaceVar }}>
                Every partnership is built around one idea: your audience deserves mental health support that feels real.
              </p>
            </div>
            <div
              className="p-10 rounded-xl"
              style={{ backgroundColor: C.surfaceHigh, border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <p className="text-lg leading-relaxed mb-6" style={{ color: C.onSurface }}>
                We come to you. No upfront cost, no complicated contracts. We create{" "}
                <span style={{ color: "#ffffff", fontWeight: 700 }}>three custom branded meditations</span>{" "}
                for your audience, designed around the real moments they face. A festival crowd, for example, gets sessions for the morning after, the social anxiety of a big crowd, and the overwhelm of too much, too fast.
              </p>
              <p className="text-lg leading-relaxed mb-6" style={{ color: C.onSurfaceVar }}>
                In return, we ask one thing: introduce us to your audience. A mini social campaign, a feature in your announcement, your affiliate link in your communications. That&apos;s it.
              </p>
              <p className="text-lg leading-relaxed mb-6" style={{ color: C.onSurface }}>
                Every subscriber who signs up through you earns you{" "}
                <span style={{ color: C.primaryCont, fontWeight: 700 }}>20% monthly recurring commission</span>,
                {" "}automatically, for as long as they stay. Your audience gets a genuine mental health tool. You generate passive monthly income. Everyone wins.
              </p>
              <p className="text-lg leading-relaxed mb-6" style={{ color: C.onSurfaceVar }}>
                Imagine releasing a free meditation to your entire audience during a moment of collective stress. A product launch, a global news cycle, a cultural shift. A simple gift that says{" "}
                <span style={{ color: C.primaryCont }}>we see what you&apos;re carrying right now</span>.
                {" "}That kind of gesture builds the kind of loyalty that no paid campaign can replicate.
              </p>
              <p className="text-lg leading-relaxed" style={{ color: C.onSurfaceVar }}>
                All Daily Meds content is developed in collaboration with a{" "}
                <span style={{ color: "#ffffff" }}>trauma-informed expert and neuroscientist</span>,
                {" "}and led by Natalie Lauraine, a qualified nervous system regulation practitioner with over five years of active community on Insight Timer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET ────────────────────────────────────────────────────── */}
      <section id="offer" className="py-32" style={{ backgroundColor: C.surfaceLow, borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl mb-4 text-white" style={HEADLINE}>What You Get</h2>
            <p className="max-w-xl mx-auto" style={{ color: C.onSurfaceVar }}>
              Everything your audience needs. Everything you need to earn from it.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {WHAT_YOU_GET.map((card) => (
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

      {/* ── WHAT WE ASK IN RETURN ───────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: C.surfaceDim }}>
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl mb-8 text-white" style={HEADLINE}>
              What We Ask <span style={{ color: C.secondary }}>In Return</span>
            </h2>
            <div
              className="p-10 rounded-xl"
              style={{ backgroundColor: C.surfaceHigh, border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <p className="text-xl leading-relaxed" style={{ color: C.onSurface }}>
                A social campaign introducing Daily Meds to your audience. A feature in your announcement. Your link, shared with intention.
              </p>
              <p className="text-lg mt-4" style={{ color: C.onSurfaceVar }}>
                That&apos;s the whole deal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO THIS WORKS FOR ──────────────────────────────────────────────── */}
      <section id="who" className="py-20" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl mb-10 text-white" style={HEADLINE}>Who This Works For</h2>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto mb-6">
            {[
              "Festivals & Events",
              "Wellness & Lifestyle Brands",
              "Tech Companies",
              "Corporate & HR Teams",
              "Non-Alcoholic & Functional Drinks Brands",
            ].map((item) => (
              <span
                key={item}
                className="px-5 py-2.5 rounded-full text-sm font-bold"
                style={{
                  backgroundColor: C.surfaceHigh,
                  border: "1px solid rgba(255,65,142,0.2)",
                  color: C.onSurface,
                  fontFamily: "var(--font-manrope)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
          <p className="text-sm mt-4" style={{ color: C.onSurfaceVar }}>
            Positive brands only. We work exclusively with brands that promote wellbeing and align with our mission.
          </p>
        </div>
      </section>

      {/* ── WHY BRANDS CHOOSE US ─────────────────────────────────────────────── */}
      <section className="py-32" style={{ backgroundColor: C.surfaceDim, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-4xl md:text-5xl mb-8 text-white" style={HEADLINE}>
                Why Brands<br />
                <span style={{ color: C.primaryCont }}>Choose Us</span>
              </h2>
              <div className="flex flex-col gap-6">
                {WHY_POINTS.map((point) => (
                  <div key={point} className="flex items-start gap-4">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={C.primary} style={{ flexShrink: 0, marginTop: 2 }}>
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                    <p className="leading-relaxed" style={{ color: C.onSurfaceVar }}>{point}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: C.primaryCont, filter: "blur(100px)", opacity: 0.1 }}
              />
              <div
                className="relative z-10 p-12 text-center rounded-2xl"
                style={{ backgroundColor: C.surface, border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <p className="text-sm mb-4" style={{ ...HEADLINE, color: C.primary }}>Your Monthly Earning</p>
                <p className="text-white" style={{ ...HEADLINE, fontSize: "8rem", lineHeight: 1 }}>20%</p>
                <p className="text-xl mt-4" style={{ ...HEADLINE, color: C.onSurfaceVar }}>
                  Per Subscriber<br />Every Month
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── APPLICATION FORM ────────────────────────────────────────────────── */}
      <section id="apply" className="py-32 relative overflow-hidden" style={{ backgroundColor: "#000000" }}>
        <div
          className="absolute right-0 top-0 w-1/2 h-full pointer-events-none -z-10"
          style={{ background: "rgba(255,65,142,0.05)", filter: "blur(150px)" }}
        />
        <div className="container mx-auto px-6">
          <div
            className="max-w-3xl mx-auto p-12 rounded-2xl"
            style={{ backgroundColor: C.surfaceLow, border: "1px solid rgba(255,255,255,0.05)" }}
          >
            {submitted ? (
              <div className="text-center py-12">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: `linear-gradient(135deg, ${C.secondary}, #f4e71d)` }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <h3 className="mb-3 text-white text-3xl" style={HEADLINE}>Application Received</h3>
                <p className="text-sm mb-8 max-w-sm mx-auto leading-relaxed" style={{ color: C.onSurfaceVar }}>
                  We review every application personally. You&apos;ll hear back within 48 hours at {form.contact_email}.
                </p>
                <Link
                  href="/"
                  className="inline-block px-8 py-3 text-sm transition-all hover:brightness-110"
                  style={{ ...HEADLINE, backgroundColor: C.primaryCont, color: "#1e000a" }}
                >
                  Back to Daily Meds
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-3xl md:text-5xl mb-4 text-white" style={HEADLINE}>
                  Ready to Give Your Audience Something That Actually Helps Them?
                </h2>
                <p className="mb-12" style={{ color: C.onSurfaceVar }}>
                  Start the conversation below or{" "}
                  <a
                    href="mailto:hello@thedailymeds.com"
                    className="underline hover:text-white transition-colors"
                    style={{ color: C.primaryCont }}
                  >
                    book a call directly
                  </a>.
                </p>

                {error && (
                  <div
                    className="px-4 py-3 rounded-xl mb-6 text-sm"
                    style={{ background: "rgba(244,63,94,0.08)", border: "0.5px solid rgba(244,63,94,0.25)", color: "#fca5a5" }}
                  >
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm uppercase tracking-widest mb-2" style={{ color: C.onSurfaceVar }}>
                        Brand / Organisation Name *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        placeholder="e.g. Glastonbury Festival"
                        maxLength={100}
                        className="w-full p-4 rounded-xl text-white outline-none"
                        style={{ backgroundColor: C.surfaceHighest, border: "none" }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm uppercase tracking-widest mb-2" style={{ color: C.onSurfaceVar }}>
                        Contact Email *
                      </label>
                      <input
                        type="email"
                        value={form.contact_email}
                        onChange={(e) => update("contact_email", e.target.value)}
                        placeholder="hello@yourbrand.com"
                        className="w-full p-4 rounded-xl text-white outline-none"
                        style={{ backgroundColor: C.surfaceHighest, border: "none" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm uppercase tracking-widest mb-2" style={{ color: C.onSurfaceVar }}>
                      Brand Type *
                    </label>
                    <select
                      value={form.brand_type}
                      onChange={(e) => update("brand_type", e.target.value)}
                      className="w-full p-4 rounded-xl text-white outline-none appearance-none"
                      style={{ backgroundColor: C.surfaceHighest, border: "none", colorScheme: "dark" }}
                    >
                      <option value="">Select a type…</option>
                      {BRAND_TYPES.map((t) => (
                        <option key={t.value} value={t.value} style={{ backgroundColor: C.surfaceHigh }}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm uppercase tracking-widest mb-2" style={{ color: C.onSurfaceVar }}>
                      Tell Us About Your Brand
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      placeholder="What does your brand stand for and what kind of partnership are you imagining?"
                      rows={4}
                      maxLength={500}
                      className="w-full p-4 rounded-xl text-white outline-none resize-none"
                      style={{ backgroundColor: C.surfaceHighest, border: "none" }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm uppercase tracking-widest mb-2" style={{ color: C.onSurfaceVar }}>
                        Website
                      </label>
                      <input
                        type="url"
                        value={form.website_url}
                        onChange={(e) => update("website_url", e.target.value)}
                        placeholder="https://yourbrand.com"
                        className="w-full p-4 rounded-xl text-white outline-none"
                        style={{ backgroundColor: C.surfaceHighest, border: "none" }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm uppercase tracking-widest mb-2" style={{ color: C.onSurfaceVar }}>
                        Instagram
                      </label>
                      <input
                        type="url"
                        value={form.instagram}
                        onChange={(e) => update("instagram", e.target.value)}
                        placeholder="https://instagram.com/yourbrand"
                        className="w-full p-4 rounded-xl text-white outline-none"
                        style={{ backgroundColor: C.surfaceHighest, border: "none" }}
                      />
                    </div>
                  </div>

                  <div className="pt-8">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-6 text-xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                      style={{ ...HEADLINE, backgroundColor: C.primaryCont, color: "#1e000a" }}
                    >
                      {submitting ? "Submitting…" : "Start the Conversation"}
                    </button>
                  </div>

                  <p className="text-xs text-center" style={{ color: "rgba(171,171,171,0.5)" }}>
                    Prefer to talk first?{" "}
                    <a href="mailto:hello@thedailymeds.com" className="transition-colors hover:text-white" style={{ color: C.onSurfaceVar }}>
                      Email hello@thedailymeds.com →
                    </a>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer
        className="px-12 py-20 grid grid-cols-1 md:grid-cols-2 gap-12"
        style={{ backgroundColor: C.surfaceDim, borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div>
          <p className="text-lg font-bold uppercase mb-4" style={{ color: "rgba(255,255,255,0.9)" }}>Daily Meds</p>
          <p className="text-sm tracking-wide mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>
            Meditation for real life. Made with love in Ibiza by Natalie Lauraine.
          </p>
          <p className="text-sm tracking-wide" style={{ color: C.primaryCont }}>
            © {new Date().getFullYear()} I AM Sound Ltd, Trading as Daily Meds.
          </p>
        </div>
        <div className="flex flex-col md:items-end gap-4">
          <div className="flex flex-wrap gap-x-8 gap-y-4 justify-start md:justify-end">
            {[
              { label: "Privacy Policy", href: "/privacy"                      },
              { label: "Terms",          href: "/terms"                        },
              { label: "Contact Us",     href: "mailto:hello@thedailymeds.com" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-sm tracking-wide uppercase transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.4)" }}
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
