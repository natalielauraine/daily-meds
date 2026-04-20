"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function FoundingMemberConfirmedPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#131313" }}>
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="max-w-xl w-full text-center flex flex-col items-center gap-8">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{
              background: "rgba(173,242,37,0.1)",
              border: "0.5px solid rgba(173,242,37,0.3)",
              color: "#adf225",
              fontFamily: "var(--font-space-grotesk)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "#adf225", boxShadow: "0 0 6px #adf225" }}
            />
            Founding Member
          </div>

          {/* Headline */}
          <div className="flex flex-col gap-3">
            <h1
              className="text-5xl sm:text-6xl text-white uppercase"
              style={{
                fontFamily: "var(--font-plus-jakarta)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
              }}
            >
              You&apos;re in.<br />
              <span
                style={{
                  background: "linear-gradient(135deg, #ff41b3, #ec723d)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Forever.
              </span>
            </h1>
            <p
              className="text-lg"
              style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-manrope)", lineHeight: 1.6 }}
            >
              Welcome to the founding circle. You&apos;ve locked in lifetime access at the founding
              rate — no renewals, no price increases, no catching up later.
            </p>
          </div>

          {/* What you get card */}
          <div
            className="w-full rounded-2xl p-6 text-left flex flex-col gap-4"
            style={{
              background: "linear-gradient(135deg, rgba(255,65,179,0.08), rgba(236,114,61,0.08))",
              border: "0.5px solid rgba(255,65,179,0.2)",
            }}
          >
            <p
              className="text-xs uppercase tracking-widest font-bold"
              style={{ color: "#ec723d", fontFamily: "var(--font-space-grotesk)" }}
            >
              What you now have
            </p>
            {[
              "Full library — every session, past and future",
              "Live sessions with Natalie, join from anywhere",
              "Audio-only mode for eyes-free practice",
              "New content every week, automatically",
              "Founding Member status on your profile",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span style={{ color: "#adf225", marginTop: "2px", flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </span>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-manrope)" }}>
                  {item}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href="/library"
              className="flex-1 flex items-center justify-center py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #ff41b3, #ec723d)",
                color: "#fff",
                fontFamily: "var(--font-lexend)",
              }}
            >
              Go to my library
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all hover:bg-white/[0.06]"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "0.5px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)",
                fontFamily: "var(--font-lexend)",
              }}
            >
              Dashboard
            </Link>
          </div>

          <p
            className="text-xs"
            style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-space-grotesk)" }}
          >
            A receipt is on its way to your inbox. Questions? joy@thedailymeds.com
          </p>

        </div>
      </main>

      <Footer />
    </div>
  );
}
