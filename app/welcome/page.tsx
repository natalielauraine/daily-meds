import Link from "next/link";
import Logo from "../components/Logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome — Daily Meds",
};

export default function WelcomePage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#010101", color: "#e5e5e5", fontFamily: "var(--font-manrope)" }}
    >
      {/* HEADER */}
      <header className="flex justify-between items-center px-8 py-8 w-full">
        <Logo href="/" size="md" />
        <Link
          href="/profile"
          className="transition-colors hover:text-white"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        </Link>
      </header>

      {/* MAIN */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1
            className="leading-tight mb-12"
            style={{
              fontFamily: "var(--font-lexend)",
              fontWeight: 800,
              fontSize: "clamp(1.6rem, 4vw, 3rem)",
              letterSpacing: "-0.04em",
            }}
          >
            <span
              style={{
                background: "linear-gradient(to right, #FE8A58, #ff418e)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 15px rgba(255,65,142,0.4))",
                display: "block",
                textTransform: "uppercase",
              }}
            >
              Well, that was a good move.
            </span>
            <span
              style={{
                background: "linear-gradient(to right, #FE8A58, #ff418e)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 15px rgba(255,65,142,0.4))",
                display: "block",
                textTransform: "uppercase",
              }}
            >
              We won&apos;t let you down.
            </span>
          </h1>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link
              href="/home"
              className="w-full md:w-auto px-10 py-5 text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:brightness-110 active:scale-95"
              style={{
                backgroundColor: "#ff418e",
                color: "#ffffff",
                borderRadius: 8,
                fontFamily: "var(--font-lexend)",
              }}
            >
              Enter Library
            </Link>
            <Link
              href="/timer"
              className="w-full md:w-auto px-10 py-5 text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:bg-white/5 active:scale-95"
              style={{
                backgroundColor: "transparent",
                color: "#FE8A58",
                border: "2px solid rgba(254,138,88,0.5)",
                borderRadius: 8,
                fontFamily: "var(--font-lexend)",
              }}
            >
              The Breath
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-12 w-full">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center">
          <p
            className="text-[10px] uppercase tracking-[0.3em]"
            style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-lexend)" }}
          >
            © {new Date().getFullYear()} DAILY MEDS. ALL MOMENTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  );
}
