// About page — the story behind Daily Meds and Natalie Lauraine.
// Public page, no login required.
// Replace all placeholder text with Natalie's real words when ready.

import Link from "next/link";
import Image from "next/image";
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
      className="text-xs text-cream/60 mb-3"
      style={{ letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}
    >
      {children}
    </p>
  );
}


// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#131313" }}>
      <Navbar />

      <main className="flex-1">

        {/* ── 1. HERO ───────────────────────────────────────────── */}
        <section
          className="relative w-full px-4 sm:px-6 py-24 sm:py-36 flex flex-col items-center justify-center text-center overflow-hidden"
          style={{ backgroundColor: "#131313" }}
        >
          {/* Soft purple glow behind the text */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, rgba(255,65,179,0.1) 0%, transparent 70%)",
            }}
          />

          {/* Gradient lotus icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-8"
            style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)" }}
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
            className="text-xs text-cream/65 mb-4"
            style={{ letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}
          >
            About
          </p>

          <h1
            className="text-4xl sm:text-6xl text-white mb-6 max-w-2xl leading-tight uppercase"
            style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            The Daily Meds is &ldquo;Audio for emotional emergencies&rdquo;
          </h1>

          <p className="text-base sm:text-lg text-cream/70 max-w-xl leading-relaxed">
            Meditation for life&apos;s most awkward moments. Not spiritual. Not corporate.
            Just real tools for when things get a bit much.
          </p>
        </section>

        {/* ── 2. THE FOUNDER ────────────────────────────────────── */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <Link href="/founder" className="block group">
            <div
              className="rounded-xl overflow-hidden flex flex-col lg:flex-row transition-all duration-300 group-hover:shadow-[0_0_40px_rgba(255,65,179,0.1)]"
              style={{ backgroundColor: "#1F1F1F", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center">
                <SectionLabel>The founder</SectionLabel>
                <h2 className="text-2xl sm:text-3xl text-white mb-4 uppercase" style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}>
                  Natalie Lauraine
                </h2>
                <p className="text-cream/60 leading-relaxed text-sm sm:text-base mb-6">
                  Meditation Artist and Inspirational Speaker with over 15 years of experience spanning nightlife, radio, music and wellness. Creator of Audio Hugs&#8482; — a binaural spatial audio format designed for emotional regulation in real life.
                </p>
                <span
                  className="text-xs uppercase tracking-widest inline-flex items-center gap-2 transition-colors group-hover:text-white"
                  style={{ color: "#ff41b3", fontFamily: "var(--font-space-grotesk)", fontWeight: 700 }}
                >
                  Read her story
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </span>
              </div>

              <div className="hidden lg:block lg:w-[420px] shrink-0 relative">
                <Image
                  src="/natalie-story-crop.jpg"
                  alt="Natalie Lauraine"
                  fill
                  className="object-cover"
                  sizes="420px"
                />
              </div>
            </div>
          </Link>
        </section>

        {/* ── 3. WHAT IS THE DAILY MEDS ─────────────────────── */}
        <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 pb-20">
          <SectionLabel>What is The Daily Meds</SectionLabel>
          <h2 className="text-2xl sm:text-3xl text-white mb-6" style={{ fontWeight: 500 }}>
            Reality-based wellness
          </h2>
          <div className="flex flex-col gap-5 text-cream/60 leading-relaxed text-sm sm:text-base">
            <p>
              The Daily Meds is an audio streaming platform focused on reality-based wellness meditations built for the emotions we don&apos;t really focus on but spend all our time trying to avoid.
            </p>
            <p>
              We don&apos;t focus on how you want to feel in the future; we focus on how you are feeling right now. We don&apos;t aim to change anything, we&apos;re just here to help you feel the uncomfortable feelings.
            </p>
            <p className="text-cream/75 italic">
              The 3am thoughts. The Monday dread. The comedown shame. The anger you cannot explain. The numbness that keeps showing up when you expected to feel fine.
            </p>
            <p>
              Most wellness platforms guide you toward a calmer, better version of yourself. The Daily Meds meets you where you actually are.
            </p>
          </div>
        </section>

        {/* ── 4. WHY IT EXISTS ────────────────────────────────── */}
        <section
          className="w-full py-20 px-4 sm:px-6"
          style={{ backgroundColor: "#1B1B1B", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="max-w-3xl mx-auto">
            <SectionLabel>Why it exists</SectionLabel>
            <h2 className="text-2xl sm:text-3xl text-white mb-6" style={{ fontWeight: 500 }}>
              Because no one else had built it
            </h2>
            <div className="flex flex-col gap-5 text-cream/60 leading-relaxed text-sm sm:text-base">
              <p>
                Founder Natalie Lauraine built a platform grounded in one belief: emotional freedom is not found in a destination. Not in a pay rise, a holiday or the right relationship. Freedom is what happens when you develop the ability to sit with yourself — regardless of how you feel — without needing to escape.
              </p>
              <p>
                That is the entire premise.
              </p>
            </div>
          </div>
        </section>

        {/* ── 5. WHAT MAKES IT DIFFERENT ──────────────────────── */}
        <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-20">
          <SectionLabel>What makes it different</SectionLabel>
          <h2 className="text-2xl sm:text-3xl text-white mb-6" style={{ fontWeight: 500 }}>
            Emotion-specific content
          </h2>
          <div className="flex flex-col gap-5 text-cream/60 leading-relaxed text-sm sm:text-base">
            <p>
              The content is emotion-specific. Rather than broad categories like &ldquo;stress&rdquo; or &ldquo;anxiety&rdquo;, The Daily Meds library is organised around the actual felt experience. Wobbly. Grumpy. Hungover. Heartbroken. Coming down. That particular kind of tired that sleep does not fix.
            </p>
            <p>
              When content names exactly what you are feeling, something in the nervous system relaxes before the audio even begins. You feel seen. And feeling seen is the beginning of regulation.
            </p>
          </div>
        </section>

        {/* ── 6. WHO IT IS FOR ────────────────────────────────── */}
        <section
          className="w-full py-20 px-4 sm:px-6"
          style={{ backgroundColor: "#1B1B1B", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="max-w-3xl mx-auto">
            <SectionLabel>Who it is for</SectionLabel>
            <h2 className="text-2xl sm:text-3xl text-white mb-6" style={{ fontWeight: 500 }}>
              Anyone who has feelings
            </h2>
            <div className="flex flex-col gap-5 text-cream/60 leading-relaxed text-sm sm:text-base">
              <p>
                The Daily Meds is not only for people who meditate. It is for anyone who has feelings — which is everyone, whether they like it or not.
              </p>
              <p>
                You do not need a practice. You do not need to be spiritual. You just need to be willing to sit with yourself for a few minutes and let the audio do its work.
              </p>
            </div>
          </div>
        </section>

        {/* ── 7. THE CONTENT ──────────────────────────────────── */}
        <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-20">
          <SectionLabel>The content</SectionLabel>
          <h2 className="text-2xl sm:text-3xl text-white mb-6" style={{ fontWeight: 500 }}>
            222 titles across 18 emotional categories
          </h2>
          <div className="flex flex-col gap-5 text-cream/60 leading-relaxed text-sm sm:text-base">
            <p>
              We have over 222 titles in process across 18 emotional categories, all recorded in binaural spatial audio at Metrica Studios in Ibiza.
            </p>
            <p>
              <strong className="text-cream/80">Audio Hugs&#8482; Journeys</strong> are Natalie&apos;s signature format — immersive sound journeys built around precise emotional moments and deep-felt presence.
            </p>
            <p>
              <strong className="text-cream/80">Alchemy Rewire&#8482; Breathwork</strong> sessions teach nervous system regulation techniques drawn from breathwork, somatic practice and Alchemy Rewire&#8482; methodology. These are not generic relaxation sessions. They are short breathwork journeys built for where you actually are.
            </p>
          </div>
        </section>

        {/* ── 8. WHY BINAURAL SPATIAL AUDIO ───────────────────── */}
        <section
          className="w-full py-20 px-4 sm:px-6"
          style={{ backgroundColor: "#1B1B1B", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="max-w-3xl mx-auto">
            <SectionLabel>Why binaural spatial audio</SectionLabel>
            <h2 className="text-2xl sm:text-3xl text-white mb-6" style={{ fontWeight: 500 }}>
              A physiological choice, not an aesthetic one
            </h2>
            <div className="flex flex-col gap-5 text-cream/60 leading-relaxed text-sm sm:text-base">
              <p>
                The Daily Meds records in binaural spatial audio. This is not an aesthetic choice. It is a physiological one.
              </p>
              <p>
                When delivered through headphones, binaural audio creates a three-dimensional sound environment your brain perceives as physically surrounding you. The nervous system responds as though someone is actually present with you in the room. That sense of presence is not incidental — it is the mechanism.
              </p>
              <p>
                The Daily Meds also produces content in Dolby Atmos, allowing sound to move in genuine three-dimensional space around the listener. The result is an audio environment the nervous system receives as safe, close and real.
              </p>
            </div>
          </div>
        </section>

        {/* ── 9. THE SCIENCE ──────────────────────────────────── */}
        <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-20">
          <SectionLabel>The science</SectionLabel>
          <h2 className="text-2xl sm:text-3xl text-white mb-6" style={{ fontWeight: 500 }}>
            It works differently on the body
          </h2>
          <div className="flex flex-col gap-5 text-cream/60 leading-relaxed text-sm sm:text-base">
            <p>
              Binaural spatial audio activates the vagus nerve more effectively than standard stereo — triggering the neural pathways associated with safety, co-regulation and calm. Research has demonstrated measurable reductions in cortisol within 15 minutes of listening. Combined with intentional voice, pacing and nervous system-informed delivery, this effect compounds significantly.
            </p>
            <p>
              The format is not just more pleasant to listen to. It works differently on the body.
            </p>
            <p>
              Natalie Lauraine&apos;s birth frequency is 17.766 Hz — the same frequency as psilocybin mushrooms. Listeners consistently describe effects that go beyond relaxation: deep calm, emotional release, a sense of being genuinely held. The Daily Meds will soon be working with neuroscientists at MuLabs to test the measurable efficiency of Natalie&apos;s voice on the human brain and body. Results coming soon.
            </p>
          </div>
        </section>

        {/* ── 10. THE PHILOSOPHY ──────────────────────────────── */}
        <section
          className="w-full py-20 px-4 sm:px-6"
          style={{ backgroundColor: "#1B1B1B", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="max-w-3xl mx-auto">
            <SectionLabel>The philosophy</SectionLabel>
            <h2 className="text-2xl sm:text-3xl text-white mb-6" style={{ fontWeight: 500 }}>
              The daily medicine
            </h2>
            <div className="flex flex-col gap-5 text-cream/60 leading-relaxed text-sm sm:text-base">
              <p>
                Most of us were never taught to sit with difficulty. We were taught to manage it, suppress it or move past it as quickly as possible.
              </p>
              <p>
                The Daily Meds teaches the other skill. The ability to be with yourself, as you are, in this moment, without needing it to be different.
              </p>
              <p className="text-cream/75 italic">
                That is the daily medicine. And it is available every day.
              </p>
            </div>
          </div>
        </section>

        {/* ── NATALIE PHOTO + LINK ──────────────────────────── */}
        <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-20">
          <Link href="/founder" className="group flex flex-col sm:flex-row gap-8 items-center">
            <div className="shrink-0">
              <div
                className="w-40 h-40 sm:w-52 sm:h-52 rounded-full overflow-hidden transition-all duration-300 group-hover:shadow-[0_0_40px_rgba(255,65,179,0.25)]"
                style={{
                  border: "2px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 0 30px rgba(255,65,179,0.15)",
                }}
              >
                <Image
                  src="/natalie-lauraine.png"
                  alt="Natalie Lauraine"
                  width={208}
                  height={208}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <SectionLabel>Meet the founder</SectionLabel>
              <h2 className="text-2xl text-white mb-3" style={{ fontWeight: 500 }}>
                Natalie Lauraine
              </h2>
              <p className="text-sm text-cream/70 leading-relaxed mb-4">
                Alchemy Rewire™ Navigator. 9,000+ Insight Timer reviews. Creator of Audio Hugs™. Featured in Marie Claire, Cond&eacute; Nast Traveller, DJ Magazine.
              </p>
              <span
                className="text-xs uppercase tracking-widest inline-flex items-center gap-2 transition-colors group-hover:text-white"
                style={{ color: "#ff41b3", fontFamily: "var(--font-space-grotesk)", fontWeight: 700 }}
              >
                Full story and credentials
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
              </span>
            </div>
          </Link>
        </section>

        {/* ── 6. CTA ───────────────────────────────────────────── */}
        <section
          className="w-full py-24 px-4 sm:px-6 flex flex-col items-center text-center relative overflow-hidden"
          style={{ backgroundColor: "#1B1B1B", borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          {/* Subtle glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 100%, rgba(255,65,179,0.08) 0%, transparent 60%)",
            }}
          />

          <h2 className="text-3xl sm:text-4xl text-white mb-4 max-w-lg leading-tight" style={{ fontWeight: 500 }}>
            Find your next session
          </h2>
          <p className="text-cream/65 text-sm sm:text-base mb-10 max-w-md leading-relaxed">
            Real audio for real moments. Browse the library and press play whenever you need it.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <Link
              href="/library"
              className="px-8 py-3.5 rounded-[10px] text-sm text-white transition-opacity hover:opacity-80"
              style={{ background: "#ff41b3", fontFamily: "var(--font-space-grotesk)", fontWeight: 700, boxShadow: "0 0 20px rgba(255,65,179,0.35)" }}
            >
              Browse sessions
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-3.5 rounded-[10px] text-sm text-cream/70 transition-colors hover:text-white"
              style={{ border: "0.5px solid rgba(255,255,255,0.15)" }}
            >
              View plans
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
