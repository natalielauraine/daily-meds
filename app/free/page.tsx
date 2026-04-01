import Link from "next/link";
import Logo from "../components/Logo";
import dynamic from "next/dynamic";

const CardCarousel = dynamic(
  () => import("../../components/ui/card-carousel").then((m) => m.CardCarousel),
  { ssr: false }
);

const StoriesSection = dynamic(() => import("./StoriesSection"), { ssr: false });

const ALWAYS_FREE_IMAGES = [
  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=750&fit=crop&q=80", alt: "Morning Ritual" },
  { src: "https://images.unsplash.com/photo-1474223960279-c596b5ac7c0c?w=500&h=750&fit=crop&q=80", alt: "Anxious session" },
  { src: "https://images.unsplash.com/photo-1455642305367-68834a1da7ab?w=500&h=750&fit=crop&q=80", alt: "Sleep audio" },
  { src: "https://images.unsplash.com/photo-1531353826977-0941b4779a1c?w=500&h=750&fit=crop&q=80", alt: "Snuggle Down" },
  { src: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&h=750&fit=crop&q=80", alt: "Healing session" },
  { src: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=500&h=750&fit=crop&q=80", alt: "Heartbreak session" },
];

export default function FreePage() {
  return (
    <div style={{ backgroundColor: "#010101", color: "#ffffff", fontFamily: "var(--font-manrope)", minHeight: "100vh" }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          backgroundColor: "rgba(1,1,1,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "0.5px solid rgba(255,255,255,0.06)",
        }}
      >
        <Logo href="/" size="md" />
        <nav className="hidden md:flex items-center gap-7">
          {[
            { label: "Home", href: "/" },
            { label: "Library", href: "/library" },
            { label: "Breathe", href: "/timer" },
            { label: "Pricing", href: "/pricing" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xs uppercase tracking-widest font-bold transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-lexend)" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/signup"
          className="px-5 py-2 rounded-full text-sm font-bold uppercase transition-transform hover:scale-105"
          style={{ backgroundColor: "#ff41b3", color: "#fff", fontFamily: "var(--font-lexend)" }}
        >
          Start Free
        </Link>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section
        className="py-20 px-6 text-center"
        style={{ background: "linear-gradient(160deg, #080808 0%, #010101 60%, #0a0500 100%)" }}
      >
        <div className="max-w-3xl mx-auto flex flex-col gap-6 items-center">
          <span
            className="text-xs uppercase tracking-widest px-4 py-1.5 rounded-full border"
            style={{ borderColor: "rgba(170,238,32,0.3)", color: "#aaee20", fontFamily: "var(--font-lexend)" }}
          >
            No credit card needed
          </span>
          <h1
            className="uppercase leading-none tracking-tight"
            style={{
              fontFamily: "var(--font-lexend)",
              fontWeight: 900,
              fontSize: "clamp(2.4rem, 7vw, 5rem)",
            }}
          >
            Free content for when{" "}
            <span className="italic" style={{ color: "#aaee20" }}>life&apos;s difficult</span>
          </h1>
          <p className="text-lg max-w-xl leading-relaxed" style={{ color: "#adaaaa" }}>
            Add your email to unlock any session. No subscription required — just real support, right now.
          </p>
          <Link
            href="/signup"
            className="mt-2 px-10 py-4 rounded-full text-base font-black uppercase tracking-wide transition-all hover:scale-105"
            style={{ backgroundColor: "#aaee20", color: "#1a2600", fontFamily: "var(--font-lexend)" }}
          >
            Unlock Free Sessions →
          </Link>
        </div>
      </section>

      {/* ── ALWAYS FREE ────────────────────────────────────────────────── */}
      <section className="py-16 px-6" style={{ backgroundColor: "#010101" }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h2
              className="text-3xl md:text-4xl uppercase tracking-tighter mb-3"
              style={{ fontFamily: "var(--font-lexend)", fontWeight: 900, color: "#aaee20" }}
            >
              Always Free
            </h2>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              These sessions are yours — no strings attached. Enter your email to play.
            </p>
          </div>

          {/* Email gate notice */}
          <div
            className="mb-8 flex items-center gap-4 px-5 py-4 rounded-xl"
            style={{ backgroundColor: "rgba(170,238,32,0.07)", border: "1px solid rgba(170,238,32,0.15)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aaee20" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
              <span style={{ color: "#aaee20", fontWeight: 700 }}>Free to play</span> — just add your email to unlock any session below.{" "}
              <Link href="/signup" className="underline hover:text-white transition-colors" style={{ color: "#aaee20" }}>
                Sign up here →
              </Link>
            </p>
          </div>

          <CardCarousel
            images={ALWAYS_FREE_IMAGES}
            autoplayDelay={2000}
            showPagination={true}
            showNavigation={true}
          />
        </div>
      </section>

      {/* ── CRISIS MEDITATIONS ─────────────────────────────────────────── */}
      <section className="py-16 px-6" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h2
              className="text-3xl md:text-4xl uppercase tracking-tighter mb-3"
              style={{ fontFamily: "var(--font-lexend)", fontWeight: 900, color: "#ff41b3" }}
            >
              Crisis Meditations
            </h2>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              For the moments you need something right now. Hover to preview.
            </p>
          </div>

          <StoriesSection />
        </div>
      </section>

      {/* ── SIGN UP CTA ────────────────────────────────────────────────── */}
      <section
        className="py-24 px-6"
        style={{ background: "linear-gradient(160deg, #0f0018 0%, #010101 100%)" }}
      >
        <div className="max-w-2xl mx-auto text-center flex flex-col gap-8 items-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
          </div>
          <h2
            className="uppercase leading-none tracking-tight"
            style={{ fontFamily: "var(--font-lexend)", fontWeight: 900, fontSize: "clamp(2rem, 6vw, 4rem)" }}
          >
            Want the full library?
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: "#adaaaa" }}>
            Unlock 100+ sessions, live events, group meditations, mood-based playlists and more — for just{" "}
            <strong style={{ color: "#ffffff" }}>£9.99/month</strong>. Cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
            <Link
              href="/signup"
              className="flex-1 text-center px-8 py-4 rounded-full font-black uppercase tracking-wide text-sm transition-all hover:scale-105"
              style={{ backgroundColor: "#ff41b3", color: "#fff", fontFamily: "var(--font-lexend)", boxShadow: "0 0 24px rgba(255,65,179,0.35)" }}
            >
              Start Full Access
            </Link>
            <Link
              href="/pricing"
              className="flex-1 text-center px-8 py-4 rounded-full font-bold uppercase tracking-wide text-sm transition-all hover:bg-white/10"
              style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-lexend)" }}
            >
              See Pricing
            </Link>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            No commitment. Cancel anytime. Trusted by thousands.
          </p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer
        className="py-10 px-6"
        style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo href="/" size="sm" />
          <div className="flex items-center gap-6 text-xs">
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Pricing", href: "/pricing" },
              { label: "About", href: "/about" },
            ].map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-xs">© {new Date().getFullYear()} The Daily Meds</p>
        </div>
      </footer>
    </div>
  );
}
