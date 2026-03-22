"use client";

// Pricing page — shows three subscription tiers.
// Clicking a paid plan sends the user to Stripe Checkout.
// Free plan just links to the signup page.

import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ── PLAN DEFINITIONS ──────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "£0",
    period: "",
    description: "Create a free account and start straight away.",
    gradient: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
    glowColor: "transparent",
    featured: false,
    priceId: null,
    features: [
      "Access to all free sessions",
      "Breathing timer",
      "3 mood categories",
      "No credit card needed",
    ],
    cta: "Start for free",
    ctaHref: "/signup",
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "£19.99",
    period: "/month",
    description: "Full access. Cancel any time.",
    gradient: "linear-gradient(135deg, #6B21E8 0%, #8B3CF7 25%, #6366F1 60%, #3B82F6 80%, #22D3EE 100%)",
    glowColor: "#6B21E8",
    featured: false,
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID,
    features: [
      "Everything in Free",
      "Full session library",
      "Live sessions with Natalie",
      "Group meditation rooms",
      "Playlists and watchlist",
      "Offline downloads",
    ],
    cta: "Get Monthly",
    ctaHref: null,
  },
  {
    id: "annual",
    name: "Annual",
    price: "£199.99",
    period: "/year",
    badge: "Best value",
    description: "Save £39.89 vs monthly. Two months free.",
    gradient: "linear-gradient(135deg, #F43F5E 0%, #EC4899 20%, #D946EF 35%, #F97316 65%, #EAB308 85%, #FACC15 100%)",
    glowColor: "#F43F5E",
    featured: true,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID,
    features: [
      "Everything in Monthly",
      "Priority support",
      "Early access to new content",
      "Founding member status",
    ],
    cta: "Get Annual",
    ctaHref: null,
  },
  {
    id: "lifetime",
    name: "Lifetime",
    price: "£299.99",
    period: " one-time",
    description: "Pay once, access forever.",
    gradient: "linear-gradient(135deg, #10B981 0%, #22C55E 35%, #84CC16 70%, #D9F100 100%)",
    glowColor: "#10B981",
    featured: false,
    priceId: process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID,
    features: [
      "Everything in Annual",
      "Never pay again",
      "All future content included",
      "Founding member status",
      "Direct access to Natalie",
    ],
    cta: "Get Lifetime",
    ctaHref: null,
  },
];

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Send the user to Stripe Checkout for the selected plan
  async function handleCheckout(planId: string, priceId: string | null | undefined) {
    if (!priceId) {
      setError("Payment not yet configured — add Stripe price IDs to .env.local.");
      return;
    }
    setError("");
    setLoadingPlan(planId);

    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, planId }),
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout. Please try again.");
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 pb-24">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl text-white mb-3" style={{ fontWeight: 500 }}>
            Find your plan
          </h1>
          <p className="text-white/45 text-base max-w-md mx-auto leading-relaxed">
            Start free. Upgrade when you&apos;re ready. No spiritual waffle — just sessions that work.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-[10px] mb-8 max-w-lg mx-auto"
            style={{ backgroundColor: "rgba(244,63,94,0.1)", border: "0.5px solid rgba(244,63,94,0.3)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#F43F5E" className="shrink-0">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Plan cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="relative flex flex-col rounded-[12px] overflow-hidden"
              style={{
                backgroundColor: "#1A1A2E",
                border: plan.featured
                  ? "1px solid rgba(244,63,94,0.5)"
                  : "0.5px solid rgba(255,255,255,0.08)",
                boxShadow: plan.featured
                  ? "0 0 40px rgba(244,63,94,0.08)"
                  : "none",
              }}
            >
              {/* Gradient top stripe */}
              <div className="h-1 w-full" style={{ background: plan.gradient }} />

              {/* Best value badge */}
              {plan.badge && (
                <div
                  className="absolute top-4 right-4 text-[10px] px-2.5 py-1 rounded-full text-white"
                  style={{ background: plan.gradient, fontWeight: 500 }}
                >
                  {plan.badge}
                </div>
              )}

              <div className="flex flex-col flex-1 p-6">

                {/* Plan icon */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
                  style={{ background: plan.gradient }}
                >
                  {plan.id === "free" && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" opacity={0.9}>
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                  )}
                  {plan.id === "monthly" && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" opacity={0.9}>
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                    </svg>
                  )}
                  {plan.id === "annual" && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" opacity={0.9}>
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  )}
                  {plan.id === "lifetime" && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" opacity={0.9}>
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
                    </svg>
                  )}
                </div>

                {/* Plan name */}
                <p className="text-xs text-white/40 mb-1" style={{ letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>
                  {plan.name}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl text-white" style={{ fontWeight: 500 }}>{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-white/35">{plan.period}</span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-white/40 mb-6 leading-relaxed">{plan.description}</p>

                {/* Features */}
                <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" className="shrink-0 mt-0.5" style={{ fill: plan.id === "free" ? "rgba(255,255,255,0.3)" : "#8B5CF6" }}>
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span className="text-xs text-white/50 leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                {plan.ctaHref ? (
                  <Link
                    href={plan.ctaHref}
                    className="w-full py-3 rounded-[10px] text-sm text-center transition-opacity hover:opacity-80 block"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.07)",
                      border: "0.5px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.7)",
                      fontWeight: 500,
                    }}
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.id, plan.priceId)}
                    disabled={loadingPlan === plan.id}
                    className="w-full py-3 rounded-[10px] text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                    style={{
                      background: plan.gradient,
                      fontWeight: 500,
                    }}
                  >
                    {loadingPlan === plan.id ? "Loading…" : plan.cta}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Trust signals */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-white/25">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            Secure payment via Stripe
          </div>
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
            </svg>
            Cancel any time — no questions asked
          </div>
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
            All content by Natalie Lauraine
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-14 max-w-xl mx-auto">
          <h2 className="text-sm text-white/50 mb-6 text-center" style={{ fontWeight: 500 }}>Common questions</h2>
          <div className="flex flex-col gap-4">
            {[
              {
                q: "Can I cancel my subscription?",
                a: "Yes — cancel any time from your profile page. You keep access until the end of the billing period.",
              },
              {
                q: "What's included in the free plan?",
                a: "Free sessions and the breathing timer. You just need a free account — no credit card required.",
              },
              {
                q: "What does Lifetime actually mean?",
                a: "One payment, access forever. All future content is included. No future charges ever.",
              },
              {
                q: "Is my payment secure?",
                a: "Yes — all payments are handled by Stripe. We never store your card details.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="p-4 rounded-[10px]"
                style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-sm text-white mb-1.5" style={{ fontWeight: 500 }}>{item.q}</p>
                <p className="text-xs text-white/40 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
