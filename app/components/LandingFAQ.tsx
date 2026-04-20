"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "How is this different to Calm, Headspace or Insight Timer?",
    a: "Daily Meds is built for real life, not perfect mornings. We cover the stuff other apps won't touch: hangovers, heartbreak, anxiety spirals, comedowns. No toxic positivity, just honest meditations that meet you where you are.",
  },
  {
    q: "How much does it cost?",
    a: "We have a plan for everyone. Start completely free with 10 sessions, no card needed. The Listener is £9.99 a month — full audio library, no live sessions. The Seeker is £19.99 a month — audio plus live sessions with Natalie. The Master is a one-time payment of £299.99 for lifetime access to everything, including all future content. Cancel anytime on monthly plans.",
  },
  {
    q: "How many meditations are on here?",
    a: "We have a growing library of 100+ sessions across moods, lengths and styles and we are adding new ones every week. We add new meditations every week and in phase two we will also be adding our children's section.",
  },
  {
    q: "Is it AI or human voices?",
    a: "All human, apart from the website. Every session is recorded by Natalie and a curated team of guides. No meditations are done with AI. Everything is recorded in person at Metrica Studios in Ibiza so we release new meditations every week as any normal human would. We can't go faster and we wouldn't want to.",
  },
  {
    q: "Is it suitable for all ages?",
    a: "There is nothing explicit and these meditations are designed for teenagers and adults alike. Start with our free section or sign up today.",
  },
  {
    q: "Can I download sessions to listen offline?",
    a: "Offline downloads are available on the Lifetime plan. Monthly subscribers can stream anywhere with internet.",
  },
];

export default function LandingFAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {FAQS.map((faq, i) => (
        <div
          key={i}
          className="rounded-lg overflow-hidden"
          style={{ backgroundColor: "#262625", border: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between p-6 text-left transition-colors hover:bg-white/5"
          >
            <span
              className="font-bold uppercase tracking-wide text-sm text-white pr-4"
              style={{ fontFamily: "var(--font-lexend)" }}
            >
              {faq.q}
            </span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="rgba(255,255,255,0.4)"
              className="shrink-0 transition-transform duration-200"
              style={{ transform: open === i ? "rotate(45deg)" : "rotate(0deg)" }}
            >
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
          {open === i && (
            <div className="px-6 pb-6">
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
