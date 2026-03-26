"use client";

// Personal stats dashboard — shows the logged-in user's real session history.
// Fetches from Supabase user_progress table joined with sessions.

import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase-browser";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ── MOOD GRADIENT MAP ─────────────────────────────────────────────────────────
// Maps each mood category to a bar gradient colour

const MOOD_GRADIENTS: Record<string, string> = {
  Hungover:         "linear-gradient(90deg, #6B21E8, #22D3EE)",
  "After The Sesh": "linear-gradient(90deg, #F43F5E, #FACC15)",
  "On A Comedown":  "linear-gradient(90deg, #10B981, #D9F100)",
  "Feeling Empty":  "linear-gradient(90deg, #6B21E8, #22D3EE)",
  "Can't Sleep":    "linear-gradient(90deg, #8B3CF7, #6366F1)",
  Anxious:          "linear-gradient(90deg, #F43F5E, #F97316)",
  Heartbroken:      "linear-gradient(90deg, #EC4899, #D946EF)",
  Overwhelmed:      "linear-gradient(90deg, #F97316, #FACC15)",
  "Low Energy":     "linear-gradient(90deg, #10B981, #22C55E)",
  "Morning Reset":  "linear-gradient(90deg, #F43F5E, #F97316)",
  "Focus Mode":     "linear-gradient(90deg, #6B21E8, #6366F1)",
};

// Month labels for the heatmap x-axis
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Returns a colour for a given heatmap intensity (0-4)
function heatmapColor(intensity: number): string {
  const colors = [
    "rgba(255,255,255,0.07)", // 0 — no session
    "#5B21B6",                // 1 — light
    "#7C3AED",                // 2 — moderate
    "#6366F1",                // 3 — good
    "#22D3EE",                // 4 — great
  ];
  return colors[Math.min(intensity, 4)];
}

// Parse the minute number out of a duration string like "18 min" → 18
function parseMins(duration: string): number {
  return parseInt(duration) || 0;
}

// Calculate current and longest streak from an array of activity date strings (YYYY-MM-DD)
function calculateStreaks(dates: string[]): { current: number; longest: number } {
  if (!dates.length) return { current: 0, longest: 0 };

  // Sort unique dates ascending
  const unique = Array.from(new Set(dates)).sort();

  // Longest streak — walk forward looking for consecutive days
  let longest = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1]);
    const curr = new Date(unique[i]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  // Current streak — walk backward from the most recent date
  const today     = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const lastDate  = unique[unique.length - 1];

  // If the user hasn't meditated today or yesterday the streak is broken
  if (lastDate !== today && lastDate !== yesterday) {
    return { current: 0, longest };
  }

  let current = 1;
  for (let i = unique.length - 1; i > 0; i--) {
    const curr = new Date(unique[i]);
    const prev = new Date(unique[i - 1]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      current++;
    } else {
      break;
    }
  }

  return { current, longest };
}

// Build a 52×7 heatmap grid from a map of { date → session count }
function buildHeatmap(dateCounts: Record<string, number>): { date: string; intensity: number }[][] {
  const weeks: { date: string; intensity: number }[][] = [];
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 364);

  for (let w = 0; w < 52; w++) {
    const days: { date: string; intensity: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const dateStr = date.toISOString().split("T")[0];
      const count   = dateCounts[dateStr] || 0;
      days.push({ date: dateStr, intensity: Math.min(count, 4) });
    }
    weeks.push(days);
  }
  return weeks;
}

// ── STAT CARD ─────────────────────────────────────────────────────────────────
// A single overview number with icon, label and optional sub-label

function StatCard({
  value,
  label,
  sublabel,
  gradient,
  icon,
}: {
  value: string;
  label: string;
  sublabel?: string;
  gradient: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[10px] p-5 flex flex-col gap-3"
      style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: gradient }}>
        {icon}
      </div>
      <div>
        <div className="text-2xl text-white" style={{ fontWeight: 500 }}>{value}</div>
        <div className="text-xs text-white/40 mt-0.5">{label}</div>
        {sublabel && <div className="text-xs text-white/25 mt-0.5">{sublabel}</div>}
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalMinutes: 0,
    totalSessions: 0,
    thisWeekMinutes: 0,
    avgSessionLength: 0,
  });
  const [moodBreakdown, setMoodBreakdown] = useState<{ label: string; count: number; gradient: string }[]>([]);
  const [heatmap, setHeatmap] = useState<{ date: string; intensity: number }[][]>([]);
  const [topMood, setTopMood] = useState("");

  useEffect(() => {
    // Load all the user's session progress from Supabase on mount
    async function loadStats() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Fetch every progress row for this user, joining session duration and mood
      const { data: progress } = await supabase
        .from("user_progress")
        .select("completed, last_watched, sessions(duration, mood_category)")
        .eq("user_id", user.id);

      if (!progress || progress.length === 0) {
        setLoading(false);
        return;
      }

      // Completed sessions only (used for most stats)
      const completed = progress.filter(
        (p) => p.completed && p.sessions
      ) as unknown as { completed: boolean; last_watched: string; sessions: { duration: string; mood_category: string } }[];

      // Total minutes across all completed sessions
      const totalMinutes = completed.reduce(
        (sum, p) => sum + parseMins(p.sessions.duration), 0
      );

      // This week = last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const thisWeekMinutes = completed
        .filter((p) => p.last_watched > sevenDaysAgo)
        .reduce((sum, p) => sum + parseMins(p.sessions.duration), 0);

      // Streaks from the date part of last_watched timestamps
      const activityDates = completed.map((p) => p.last_watched.split("T")[0]);
      const { current: currentStreak, longest: longestStreak } = calculateStreaks(activityDates);

      // Mood breakdown — count sessions per mood, sorted by most used
      const moodCounts: Record<string, number> = {};
      for (const p of completed) {
        const mood = p.sessions.mood_category;
        if (mood) moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      }
      const moodBreakdownData = Object.entries(moodCounts)
        .map(([label, count]) => ({
          label,
          count,
          gradient: MOOD_GRADIENTS[label] || "linear-gradient(90deg, #8B5CF6, #6366F1)",
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8); // Show top 8 moods

      // Heatmap — count all sessions per calendar day (completed + in progress)
      const dateCounts: Record<string, number> = {};
      for (const p of progress) {
        if (p.last_watched) {
          const date = p.last_watched.split("T")[0];
          dateCounts[date] = (dateCounts[date] || 0) + 1;
        }
      }

      const totalSessions  = completed.length;
      const avgSessionLength = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

      setStats({ currentStreak, longestStreak, totalMinutes, totalSessions, thisWeekMinutes, avgSessionLength });
      setMoodBreakdown(moodBreakdownData);
      setHeatmap(buildHeatmap(dateCounts));
      setTopMood(moodBreakdownData[0]?.label || "");
      setLoading(false);
    }

    loadStats();
  }, []);

  const maxMoodCount = moodBreakdown.length > 0 ? Math.max(...moodBreakdown.map((m) => m.count)) : 1;

  return (
    <div className="flex flex-col min-h-screen bg-[#0D0D1A]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-2xl text-white mb-1">Your Stats</h1>
          <p className="text-white/40 text-sm">Keep going — every session counts.</p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="rounded-[10px] p-5 h-28 animate-pulse" style={{ backgroundColor: "#1A1A2E" }} />
            ))}
          </div>
        )}

        {/* ── OVERVIEW CARDS ── */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
            <StatCard
              value={`${stats.currentStreak} days`}
              label="Current streak"
              sublabel="Keep it up"
              gradient="linear-gradient(135deg, #F43F5E, #F97316)"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
                </svg>
              }
            />
            <StatCard
              value={`${stats.longestStreak} days`}
              label="Longest streak"
              sublabel="Personal best"
              gradient="linear-gradient(135deg, #8B3CF7, #6366F1)"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
                </svg>
              }
            />
            <StatCard
              value={`${stats.totalMinutes} min`}
              label="Total listened"
              sublabel={`${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`}
              gradient="linear-gradient(135deg, #10B981, #22C55E)"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                </svg>
              }
            />
            <StatCard
              value={`${stats.totalSessions}`}
              label="Sessions completed"
              sublabel={`Avg ${stats.avgSessionLength} min each`}
              gradient="linear-gradient(135deg, #EC4899, #D946EF)"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              }
            />
            <StatCard
              value={`${stats.thisWeekMinutes} min`}
              label="This week"
              sublabel="Last 7 days"
              gradient="linear-gradient(135deg, #F97316, #FACC15)"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
              }
            />
          </div>
        )}

        {/* ── HEATMAP CALENDAR ── */}
        {!loading && heatmap.length > 0 && (
          <div
            className="rounded-[10px] p-6 mb-8"
            style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm text-white" style={{ fontWeight: 500 }}>Activity — last 12 months</h2>
              <div className="flex items-center gap-1.5">
                <span className="text-white/30 text-xs">Less</span>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="rounded-sm"
                    style={{ width: "13px", height: "13px", backgroundColor: heatmapColor(i) }}
                  />
                ))}
                <span className="text-white/30 text-xs">More</span>
              </div>
            </div>

            {/* Month labels */}
            <div className="flex mb-1 pl-8 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {MONTH_LABELS.map((month) => (
                <div
                  key={month}
                  className="text-white/25 shrink-0"
                  style={{ fontSize: "10px", width: `${Math.round(52 / 12) * 13}px` }}
                >
                  {month}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="flex gap-1 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {/* Day labels */}
              <div className="flex flex-col gap-1 mr-1 shrink-0">
                {["", "Mon", "", "Wed", "", "Fri", ""].map((day, i) => (
                  <div
                    key={i}
                    className="text-white/25 flex items-center justify-end"
                    style={{ fontSize: "9px", height: "12px", width: "24px" }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Week columns */}
              {heatmap.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1 shrink-0">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      className="rounded-sm transition-opacity hover:opacity-80 cursor-default"
                      style={{ width: "13px", height: "13px", backgroundColor: heatmapColor(day.intensity) }}
                      title={`${day.date}: ${day.intensity > 0 ? `${day.intensity} session${day.intensity > 1 ? "s" : ""}` : "No session"}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MOOD BREAKDOWN ── */}
        {!loading && moodBreakdown.length > 0 && (
          <div
            className="rounded-[10px] p-6"
            style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
          >
            <h2 className="text-sm text-white mb-5" style={{ fontWeight: 500 }}>Mood breakdown</h2>

            <div className="flex flex-col gap-4">
              {moodBreakdown.map((mood) => {
                const pct = Math.round((mood.count / maxMoodCount) * 100);
                return (
                  <div key={mood.label} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-xs">{mood.label}</span>
                      <span className="text-white/35 text-xs">{mood.count} session{mood.count !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: mood.gradient }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary row */}
            <div
              className="mt-6 pt-5 flex flex-wrap gap-6"
              style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}
            >
              <div>
                <div className="text-white/25 text-xs mb-1">Most used mood</div>
                <div className="text-white text-sm">{topMood || "—"}</div>
              </div>
              <div>
                <div className="text-white/25 text-xs mb-1">Total sessions</div>
                <div className="text-white text-sm">{stats.totalSessions}</div>
              </div>
              <div>
                <div className="text-white/25 text-xs mb-1">Moods explored</div>
                <div className="text-white text-sm">{moodBreakdown.length} of 11</div>
              </div>
            </div>
          </div>
        )}

        {/* Empty state — shown when the user has no sessions yet */}
        {!loading && stats.totalSessions === 0 && (
          <div
            className="flex flex-col items-center justify-center py-20 rounded-[10px] text-center"
            style={{ border: "0.5px dashed rgba(255,255,255,0.1)" }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" className="mb-4">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
            </svg>
            <p className="text-sm text-white/30 mb-1">No sessions yet</p>
            <p className="text-xs text-white/20">Complete your first session to see your stats here</p>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
