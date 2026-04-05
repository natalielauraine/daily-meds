"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "../../lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ── MOOD GRADIENT MAP ─────────────────────────────────────────────────────────

const MOOD_GRADIENTS: Record<string, string> = {
  Hungover:         "linear-gradient(135deg, #ff41b3, #ec723d)",
  "After The Sesh": "linear-gradient(135deg, #ff41b3, #f4e71d)",
  "On A Comedown":  "linear-gradient(135deg, #adf225, #f4e71d)",
  "Feeling Empty":  "linear-gradient(135deg, #ff41b3, #ec723d)",
  "Can't Sleep":    "linear-gradient(135deg, #ff41b3, #adf225)",
  Anxious:          "linear-gradient(135deg, #ec723d, #f4e71d)",
  Heartbroken:      "linear-gradient(135deg, #ff41b3, #ec723d)",
  Overwhelmed:      "linear-gradient(135deg, #ec723d, #f4e71d)",
  "Low Energy":     "linear-gradient(135deg, #adf225, #f4e71d)",
  "Morning Reset":  "linear-gradient(135deg, #ff41b3, #f4e71d)",
  "Focus Mode":     "linear-gradient(135deg, #adf225, #ec723d)",
};

function parseMins(duration: string | number): number {
  if (typeof duration === "number") return duration;
  return parseInt(duration) || 0;
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-GB");
}

function calculateStreaks(dates: string[]): { current: number; longest: number } {
  if (!dates.length) return { current: 0, longest: 0 };
  const unique = Array.from(new Set(dates)).sort();
  let longest = 1, run = 1;
  for (let i = 1; i < unique.length; i++) {
    const diff = Math.round((new Date(unique[i]).getTime() - new Date(unique[i - 1]).getTime()) / 86400000);
    if (diff === 1) { run++; if (run > longest) longest = run; } else run = 1;
  }
  const today     = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const last = unique[unique.length - 1];
  if (last !== today && last !== yesterday) return { current: 0, longest };
  let current = 1;
  for (let i = unique.length - 1; i > 0; i--) {
    const diff = Math.round((new Date(unique[i]).getTime() - new Date(unique[i - 1]).getTime()) / 86400000);
    if (diff === 1) current++; else break;
  }
  return { current, longest };
}

function buildWeeklyData(rows: { updated_at: string }[]) {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const result = labels.map((day) => ({ day, sessions: 0 }));
  const now = Date.now();
  for (const r of rows) {
    if (!r.updated_at) continue;
    const date = new Date(r.updated_at);
    if (now - date.getTime() > 7 * 86400000) continue;
    result[date.getDay()].sessions++;
  }
  return result;
}

function formatMemberSince(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

// ── LIVE SHOWS ────────────────────────────────────────────────────────────────

const LIVE_SHOWS = [
  {
    title: "Live Audio Hug",
    host: "Host: Natalie Lauraine",
    when: "Monday 8am UK",
    accent: "#ff41b3",
    img: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&h=400&fit=crop",
  },
  {
    title: "Live Podcast",
    host: "Guest: TBC",
    when: "Wednesday 7pm UK",
    accent: "#ec723d",
    img: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&h=400&fit=crop",
  },
  {
    title: "Alchemy Rewire",
    host: "Host: Natalie Lauraine",
    when: "Friday 8am UK",
    accent: "#adf225",
    img: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600&h=400&fit=crop",
  },
];

// ── GLASS CARD ────────────────────────────────────────────────────────────────

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl border ${className}`}
      style={{
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderColor: "rgba(255,255,255,0.06)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
      }}
    >
      {children}
    </div>
  );
}

// ── WEEKLY BAR CHART ──────────────────────────────────────────────────────────

function WeeklyChart({ data }: { data: { day: string; sessions: number }[] }) {
  const max = Math.max(...data.map((d) => d.sessions), 1);
  const today = new Date().getDay();

  return (
    <div className="flex items-end justify-between gap-2" style={{ height: 96 }}>
      {data.map((d, i) => {
        const pct = Math.max((d.sessions / max) * 100, d.sessions > 0 ? 12 : 5);
        const isToday = i === today;
        return (
          <div key={d.day} className="flex flex-col items-center gap-2 flex-1">
            <div className="w-full flex items-end" style={{ height: 72 }}>
              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{
                  height: `${pct}%`,
                  backgroundColor: isToday ? "#ff41b3" : d.sessions > 0 ? "rgba(255,65,179,0.3)" : "rgba(255,255,255,0.05)",
                }}
              />
            </div>
            <span
              className="text-[9px] uppercase tracking-wider"
              style={{
                color: isToday ? "#ff41b3" : "rgba(255,255,255,0.3)",
                fontFamily: "var(--font-lexend)",
                fontWeight: isToday ? 700 : 400,
              }}
            >
              {d.day}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    currentStreak: 0, longestStreak: 0,
    totalMinutes: 0,  totalSessions: 0, moodsExplored: 0,
  });
  const [topMood, setTopMood]           = useState<{ label: string; gradient: string } | null>(null);
  const [mostListened, setMostListened] = useState<{ title: string; gradient: string; mood: string } | null>(null);
  const [weeklyData, setWeeklyData]     = useState<{ day: string; sessions: number }[]>([]);
  const [moodBreakdown, setMoodBreakdown] = useState<{ label: string; count: number; gradient: string }[]>([]);

  useEffect(() => {
    async function loadAll() {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
      if (!u) { setLoading(false); return; }

      const { data: progress } = await supabase
        .from("user_progress")
        .select("completed, updated_at, sessions(title, duration, mood_category)")
        .eq("user_id", u.id);

      if (progress && progress.length > 0) {
        type NormRow = { completed: boolean; updated_at: string; title: string; duration: string | number; mood_category: string; gradient: string };
        const rows: NormRow[] = [];
        for (const p of progress as unknown as { completed: boolean; updated_at: string; sessions: { title: string; duration: string | number; mood_category: string } | null | { title: string; duration: string | number; mood_category: string }[] }[]) {
          if (!p.sessions) continue;
          const s = Array.isArray(p.sessions) ? p.sessions[0] : p.sessions;
          if (!s) continue;
          rows.push({ completed: p.completed, updated_at: p.updated_at, title: s.title, duration: s.duration, mood_category: s.mood_category, gradient: MOOD_GRADIENTS[s.mood_category] || "linear-gradient(135deg, #ff41b3, #ec723d)" });
        }
        const completedRows = rows.filter((r) => r.completed);
        const totalMinutes  = completedRows.reduce((sum, r) => sum + parseMins(r.duration), 0);
        const totalSessions = completedRows.length;
        const activityDates = rows.map((r) => r.updated_at?.split("T")[0]).filter(Boolean) as string[];
        const { current: currentStreak, longest: longestStreak } = calculateStreaks(activityDates);
        const moodCounts: Record<string, number> = {};
        for (const r of completedRows) { if (r.mood_category) moodCounts[r.mood_category] = (moodCounts[r.mood_category] || 0) + 1; }
        const moodBreakdownData = Object.entries(moodCounts).map(([label, count]) => ({ label, count, gradient: MOOD_GRADIENTS[label] || "linear-gradient(135deg, #ff41b3, #ec723d)" })).sort((a, b) => b.count - a.count);
        const sessionCounts: Record<string, { title: string; gradient: string; mood: string; count: number }> = {};
        for (const r of completedRows) { if (!r.title) continue; if (!sessionCounts[r.title]) sessionCounts[r.title] = { title: r.title, gradient: r.gradient, mood: r.mood_category, count: 0 }; sessionCounts[r.title].count++; }
        const mostListenedData = Object.values(sessionCounts).sort((a, b) => b.count - a.count)[0] || null;
        const weekly = buildWeeklyData(rows.map((r) => ({ updated_at: r.updated_at })));
        setStats({ currentStreak, longestStreak, totalMinutes, totalSessions, moodsExplored: moodBreakdownData.length });
        setTopMood(moodBreakdownData[0] ? { label: moodBreakdownData[0].label, gradient: moodBreakdownData[0].gradient } : null);
        setMostListened(mostListenedData);
        setWeeklyData(weekly);
        setMoodBreakdown(moodBreakdownData.slice(0, 6));
      }
      setLoading(false);
    }
    loadAll();
  }, []);

  const displayName  = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Meditator";
  const handle       = "@" + (user?.email?.split("@")[0] || "dailymeds");
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const avatarUrl     = user?.user_metadata?.avatar_url as string | undefined;
  const memberSince   = user?.created_at ? formatMemberSince(user.created_at) : "";
  const maxMoodCount  = moodBreakdown.length > 0 ? Math.max(...moodBreakdown.map((m) => m.count)) : 1;

  const emptyWeekly = [
    { day: "Sun", sessions: 0 }, { day: "Mon", sessions: 0 }, { day: "Tue", sessions: 0 },
    { day: "Wed", sessions: 0 }, { day: "Thu", sessions: 0 }, { day: "Fri", sessions: 0 }, { day: "Sat", sessions: 0 },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#010101", color: "white" }}>
      <Navbar />

      {/* ── CINEMATIC HERO ── */}
      <section
        className="relative w-full flex items-end pt-16 pb-32 overflow-hidden"
        style={{ minHeight: 500 }}
      >
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=2000&auto=format&fit=crop"
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: "cover", opacity: 0.35 }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(1,1,1,0.2) 0%, #010101 100%)" }}
        />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p
            className="text-xs font-bold uppercase tracking-[0.3em] mb-2"
            style={{ color: "#ff41b3", fontFamily: "var(--font-lexend)" }}
          >
            The Daily Meds
          </p>
          <h1
            className="uppercase leading-none"
            style={{
              fontFamily: "var(--font-nyata), var(--font-lexend)",
              fontWeight: 900,
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              letterSpacing: "-0.03em",
            }}
          >
            Your ritual,<br />recorded.
          </h1>
        </div>
      </section>

      {/* ── PROFILE + STATS CANVAS ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16" style={{ marginTop: "-80px", position: "relative", zIndex: 10 }}>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 rounded-3xl h-96 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            <div className="lg:col-span-7 grid grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-3xl h-40 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── PROFILE CARD ── */}
            <div className="lg:col-span-5">
              <GlassCard className="p-8 flex flex-col items-center text-center">

                {/* Avatar */}
                <div className="relative mb-6">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ background: "rgba(255,65,179,0.25)", filter: "blur(24px)" }}
                  />
                  <div
                    className="relative p-[2px] rounded-3xl"
                    style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)" }}
                  >
                    <div
                      className="w-32 h-32 rounded-3xl overflow-hidden flex items-center justify-center"
                      style={{ backgroundColor: "#0e0e0e" }}
                    >
                      {avatarUrl ? (
                        <Image src={avatarUrl} alt={displayName} width={128} height={128} className="w-full h-full object-cover" unoptimized />
                      ) : (
                        <span className="text-4xl font-black text-white" style={{ fontFamily: "var(--font-lexend)" }}>
                          {avatarInitial}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Name / email / handle */}
                <h2 className="text-3xl font-black text-white mb-1" style={{ fontFamily: "var(--font-lexend)" }}>
                  {displayName}
                </h2>
                <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>{user?.email}</p>
                <span
                  className="text-sm font-bold px-4 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(255,65,179,0.12)", border: "0.5px solid rgba(255,65,179,0.3)", color: "#ff41b3" }}
                >
                  {handle}
                </span>

                <div className="w-full my-8" style={{ height: "0.5px", backgroundColor: "rgba(255,255,255,0.08)" }} />

                {/* Counters */}
                <div className="grid grid-cols-2 gap-4 w-full">
                  {[
                    { icon: "👥", value: formatNumber(stats.totalSessions), label: "Sessions" },
                    { icon: "🌀", value: String(stats.moodsExplored), label: "Moods" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="p-4 rounded-2xl flex flex-col items-center gap-1"
                      style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-xl font-black text-white" style={{ fontFamily: "var(--font-lexend)" }}>{item.value}</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>{item.label}</span>
                    </div>
                  ))}
                </div>

                {memberSince && (
                  <p className="text-xs mt-6" style={{ color: "rgba(255,255,255,0.2)" }}>
                    Member since {memberSince}
                  </p>
                )}

                <Link
                  href="/profile"
                  className="mt-6 w-full py-3 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all hover:opacity-80"
                  style={{ border: "0.5px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-lexend)" }}
                >
                  Edit profile & settings
                </Link>
              </GlassCard>
            </div>

            {/* ── BENTO STATS GRID ── */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Active Streak */}
              <GlassCard className="p-6 flex flex-col justify-between group">
                <div className="flex justify-between items-start mb-8">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "rgba(255,65,179,0.12)" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff41b3">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#ff41b3", fontFamily: "var(--font-lexend)" }}>
                    Active Streak
                  </span>
                </div>
                <div>
                  <p
                    className="font-black text-white leading-none mb-2 transition-transform group-hover:scale-105 origin-left"
                    style={{ fontFamily: "var(--font-lexend)", fontSize: "clamp(44px, 5vw, 64px)" }}
                  >
                    {formatNumber(stats.currentStreak)}
                  </p>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Day consecutive meditation</p>
                </div>
              </GlassCard>

              {/* Total Presence */}
              <GlassCard className="p-6 flex flex-col justify-between group">
                <div className="flex justify-between items-start mb-8">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "rgba(236,114,61,0.12)" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#ec723d">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#ec723d", fontFamily: "var(--font-lexend)" }}>
                    Total Presence
                  </span>
                </div>
                <div>
                  <p
                    className="font-black text-white leading-none mb-2 transition-transform group-hover:scale-105 origin-left"
                    style={{ fontFamily: "var(--font-lexend)", fontSize: "clamp(36px, 4vw, 56px)" }}
                  >
                    {formatNumber(stats.totalMinutes)}
                  </p>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Minutes of mindfulness</p>
                </div>
              </GlassCard>

              {/* Most Listened Track */}
              <GlassCard className="md:col-span-2 p-8 relative overflow-hidden group">
                <div
                  className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"
                  style={{ fontSize: 120 }}
                >
                  ♫
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] block mb-5" style={{ color: "#adf225", fontFamily: "var(--font-lexend)" }}>
                  Most Listened Track
                </span>
                {mostListened ? (
                  <div className="flex items-center gap-6">
                    <div
                      className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center"
                      style={{ background: mostListened.gradient }}
                    >
                      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                        <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.9"/>
                        <path d="M10 14C10 14 2 18 2 25C2 29.4 5.6 33 10 33C13 33 15.6 31.4 17 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8"/>
                        <path d="M38 14C38 14 46 18 46 25C46 29.4 42.4 33 38 33C35 33 32.4 31.4 31 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8"/>
                        <circle cx="24" cy="28" r="2" fill="white" opacity="0.9"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-white leading-tight" style={{ fontFamily: "var(--font-lexend)" }}>
                        {mostListened.title}
                      </p>
                      <p className="text-sm italic mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{mostListened.mood}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>Complete a session to see your most listened track</p>
                )}
              </GlassCard>

              {/* Weekly Energy */}
              <GlassCard className="md:col-span-2 p-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-lexend)" }}>
                    Weekly Energy
                  </span>
                  <div className="flex gap-1">
                    {[0.4, 1, 0.4].map((o, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `rgba(255,65,179,${o})` }} />
                    ))}
                  </div>
                </div>
                <WeeklyChart data={weeklyData.length > 0 ? weeklyData : emptyWeekly} />
              </GlassCard>

            </div>
          </div>
        )}

        {/* ── MOOD BREAKDOWN ── */}
        {!loading && moodBreakdown.length > 0 && (
          <GlassCard className="p-6 mt-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-lexend)" }}>
                Mood Breakdown
              </span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>{moodBreakdown.length} moods explored</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {moodBreakdown.map((mood) => {
                const pct = Math.round((mood.count / maxMoodCount) * 100);
                return (
                  <div key={mood.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{mood.label}</span>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{mood.count}×</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: mood.gradient, transition: "width 0.7s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {topMood && (
              <div className="flex flex-wrap gap-6 mt-6 pt-5" style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>Go-to mood</p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-white font-bold" style={{ background: topMood.gradient }}>
                    {topMood.label}
                  </div>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>Longest streak</p>
                  <p className="text-sm text-white font-bold">{stats.longestStreak} days</p>
                </div>
              </div>
            )}
          </GlassCard>
        )}

        {/* ── LIVE SHOWS ── */}
        <div className="mt-16 mb-4">
          <h3
            className="text-xl font-black uppercase tracking-[0.2em] mb-8 text-white"
            style={{ fontFamily: "var(--font-lexend)" }}
          >
            Live Shows Coming Up
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LIVE_SHOWS.map((show) => (
              <Link href="/live" key={show.title}>
                <div
                  className="rounded-3xl overflow-hidden group transition-all duration-300 cursor-pointer"
                  style={{
                    background: "rgba(0,0,0,0.45)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "0.5px solid rgba(255,255,255,0.06)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${show.accent}50`)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={show.img}
                      alt={show.title}
                      fill
                      sizes="(max-width:768px) 100vw, 400px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }} />
                    <div className="absolute bottom-4 left-4">
                      <span
                        className="text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest"
                        style={{ backgroundColor: show.accent, color: "#000" }}
                      >
                        {show.when}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-black text-white mb-1" style={{ fontFamily: "var(--font-lexend)" }}>{show.title}</h4>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{show.host}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── EMPTY STATE ── */}
        {!loading && stats.totalSessions === 0 && (
          <GlassCard className="p-16 mt-6 text-center">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)" }}
            >
              <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.9"/>
                <circle cx="24" cy="28" r="2" fill="white" opacity="0.9"/>
              </svg>
            </div>
            <h3 className="text-lg font-black text-white mb-2" style={{ fontFamily: "var(--font-lexend)" }}>Your story starts here</h3>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Complete your first session to see your ritual recorded.</p>
            <Link
              href="/library"
              className="inline-block mt-6 px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all hover:scale-105"
              style={{ background: "#ff41b3", color: "#fff", fontFamily: "var(--font-lexend)" }}
            >
              Browse Library
            </Link>
          </GlassCard>
        )}

      </div>

      <Footer />
    </div>
  );
}
