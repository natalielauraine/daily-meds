"use client";

// Pricing page — four subscription tiers with monthly/annual billing toggle.
// Layout: cinematic hero → billing toggle → 4-col plan grid → tagline band → FAQ.
// Matches the Stitch "Subscription Plans" design with the neon brand palette.

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Maps each plan ID to its Stripe price ID from env vars.
// 'trial' and 'lifetime' don't need a priceId here — the checkout route handles them directly.
const PRICE_IDS: Record<string, string> = {
  audio:    process.env.NEXT_PUBLIC_STRIPE_AUDIO_PRICE_ID    ?? "",
  monthly:  process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID  ?? "",
  annual:   process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID   ?? "",
  lifetime: process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID ?? "",
};

// ── PLAN DATA ─────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "free",
    name: "The Observer",
    tagline: "Dip your toes in",
    monthlyPrice: "Free",
    annualPrice: "Free",
    priceNote: "Forever free",
    cta: "Start for free",
    ctaHref: "/signup",
    featured: false,
    features: [
      "10 free sessions",
      "Mood category browsing",
      "Breathing timer",
      "Community access",
    ],
    locked: [
      "Full library (200+ sessions)",
      "Offline downloads",
      "Group meditation rooms",
      "Live sessions with Natalie",
    ],
  },
  {
    id: "audio",
    name: "Audio Only",
    tagline: "Full library, anytime",
    monthlyPrice: "£9.99",
    annualPrice: "£9.99",
    priceNote: "per month",
    cta: "Start listening",
    ctaHref: "/signup?plan=audio",
    featured: false,
    features: [
      "Everything in Free",
      "Full library (200+ sessions)",
      "New drops every week",
      "Breathing timer",
      "Cancel any time",
    ],
    locked: [
      "Live sessions with Natalie",
      "Offline downloads",
      "Group meditation rooms",
    ],
  },
  {
    id: "monthly",
    name: "The Seeker",
    tagline: "Audio plus live events",
    monthlyPrice: "£19.99",
    annualPrice: "£19.99",
    priceNote: "per month",
    cta: "Start monthly",
    ctaHref: "/signup?plan=monthly",
    featured: false,
    features: [
      "Everything in Audio",
      "Live sessions with Natalie",
      "Group meditation rooms",
      "Cancel any time",
    ],
    locked: [
      "Offline downloads",
    ],
  },
  {
    id: "annual",
    name: "The Regular",
    tagline: "Best value, save over 15%",
    monthlyPrice: "£16.66",
    annualPrice: "£199.99",
    monthlyPriceNote: "per month, billed annually",
    annualPriceNote: "per year",
    cta: "Go annual",
    ctaHref: "/signup?plan=annual",
    featured: true,
    features: [
      "Everything in Monthly",
      "Offline downloads",
      "Priority support",
      "Early access to new content",
      "Save vs monthly",
    ],
    locked: [],
  },
];

// ── FAQ DATA ──────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "Can I cancel my subscription at any time?",
    a: "Yes, cancel any time from your account settings. You will keep access until the end of your current billing period.",
  },
  {
    q: "What's included in the free plan?",
    a: "10 handpicked sessions, full access to the breathing timer, and community browsing. No credit card required.",
  },
  {
    q: "What are the different plans?",
    a: "Free plan gives you 10 sessions at no cost. Audio Only is £9.99 a month for full library access. Audio plus live events is £19.99 a month. The annual plan is £199.99 for the full year. The Founder Membership is a one-time payment of £299.99 for lifetime access to everything.",
  },
  {
    q: "Is the founder membership really one payment?",
    a: "Yes. £299.99 once, no monthly fees, no renewals, no surprises. Every future session and series is included.",
  },
  {
    q: "Can I download sessions to listen offline?",
    a: "Offline downloads are available on Annual and Lifetime plans. Monthly subscribers can stream anywhere with internet.",
  },
  {
    q: "What are group meditation rooms?",
    a: "Rooms let you meditate live with friends, with a shared timer, ambient audio, and optional emoji reactions.",
  },
  {
    q: "Is my payment secure?",
    a: "Yes, all payments are handled by Stripe. We never store your card details.",
  },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────

// The correct Daily Meds lotus icon — used on hero and plan cards
function LotusIcon({ size = 24, opacity = 0.9 }: { size?: number; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ opacity }}>
      <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.95" />
      <path d="M10 14C10 14 2 18 2 25C2 29.4 5.6 33 10 33C13 33 15.6 31.4 17 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
      <path d="M38 14C38 14 46 18 46 25C46 29.4 42.4 33 38 33C35 33 32.4 31.4 31 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
      <path d="M24 28L20 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75" />
      <path d="M24 28L28 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75" />
      <circle cx="24" cy="28" r="2" fill="white" opacity="0.9" />
    </svg>
  );
}

// Green tick icon — shown next to included features
function Tick() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
      <circle cx="12" cy="12" r="10" fill="rgba(173,242,37,0.15)" />
      <path d="M7 12l3.5 3.5L17 9" stroke="#adf225" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Grey cross — shown next to locked/unavailable features
function Cross() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
      <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.04)" />
      <path d="M9 9l6 6M15 9l-6 6" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// One FAQ accordion item — toggles open/closed on click
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.07)", background: "#1F1F1F" }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span
          className="text-sm pr-4"
          style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 700, color: "#E2E2E2" }}
        >
          {q}
        </span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          className="shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M6 9l6 6 6-6" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <p
          className="px-5 pb-4 text-sm leading-relaxed"
          style={{ fontFamily: "var(--font-inter)", color: "rgba(255,255,255,0.45)" }}
        >
          {a}
        </p>
      )}
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();

  // Called when the user clicks a paid plan CTA.
  // Posts to the checkout API, then redirects to Stripe's hosted payment page.
  async function handleCheckout(planId: string) {
    const priceId = PRICE_IDS[planId];
    if (!priceId) {
      alert("This plan is not available yet. Please try again later.");
      return;
    }

    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, planId }),
      });

      const data = await res.json();

      if (data.error) {
        alert(`Something went wrong: ${data.error}`);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        router.push(data.url);
      }
    } catch {
      alert("Could not connect to payment system. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#131313" }}>
      <Navbar />

      <main className="flex-1">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
          {/* Pink glow top-left */}
          <div
            className="absolute top-0 left-1/4 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,65,179,0.12) 0%, transparent 70%)" }}
          />
          {/* Orange glow top-right */}
          <div
            className="absolute top-0 right-1/4 w-[400px] h-[400px] translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(236,114,61,0.09) 0%, transparent 70%)" }}
          />

          <div className="relative max-w-3xl mx-auto">
            {/* Lotus icon badge */}
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-6"
              style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)" }}
            >
              <LotusIcon size={26} />
            </div>

            {/* Eyebrow label */}
            <p
              className="text-xs uppercase tracking-widest mb-4"
              style={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 500, color: "rgba(255,255,255,0.35)" }}
            >
              Pricing
            </p>

            {/* Main headline */}
            <h1
              className="uppercase mb-5"
              style={{
                fontFamily: "var(--font-plus-jakarta)",
                fontWeight: 800,
                fontSize: "clamp(2.2rem, 6vw, 4rem)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                color: "#E2E2E2",
              }}
            >
              Choose your{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #ff41b3 0%, #ec723d 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                stillness
              </span>
            </h1>

            {/* Subheading */}
            <p
              className="text-base sm:text-lg mb-10 max-w-xl mx-auto"
              style={{ fontFamily: "var(--font-inter)", color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}
            >
              If you pressed play, something&apos;s on your mind. Every plan includes access to Natalie&apos;s audio library.
            </p>

            {/* Monthly / Annual toggle */}
            <div
              className="inline-flex items-center gap-1 p-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <button
                onClick={() => setBilling("monthly")}
                className="px-5 py-2 rounded-full text-xs transition-all duration-200"
                style={{
                  fontFamily: "var(--font-space-grotesk)",
                  fontWeight: 700,
                  background: billing === "monthly" ? "#ff41b3" : "transparent",
                  color: billing === "monthly" ? "white" : "rgba(255,255,255,0.45)",
                  boxShadow: billing === "monthly" ? "0 0 12px rgba(255,65,179,0.4)" : "none",
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("annual")}
                className="px-5 py-2 rounded-full text-xs transition-all duration-200 flex items-center gap-2"
                style={{
                  fontFamily: "var(--font-space-grotesk)",
                  fontWeight: 700,
                  background: billing === "annual" ? "#ff41b3" : "transparent",
                  color: billing === "annual" ? "white" : "rgba(255,255,255,0.45)",
                  boxShadow: billing === "annual" ? "0 0 12px rgba(255,65,179,0.4)" : "none",
                }}
              >
                Annual
                {billing !== "annual" && (
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded uppercase"
                    style={{
                      background: "rgba(173,242,37,0.15)",
                      color: "#adf225",
                      fontFamily: "var(--font-space-grotesk)",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                    }}
                  >
                    Save 15%
                  </span>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* ── COMPARISON TABLE ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-5xl mx-auto">
            <p
              className="text-xs uppercase tracking-widest mb-2 text-center"
              style={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 500, color: "rgba(255,255,255,0.3)" }}
            >
              How we compare
            </p>
            <h2
              className="text-center uppercase mb-10"
              style={{
                fontFamily: "var(--font-plus-jakarta)",
                fontWeight: 800,
                fontSize: "clamp(1.2rem, 3vw, 1.75rem)",
                letterSpacing: "-0.01em",
                color: "#E2E2E2",
              }}
            >
              Why Daily Meds is different
            </h2>
            <div className="rounded-2xl overflow-hidden" style={{ border: "0.5px solid rgba(255,255,255,0.08)" }}>
              <Image
                src="https://uuglprtvwvumucnkrshj.supabase.co/storage/v1/object/public/share%20cards/Pricing%20Differennciator.png"
                alt="Daily Meds vs Calm vs Insight Timer vs Headspace comparison"
                width={2106}
                height={1226}
                className="w-full h-auto"
                unoptimized
              />
            </div>
          </div>
        </section>

        {/* ── PRICING GRID ── */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 items-start lg:mt-4">
              {PLANS.map((plan) => {
                const isFeatured = plan.featured;

                // Work out which price to show based on the billing toggle
                const displayPrice = billing === "annual" ? plan.annualPrice : plan.monthlyPrice;
                const displayNote =
                  plan.id === "annual"
                    ? billing === "annual"
                      ? plan.annualPriceNote
                      : plan.monthlyPriceNote
                    : plan.priceNote;

                return (
                  <div
                    key={plan.id}
                    className="relative flex flex-col rounded-2xl transition-all duration-300"
                    style={{
                      background: "#1F1F1F",
                      boxShadow: isFeatured
                        ? "0 0 0 1.5px #ff41b3, 0 0 40px rgba(255,65,179,0.15)"
                        : "0 0 0 1px rgba(255,255,255,0.06)",
                      transform: isFeatured ? "translateY(-10px)" : "none",
                    }}
                  >
                    {/* Most Popular badge — floats above the featured card */}
                    {isFeatured && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <span
                          className="text-[10px] px-3 py-1 rounded-full uppercase whitespace-nowrap"
                          style={{
                            background: "linear-gradient(90deg, #ff41b3, #ec723d)",
                            color: "white",
                            fontFamily: "var(--font-space-grotesk)",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                          }}
                        >
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="p-6 flex flex-col flex-1">
                      {/* Plan icon */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
                        style={{
                          background: isFeatured
                            ? "linear-gradient(135deg, #ff41b3, #ec723d)"
                            : "rgba(255,255,255,0.07)",
                        }}
                      >
                        <LotusIcon size={18} opacity={isFeatured ? 0.95 : 0.5} />
                      </div>

                      {/* Plan name */}
                      <h2
                        className="uppercase mb-1"
                        style={{
                          fontFamily: "var(--font-plus-jakarta)",
                          fontWeight: 800,
                          fontSize: "14px",
                          letterSpacing: "0.02em",
                          color: isFeatured ? "#ff41b3" : "#E2E2E2",
                        }}
                      >
                        {plan.name}
                      </h2>

                      {/* Tagline */}
                      <p
                        className="text-xs mb-5"
                        style={{ fontFamily: "var(--font-space-grotesk)", color: "rgba(255,255,255,0.35)" }}
                      >
                        {plan.tagline}
                      </p>

                      {/* Price display */}
                      <div className="mb-6">
                        <div className="flex items-end gap-1.5 flex-wrap">
                          <span
                            style={{
                              fontFamily: "var(--font-plus-jakarta)",
                              fontWeight: 800,
                              fontSize: displayPrice === "Free" ? "2rem" : "2.1rem",
                              color: "#E2E2E2",
                              lineHeight: 1,
                            }}
                          >
                            {displayPrice}
                          </span>
                          {displayPrice !== "Free" && displayNote && (
                            <span
                              className="text-xs mb-0.5 leading-tight"
                              style={{ fontFamily: "var(--font-space-grotesk)", color: "rgba(255,255,255,0.3)" }}
                            >
                              {displayNote}
                            </span>
                          )}
                        </div>
                        {/* Savings label on annual for the featured card */}
                        {plan.id === "annual" && billing === "annual" && (
                          <p
                            className="text-[11px] mt-1.5"
                            style={{ fontFamily: "var(--font-space-grotesk)", color: "#adf225" }}
                          >
                            Save £39.89 vs monthly
                          </p>
                        )}
                      </div>

                      {/* CTA button — free plan links to signup, paid plans go to Stripe */}
                      {plan.id === "free" ? (
                        <Link
                          href="/signup"
                          className="block text-center py-3 rounded-full text-sm mb-6 transition-all duration-200"
                          style={{
                            fontFamily: "var(--font-space-grotesk)",
                            fontWeight: 700,
                            background: "rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.65)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          {plan.cta}
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleCheckout(plan.id)}
                          disabled={loadingPlan === plan.id}
                          className="w-full text-center py-3 rounded-full text-sm mb-6 transition-all duration-200 disabled:opacity-60"
                          style={{
                            fontFamily: "var(--font-space-grotesk)",
                            fontWeight: 700,
                            background: isFeatured ? "#ff41b3" : "rgba(255,65,179,0.12)",
                            color: isFeatured ? "white" : "#ff41b3",
                            border: isFeatured ? "none" : "1px solid rgba(255,255,255,0.1)",
                            boxShadow: isFeatured ? "0 0 20px rgba(255,65,179,0.35)" : "none",
                            cursor: loadingPlan === plan.id ? "wait" : "pointer",
                          }}
                        >
                          {loadingPlan === plan.id ? "Redirecting…" : plan.cta}
                        </button>
                      )}

                      {/* Divider */}
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: "1rem" }} />

                      {/* Included features */}
                      <ul className="flex flex-col gap-2.5">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2.5">
                            <Tick />
                            <span
                              className="text-xs leading-snug"
                              style={{ fontFamily: "var(--font-space-grotesk)", color: "rgba(255,255,255,0.65)" }}
                            >
                              {f}
                            </span>
                          </li>
                        ))}
                        {/* Locked (unavailable) features */}
                        {plan.locked.map((f) => (
                          <li key={f} className="flex items-start gap-2.5">
                            <Cross />
                            <span
                              className="text-xs leading-snug line-through"
                              style={{ fontFamily: "var(--font-space-grotesk)", color: "rgba(255,255,255,0.18)" }}
                            >
                              {f}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trust signals row */}
            <div
              className="flex flex-wrap justify-center gap-6 mt-10 text-xs"
              style={{ fontFamily: "var(--font-space-grotesk)", color: "rgba(255,255,255,0.25)" }}
            >
              <span>Secure payment via Stripe</span>
              <span>·</span>
              <span>Cancel any time</span>
              <span>·</span>
              <span>Instant access after payment</span>
              <span>·</span>
              <span>All prices in GBP</span>
            </div>
          </div>
        </section>

        {/* ── FOUNDER OFFER ── */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-2xl mx-auto">
            <div
              className="relative rounded-2xl p-8 sm:p-10 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1a0010 0%, #1f1f1f 60%, #0a1500 100%)",
                border: "1.5px solid rgba(255,65,179,0.3)",
                boxShadow: "0 0 60px rgba(255,65,179,0.08)",
              }}
            >
              {/* Glow */}
              <div
                className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(255,65,179,0.1) 0%, transparent 70%)" }}
              />
              <div className="relative">
                <span
                  className="inline-block text-[10px] px-3 py-1 rounded-full uppercase tracking-widest mb-5"
                  style={{ background: "linear-gradient(90deg, #ff41b3, #ec723d)", color: "#fff", fontFamily: "var(--font-space-grotesk)", fontWeight: 700 }}
                >
                  Limited Time Only
                </span>
                <h3
                  className="uppercase mb-2"
                  style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800, fontSize: "1.75rem", color: "#E2E2E2" }}
                >
                  Founder Membership
                </h3>
                <p
                  className="text-sm mb-6 max-w-md"
                  style={{ fontFamily: "var(--font-inter)", color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}
                >
                  Pay once. Never again. Get lifetime access to everything The Daily Meds will ever make, including all future series and content. Only available for a limited time at the founding price.
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 mb-8">
                  <div>
                    <div className="flex items-end gap-2">
                      <span style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800, fontSize: "3rem", color: "#E2E2E2", lineHeight: 1 }}>£299.99</span>
                      <span className="mb-1 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>one-time</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: "#adf225" }}>Never pay again</p>
                  </div>

                  <ul className="flex flex-col gap-2 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {[
                      "Full library, forever",
                      "All future series included",
                      "Live sessions with Natalie",
                      "Offline downloads",
                      "Group meditation rooms",
                      "Personal welcome message",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" fill="rgba(173,242,37,0.15)" />
                          <path d="M7 12l3.5 3.5L17 9" stroke="#adf225" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleCheckout("lifetime")}
                  className="px-8 py-3.5 rounded-full text-sm transition-all duration-200 hover:scale-105"
                  style={{
                    fontFamily: "var(--font-space-grotesk)",
                    fontWeight: 700,
                    background: "linear-gradient(90deg, #ff41b3, #ec723d)",
                    color: "#fff",
                    boxShadow: "0 0 30px rgba(255,65,179,0.4)",
                  }}
                >
                  Claim founder membership
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── BOTTOM TAGLINE BAND ── */}
        <section
          className="px-4 sm:px-6 lg:px-8 py-16 text-center relative overflow-hidden"
          style={{ background: "#1B1B1B" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, rgba(255,65,179,0.07) 0%, transparent 70%)" }}
          />
          <div className="relative max-w-2xl mx-auto">
            <p
              className="uppercase mb-4"
              style={{
                fontFamily: "var(--font-plus-jakarta)",
                fontWeight: 800,
                fontSize: "clamp(1.4rem, 4vw, 2rem)",
                letterSpacing: "-0.01em",
                color: "#E2E2E2",
              }}
            >
              Every breath is a{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #ff41b3 0%, #ec723d 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                new beginning
              </span>
            </p>
            <p
              className="text-sm mb-8"
              style={{ fontFamily: "var(--font-inter)", color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}
            >
              Natalie created The Daily Meds for the moments no one talks about — the comedowns, the 3am spirals, the days when everything is just a bit too much. Start for free today.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm"
              style={{
                fontFamily: "var(--font-space-grotesk)",
                fontWeight: 700,
                background: "#ff41b3",
                color: "white",
                boxShadow: "0 0 24px rgba(255,65,179,0.4)",
              }}
            >
              Start for free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </Link>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto">
            <p
              className="text-xs uppercase tracking-widest mb-2 text-center"
              style={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 500, color: "rgba(255,255,255,0.3)" }}
            >
              Questions
            </p>
            <h2
              className="text-center uppercase mb-10"
              style={{
                fontFamily: "var(--font-plus-jakarta)",
                fontWeight: 800,
                fontSize: "clamp(1.2rem, 3vw, 1.75rem)",
                letterSpacing: "-0.01em",
                color: "#E2E2E2",
              }}
            >
              Frequently asked
            </h2>
            <div className="flex flex-col gap-3">
              {FAQS.map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
