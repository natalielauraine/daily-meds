// About page — the story behind Daily Meds and Natalie Lauraine.
// Public page, no login required.
// Replace all placeholder text with Natalie's real words when ready.

import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "About — Daily Meds",
  description: "The story behind Daily Meds and why Natalie Lauraine built audio for emotional emergencies.",
};

// ── SECTION LABEL ─────────────────────────────────────────────────────────────
// Small uppercase label used above each section heading

function SectionLabel({ children }: { children: string }) {
  return (
    <p
      className="text-xs text-white/30 mb-3"
      style={{ letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}
    >
      {children}
    </p>
  );
}

// ── HOW IT WORKS STEP ────────────────────────────────────────────────────────

function Step({
  number,
  title,
  description,
  gradient,
}: {
  number: string;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="flex flex-col items-start gap-4">
      {/* Step number circle */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm shrink-0"
        style={{ background: gradient, fontWeight: 500 }}
      >
        {number}
      </div>
      <div>
        <h3 className="text-white text-base mb-2" style={{ fontWeight: 500 }}>
          {title}
        </h3>
        <p className="text-sm text-white/45 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
      <Navbar />

      <main className="flex-1">

        {/* ── 1. HERO ───────────────────────────────────────────── */}
        <section
          className="relative w-full px-4 sm:px-6 py-24 sm:py-36 flex flex-col items-center justify-center text-center overflow-hidden"
          style={{ backgroundColor: "#0D0D1A" }}
        >
          {/* Soft purple glow behind the text */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, rgba(139,92,246,0.12) 0%, transparent 70%)",
            }}
          />

          {/* Gradient lotus icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-8"
            style={{ background: "linear-gradient(135deg, #6B21E8 0%, #8B3CF7 25%, #6366F1 60%, #3B82F6 80%, #22D3EE 100%)" }}
          >
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.95"/>
              <path d="M10 14C10 14 2 18 2 25C2 29.4 5.6 33 10 33C13 33 15.6 31.4 17 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85"/>
              <path d="M38 14C38 14 46 18 46 25C46 29.4 42.4 33 38 33C35 33 32.4 31.4 31 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85"/>
              <path d="M24 28L20 36" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75"/>
              <path d="M24 28L28 36" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75"/>
              <circle cx="24" cy="28" r="2" fill="white" opacity="0.9"/>
            </svg>
          </div>

          <p
            className="text-xs text-white/35 mb-4"
            style={{ letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}
          >
            Natalie Lauraine
          </p>

          <h1
            className="text-4xl sm:text-6xl text-white mb-6 max-w-2xl leading-tight"
            style={{ fontWeight: 500 }}
          >
            Audio for emotional emergencies
          </h1>

          <p className="text-base sm:text-lg text-white/45 max-w-xl leading-relaxed">
            Meditation for life&apos;s most awkward moments. Not spiritual. Not corporate.
            Just real tools for when things get a bit much.
          </p>
        </section>

        {/* ── 2. THE STORY ─────────────────────────────────────── */}
        <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-20">
          <div
            className="rounded-[10px] p-8 sm:p-12"
            style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
          >
            <SectionLabel>The story</SectionLabel>
            <h2 className="text-2xl sm:text-3xl text-white mb-8" style={{ fontWeight: 500 }}>
              Why I built this
            </h2>

            {/* Replace these paragraphs with Natalie's real words */}
            <div className="flex flex-col gap-5 text-white/55 leading-relaxed text-sm sm:text-base">
              <p>
                [Natalie — replace this with your real story. Where were you when the idea hit you?
                What were you going through? What made you realise that normal meditation apps
                weren&apos;t built for the moments you actually needed them?]
              </p>
              <p>
                [What happened? A bad weekend, a breakup, a comedown, a Sunday spiral?
                Be specific. The more real this is, the more people will feel it.]
              </p>
              <p>
                [What did you try that didn&apos;t work? Generic calm apps, breathing exercises
                that felt patronising, meditation teachers who seemed like they&apos;d never had
                a rough night in their life?]
              </p>
              <p>
                [What made you decide to build something yourself instead of just finding
                the right app? What was the moment you thought — I&apos;m just going to make this.]
              </p>
            </div>

            {/* Pull quote */}
            <div
              className="mt-10 pl-5 border-l-2"
              style={{ borderColor: "rgba(139,92,246,0.5)" }}
            >
              <p className="text-white/70 text-base sm:text-lg leading-relaxed italic" style={{ fontWeight: 400 }}>
                &ldquo;[Your most honest, personal quote about why you built Daily Meds.
                Something you&apos;d actually say to a friend, not a press release.]&rdquo;
              </p>
              <p className="text-xs text-white/30 mt-3">— Natalie Lauraine, founder</p>
            </div>
          </div>
        </section>

        {/* ── 3. THE MISSION ───────────────────────────────────── */}
        <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 pb-20">
          <SectionLabel>The mission</SectionLabel>
          <h2 className="text-2xl sm:text-3xl text-white mb-6" style={{ fontWeight: 500 }}>
            Practical tools for real life
          </h2>
          <p className="text-white/45 leading-relaxed text-sm sm:text-base mb-10 max-w-2xl">
            Daily Meds is not a spiritual practice. It&apos;s not about enlightenment, chakras,
            or becoming a calmer person. It&apos;s nervous system regulation for people who
            live full lives — including the messy bits.
          </p>

          {/* Three mission pillars */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                  </svg>
                ),
                gradient: "linear-gradient(135deg, #6B21E8, #22D3EE)",
                title: "Practical",
                body: "Every session is built around a specific feeling — not a vague wellness goal. Hungover. Anxious. Heartbroken. You pick the moment, we have the session.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                  </svg>
                ),
                gradient: "linear-gradient(135deg, #F43F5E, #FACC15)",
                title: "Grounded",
                body: "No woo. No jargon. No pretending you need to be spiritual to regulate your nervous system. These are real techniques that actually work.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                ),
                gradient: "linear-gradient(135deg, #10B981, #D9F100)",
                title: "Human",
                body: "Built by someone who has actually been there. Who has needed this on a Sunday morning and found nothing that felt right. That&apos;s why this exists.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[10px] p-5"
                style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white mb-4"
                  style={{ background: item.gradient }}
                >
                  {item.icon}
                </div>
                <h3 className="text-white text-sm mb-2" style={{ fontWeight: 500 }}>{item.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. HOW IT WORKS ─────────────────────────────────── */}
        <section
          className="w-full py-20 px-4 sm:px-6"
          style={{ backgroundColor: "#1A1A2E", borderTop: "0.5px solid rgba(255,255,255,0.06)", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
        >
          <div className="max-w-3xl mx-auto">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="text-2xl sm:text-3xl text-white mb-12" style={{ fontWeight: 500 }}>
              Three steps. That&apos;s it.
            </h2>

            <div className="grid sm:grid-cols-3 gap-10 sm:gap-8">
              <Step
                number="1"
                title="Choose your mood"
                description="Pick how you actually feel right now — not how you want to feel. Hungover, anxious, heartbroken, overwhelmed. We have a session for it."
                gradient="linear-gradient(135deg, #6B21E8 0%, #8B3CF7 25%, #6366F1 60%, #3B82F6 80%, #22D3EE 100%)"
              />
              <Step
                number="2"
                title="Press play"
                description="Guided audio sessions from 5 to 45 minutes. No setup, no equipment. Just put your headphones in wherever you are."
                gradient="linear-gradient(135deg, #F43F5E 0%, #EC4899 20%, #D946EF 35%, #F97316 65%, #FACC15 100%)"
              />
              <Step
                number="3"
                title="Feel better"
                description="Your nervous system actually shifts. Not because of magic — because these techniques work. Come back whenever you need."
                gradient="linear-gradient(135deg, #10B981 0%, #22C55E 35%, #84CC16 70%, #D9F100 100%)"
              />
            </div>
          </div>
        </section>

        {/* ── 5. CREDENTIALS / BACKGROUND ─────────────────────── */}
        <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-20">
          <div className="flex flex-col sm:flex-row gap-10 items-start">

            {/* Avatar / photo placeholder */}
            <div className="shrink-0">
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center text-4xl text-white"
                style={{
                  background: "linear-gradient(135deg, #8B5CF6, #6366F1)",
                  border: "2px solid rgba(255,255,255,0.1)",
                  fontWeight: 500,
                }}
              >
                N
              </div>
            </div>

            <div className="flex-1">
              <SectionLabel>Background</SectionLabel>
              <h2 className="text-2xl text-white mb-5" style={{ fontWeight: 500 }}>
                Natalie Lauraine
              </h2>

              {/* Replace with real background */}
              <div className="flex flex-col gap-4 text-sm text-white/45 leading-relaxed">
                <p>
                  [Natalie — add your real background here. Where are you from? What did you
                  do before this? What qualifications, training, or life experience makes
                  you the right person to build this?]
                </p>
                <p>
                  [Meditation teacher training? Therapy? Personal experience with anxiety,
                  substance use, burnout? A background in audio or sound? Whatever is real
                  and relevant — put it here.]
                </p>
                <p>
                  [You don&apos;t need to have letters after your name. Real experience counts.
                  People trust people who have been through it, not just studied it.]
                </p>
              </div>

              {/* Credential pills — replace with real ones */}
              <div className="flex flex-wrap gap-2 mt-6">
                {[
                  "[Credential or training]",
                  "[Years of experience]",
                  "[Location]",
                  "[Something personal]",
                ].map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 rounded-full text-xs text-white/50"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.1)" }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. CTA ───────────────────────────────────────────── */}
        <section
          className="w-full py-24 px-4 sm:px-6 flex flex-col items-center text-center relative overflow-hidden"
          style={{ backgroundColor: "#1A1A2E", borderTop: "0.5px solid rgba(255,255,255,0.06)" }}
        >
          {/* Subtle glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 100%, rgba(139,92,246,0.1) 0%, transparent 60%)",
            }}
          />

          <h2 className="text-3xl sm:text-4xl text-white mb-4 max-w-lg leading-tight" style={{ fontWeight: 500 }}>
            Ready to feel better?
          </h2>
          <p className="text-white/40 text-sm sm:text-base mb-10 max-w-md leading-relaxed">
            Join thousands of people using Daily Meds for their most difficult moments.
            Free to start. No commitment.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <Link
              href="/pricing"
              className="px-8 py-3.5 rounded-[10px] text-sm text-white transition-opacity hover:opacity-80"
              style={{ background: "linear-gradient(135deg, #6B21E8, #8B5CF6)", fontWeight: 500 }}
            >
              Join Daily Meds
            </Link>
            <Link
              href="/"
              className="px-8 py-3.5 rounded-[10px] text-sm text-white/60 transition-colors hover:text-white"
              style={{ border: "0.5px solid rgba(255,255,255,0.15)" }}
            >
              Browse sessions
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
