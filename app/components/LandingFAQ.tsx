"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "How is this different to Calm, Headspace or Insight Timer?",
    a: "Daily Meds is built for real life — not perfect mornings. We cover the stuff other apps won't touch: hangovers, heartbreak, anxiety spirals, comedowns. No toxic positivity, just honest meditations that meet you where you are.",
  },
  {
    q: "How much does it cost?",
    a: "Start completely free. Full access is £9.99/month. Cancel anytime, no questions asked.",
  },
  {
    q: "How many meditations are on here?",
    a: "We have a growing library of 100+ sessions across moods, lengths and styles — and we're adding new ones every week.",
  },
  {
    q: "Is it real or AI voices?",
    a: "Real. Every session is recorded by Natalie and a curated team of guides. No robots, no generated voices.",
  },
  {
    q: "Can the whole family watch?",
    a: "Yes. The content is designed for adults but there's nothing inappropriate. Younger teens upwards would find it useful.",
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
              style={{ fontFamily: "var(--font-plus-jakarta)" }}
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
