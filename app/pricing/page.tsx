"use client";

// /pricing — three plan cards with animated monthly/annual billing toggle.
// Uses the Pricing component from components/ui/pricing.tsx.
// Free plan links to /signup. Paid plans call Stripe Checkout via the API.

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Pricing } from "@/components/ui/pricing";

// Plan data for Daily Meds.
// priceId values come from your Stripe dashboard — set them in .env.local.
// Member plan has both a monthly price ID and an annual price ID
// so the toggle can switch between them.
const PLANS = [
  {
    name: "Free",
    price: 0,
    yearlyPrice: 0,
    period: "forever",
    features: [
      "Access to all free sessions",
      "Breathing timer tool",
      "New free drops each month",
      "No credit card needed",
    ],
    description: "A taste of what Daily Meds can do.",
    buttonText: "Get Started Free",
    href: "/signup",
    isPopular: false,
  },
  {
    name: "Member",
    price: 19.99,
    yearlyPrice: 16.67, // £199.99/yr ÷ 12 months
    period: "month",
    features: [
      "Full library — 50+ sessions",
      "All mood categories",
      "New sessions every week",
      "Custom playlists",
      "Breathing timer",
      "Session history & streaks",
      "Cancel any time",
    ],
    description: "Everything you need to regulate, every single day.",
    buttonText: "Start Membership",
    href: "/signup",
    isPopular: true,
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID,
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID,
    planId: "monthly",
    yearlyPlanId: "annual",
  },
  {
    name: "Lifetime",
    price: 299.99,
    yearlyPrice: 299.99,
    period: "once",
    features: [
      "Everything in Member",
      "Pay once — access forever",
      "All future content included",
      "Offline downloads",
      "Group meditation rooms",
      "Early access to new features",
      "Priority support",
    ],
    description: "One payment. Daily Meds forever.",
    buttonText: "Get Lifetime Access",
    href: "/signup",
    isPopular: false,
    isLifetime: true,
    priceId: process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID,
    planId: "lifetime",
  },
];

// FAQ items shown below the pricing cards
const FAQ = [
  {
    q: "Can I cancel my subscription?",
    a: "Yes — cancel any time from your profile page. You keep access until the end of the billing period.",
  },
  {
    q: "What's included in the free plan?",
    a: "Free sessions and the breathing timer. Just create a free account — no credit card required.",
  },
  {
    q: "What does Lifetime actually mean?",
    a: "One payment, access forever. All future content is included. No further charges ever.",
  },
  {
    q: "Is my payment secure?",
    a: "Yes — all payments are handled by Stripe. We never store your card details.",
  },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0D0D1A]">
      <Navbar />

      <main className="flex-1 relative">
        {/* Subtle purple glow at the top */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(139,92,246,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Animated pricing cards */}
        <div className="pt-24">
          <Pricing
            plans={PLANS}
            title="Simple, Transparent Pricing"
            description={`No algorithms. No ads. No fluff.\nJust sessions that actually work.`}
          />
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-6 text-xs text-white/30 pb-8 px-4">
          <span>Secure payment via Stripe</span>
          <span>Cancel any time</span>
          <span>Instant access after payment</span>
        </div>

        {/* FAQ */}
        <div className="max-w-xl mx-auto px-4 pb-24">
          <h2 className="text-sm text-white/40 mb-6 text-center font-medium tracking-wide uppercase">
            Common questions
          </h2>
          <div className="flex flex-col gap-4">
            {FAQ.map((item) => (
              <div
                key={item.q}
                className="p-5 rounded-[10px]"
                style={{
                  backgroundColor: "#1A1A2E",
                  border: "0.5px solid rgba(255,255,255,0.07)",
                }}
              >
                <p className="text-sm text-white font-medium mb-1.5">{item.q}</p>
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
