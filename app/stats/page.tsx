"use client";

import { useState, useEffect } from "react";
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

/** Extract the first hex color from a gradient string for solid fills */
function extractFirstColor(gradient: string): string {
  const match = gradient.match(/#[0-9a-fA-F]{6}/);
  return match ? match[0] : "#ff41b3";
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

// ── TYPES ────────────────────────────────────────────────────────────────────

type DayData = {
  dateStr: string;
  label: string;
  segments: { mood: string; count: number; color: string }[];
  total: number;
  isToday: boolean;
};

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

// ── 14-DAY STACKED BAR CHART ─────────────────────────────────────────────────

function FourteenDayChart({ data }: { data: DayData[] }) {
  const maxSessions = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="flex items-end gap-1 sm:gap-2" style={{ height: 180 }}>
      {data.map((d) => {
        const barHeight = d.total > 0 ? Math.max((d.total / maxSessions) * 100, 10) : 0;
        return (
          <div key={d.dateStr} className="flex flex-col items-center flex-1 gap-1.5">
            {/* Stacked bar */}
            <div className="w-full flex flex-col-reverse items-stretch" style={{ height: 140 }}>
              {d.total === 0 ? (
                <div
                  className="w-full rounded"
                  style={{
                    height: "4px",
                    backgroundColor: d.isToday ? "rgba(255,65,179,0.2)" : "rgba(255,255,255,0.04)",
                  }}
                />
              ) : (
                <div
                  className="w-full flex flex-col-reverse rounded-t-lg overflow-hidden transition-all duration-500"
                  style={{ height: `${barHeight}%` }}
                >
                  {d.segments.map((seg, si) => {
                    const segPct = (seg.count / d.total) * 100;
                    return (
                      <div
                        key={seg.mood + si}
                        style={{
                          height: `${segPct}%`,
                          minHeight: 3,
                          backgroundColor: seg.color,
                          opacity: d.isToday ? 1 : 0.7,
                        }}
                        title={`${seg.mood}: ${seg.count}`}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Day label */}
            <span
              className="text-[8px] sm:text-[9px] tracking-wider whitespace-nowrap"
              style={{
                color: d.isToday ? "#ff41b3" : "rgba(255,255,255,0.3)",
                fontFamily: "var(--font-lexend)",
                fontWeight: d.isToday ? 700 : 400,
              }}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── BUILD 14-DAY DATA ────────────────────────────────────────────────────────

function buildFourteenDayData(
  rows: { completed: boolean; updated_at: string; mood_category: string }[]
): DayData[] {
  const todayStr = new Date().toISOString().split("T")[0];
  const days: DayData[] = [];

  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
    days.push({ dateStr, label, segments: [], total: 0, isToday: dateStr === todayStr });
  }

  const completedRows = rows.filter((r) => r.completed);

  for (const row of completedRows) {
    if (!row.updated_at) continue;
    const rowDate = row.updated_at.split("T")[0];
    const dayEntry = days.find((d) => d.dateStr === rowDate);
    if (!dayEntry) continue;

    const mood = row.mood_category || "Unknown";
    const existing = dayEntry.segments.find((s) => s.mood === mood);
    if (existing) {
      existing.count++;
    } else {
      const gradient = MOOD_GRADIENTS[mood] || "linear-gradient(135deg, #ff41b3, #ec723d)";
      dayEntry.segments.push({ mood, count: 1, color: extractFirstColor(gradient) });
    }
    dayEntry.total++;
  }

  return days;
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [totalSessions, setTotalSessions] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [chartData, setChartData] = useState<DayData[]>([]);

  useEffect(() => {
    async function loadStats() {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { setLoading(false); return; }

      const { data: progress } = await supabase
        .from("user_progress")
        .select("completed, updated_at, sessions(title, duration, mood_category)")
        .eq("user_id", u.id);

      if (progress && progress.length > 0) {
        type ProgressRow = {
          completed: boolean;
          updated_at: string;
          sessions: { title: string; duration: string | number; mood_category: string } | null | { title: string; duration: string | number; mood_category: string }[];
        };

        const rows: { completed: boolean; updated_at: string; mood_category: string }[] = [];
        for (const p of progress as unknown as ProgressRow[]) {
          if (!p.sessions) continue;
          const s = Array.isArray(p.sessions) ? p.sessions[0] : p.sessions;
          if (!s) continue;
          rows.push({ completed: p.completed, updated_at: p.updated_at, mood_category: s.mood_category });
        }

        const completedRows = rows.filter((r) => r.completed);
        setTotalSessions(completedRows.length);

        const activityDates = rows.map((r) => r.updated_at?.split("T")[0]).filter(Boolean) as string[];
        const { current } = calculateStreaks(activityDates);
        setCurrentStreak(current);

        setChartData(buildFourteenDayData(rows));
      } else {
        setChartData(buildFourteenDayData([]));
      }

      setLoading(false);
    }
    loadStats();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#010101", color: "white" }}>
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-20">

        {/* ── PAGE TITLE ── */}
        <h1
          className="text-4xl sm:text-5xl font-black uppercase tracking-tight mb-10"
          style={{ fontFamily: "var(--font-plus-jakarta)", letterSpacing: "-0.03em" }}
        >
          Your Stats
        </h1>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl h-32 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
              <div className="rounded-3xl h-32 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            </div>
            <div className="rounded-3xl h-64 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
          </div>
        ) : (
          <div className="space-y-6">

            {/* ── TWO STAT CARDS ── */}
            <div className="grid grid-cols-2 gap-4">

              {/* Session Count */}
              <GlassCard className="p-6 flex flex-col justify-between">
                <p
                  className="text-[10px] uppercase tracking-[0.2em] font-bold mb-4"
                  style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-lexend)" }}
                >
                  Sessions
                </p>
                <p
                  className="text-5xl font-black"
                  style={{ fontFamily: "var(--font-space-grotesk)", color: "#ff41b3" }}
                >
                  {totalSessions}
                </p>
                <p
                  className="text-xs mt-2"
                  style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-lexend)" }}
                >
                  completed
                </p>
              </GlassCard>

              {/* Current Streak */}
              <GlassCard className="p-6 flex flex-col justify-between">
                <p
                  className="text-[10px] uppercase tracking-[0.2em] font-bold mb-4"
                  style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-lexend)" }}
                >
                  Streak
                </p>
                <p
                  className="text-5xl font-black"
                  style={{ fontFamily: "var(--font-space-grotesk)", color: "#adf225" }}
                >
                  {currentStreak}
                </p>
                <p
                  className="text-xs mt-2"
                  style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-lexend)" }}
                >
                  {currentStreak === 1 ? "day" : "days"} consecutive
                </p>
              </GlassCard>
            </div>

            {/* ── 14-DAY CHART ── */}
            <GlassCard className="p-6">
              <p
                className="text-[10px] uppercase tracking-[0.2em] font-bold mb-6"
                style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-lexend)" }}
              >
                Last 14 days
              </p>
              <FourteenDayChart data={chartData} />

              {/* Legend — mood colors */}
              {chartData.some((d) => d.segments.length > 0) && (
                <div className="flex flex-wrap gap-3 mt-5 pt-4" style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
                  {(() => {
                    const seen = new Map<string, string>();
                    for (const d of chartData) {
                      for (const seg of d.segments) {
                        if (!seen.has(seg.mood)) seen.set(seg.mood, seg.color);
                      }
                    }
                    return Array.from(seen.entries()).map(([mood, color]) => (
                      <div key={mood} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span
                          className="text-[10px] tracking-wide"
                          style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-lexend)" }}
                        >
                          {mood}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </GlassCard>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
