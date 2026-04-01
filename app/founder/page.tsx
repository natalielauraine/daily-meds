"use client";

// /founder — Natalie Lauraine's founder story page.
// Cinematic portrait hero, mission statement, audio player UI, closing quote.
// Public page — no auth required.

import Link from "next/link";
import Logo from "../components/Logo";

export default function FounderPage() {
  return (
    <div
      style={{
        backgroundColor: "#0e0e0e",
        color: "#e5e5e5",
        fontFamily: "var(--font-manrope)",
        minHeight: "100vh",
      }}
    >
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(14,14,14,0.75)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors hover:text-white"
          style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-lexend)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back
        </Link>
        <Logo href="/" size="md" />
      </header>

      {/* ── HERO PORTRAIT ──────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          height: 870,
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Portrait background — replace src with Natalie's real photo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1200&h=1600&fit=crop&crop=face')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
            maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
          }}
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, #0e0e0e 15%, transparent 60%)",
          }}
        />
        {/* Name + label */}
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 0,
            right: 0,
            paddingLeft: "clamp(1.5rem, 6vw, 6rem)",
          }}
        >
          <p
            className="uppercase tracking-[0.4em] mb-4 text-xs"
            style={{
              color: "#ef7f4e",
              fontFamily: "var(--font-lexend)",
              textShadow: "0 0 12px rgba(254,138,88,0.4)",
            }}
          >
            Founder &amp; Creator
          </p>
          <h1
            className="uppercase leading-none"
            style={{
              fontFamily: "var(--font-nyata), var(--font-lexend)",
              fontWeight: 900,
              fontSize: "clamp(3.5rem, 9vw, 7rem)",
              letterSpacing: "-0.03em",
              color: "#ffffff",
              textShadow: "0 0 40px rgba(255,65,142,0.3)",
            }}
          >
            Natalie<br />Lauraine
          </h1>
        </div>
      </section>

      {/* ── MISSION ────────────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 896,
          margin: "0 auto",
          padding: "6rem 1.5rem",
        }}
      >
        <div className="flex flex-col gap-12">
          <div className="space-y-4">
            <h2
              className="uppercase tracking-tight"
              style={{
                fontFamily: "var(--font-nyata), var(--font-lexend)",
                fontWeight: 900,
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                color: "#ff41b3",
                textShadow: "0 0 12px rgba(255,65,142,0.4)",
              }}
            >
              Why I Built This
            </h2>
            <div style={{ width: 96, height: 4, background: "#ff41b3", borderRadius: 9999, opacity: 0.5 }} />
          </div>

          <div className="space-y-8" style={{ fontSize: "clamp(1rem, 1.25vw, 1.25rem)", lineHeight: 1.75, color: "rgba(255,255,255,0.55)" }}>
            <p>
              In an era of curated perfection and relentless digital noise, I felt a growing disconnection from my own internal world. We are taught to manage our lives — but rarely to regulate our hearts.
            </p>
            <p
              style={{
                borderLeft: "2px solid #ef7f4e",
                paddingLeft: "2rem",
                fontStyle: "italic",
                color: "rgba(255,255,255,0.8)",
                fontFamily: "var(--font-lexend)",
              }}
            >
              &ldquo;Daily Meds wasn&apos;t born from a business plan. It was born from a necessity to breathe again.&rdquo;
            </p>
            <p>
              I wanted to create a sanctuary for honest human moments. Not the productive ones or the instagrammable ones — the raw, unedited reality of our everyday struggles and quiet triumphs. A place where emotional regulation is treated with the same reverence as something you truly care about.
            </p>
            <p>
              Every session, every soundscape, every word here is designed to help you stay present. In the space between the chaos and the calm. That&apos;s the velvet hour. That&apos;s where we live.
            </p>
          </div>
        </div>
      </section>

      {/* ── AUDIO PLAYER ───────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 896,
          margin: "0 auto",
          padding: "0 1.5rem 8rem",
        }}
      >
        <div
          style={{
            background: "rgba(25,25,25,0.6)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            padding: "clamp(2rem, 4vw, 3rem)",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.08)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Glow accent */}
          <div
            style={{
              position: "absolute",
              top: -96,
              right: -96,
              width: 256,
              height: 256,
              background: "rgba(255,65,142,0.1)",
              filter: "blur(100px)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />

          <div className="relative flex flex-col md:flex-row items-center gap-8">
            {/* Play button */}
            <button
              style={{
                width: 88,
                height: 88,
                flexShrink: 0,
                borderRadius: "50%",
                background: "#ff41b3",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 30px rgba(255,65,142,0.4)",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.07)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>

            {/* Player info */}
            <div className="flex-1 w-full space-y-5">
              <div>
                <h3
                  className="uppercase tracking-wide"
                  style={{ fontFamily: "var(--font-lexend)", fontWeight: 800, fontSize: "1.15rem", color: "#ffffff" }}
                >
                  Listen to the Founder&apos;s Story
                </h3>
                <p
                  className="text-xs uppercase tracking-widest mt-1"
                  style={{ color: "#ef7f4e", fontFamily: "var(--font-lexend)", opacity: 0.8 }}
                >
                  Narrated by Natalie Lauraine &bull; 08:42
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div
                  style={{
                    position: "relative",
                    height: 6,
                    width: "100%",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 9999,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: "100%",
                      width: "33%",
                      background: "linear-gradient(to right, #ff41b3, #ef7f4e)",
                      borderRadius: 9999,
                      boxShadow: "0 0 10px rgba(255,65,142,0.5)",
                    }}
                  />
                </div>
                <div
                  className="flex justify-between text-[10px] uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-lexend)" }}
                >
                  <span>02:54</span>
                  <span>08:42</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {[
                    { label: "−10s", icon: "M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8zm-1.1 11H10v-5.45l-1.67.48-.28-1.07L10.5 9h.4V16zm3.23 0h-1.05l.01-.82c-.44.63-1.01.94-1.72.94-.52 0-.93-.14-1.22-.43-.29-.28-.43-.67-.43-1.15 0-.51.19-.9.57-1.19.38-.28.93-.43 1.64-.43h1.1v-.51c0-.59-.3-.89-.91-.89-.51 0-.97.2-1.37.61l-.58-.73c.54-.55 1.2-.83 1.99-.83 1.27 0 1.9.63 1.9 1.9V16h-.93z" },
                    { label: "+10s", icon: "M18 13c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6v4l5-5-5-5v4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8h-2zm-5.1 3H11.9v-5.45l-1.67.48-.28-1.07L12.4 9h.4l.1 7zm3.23 0h-1.05l.01-.82c-.44.63-1.01.94-1.72.94-.52 0-.93-.14-1.22-.43-.29-.28-.43-.67-.43-1.15 0-.51.19-.9.57-1.19.38-.28.93-.43 1.64-.43h1.1v-.51c0-.59-.3-.89-.91-.89-.51 0-.97.2-1.37.61l-.58-.73c.54-.55 1.2-.83 1.99-.83 1.27 0 1.9.63 1.9 1.9V16h-.93z" },
                  ].map((ctrl) => (
                    <button
                      key={ctrl.label}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, transition: "color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#ff41b3")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d={ctrl.icon}/></svg>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                  <div
                    style={{
                      width: 80,
                      height: 4,
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: 9999,
                      overflow: "hidden",
                    }}
                    className="hidden sm:block"
                  >
                    <div style={{ height: "100%", width: "75%", background: "rgba(255,255,255,0.4)", borderRadius: 9999 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER QUOTE ───────────────────────────────────────────────────── */}
      <footer
        style={{
          padding: "6rem 1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{ maxWidth: 896, margin: "0 auto", textAlign: "center" }}
          className="space-y-8"
        >
          {/* Quote icon */}
          <div style={{ width: 48, height: 48, margin: "0 auto", color: "rgba(255,65,142,0.3)" }}>
            <svg fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
              <path d="M116,72v88a48,48,0,0,1-48,48,8,8,0,0,1,0-16,32,32,0,0,0,32-32v-8H48a16,16,0,0,1-16-16V72A16,16,0,0,1,48,56h52A16,16,0,0,1,116,72Zm108,0v64a16,16,0,0,1-16,16H156v8a32,32,0,0,0,32,32,8,8,0,0,1,0,16,48,48,0,0,1-48-48V72a16,16,0,0,1,16-16h52A16,16,0,0,1,224,72Z"/>
            </svg>
          </div>

          <p
            className="uppercase tracking-tighter"
            style={{
              fontFamily: "var(--font-nyata), var(--font-lexend)",
              fontWeight: 900,
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
              color: "rgba(255,255,255,0.5)",
              maxWidth: 640,
              margin: "0 auto",
            }}
          >
            We don&apos;t fix what is broken. We sit with what is{" "}
            <span style={{ color: "#ffffff" }}>real</span>.
          </p>

          <div style={{ paddingTop: "3rem" }}>
            <Link
              href="/signup"
              className="inline-block text-xs uppercase tracking-[0.3em] px-8 py-4 transition-all duration-300 hover:scale-105"
              style={{
                background: "rgba(255,255,255,0.07)",
                color: "#ffffff",
                borderRadius: 9999,
                fontFamily: "var(--font-lexend)",
                fontWeight: 700,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#ff41b3";
                (e.currentTarget as HTMLElement).style.borderColor = "#ff41b3";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
              }}
            >
              Join the collective
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
