"use client";

// /progress — build tracker page for Natalie.
// Shows every page with checkboxes for: Old Version, New Design, Complete, Live.
// All checkbox state is saved to localStorage so it persists between sessions.

import { useState, useEffect } from "react";

const GRADIENT = "linear-gradient(135deg, #ff41b3 0%, #ec723d 100%)";

// All pages grouped by section
const SECTIONS = [
  {
    title: "Public Pages",
    emoji: "🌐",
    pages: [
      { name: "Homepage", url: "/" },
      { name: "Free Content", url: "/free" },
      { name: "Live Schedule", url: "/live" },
      { name: "Pricing", url: "/pricing" },
      { name: "About Natalie", url: "/about" },
      { name: "Testimonials", url: "/testimonials" },
      { name: "Affiliate Landing", url: "/affiliate" },
      { name: "Partnerships", url: "/partnerships" },
      { name: "Blog Home", url: "/blog" },
      { name: "Single Blog Page", url: "/blog/[slug]" },
      { name: "Podcasts", url: "/podcasts" },
      { name: "Podcast Episode", url: "/podcasts/[slug]" },
      { name: "Terms", url: "/terms" },
      { name: "Privacy Policy", url: "/policy" },
      { name: "Your Policy", url: "/your-policy" },
    ],
  },
  {
    title: "Auth Pages",
    emoji: "🔐",
    pages: [
      { name: "Login", url: "/login" },
      { name: "Signup", url: "/signup" },
      { name: "Pricing Success", url: "/pricing/success" },
    ],
  },
  {
    title: "Member Pages",
    emoji: "🧘",
    pages: [
      { name: "Library", url: "/library" },
      { name: "Session Player", url: "/session/[id]" },
      { name: "Profile", url: "/profile" },
      { name: "Stats", url: "/stats" },
      { name: "Watchlist", url: "/watchlist" },
      { name: "Downloads", url: "/downloads" },
      { name: "Playlists", url: "/playlists" },
      { name: "Breathing Timer", url: "/timer" },
      { name: "Community", url: "/community" },
      { name: "Challenges", url: "/challenges" },
      { name: "Challenge Detail", url: "/challenges/[id]" },
      { name: "Affiliate Dashboard", url: "/affiliate/dashboard" },
      { name: "Affiliate Overview", url: "/affiliate/dashboard/overview" },
    ],
  },
  {
    title: "Group & Live Pages",
    emoji: "🎙️",
    pages: [
      { name: "Group Rooms", url: "/rooms" },
      { name: "Group Room Player", url: "/rooms/[roomName]" },
      { name: "Live Room", url: "/live/[roomName]" },
      { name: "Crew List", url: "/crew" },
      { name: "Crew Dashboard", url: "/crew/[id]" },
    ],
  },
  {
    title: "Admin Pages",
    emoji: "⚙️",
    pages: [
      { name: "Admin Dashboard", url: "/admin" },
      { name: "Admin Content", url: "/admin/content" },
      { name: "Admin Users", url: "/admin/users" },
      { name: "Admin Live", url: "/admin/live" },
      { name: "Brand Crews", url: "/admin/brand-crews" },
    ],
  },
];

// The four columns to tick off for each page
const COLUMNS = [
  { key: "old", label: "Old Version", colour: "#ec723d" },
  { key: "new", label: "New Design", colour: "#a78bfa" },
  { key: "complete", label: "Complete", colour: "#adf225" },
  { key: "live", label: "Live", colour: "#ff41b3" },
];

type CheckState = Record<string, Record<string, boolean>>;

function makeKey(section: string, url: string, col: string) {
  return `progress__${section}__${url}__${col}`;
}

export default function ProgressPage() {
  const [checks, setChecks] = useState<CheckState>({});
  const [loaded, setLoaded] = useState(false);

  // Load all saved checkbox state from localStorage on mount
  useEffect(() => {
    const saved: CheckState = {};
    SECTIONS.forEach((section) => {
      section.pages.forEach((page) => {
        COLUMNS.forEach((col) => {
          const key = makeKey(section.title, page.url, col.key);
          const val = localStorage.getItem(key);
          if (!saved[`${section.title}__${page.url}`]) {
            saved[`${section.title}__${page.url}`] = {};
          }
          saved[`${section.title}__${page.url}`][col.key] = val === "true";
        });
      });
    });
    setChecks(saved);
    setLoaded(true);
  }, []);

  // Toggle a checkbox and save to localStorage
  function toggle(section: string, url: string, col: string) {
    const rowKey = `${section}__${url}`;
    const current = checks[rowKey]?.[col] ?? false;
    const next = !current;

    setChecks((prev) => ({
      ...prev,
      [rowKey]: { ...(prev[rowKey] ?? {}), [col]: next },
    }));

    localStorage.setItem(makeKey(section, url, col), String(next));
  }

  function isChecked(section: string, url: string, col: string) {
    return checks[`${section}__${url}`]?.[col] ?? false;
  }

  // Count how many pages are fully "live" across all sections
  const totalPages = SECTIONS.flatMap((s) => s.pages).length;
  const liveCount = SECTIONS.flatMap((s) =>
    s.pages.filter((p) => isChecked(s.title, p.url, "live"))
  ).length;
  const completeCount = SECTIONS.flatMap((s) =>
    s.pages.filter((p) => isChecked(s.title, p.url, "complete"))
  ).length;

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0d0d0d" }}>
        <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-pink-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10" style={{ backgroundColor: "#0d0d0d", fontFamily: "var(--font-space-grotesk)" }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: "#ff41b3", fontWeight: 600 }}
          >
            Daily Meds
          </p>
          <h1
            className="text-4xl uppercase italic mb-3"
            style={{
              fontFamily: "var(--font-plus-jakarta)",
              fontWeight: 900,
              background: GRADIENT,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
            }}
          >
            Build Tracker
          </h1>
          <p className="text-sm text-white/40">Tick off each column as you go. Progress saves automatically.</p>

          {/* Overall progress bar */}
          <div className="mt-6 flex items-center gap-6 flex-wrap">
            <div>
              <p className="text-xs text-white/30 mb-1">Complete</p>
              <div className="flex items-center gap-2">
                <div className="w-40 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(completeCount / totalPages) * 100}%`, background: "linear-gradient(90deg, #adf225, #f4e71d)" }}
                  />
                </div>
                <span className="text-xs text-white/40">{completeCount}/{totalPages}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-white/30 mb-1">Live</p>
              <div className="flex items-center gap-2">
                <div className="w-40 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(liveCount / totalPages) * 100}%`, background: GRADIENT }}
                  />
                </div>
                <span className="text-xs text-white/40">{liveCount}/{totalPages}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column legend */}
        <div className="flex items-center gap-5 mb-6 flex-wrap">
          {COLUMNS.map((col) => (
            <div key={col.key} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: col.colour }} />
              <span className="text-xs text-white">{col.label}</span>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-10">
          {SECTIONS.map((section) => {
            const sectionComplete = section.pages.filter((p) => isChecked(section.title, p.url, "complete")).length;
            return (
              <div key={section.title}>
                {/* Section heading */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{section.emoji}</span>
                    <h2
                      className="text-sm uppercase tracking-widest text-white"
                      style={{ fontWeight: 600 }}
                    >
                      {section.title}
                    </h2>
                  </div>
                  <span className="text-xs text-white/60">{sectionComplete}/{section.pages.length} complete</span>
                </div>

                {/* Table */}
                <div
                  className="rounded-[14px] overflow-hidden"
                  style={{ backgroundColor: "#141414", border: "0.5px solid rgba(255,255,255,0.06)" }}
                >
                  {/* Table header */}
                  <div
                    className="grid items-center px-4 py-2.5 text-[10px] uppercase tracking-widest text-white/70"
                    style={{
                      gridTemplateColumns: "1fr 140px 90px 90px 90px 90px",
                      borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span>Page</span>
                    <span>URL</span>
                    {COLUMNS.map((col) => (
                      <span key={col.key} className="text-center">{col.label}</span>
                    ))}
                  </div>

                  {/* Rows */}
                  {section.pages.map((page, i) => {
                    const isLive = isChecked(section.title, page.url, "live");
                    const isComplete = isChecked(section.title, page.url, "complete");
                    return (
                      <div
                        key={page.url}
                        className="grid items-center px-4 py-3 transition-colors hover:bg-white/[0.02]"
                        style={{
                          gridTemplateColumns: "1fr 140px 90px 90px 90px 90px",
                          borderTop: i > 0 ? "0.5px solid rgba(255,255,255,0.04)" : "none",
                          opacity: isLive ? 1 : isComplete ? 0.85 : 1,
                        }}
                      >
                        {/* Page name */}
                        <div className="flex items-center gap-2 min-w-0">
                          {isLive && (
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
                              style={{ backgroundColor: "#ff41b3" }}
                            />
                          )}
                          <span
                            className="text-sm truncate"
                            style={{ color: "#E2E2E2", fontWeight: 500 }}
                          >
                            {page.name}
                          </span>
                        </div>

                        {/* URL — clickable link */}
                        <a
                          href={`http://localhost:3000${page.url.replace("[id]", "1").replace("[roomName]", "test").replace("[slug]", "test")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono truncate hover:underline transition-colors"
                          style={{ color: "#ff41b3" }}
                          title={`Open ${page.url}`}
                        >
                          {page.url}
                        </a>

                        {/* Checkboxes */}
                        {COLUMNS.map((col) => {
                          const checked = isChecked(section.title, page.url, col.key);
                          return (
                            <div key={col.key} className="flex justify-center">
                              <button
                                onClick={() => toggle(section.title, page.url, col.key)}
                                className="w-6 h-6 rounded-md flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                                style={{
                                  backgroundColor: checked ? col.colour : "rgba(255,255,255,0.05)",
                                  border: `1.5px solid ${checked ? col.colour : "rgba(255,255,255,0.1)"}`,
                                }}
                                title={`Mark ${page.name} ${col.label}`}
                              >
                                {checked && (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#0d0d0d">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                  </svg>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Status summary */}
        <div className="mt-16 rounded-[16px] p-8" style={{ backgroundColor: "#141414", border: "0.5px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-lg text-white font-bold mb-6" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Where We're At</h2>

          {/* Estimates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Design", value: "55%", colour: "#a78bfa" },
              { label: "Functionality", value: "70%", colour: "#adf225" },
              { label: "Production Ready", value: "45%", colour: "#ff41b3" },
            ].map((item) => (
              <div key={item.label} className="rounded-[12px] p-4 text-center" style={{ backgroundColor: "#1a1a1a" }}>
                <p className="text-3xl font-black mb-1" style={{ color: item.colour, fontFamily: "var(--font-plus-jakarta)" }}>{item.value}</p>
                <p className="text-xs text-white/50 uppercase tracking-widest">{item.label}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-white/60 mb-6 leading-relaxed">
            ~45 pages exist in the code. The new cinematic design is live on: homepage, free, live, timer, about, session player, testimonials, terms, privacy, pricing, login, signup, crew detail, live room. Core functionality (auth, payments, Supabase, realtime, audio player) is working.
            <br /><br />
            <span className="text-white font-medium">You're roughly 45% of the way to a full launch.</span> The hardest technical work is done. What&apos;s left is design polish on member pages and real content.
          </p>

          {/* Outstanding items */}
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-white/40 mb-3">Still needed before launch</p>
            <div className="flex flex-col gap-2">
              {[
                "Library, Profile, Stats — core member pages need the cinematic treatment",
                "Real Vimeo/audio content — sessions page needs actual content uploaded",
                "Stripe payments — needs testing end to end",
                "Daily.co — needs payment method added before live streaming works",
                "Testimonials page — animated columns not rendering yet",
                "Vercel deployment — not deployed to thedailymeds.com yet",
                "SEO / meta images — OG images need checking per page",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: "#ec723d" }} />
                  <p className="text-sm text-white/70">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* The plan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                day: "Saturday",
                colour: "#ff41b3",
                items: ["Homepage redesign", "Login page", "Library", "Profile + Stats"],
              },
              {
                day: "Monday",
                colour: "#adf225",
                items: ["Pricing page polish", "Community, Challenges, Rooms", "Test Stripe end to end", "Deploy to thedailymeds.com"],
              },
            ].map((plan) => (
              <div key={plan.day} className="rounded-[12px] p-4" style={{ backgroundColor: "#1a1a1a" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: plan.colour }}>{plan.day}</p>
                <div className="flex flex-col gap-2">
                  {plan.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: plan.colour }} />
                      <p className="text-sm text-white/70">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-white/50 mt-6 text-center">By Monday evening you could have a live, working product. 🚀</p>
        </div>

        {/* Footer note */}
        <p className="text-xs text-white/20 text-center mt-8">
          Checkboxes save automatically to this browser. Visit <span className="text-white/40">localhost:3000/progress</span> anytime to check in.
        </p>

      </div>
    </div>
  );
}
