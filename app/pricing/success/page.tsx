"use client";

// Success page — shown after a successful Stripe payment.
// Confirms the purchase and links the user to the library.

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";

const PLAN_DETAILS: Record<string, { label: string; gradient: string; message: string }> = {
  monthly: {
    label: "Monthly",
    gradient: "linear-gradient(135deg, #ff41b3 0%, #ec723d 25%, #adf225 60%, #adf225 80%, #adf225 100%)",
    message: "Your monthly membership is now active. Full library unlocked.",
  },
  annual: {
    label: "Annual",
    gradient: "linear-gradient(135deg, #ff41b3 0%, #ff41b3 20%, #ff41b3 35%, #ec723d 65%, #f4e71d 85%, #f4e71d 100%)",
    message: "Your annual membership is now active. Enjoy two months free.",
  },
  lifetime: {
    label: "Lifetime",
    gradient: "linear-gradient(135deg, #adf225 0%, #adf225 35%, #adf225 70%, #f4e71d 100%)",
    message: "You're a founding member. Access everything, forever. Thank you.",
  },
};

// Inner component uses useSearchParams — must be inside Suspense
function SuccessContent() {
  const searchParams = useSearchParams();
  const plan = searchParams?.get("plan") ?? "monthly";
  const details = PLAN_DETAILS[plan] ?? PLAN_DETAILS.monthly;

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm text-center">

        {/* Animated checkmark circle */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: details.gradient, boxShadow: `0 0 60px rgba(255,65,179,0.25)` }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </div>

        <h1 className="text-2xl text-white mb-3" style={{ fontWeight: 500 }}>
          You&apos;re in 🎉
        </h1>

        <p className="text-sm text-white/40 leading-relaxed mb-2">
          {details.message}
        </p>

        <p className="text-xs text-white/25 mb-10">
          You&apos;ll get a confirmation email from Stripe shortly.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/library"
            className="w-full py-3.5 rounded-[10px] text-sm text-white text-center transition-opacity hover:opacity-80"
            style={{ background: details.gradient, fontWeight: 500 }}
          >
            Go to the library
          </Link>
          <Link
            href="/"
            className="w-full py-3 rounded-[10px] text-sm text-center transition-colors hover:bg-white/[0.05]"
            style={{ color: "rgba(255,255,255,0.4)", border: "0.5px solid rgba(255,255,255,0.1)" }}
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function PricingSuccessPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#131313" }}>
      <Navbar />
      <Suspense fallback={null}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
