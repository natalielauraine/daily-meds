"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
// Replace with real Supabase data in Phase 3 auth integration

const STATS = {
  currentStreak: 7,
  longestStreak: 21,
  totalMinutes: 342,
  totalSessions: 28,
  thisWeekMinutes: 64,
  avgSessionLength: 12,
};

// Mood breakdown — how many sessions per mood category
const MOOD_BREAKDOWN = [
  { label: "Can't Sleep", count: 8, gradient: "linear-gradient(90deg, #8B3CF7, #6366F1)" },
  { label: "Anxious", count: 6, gradient: "linear-gradient(90deg, #F43F5E, #F97316)" },
  { label: "Hungover", count: 5, gradient: "linear-gradient(90deg, #6B21E8, #22D3EE)" },
  { label: "Overwhelmed", count: 4, gradient: "linear-gradient(90deg, #F97316, #FACC15)" },
  { label: "After The Sesh", count: 3, gradient: "linear-gradient(90deg, #F43F5E, #FACC15)" },
  { label: "Morning Reset", count: 2, gradient: "linear-gradient(90deg, #F43F5E, #F97316)" },
];

// Hardcoded activity pattern — tells a story of a user building a meditation habit.
// Uses a fixed lookup table so the heatmap always looks the same.
// Intensity: 0 = none, 1 = light (~10min), 2 = moderate (~20min), 3 = good (~30min), 4 = great (40+min)
const ACTIVITY_PATTERN = [
  // Weeks 0-12: sparse — just starting out
  [0,0,0,0,0,0,0],[0,1,0,0,0,0,0],[0,0,0,1,0,0,0],[0,0,0,0,0,1,0],
  [0,1,0,0,0,0,1],[0,0,1,0,0,0,0],[0,0,0,0,1,0,0],[1,0,0,0,0,0,1],
  [0,0,1,0,0,1,0],[0,1,0,0,0,0,0],[0,0,0,1,0,0,1],[1,0,0,0,1,0,0],
  [0,1,0,0,0,1,0],
  // Weeks 13-25: picking up
  [0,0,1,0,1,0,0],[1,0,0,1,0,0,1],[0,1,0,0,1,0,0],[0,0,2,0,0,1,0],
  [1,0,0,0,1,0,1],[0,2,0,1,0,0,0],[0,0,1,0,0,2,0],[1,0,0,2,0,0,1],
  [0,1,0,0,2,0,0],[2,0,1,0,0,1,0],[0,0,2,0,1,0,1],[1,0,0,1,0,2,0],
  [0,2,0,0,1,0,0],
  // Weeks 26-38: building consistency
  [1,0,2,0,1,0,2],[0,2,0,2,0,1,0],[2,0,1,0,2,0,1],[0,3,0,1,0,2,0],
  [1,0,2,0,1,2,0],[0,2,1,0,2,0,2],[2,0,0,2,1,0,2],[1,2,0,1,0,2,1],
  [0,1,2,0,2,1,0],[2,0,1,2,0,1,2],[0,2,0,2,1,0,1],[2,1,0,1,2,0,2],
  [1,0,2,1,0,2,1],
  // Weeks 39-51: strong habit — nearly daily
  [2,3,1,2,3,1,2],[1,2,3,1,2,3,0],[3,1,2,3,1,2,3],[2,3,2,1,3,2,1],
  [3,2,3,2,3,1,2],[1,3,2,3,2,3,1],[3,2,1,3,3,2,3],[2,3,3,2,3,2,3],
  [3,2,3,3,2,3,2],[3,3,2,3,3,2,3],[2,3,3,3,2,3,3],[4,3,3,4,3,3,4],
  [4,4,3,4,4,3,4],
];

// Generate a fake heatmap — 52 weeks × 7 days using the fixed pattern above
function generateHeatmap() {
  const weeks = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);

  for (let w = 0; w < 52; w++) {
    const days = [];
    const pattern = ACTIVITY_PATTERN[Math.min(w, ACTIVITY_PATTERN.length - 1)];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      const isInFuture = date > today;
      const intensity = isInFuture ? 0 : (pattern[d] ?? 0);
      days.push({ date: date.toISOString().split("T")[0], intensity });
    }
    weeks.push(days);
  }
  return weeks;
}

const HEATMAP = generateHeatmap();

// Month labels for the heatmap x-axis
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Returns a colour for a given heatmap intensity (0-4)
function heatmapColor(intensity: number): string {
  const colors = [
    "rgba(255,255,255,0.07)",  // 0 — no session (visible grid)
    "#5B21B6",                 // 1 — light (solid purple)
    "#7C3AED",                 // 2 — moderate
    "#6366F1",                 // 3 — good (indigo)
    "#22D3EE",                 // 4 — great (cyan)
  ];
  return colors[Math.min(intensity, 4)];
}

// A single stat card — icon, value, and label
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
      style={{
        backgroundColor: "#1A1A2E",
        border: "0.5px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Icon circle */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: gradient }}
      >
        {icon}
      </div>
      {/* Value */}
      <div>
        <div className="text-2xl text-white" style={{ fontWeight: 500 }}>
          {value}
        </div>
        <div className="text-xs text-white/40 mt-0.5">{label}</div>
        {sublabel && <div className="text-xs text-white/25 mt-0.5">{sublabel}</div>}
      </div>
    </div>
  );
}

// The personal stats dashboard page
export default function StatsPage() {
  const maxMoodCount = Math.max(...MOOD_BREAKDOWN.map((m) => m.count));

  return (
    <div className="flex flex-col min-h-screen bg-[#0D0D1A]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-2xl text-white mb-1">Your Stats</h1>
          <p className="text-white/40 text-sm">Keep going — every session counts.</p>
        </div>

        {/* ── OVERVIEW CARDS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
          <StatCard
            value={`${STATS.currentStreak} days`}
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
            value={`${STATS.longestStreak} days`}
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
            value={`${STATS.totalMinutes} min`}
            label="Total listened"
            sublabel={`${Math.round(STATS.totalMinutes / 60)}h ${STATS.totalMinutes % 60}m`}
            gradient="linear-gradient(135deg, #10B981, #22C55E)"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
              </svg>
            }
          />
          <StatCard
            value={`${STATS.totalSessions}`}
            label="Sessions completed"
            sublabel={`Avg ${STATS.avgSessionLength} min each`}
            gradient="linear-gradient(135deg, #EC4899, #D946EF)"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            }
          />
          <StatCard
            value={`${STATS.thisWeekMinutes} min`}
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

        {/* ── HEATMAP CALENDAR ── */}
        <div
          className="rounded-[10px] p-6 mb-8"
          style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm text-white" style={{ fontWeight: 500 }}>Activity — last 12 months</h2>
            {/* Legend */}
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

          {/* Month labels — one every ~4.3 weeks, offset by day-of-week column */}
          <div className="flex mb-1 pl-8 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {MONTH_LABELS.map((month, i) => (
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
            {/* Day-of-week labels */}
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
            {HEATMAP.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1 shrink-0">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className="rounded-sm transition-opacity hover:opacity-80 cursor-default"
                    style={{ width: "13px", height: "13px", backgroundColor: heatmapColor(day.intensity) }}
                    title={`${day.date}: ${day.intensity > 0 ? `${day.intensity * 10} min` : "No session"}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── MOOD BREAKDOWN ── */}
        <div
          className="rounded-[10px] p-6"
          style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-sm text-white mb-5" style={{ fontWeight: 500 }}>Mood breakdown</h2>

          <div className="flex flex-col gap-4">
            {MOOD_BREAKDOWN.map((mood) => {
              const pct = Math.round((mood.count / maxMoodCount) * 100);
              return (
                <div key={mood.label} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">{mood.label}</span>
                    <span className="text-white/35 text-xs">{mood.count} sessions</span>
                  </div>
                  {/* Bar track */}
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                  >
                    {/* Filled bar */}
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: mood.gradient,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total summary */}
          <div
            className="mt-6 pt-5 flex flex-wrap gap-6"
            style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}
          >
            <div>
              <div className="text-white/25 text-xs mb-1">Most used mood</div>
              <div className="text-white text-sm">Can't Sleep</div>
            </div>
            <div>
              <div className="text-white/25 text-xs mb-1">Total sessions</div>
              <div className="text-white text-sm">{STATS.totalSessions}</div>
            </div>
            <div>
              <div className="text-white/25 text-xs mb-1">Moods explored</div>
              <div className="text-white text-sm">{MOOD_BREAKDOWN.length} of 11</div>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
