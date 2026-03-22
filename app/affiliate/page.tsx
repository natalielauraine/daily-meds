"use client";

// Affiliate landing page — explains the programme and lets people apply.
// 20% commission on every subscription referred.
// Application form saves to the Supabase affiliates table via /api/affiliate/apply.

import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// The three steps shown in the "how it works" section
const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Apply",
    body: "Fill in the form below. We review every application and usually respond within 48 hours.",
    gradient: "linear-gradient(135deg, #6B21E8, #22D3EE)",
  },
  {
    step: "02",
    title: "Share your link",
    body: "Get your unique referral link. Share it on Instagram, TikTok, YouTube, your newsletter — wherever your audience is.",
    gradient: "linear-gradient(135deg, #F43F5E, #FACC15)",
  },
  {
    step: "03",
    title: "Earn 20%",
    body: "You earn 20% of every subscription your referral signs up to — monthly, annual or lifetime. Paid monthly.",
    gradient: "linear-gradient(135deg, #10B981, #D9F100)",
  },
];

// All the platforms we ask follower counts for
const AUDIENCE_PLATFORMS = [
  { key: "instagram",  label: "Instagram followers",        placeholder: "e.g. 12,000" },
  { key: "tiktok",     label: "TikTok followers",           placeholder: "e.g. 45,000" },
  { key: "youtube",    label: "YouTube subscribers",        placeholder: "e.g. 8,000"  },
  { key: "podcast",    label: "Podcast listeners/month",    placeholder: "e.g. 2,000"  },
  { key: "email",      label: "Email / mailing list",       placeholder: "e.g. 3,500"  },
  { key: "twitter",    label: "Twitter / X followers",      placeholder: "e.g. 6,000"  },
  { key: "other",      label: "Other (blog, forum, etc.)",  placeholder: "e.g. 10,000" },
];

export default function AffiliatePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    whyJoin: "",
  });
  // Follower counts per platform — stored separately so they're easy to read
  const [audience, setAudience] = useState<Record<string, string>>({
    instagram: "", tiktok: "", youtube: "", podcast: "", email: "", twitter: "", other: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateAudience(key: string, value: string) {
    setAudience((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.whyJoin) {
      setError("Please fill in your name, email and the why field.");
      return;
    }
    setError("");
    setLoading(true);

    // Serialise the audience numbers into a single string so we can store in one column
    const audienceSummary = AUDIENCE_PLATFORMS
      .filter((p) => audience[p.key])
      .map((p) => `${p.label}: ${audience[p.key]}`)
      .join(" | ");

    try {
      const res = await fetch("/api/affiliate/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, platform: "multiple", audienceSize: audienceSummary }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
      <Navbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 pb-24">

        {/* ── HERO ── */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-white mb-6"
            style={{ background: "linear-gradient(135deg, #6B21E8, #22D3EE)", fontWeight: 500 }}
          >
            Affiliate Programme
          </div>
          <h1 className="text-4xl sm:text-5xl text-white mb-4 leading-tight" style={{ fontWeight: 500 }}>
            Earn 20% on every
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #F43F5E, #D946EF, #F97316, #FACC15)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              referral you send
            </span>
          </h1>
          <p className="text-white/45 text-base max-w-lg mx-auto leading-relaxed">
            Share Daily Meds with your audience. When they subscribe, you earn 20% — every month, every year, or one big lifetime payment.
          </p>
        </div>

        {/* ── COMMISSION CALLOUT ── */}
        <div
          className="rounded-[14px] p-6 sm:p-8 mb-14 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left"
          style={{
            background: "linear-gradient(135deg, rgba(107,33,232,0.15), rgba(34,211,238,0.08))",
            border: "0.5px solid rgba(107,33,232,0.3)",
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 mx-auto sm:mx-0"
            style={{ background: "linear-gradient(135deg, #6B21E8, #22D3EE)" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-white text-xl mb-1" style={{ fontWeight: 500 }}>20% recurring commission</p>
            <p className="text-white/45 text-sm leading-relaxed">
              Monthly subscribers earn you £4/mo each. Annual = £40. Lifetime = £60 one-time. No cap, no expiry — you earn as long as they stay subscribed.
            </p>
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div className="mb-16">
          <h2 className="text-xl text-white mb-8 text-center" style={{ fontWeight: 500 }}>How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.step}
                className="rounded-[12px] p-6"
                style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.07)" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-4 text-white text-sm"
                  style={{ background: step.gradient, fontWeight: 500 }}
                >
                  {step.step}
                </div>
                <h3 className="text-white text-sm mb-2" style={{ fontWeight: 500 }}>{step.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── APPLICATION FORM ── */}
        <div
          className="rounded-[14px] p-6 sm:p-8"
          style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          {submitted ? (
            /* Success state */
            <div className="text-center py-8">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: "linear-gradient(135deg, #10B981, #22C55E)" }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <h3 className="text-white text-lg mb-2" style={{ fontWeight: 500 }}>Application received</h3>
              <p className="text-sm text-white/40 mb-6 max-w-sm mx-auto leading-relaxed">
                We review every application personally. You'll hear back within 48 hours. If approved, your dashboard will be waiting at the link below.
              </p>
              <Link
                href="/affiliate/dashboard"
                className="inline-flex px-5 py-2.5 rounded-[10px] text-sm text-white transition-opacity hover:opacity-80"
                style={{ background: "linear-gradient(135deg, #6B21E8, #22D3EE)", fontWeight: 500 }}
              >
                View my dashboard
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg text-white mb-1" style={{ fontWeight: 500 }}>Apply to join</h2>
              <p className="text-sm text-white/40 mb-7">
                Tell us a bit about yourself and your audience. We welcome creators of all sizes.
              </p>

              {error && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-[8px] mb-5 text-sm text-red-300"
                  style={{ backgroundColor: "rgba(244,63,94,0.08)", border: "0.5px solid rgba(244,63,94,0.25)" }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/40 mb-2">Your name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Natalie Lauraine"
                      className="w-full px-4 py-3 rounded-[8px] text-sm text-white outline-none transition-colors"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: "0.5px solid rgba(255,255,255,0.1)",
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-2">Email address *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-[8px] text-sm text-white outline-none transition-colors"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: "0.5px solid rgba(255,255,255,0.1)",
                      }}
                    />
                  </div>
                </div>

                {/* Audience numbers per platform */}
                <div>
                  <label className="block text-xs text-white/40 mb-3">
                    Your audience — fill in any that apply
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AUDIENCE_PLATFORMS.map((p) => (
                      <div key={p.key}>
                        <label className="block text-[11px] text-white/30 mb-1.5">{p.label}</label>
                        <input
                          type="text"
                          value={audience[p.key]}
                          onChange={(e) => updateAudience(p.key, e.target.value)}
                          placeholder={p.placeholder}
                          className="w-full px-3 py-2.5 rounded-[8px] text-sm text-white outline-none"
                          style={{
                            backgroundColor: "rgba(255,255,255,0.05)",
                            border: "0.5px solid rgba(255,255,255,0.1)",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Why join */}
                <div>
                  <label className="block text-xs text-white/40 mb-2">
                    Why do you want to promote Daily Meds? *
                  </label>
                  <textarea
                    value={form.whyJoin}
                    onChange={(e) => updateField("whyJoin", e.target.value)}
                    placeholder="Tell us about your audience and why Daily Meds is a good fit for them..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-[8px] text-sm text-white outline-none resize-none leading-relaxed"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: "0.5px solid rgba(255,255,255,0.1)",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-[10px] text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #6B21E8, #22D3EE)", fontWeight: 500 }}
                >
                  {loading ? "Submitting…" : "Submit application"}
                </button>

                <p className="text-xs text-white/20 text-center">
                  Already applied?{" "}
                  <Link href="/affiliate/dashboard" className="text-white/40 hover:text-white/60 transition-colors">
                    View your dashboard →
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
