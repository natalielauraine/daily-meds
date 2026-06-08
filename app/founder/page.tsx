import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Natalie Lauraine — Founder of The Daily Meds",
  description: "Meditation artist, inspirational speaker, and creator of Audio Hugs. The story behind The Daily Meds.",
};

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

export default function FounderPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#131313" }}>
      <Navbar />

      <main className="flex-1">

        {/* ── HERO ───────────────────────────────────────────── */}
        <section
          className="relative w-full px-4 sm:px-6 py-24 sm:py-36 flex flex-col items-center justify-center text-center overflow-hidden"
          style={{ backgroundColor: "#131313" }}
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, rgba(255,65,179,0.1) 0%, transparent 70%)" }}
          />

          <p
            className="text-xs text-white/35 mb-4"
            style={{ letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}
          >
            Founder
          </p>

          <h1
            className="text-4xl sm:text-6xl text-white mb-6 max-w-2xl leading-tight uppercase"
            style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            Natalie Lauraine
          </h1>

          <p className="text-base sm:text-lg text-white/45 max-w-xl leading-relaxed">
            Meditation Artist and Inspirational Speaker with over 15 years of experience spanning the nightlife, radio, music and wellness industries. Founder of The Daily Meds and creator of Audio Hugs — a binaural spatial audio format designed for emotional regulation in real life.
          </p>
        </section>

        {/* ── HER WORK + THE STORY — full-height image left, text right ── */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-20">
          <div
            className="rounded-xl overflow-hidden flex flex-col lg:flex-row"
            style={{ backgroundColor: "#1F1F1F", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {/* Text — left side */}
            <div className="flex-1 p-8 sm:p-12 lg:p-16">
              <p className="text-white/55 leading-relaxed text-sm sm:text-base mb-12">
                Her work sits at the intersection of lived experience and applied neuroscience. Built on the belief that the most powerful wellness tool any person possesses is the ability to sit with themselves — fully, honestly and without escape.
              </p>

              <SectionLabel>The story</SectionLabel>
              <h2 className="text-2xl sm:text-3xl text-white mb-8" style={{ fontWeight: 500 }}>
                From the West End to Ibiza
              </h2>

              <div className="flex flex-col gap-5 text-white/50 leading-relaxed text-sm sm:text-base">
                <p>
                  Natalie began her career in West London{"'"}s VIP hospitality scene, moving through nightclubs, parties and venues before extending into the UK festival circuit — Reading, Leeds, V Festival, SW4, Lovebox — and eventually making Ibiza her permanent home in 2015. Her radio career spanned over 5 stations across the UK and Ibiza.
                </p>
                <p>
                  The turning point came through sobriety. Drugs stopped in 2011. Alcohol in 2014. She came off social media entirely from 2018 to 2022. These were not wellness trend branding moves — these were deep decisions made from the inside, one by one, stripping back everything she had used to manage, escape or perform her way through life.
                </p>
                <p>
                  What she found underneath all of it became the foundation of The Daily Meds.
                </p>
                <p>
                  Something Natalie is very clear about: there is nothing wrong with spiritual curiosity. She has explored it all. But what she found through all of that exploration was that the most urgent work is not to transcend reality but to embody it fully.
                </p>
                <p className="text-white/65 italic">
                  It is being here — grounded in this body, in this day, in this reality, facing this feeling — that will save you.
                </p>
                <p className="text-white/40 italic text-sm">
                  As Ram Dass once said. Be Here Now{"\u2026"}
                </p>
              </div>
            </div>

            {/* Image — right side, full height */}
            <div className="hidden lg:block lg:w-[480px] shrink-0 relative" style={{ minHeight: 800 }}>
              <Image
                src="/natalie-story.jpg"
                alt="Natalie Lauraine"
                fill
                className="object-cover"
                sizes="480px"
                priority
              />
            </div>
          </div>
        </section>

        {/* ── THE VOICE ───────────────────────────────────────── */}
        <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-20">
          <SectionLabel>The voice</SectionLabel>
          <h2 className="text-2xl sm:text-3xl text-white mb-8" style={{ fontWeight: 500 }}>
            The instrument is the work
          </h2>

          <div className="flex flex-col gap-5 text-white/50 leading-relaxed text-sm sm:text-base">
            <p>
              Natalie{"'"}s voice is not incidental to her work. It is the work.
            </p>
            <p>
              Listeners consistently describe something beyond relaxation — calm, presence and emotional release that is difficult to put into words. Many fall into deep sleep within minutes. Others describe effects that mirror plant medicine ceremony.
            </p>
            <p>
              Her birth frequency is 17.766 Hz — the same frequency as psilocybin mushrooms. The Daily Meds will soon be working with neuroscientists at MuLabs to test the measurable efficiency of her voice on the human brain and body. Results coming soon.
            </p>
          </div>
        </section>

        {/* ── THE BELIEF ──────────────────────────────────────── */}
        <section
          className="w-full py-20 px-4 sm:px-6"
          style={{ backgroundColor: "#1B1B1B", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="max-w-3xl mx-auto">
            <SectionLabel>The belief</SectionLabel>
            <h2 className="text-2xl sm:text-3xl text-white mb-8" style={{ fontWeight: 500 }}>
              Freedom from the inside out
            </h2>

            <div className="flex flex-col gap-5 text-white/50 leading-relaxed text-sm sm:text-base">
              <p>
                Freedom is not found in the external world. Not in financial security, the right relationship or the right life circumstances. Freedom is what becomes available when a person develops the ability to sit with themselves — without distraction, without escape — regardless of what they are feeling.
              </p>
              <p className="text-white/65 italic">
                The Daily Meds is built on that belief. Every single day.
              </p>
            </div>
          </div>
        </section>

        {/* ── CREDENTIALS ─────────────────────────────────────── */}
        <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-20">
          <div className="flex flex-col sm:flex-row gap-10 items-start">

            <div className="shrink-0">
              <div
                className="w-40 h-40 sm:w-52 sm:h-52 rounded-full overflow-hidden"
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

            <div className="flex-1">
              <SectionLabel>Credentials</SectionLabel>

              <div className="mb-8">
                <h3 className="text-white text-sm mb-3" style={{ fontWeight: 600 }}>Featured in</h3>
                <p className="text-sm text-white/45 leading-relaxed">
                  Marie Claire, Metro, Time Out London, Stylist, Balance, Dose, Closer, Heat, Cond{"é"} Nast Traveller, DJ Magazine.
                </p>
              </div>

              <div className="mb-8">
                <h3 className="text-white text-sm mb-3" style={{ fontWeight: 600 }}>Speaker at</h3>
                <p className="text-sm text-white/45 leading-relaxed">
                  Amsterdam Dance Event, Brighton Music Conference, WooMoon Ibiza, Ibiza Spirit Festival, Regent{"'"}s University London, Point Blank Music College, Sunderland University, University of Scotland, EO Network, Semetrical Agency and more.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  "Alchemy Rewire\u2122 Navigator",
                  "Audio Hugs\u2122 \u2014 Spatial Audio in Dolby Atmos",
                  "9,000+ Insight Timer reviews \u2014 7 years of meditation audio",
                  "The Science of Wellbeing, Yale University",
                  "Sustainable Business Management, Cambridge University",
                  "Sound Healing Practitioner",
                  "Advanced Radio Production",
                  "Mental Health and Suicide Prevention",
                  "Sobriety and Accountability Coach \u2014 Music Industry",
                  "Voice Artist",
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

        {/* ── CTA ─────────────────────────────────────────────── */}
        <section
          className="w-full py-24 px-4 sm:px-6 flex flex-col items-center text-center relative overflow-hidden"
          style={{ backgroundColor: "#1B1B1B", borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(255,65,179,0.08) 0%, transparent 60%)" }}
          />

          <h2 className="text-3xl sm:text-4xl text-white mb-4 max-w-lg leading-tight" style={{ fontWeight: 500 }}>
            Find your next session
          </h2>
          <p className="text-white/40 text-sm sm:text-base mb-10 max-w-md leading-relaxed">
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
              href="/about"
              className="px-8 py-3.5 rounded-[10px] text-sm text-white/60 transition-colors hover:text-white"
              style={{ border: "0.5px solid rgba(255,255,255,0.15)" }}
            >
              About The Daily Meds
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
