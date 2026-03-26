"use client";

// Personal stats dashboard — shows the logged-in user's real session history.
// Fetches from Supabase user_progress table joined with sessions.
// Milestone cards (streak + sessions) have a Share button and live reaction pills.

import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ── MOOD GRADIENT MAP ─────────────────────────────────────────────────────────

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

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// The six reaction emojis — matches the rest of the app
const REACTION_EMOJIS = ["🔥", "💜", "🙏", "⭐", "💪", "🧘"];

type Reaction = { emoji: string; count: number; userReacted: boolean };

// Shape of a shared milestone post's data
type MilestoneShare = {
  post_id: string;
  reactions: Reaction[];
};

function heatmapColor(intensity: number): string {
  return ["rgba(255,255,255,0.07)", "#5B21B6", "#7C3AED", "#6366F1", "#22D3EE"][Math.min(intensity, 4)];
}

function parseMins(duration: string): number {
  return parseInt(duration) || 0;
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

function buildHeatmap(dateCounts: Record<string, number>): { date: string; intensity: number }[][] {
  const weeks: { date: string; intensity: number }[][] = [];
  const start = new Date();
  start.setDate(start.getDate() - 364);
  for (let w = 0; w < 52; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const dateStr = date.toISOString().split("T")[0];
      days.push({ date: dateStr, intensity: Math.min(dateCounts[dateStr] || 0, 4) });
    }
    weeks.push(days);
  }
  return weeks;
}

// ── STAT CARD ─────────────────────────────────────────────────────────────────

function StatCard({ value, label, sublabel, gradient, icon }: {
  value: string; label: string; sublabel?: string; gradient: string; icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[10px] p-5 flex flex-col gap-3" style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: gradient }}>{icon}</div>
      <div>
        <div className="text-2xl text-white" style={{ fontWeight: 500 }}>{value}</div>
        <div className="text-xs text-white/40 mt-0.5">{label}</div>
        {sublabel && <div className="text-xs text-white/25 mt-0.5">{sublabel}</div>}
      </div>
    </div>
  );
}

// ── MILESTONE CARD ────────────────────────────────────────────────────────────
// Like StatCard but with a Share button and live reaction pills below the value.

function MilestoneCard({ value, label, sublabel, gradient, icon, share, onShare, sharing }: {
  value: string; label: string; sublabel?: string; gradient: string; icon: React.ReactNode;
  share: MilestoneShare | null;
  onShare: () => void;
  sharing: boolean;
}) {
  return (
    <div className="rounded-[10px] p-5 flex flex-col gap-3" style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: gradient }}>{icon}</div>
      <div>
        <div className="text-2xl text-white" style={{ fontWeight: 500 }}>{value}</div>
        <div className="text-xs text-white/40 mt-0.5">{label}</div>
        {sublabel && <div className="text-xs text-white/25 mt-0.5">{sublabel}</div>}
      </div>

      {/* Share button — only shown if not yet shared */}
      {!share && (
        <button
          onClick={onShare}
          disabled={sharing}
          className="self-start flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full transition-opacity hover:opacity-70 disabled:opacity-40"
          style={{ backgroundColor: "rgba(139,92,246,0.15)", border: "0.5px solid rgba(139,92,246,0.3)", color: "#C4B5FD" }}
        >
          {sharing ? "Sharing…" : (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
              </svg>
              Share to community
            </>
          )}
        </button>
      )}

      {/* Reaction pills — shown after sharing */}
      {share && (
        <div className="flex items-center gap-1 flex-wrap">
          {REACTION_EMOJIS.map((emoji) => {
            const r = share.reactions.find((x) => x.emoji === emoji);
            const isReacted = r?.userReacted ?? false;
            return (
              <div
                key={emoji}
                className="flex items-center rounded-lg overflow-hidden"
                style={{
                  backgroundColor: isReacted ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)",
                  border: `0.5px solid ${isReacted ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.07)"}`,
                }}
              >
                <span className="px-1.5 py-0.5 text-xs" style={{ color: isReacted ? "#C4B5FD" : "rgba(255,255,255,0.3)" }}>
                  {emoji}
                </span>
                {r && r.count > 0 && (
                  <span className="pr-1.5 py-0.5 text-xs" style={{ color: isReacted ? "#C4B5FD" : "rgba(255,255,255,0.4)" }}>
                    {r.count}
                  </span>
                )}
              </div>
            );
          })}
          <span className="text-[10px] text-white/20 ml-1">Shared ✓</span>
        </div>
      )}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    currentStreak: 0, longestStreak: 0, totalMinutes: 0,
    totalSessions: 0, thisWeekMinutes: 0, avgSessionLength: 0,
  });
  const [moodBreakdown, setMoodBreakdown] = useState<{ label: string; count: number; gradient: string }[]>([]);
  const [heatmap, setHeatmap] = useState<{ date: string; intensity: number }[][]>([]);
  const [topMood, setTopMood] = useState("");

  // Milestone sharing state — one entry per type ("streak" | "milestone")
  const [milestoneShares, setMilestoneShares] = useState<Record<string, MilestoneShare>>({});
  const [sharing, setSharing] = useState<string | null>(null);

  useEffect(() => {
    async function loadAll() {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
      if (!u) { setLoading(false); return; }

      // ── Load session progress ──────────────────────────────────────────────
      const { data: progress } = await supabase
        .from("user_progress")
        .select("completed, last_watched, sessions(duration, mood_category)")
        .eq("user_id", u.id);

      if (progress && progress.length > 0) {
        const completed = progress.filter((p) => p.completed && p.sessions) as unknown as
          { completed: boolean; last_watched: string; sessions: { duration: string; mood_category: string } }[];

        const totalMinutes = completed.reduce((sum, p) => sum + parseMins(p.sessions.duration), 0);
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
        const thisWeekMinutes = completed
          .filter((p) => p.last_watched > sevenDaysAgo)
          .reduce((sum, p) => sum + parseMins(p.sessions.duration), 0);

        const activityDates = completed.map((p) => p.last_watched.split("T")[0]);
        const { current: currentStreak, longest: longestStreak } = calculateStreaks(activityDates);

        const moodCounts: Record<string, number> = {};
        for (const p of completed) {
          const mood = p.sessions.mood_category;
          if (mood) moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        }
        const moodBreakdownData = Object.entries(moodCounts)
          .map(([label, count]) => ({ label, count, gradient: MOOD_GRADIENTS[label] || "linear-gradient(90deg, #8B5CF6, #6366F1)" }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);

        const dateCounts: Record<string, number> = {};
        for (const p of progress) {
          if (p.last_watched) {
            const date = p.last_watched.split("T")[0];
            dateCounts[date] = (dateCounts[date] || 0) + 1;
          }
        }

        const totalSessions = completed.length;
        const avgSessionLength = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

        setStats({ currentStreak, longestStreak, totalMinutes, totalSessions, thisWeekMinutes, avgSessionLength });
        setMoodBreakdown(moodBreakdownData);
        setHeatmap(buildHeatmap(dateCounts));
        setTopMood(moodBreakdownData[0]?.label || "");
      }

      // ── Load existing milestone shares + their reactions ───────────────────
      const { data: milestonePosts } = await supabase
        .from("community_posts")
        .select("id, post_type")
        .eq("user_id", u.id)
        .in("post_type", ["streak", "milestone"])
        .order("created_at", { ascending: false })
        .limit(10);

      if (milestonePosts && milestonePosts.length > 0) {
        // Find most recent streak share and milestone share
        const streakPost    = milestonePosts.find((p) => p.post_type === "streak");
        const sessionsPost  = milestonePosts.find((p) => p.post_type === "milestone");
        const postIds       = milestonePosts.map((p) => p.id);

        // Fetch all reactions for these posts
        const { data: allReactions } = await supabase
          .from("community_post_reactions")
          .select("post_id, emoji, user_id")
          .in("post_id", postIds);

        // Build reaction summary per post
        const buildReactions = (postId: string): Reaction[] => {
          const reactionMap: Record<string, Reaction> = {};
          (allReactions ?? []).filter((r) => r.post_id === postId).forEach((r) => {
            if (!reactionMap[r.emoji]) reactionMap[r.emoji] = { emoji: r.emoji, count: 0, userReacted: false };
            reactionMap[r.emoji].count++;
            if (r.user_id === u.id) reactionMap[r.emoji].userReacted = true;
          });
          return Object.values(reactionMap);
        };

        const shares: Record<string, MilestoneShare> = {};
        if (streakPost)   shares["streak"]    = { post_id: streakPost.id,   reactions: buildReactions(streakPost.id) };
        if (sessionsPost) shares["milestone"]  = { post_id: sessionsPost.id, reactions: buildReactions(sessionsPost.id) };
        setMilestoneShares(shares);
      }

      setLoading(false);
    }
    loadAll();
  }, []);

  // Realtime: update reaction counts on milestone cards when anyone reacts
  useEffect(() => {
    const postIds = Object.values(milestoneShares).map((s) => s.post_id);
    if (postIds.length === 0) return;

    const channel = supabase
      .channel("milestone_reactions")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_post_reactions" }, async () => {
        const { data: allReactions } = await supabase
          .from("community_post_reactions")
          .select("post_id, emoji, user_id")
          .in("post_id", postIds);

        const { data: { user: u } } = await supabase.auth.getUser();

        setMilestoneShares((prev) => {
          const updated = { ...prev };
          for (const [type, share] of Object.entries(prev)) {
            const reactionMap: Record<string, Reaction> = {};
            (allReactions ?? []).filter((r) => r.post_id === share.post_id).forEach((r) => {
              if (!reactionMap[r.emoji]) reactionMap[r.emoji] = { emoji: r.emoji, count: 0, userReacted: false };
              reactionMap[r.emoji].count++;
              if (u && r.user_id === u.id) reactionMap[r.emoji].userReacted = true;
            });
            updated[type] = { ...share, reactions: Object.values(reactionMap) };
          }
          return updated;
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [milestoneShares]);

  // Share a milestone to the community feed
  async function shareMilestone(type: "streak" | "milestone", value: number) {
    if (!user) return;
    setSharing(type);

    const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Anonymous";
    const note = type === "streak"
      ? `${value}-day streak 🔥`
      : `${value} sessions completed 🧘`;

    const { data } = await supabase
      .from("community_posts")
      .insert({
        user_id: user.id,
        display_name: displayName,
        avatar_url: user.user_metadata?.avatar_url ?? null,
        post_type: type,
        mood_category: null,
        note,
        streak_count: type === "streak" ? value : 0,
      })
      .select("id")
      .single();

    if (data) {
      setMilestoneShares((prev) => ({
        ...prev,
        [type]: { post_id: data.id, reactions: [] },
      }));
    }
    setSharing(null);
  }

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

        {/* Loading skeleton */}
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

            {/* Current streak — MILESTONE CARD with share + reactions */}
            <MilestoneCard
              value={`${stats.currentStreak} days`}
              label="Current streak"
              sublabel="Keep it up"
              gradient="linear-gradient(135deg, #F43F5E, #F97316)"
              share={milestoneShares["streak"] ?? null}
              onShare={() => shareMilestone("streak", stats.currentStreak)}
              sharing={sharing === "streak"}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
                </svg>
              }
            />

            {/* Longest streak — plain StatCard */}
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

            {/* Total minutes — plain StatCard */}
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

            {/* Sessions completed — MILESTONE CARD with share + reactions */}
            <MilestoneCard
              value={`${stats.totalSessions}`}
              label="Sessions completed"
              sublabel={`Avg ${stats.avgSessionLength} min each`}
              gradient="linear-gradient(135deg, #EC4899, #D946EF)"
              share={milestoneShares["milestone"] ?? null}
              onShare={() => shareMilestone("milestone", stats.totalSessions)}
              sharing={sharing === "milestone"}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              }
            />

            {/* This week — plain StatCard */}
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
          <div className="rounded-[10px] p-6 mb-8" style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm text-white" style={{ fontWeight: 500 }}>Activity — last 12 months</h2>
              <div className="flex items-center gap-1.5">
                <span className="text-white/30 text-xs">Less</span>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-sm" style={{ width: "13px", height: "13px", backgroundColor: heatmapColor(i) }} />
                ))}
                <span className="text-white/30 text-xs">More</span>
              </div>
            </div>
            <div className="flex mb-1 pl-8 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {MONTH_LABELS.map((month) => (
                <div key={month} className="text-white/25 shrink-0" style={{ fontSize: "10px", width: `${Math.round(52 / 12) * 13}px` }}>
                  {month}
                </div>
              ))}
            </div>
            <div className="flex gap-1 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              <div className="flex flex-col gap-1 mr-1 shrink-0">
                {["", "Mon", "", "Wed", "", "Fri", ""].map((day, i) => (
                  <div key={i} className="text-white/25 flex items-center justify-end" style={{ fontSize: "9px", height: "12px", width: "24px" }}>{day}</div>
                ))}
              </div>
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
          <div className="rounded-[10px] p-6" style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}>
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
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: mood.gradient }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-5 flex flex-wrap gap-6" style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
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

        {/* Empty state */}
        {!loading && stats.totalSessions === 0 && (
          <div className="flex flex-col items-center justify-center py-20 rounded-[10px] text-center" style={{ border: "0.5px dashed rgba(255,255,255,0.1)" }}>
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
