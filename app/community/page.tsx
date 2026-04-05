"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "../../lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";
import { type Crew } from "../../lib/crews";
import { type Challenge, challengeGradient, TYPE_ICONS } from "../../lib/challenges";

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const C = {
  primary:        "#ff6a9e",
  primaryCont:    "#ff418e",
  secondary:      "#52e32c",
  tertiary:       "#ef7f4e",
  surfaceDim:     "#0e0e0e",
  surfaceLow:     "#131313",
  surface:        "#191919",
  surfaceHigh:    "#1f1f1f",
  surfaceHighest: "#262626",
  onSurfaceVar:   "#ababab",
  onSurface:      "#e5e5e5",
};

const HEADLINE: React.CSSProperties = {
  fontFamily: "var(--font-lexend)",
  fontWeight: 900,
  letterSpacing: "-0.05em",
  textTransform: "uppercase",
};

const GLASS: React.CSSProperties = {
  background: "rgba(38,38,38,0.4)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.05)",
};

// ── MOOD GRADIENTS ────────────────────────────────────────────────────────────
const MOOD_GRADIENTS: Record<string, string> = {
  "Hungover":       "linear-gradient(135deg, #ff41b3, #ec723d)",
  "After The Sesh": "linear-gradient(135deg, #ff41b3, #f4e71d)",
  "On A Comedown":  "linear-gradient(135deg, #adf225, #f4e71d)",
  "Feeling Empty":  "linear-gradient(135deg, #ff41b3, #ec723d)",
  "Can't Sleep":    "linear-gradient(135deg, #ff41b3, #adf225)",
  "Anxious":        "linear-gradient(135deg, #ec723d, #f4e71d)",
  "Heartbroken":    "linear-gradient(135deg, #ff41b3, #ec723d)",
  "Overwhelmed":    "linear-gradient(135deg, #ec723d, #f4e71d)",
  "Low Energy":     "linear-gradient(135deg, #adf225, #f4e71d)",
  "Morning Reset":  "linear-gradient(135deg, #ff41b3, #f4e71d)",
  "Focus Mode":     "linear-gradient(135deg, #adf225, #ec723d)",
};

const PURPLE = "linear-gradient(135deg, #ff41b3 0%, #ec723d 50%, #adf225 100%)";
const POST_EMOJIS = ["🔥", "💜", "🙏", "⭐", "💪", "🧘"];

// ── TYPES ─────────────────────────────────────────────────────────────────────
type CommunityPost = {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  post_type: string;
  mood_category: string | null;
  streak_count: number;
  note: string | null;
  created_at: string;
  reactions: { emoji: string; count: number; userReacted: boolean }[];
};

type LeaderboardEntry = {
  display_name: string;
  avatar_url: string | null;
  session_count: number;
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function postText(post: CommunityPost): string {
  if (post.post_type === "streak") return `hit a ${post.streak_count}-day streak 🔥`;
  if (post.post_type === "challenge") return `completed a challenge 🎯`;
  if (post.mood_category) return `completed a ${post.mood_category} session`;
  return `completed a meditation`;
}

function Avatar({ url, name, size = 14 }: { url: string | null; name: string; size?: number }) {
  const sz = `${size * 4}px`;
  return (
    <div
      className="rounded-full shrink-0 flex items-center justify-center text-sm text-white overflow-hidden"
      style={{ width: sz, height: sz, background: url ? "transparent" : PURPLE, fontWeight: 700 }}
    >
      {url ? <Image src={url} alt={name} width={size * 4} height={size * 4} className="w-full h-full object-cover" unoptimized /> : name[0]?.toUpperCase()}
    </div>
  );
}

// ── TRENDING SESSIONS (sidebar) ───────────────────────────────────────────────
const WEEKLY_PULSE = [
  { title: "Too Many Bills",    sub: "1.4k listening now", color: C.primaryCont },
  { title: "The 3AM Spiral",    sub: "842 listening now",  color: C.secondary   },
  { title: "Social Exhaustion", sub: "610 listening now",  color: C.tertiary    },
];

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function CommunityPage() {
  const supabase = createClient();
  const [user, setUser]               = useState<User | null>(null);
  const [posts, setPosts]             = useState<CommunityPost[]>([]);
  const [crews, setCrews]             = useState<Crew[]>([]);
  const [challenges, setChallenges]   = useState<Challenge[]>([]);
  const [challengeCounts, setChallengeCounts] = useState<Record<string, number>>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [settings, setSettings]       = useState({ show_in_feed: false, show_in_leaderboard: false });
  const [todayStats, setTodayStats]   = useState({ posts: 0, uniqueUsers: 0 });
  const [loading, setLoading]         = useState(true);
  const [feedFilter, setFeedFilter]   = useState<"recent" | "global">("recent");

  // Reactor popover
  const [reactorPopover, setReactorPopover] = useState<{ postId: string; emoji: string } | null>(null);
  const [reactorNames, setReactorNames]     = useState<string[]>([]);
  const [reactorLoading, setReactorLoading] = useState(false);

  // Share / post composer
  const [showShare, setShowShare]   = useState(false);
  const [shareForm, setShareForm]   = useState({ mood_category: "", note: "", post_type: "session" });
  const [sharing, setSharing]       = useState(false);
  const [shareError, setShareError] = useState("");

  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);

      const [postsRes, crewsRes, challengesRes, settingsRes] = await Promise.all([
        fetchPosts(u?.id ?? null),
        supabase.from("crews").select("*").eq("is_public" as never, true).order("created_at", { ascending: false }).limit(4),
        supabase.from("challenges").select("*").eq("is_official", true).order("created_at", { ascending: false }).limit(4),
        u ? supabase.from("community_settings").select("*").eq("user_id", u.id).maybeSingle() : Promise.resolve({ data: null }),
      ]);

      setPosts(postsRes);
      setCrews((crewsRes.data as Crew[]) ?? []);
      const challengeData = (challengesRes.data as Challenge[]) ?? [];
      setChallenges(challengeData);

      if (challengeData.length) {
        const counts: Record<string, number> = {};
        await Promise.all(challengeData.map(async (c) => {
          const { count } = await supabase.from("challenge_participants").select("*", { count: "exact", head: true }).eq("challenge_id", c.id);
          counts[c.id] = count ?? 0;
        }));
        setChallengeCounts(counts);
      }

      if (settingsRes.data) setSettings(settingsRes.data);

      const today = new Date(); today.setHours(0, 0, 0, 0);
      const todayPosts = postsRes.filter(p => new Date(p.created_at) >= today);
      setTodayStats({ posts: todayPosts.length, uniqueUsers: new Set(todayPosts.map(p => p.user_id)).size });

      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: lbData } = await supabase.from("community_posts").select("user_id, display_name, avatar_url").gte("created_at", weekAgo);
      if (lbData) {
        const counts: Record<string, LeaderboardEntry> = {};
        lbData.forEach((p) => {
          if (!counts[p.user_id]) counts[p.user_id] = { display_name: p.display_name, avatar_url: p.avatar_url, session_count: 0 };
          counts[p.user_id].session_count++;
        });
        setLeaderboard(Object.values(counts).sort((a, b) => b.session_count - a.session_count).slice(0, 5));
      }

      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("community_feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_posts" }, async () => {
        setPosts(await fetchPosts(user?.id ?? null));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "community_post_reactions" }, async () => {
        setPosts(await fetchPosts(user?.id ?? null));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  async function fetchPosts(userId: string | null): Promise<CommunityPost[]> {
    const { data: rawPosts } = await supabase.from("community_posts").select("*").order("created_at", { ascending: false }).limit(50);
    if (!rawPosts) return [];
    const { data: allReactions } = await supabase.from("community_post_reactions").select("post_id, emoji, user_id");
    const reactionMap: Record<string, { emoji: string; count: number; userReacted: boolean }[]> = {};
    (allReactions ?? []).forEach((r) => {
      if (!reactionMap[r.post_id]) reactionMap[r.post_id] = [];
      const existing = reactionMap[r.post_id].find(x => x.emoji === r.emoji);
      if (existing) { existing.count++; if (userId && r.user_id === userId) existing.userReacted = true; }
      else reactionMap[r.post_id].push({ emoji: r.emoji, count: 1, userReacted: !!(userId && r.user_id === userId) });
    });
    return rawPosts.map(p => ({ ...p, reactions: reactionMap[p.id] ?? [] }));
  }

  async function handleReact(postId: string, emoji: string, userAlreadyReacted: boolean) {
    if (!user) return;
    if (userAlreadyReacted) {
      await supabase.from("community_post_reactions").delete().eq("post_id", postId).eq("user_id", user.id);
    } else {
      await supabase.from("community_post_reactions").upsert({ post_id: postId, user_id: user.id, emoji }, { onConflict: "post_id,user_id" });
      const post = posts.find(p => p.id === postId);
      if (post && post.user_id !== user.id) {
        const reactorName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Someone";
        await supabase.from("notifications").insert({
          user_id: post.user_id, from_user_id: user.id, from_display_name: reactorName,
          type: "reaction", message: `${reactorName} reacted ${emoji} to your post`, post_id: postId,
        });
      }
    }
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const updated = [...p.reactions];
      const existing = updated.find(r => r.emoji === emoji);
      if (userAlreadyReacted) {
        return { ...p, reactions: updated.map(r => r.emoji === emoji ? { ...r, count: r.count - 1, userReacted: false } : r).filter(r => r.count > 0) };
      } else {
        if (existing) return { ...p, reactions: updated.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, userReacted: true } : r) };
        else return { ...p, reactions: [...updated, { emoji, count: 1, userReacted: true }] };
      }
    }));
  }

  async function fetchReactors(postId: string, emoji: string) {
    setReactorLoading(true);
    setReactorNames([]);
    const { data: reactions } = await supabase.from("community_post_reactions").select("user_id").eq("post_id", postId).eq("emoji", emoji).limit(20);
    if (!reactions || reactions.length === 0) { setReactorLoading(false); return; }
    const { data: users } = await supabase.from("users").select("id, name").in("id", reactions.map((r) => r.user_id));
    setReactorNames((users ?? []).map((u) => u.name || "Someone"));
    setReactorLoading(false);
  }

  async function handleShare() {
    if (!user) return;
    if (!settings.show_in_feed) { setShareError("Enable community visibility in your Profile settings first."); return; }
    setSharing(true);
    setShareError("");
    const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Anonymous";
    const { error } = await supabase.from("community_posts").insert({
      user_id: user.id, display_name: displayName, avatar_url: user.user_metadata?.avatar_url ?? null,
      post_type: shareForm.post_type, mood_category: shareForm.mood_category || null,
      note: shareForm.note.trim() || null, streak_count: 0,
    });
    if (error) { setShareError(error.message); setSharing(false); return; }
    setShowShare(false);
    setShareForm({ mood_category: "", note: "", post_type: "session" });
    setSharing(false);
  }

  return (
    <div style={{ backgroundColor: C.surfaceDim, color: C.onSurface, fontFamily: "var(--font-manrope)", minHeight: "100vh" }}>
      <Navbar />

      <main
        className="flex flex-col lg:flex-row gap-12 px-6 py-10 lg:px-20 max-w-[1440px] mx-auto w-full"
        style={{ paddingTop: "calc(4rem + 2.5rem)" }}
      >

        {/* ── LEFT: MAIN FEED ───────────────────────────────────────────────── */}
        <div className="flex-1 space-y-12 min-w-0">

          {/* Founder's Corner */}
          <section className="relative overflow-hidden rounded-xl p-px group" style={{ backgroundColor: C.surfaceLow }}>
            <div className="absolute inset-0 opacity-50" style={{ background: `linear-gradient(135deg, rgba(255,65,142,0.2), transparent)` }} />
            <div
              className="relative flex flex-col md:flex-row gap-8 items-center p-8 rounded-xl"
              style={{ backgroundColor: C.surfaceDim, border: `1px solid rgba(255,65,142,0.1)` }}
            >
              <div className="flex -space-x-4">
                <div
                  className="w-20 h-20 rounded-full border-2 overflow-hidden shrink-0"
                  style={{ borderColor: C.primaryCont, background: "#333" }}
                >
                  <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)" }} />
                </div>
                <div
                  className="w-20 h-20 rounded-full border-2 overflow-hidden shrink-0"
                  style={{ borderColor: C.secondary, background: "#333" }}
                >
                  <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #52e32c, #adf225)" }} />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl text-white mb-2" style={HEADLINE}>Founder Memo</h3>
                <p style={{ color: C.onSurfaceVar }}>
                  &quot;We&apos;re moving through some heavy energy this week. Join us tonight at 8PM for a live session on &apos;Navigating the Noise&apos;.&quot; — Natalie
                </p>
              </div>
              <Link
                href="/live"
                className="px-8 py-3 rounded-xl font-bold transition-all active:scale-95 hover:brightness-110 whitespace-nowrap"
                style={{ ...HEADLINE, fontSize: "0.85rem", backgroundColor: C.primary, color: "#470020" }}
              >
                Join Live
              </Link>
            </div>
          </section>

          {/* Community Dashboard + Post Composer */}
          <section className="space-y-6">
            <div>
              <h2 className="text-4xl text-white mb-1" style={HEADLINE}>Community Dashboard</h2>
              <p className="font-medium" style={{ color: C.tertiary }}>
                If you have something to share with the community, drop it here.
              </p>
            </div>

            {/* Inline composer */}
            <div
              className="rounded-xl p-6 transition-all"
              style={{ ...GLASS }}
            >
              <div className="flex gap-4">
                <Avatar url={user?.user_metadata?.avatar_url ?? null} name={user?.user_metadata?.full_name ?? "?"} size={12} />
                <div className="flex-1 space-y-4">
                  <textarea
                    value={shareForm.note}
                    onChange={(e) => setShareForm(f => ({ ...f, note: e.target.value }))}
                    placeholder="Share a win or an emotional breakthrough..."
                    rows={3}
                    maxLength={200}
                    className="w-full bg-transparent border-none outline-none resize-none text-xl placeholder-white/25"
                    style={{ color: "#ffffff" }}
                  />
                  <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex gap-3" style={{ color: C.onSurfaceVar }}>
                      {/* Mood picker */}
                      <select
                        value={shareForm.mood_category}
                        onChange={(e) => setShareForm(f => ({ ...f, mood_category: e.target.value }))}
                        className="bg-transparent text-xs outline-none appearance-none cursor-pointer transition-colors hover:text-white"
                        style={{ color: C.onSurfaceVar, colorScheme: "dark" }}
                      >
                        <option value="">Mood...</option>
                        {["Hungover","After The Sesh","On A Comedown","Feeling Empty","Can't Sleep","Anxious","Heartbroken","Overwhelmed","Low Energy","Morning Reset","Focus Mode"].map(m => (
                          <option key={m} value={m} style={{ backgroundColor: C.surfaceHigh }}>{m}</option>
                        ))}
                      </select>
                      {/* Type picker */}
                      <select
                        value={shareForm.post_type}
                        onChange={(e) => setShareForm(f => ({ ...f, post_type: e.target.value }))}
                        className="bg-transparent text-xs outline-none appearance-none cursor-pointer transition-colors hover:text-white"
                        style={{ color: C.onSurfaceVar, colorScheme: "dark" }}
                      >
                        {[{ value: "session", label: "🧘 Meditation" }, { value: "streak", label: "🔥 Streak" }, { value: "challenge", label: "🎯 Challenge" }].map(t => (
                          <option key={t.value} value={t.value} style={{ backgroundColor: C.surfaceHigh }}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleShare}
                      disabled={sharing}
                      className="py-2 px-6 rounded-lg font-bold transition-all hover:brightness-110 disabled:opacity-40"
                      style={{ ...HEADLINE, fontSize: "0.75rem", backgroundColor: C.surfaceHighest, color: "#ffffff" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = C.primaryCont; e.currentTarget.style.color = "#1e000a"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = C.surfaceHighest; e.currentTarget.style.color = "#ffffff"; }}
                    >
                      {sharing ? "Posting…" : "Post Win"}
                    </button>
                  </div>
                  {shareError && <p className="text-xs text-amber-400">{shareError}</p>}
                </div>
              </div>
            </div>
          </section>

          {/* The Flow — Feed */}
          <section className="space-y-8">
            <div
              className="flex items-center justify-between pb-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <h2 className="text-2xl text-white" style={HEADLINE}>The Flow</h2>
              <div className="flex gap-4 text-sm font-bold uppercase tracking-widest" style={{ color: C.onSurfaceVar }}>
                {(["recent", "global"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFeedFilter(f)}
                    className="pb-1 transition-colors"
                    style={{
                      color: feedFilter === f ? C.primaryCont : C.onSurfaceVar,
                      borderBottom: feedFilter === f ? `2px solid ${C.primaryCont}` : "2px solid transparent",
                      fontFamily: "var(--font-lexend)",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-pink-400 animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div
                className="p-10 rounded-xl text-center"
                style={{ backgroundColor: C.surfaceHigh, border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <p className="text-3xl mb-3">✨</p>
                <p className="text-sm mb-1" style={{ color: C.onSurfaceVar }}>No posts yet</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Be the first to share a win</p>
              </div>
            ) : (
              <div className="space-y-8">
                {posts.map((post, idx) => {
                  const moodGradient = post.mood_category ? (MOOD_GRADIENTS[post.mood_category] ?? PURPLE) : PURPLE;
                  const isLast = idx === posts.length - 1;
                  return (
                    <div key={post.id} className="group flex gap-6 p-2 rounded-xl transition-all hover:bg-white/[0.02]">
                      {/* Avatar + vertical connector */}
                      <div className="flex flex-col items-center gap-2">
                        <Avatar url={post.avatar_url} name={post.display_name} size={14} />
                        {!isLast && (
                          <div className="w-0.5 flex-1 rounded-full" style={{ backgroundColor: C.surfaceHighest, minHeight: 32 }} />
                        )}
                      </div>

                      {/* Post content */}
                      <div className="flex-1 space-y-3 pb-4">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">
                            {post.display_name}
                            <span className="font-normal ml-2" style={{ color: C.onSurfaceVar }}>
                              @{post.display_name.toLowerCase().replace(/\s+/g, "_")}
                            </span>
                          </span>
                          <span
                            className="text-xs font-bold uppercase"
                            style={{ color: C.onSurfaceVar, fontFamily: "var(--font-lexend)" }}
                          >
                            {timeAgo(post.created_at)}
                          </span>
                        </div>

                        <p className="text-lg leading-relaxed" style={{ color: C.onSurface }}>
                          {postText(post)}
                          {post.mood_category && (
                            <span
                              className="ml-2 inline-block text-xs text-white px-2 py-0.5 rounded-full"
                              style={{ background: moodGradient }}
                            >
                              {post.mood_category}
                            </span>
                          )}
                        </p>

                        {post.note && (
                          <p className="text-base leading-relaxed" style={{ color: C.onSurface }}>{post.note}</p>
                        )}

                        {/* Reactions */}
                        <div className="flex items-center gap-4 pt-2 flex-wrap">
                          {/* Heart (most recent reaction or first emoji) */}
                          {POST_EMOJIS.slice(0, 3).map((emoji) => {
                            const r = post.reactions.find(x => x.emoji === emoji);
                            const isReacted = r?.userReacted ?? false;
                            return (
                              <button
                                key={emoji}
                                onClick={() => handleReact(post.id, emoji, isReacted)}
                                className="flex items-center gap-1.5 transition-colors hover:text-white"
                                style={{ color: isReacted ? C.primaryCont : C.onSurfaceVar }}
                              >
                                <span style={{ fontSize: 18 }}>{emoji}</span>
                                <span className="text-xs font-bold">{r?.count ?? 0}</span>
                              </button>
                            );
                          })}
                          {/* View all reactors */}
                          <button
                            onClick={() => { setReactorPopover({ postId: post.id, emoji: "all" }); fetchReactors(post.id, "🔥"); }}
                            className="flex items-center gap-1.5 transition-colors hover:text-white text-xs font-bold uppercase ml-2"
                            style={{ color: C.onSurfaceVar, fontFamily: "var(--font-lexend)", letterSpacing: "0.05em" }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                            </svg>
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={feedEndRef} />
              </div>
            )}
          </section>
        </div>

        {/* ── RIGHT: SIDEBAR ────────────────────────────────────────────────── */}
        <aside className="w-full lg:w-[360px] space-y-10 shrink-0">

          {/* Weekly Pulse */}
          <section className="space-y-6">
            <h3
              className="text-xl text-white"
              style={{ ...HEADLINE, textShadow: "0 0 12px rgba(255,106,158,0.4)" }}
            >
              The Weekly Pulse
            </h3>
            <div className="space-y-3">
              {WEEKLY_PULSE.map((item) => (
                <Link
                  key={item.title}
                  href="/library"
                  className="flex items-center gap-4 p-4 rounded-xl cursor-pointer group transition-all"
                  style={{ ...GLASS }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = C.surfaceHighest; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center transition-all group-hover:scale-105"
                    style={{ backgroundColor: `${item.color}22`, color: item.color }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-sm">{item.title}</h4>
                    <p className="text-xs" style={{ color: C.onSurfaceVar }}>{item.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Active Crews */}
          {crews.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl text-white" style={HEADLINE}>Active Crews</h3>
                <Link href="/crew" className="text-xs font-bold uppercase transition-colors hover:text-white" style={{ color: C.primaryCont, fontFamily: "var(--font-lexend)" }}>
                  See all
                </Link>
              </div>
              <div className="space-y-4">
                {crews.map((crew) => (
                  <Link
                    key={crew.id}
                    href={`/crew/${crew.id}`}
                    className="flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs text-white"
                        style={{ background: PURPLE }}
                      >
                        {crew.name.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <h4
                          className="font-bold text-sm text-white transition-colors"
                          style={{ fontFamily: "var(--font-manrope)" }}
                        >
                          {crew.name}
                        </h4>
                        <p className="text-xs" style={{ color: C.onSurfaceVar }}>Members</p>
                      </div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={C.onSurfaceVar} className="group-hover:translate-x-1 transition-transform">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xl text-white" style={HEADLINE}>Most Active</h3>
              <div className="space-y-3">
                {leaderboard.map((entry, i) => (
                  <div key={entry.display_name} className="flex items-center gap-3">
                    <span
                      className="text-sm w-5 text-center shrink-0"
                      style={{ color: i === 0 ? "#f4e71d" : C.onSurfaceVar }}
                    >
                      {i === 0 ? "🌟" : `${i + 1}`}
                    </span>
                    <Avatar url={entry.avatar_url} name={entry.display_name} size={8} />
                    <p className="text-sm flex-1 truncate" style={{ color: C.onSurface }}>{entry.display_name}</p>
                    <p className="text-xs font-bold" style={{ color: C.onSurfaceVar }}>{entry.session_count}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.15)" }}>
                Only users who post appear here
              </p>
            </section>
          )}

          {/* Blog / Promo card */}
          <div
            className="relative overflow-hidden rounded-xl aspect-square flex flex-col justify-end"
            style={{ backgroundColor: C.surfaceHigh }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop')",
                opacity: 0.6,
              }}
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #000000 30%, transparent)" }} />
            <div className="relative z-10 p-8 space-y-4">
              <h4 className="text-3xl text-white" style={HEADLINE}>Latest Podcast</h4>
              <p className="text-sm" style={{ color: C.onSurfaceVar }}>New episodes drop every week.</p>
              <Link
                href="/podcasts"
                className="block w-full py-3 rounded-lg text-center font-black uppercase transition-all hover:brightness-90"
                style={{ ...HEADLINE, fontSize: "0.85rem", backgroundColor: "#ffffff", color: "#000000" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = C.primaryCont; (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#ffffff"; (e.currentTarget as HTMLElement).style.color = "#000000"; }}
              >
                Listen Now
              </Link>
            </div>
          </div>

          {/* Privacy notice */}
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: C.surfaceHigh, border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <p className="text-xs font-bold mb-1" style={{ color: C.onSurface }}>Your Privacy</p>
            <p className="text-xs leading-relaxed mb-3" style={{ color: C.onSurfaceVar }}>
              Nothing is shared without your consent. Enable community visibility in your profile to appear in the feed.
            </p>
            {user && (
              <Link href="/profile" className="text-xs font-bold transition-colors hover:text-white" style={{ color: C.primaryCont }}>
                Manage settings →
              </Link>
            )}
          </div>

        </aside>
      </main>

      {/* ── REACTOR POPOVER ───────────────────────────────────────────────────── */}
      {reactorPopover && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
          style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
          onClick={() => setReactorPopover(null)}
        >
          <div
            className="w-full max-w-xs rounded-2xl p-5"
            style={{ backgroundColor: C.surfaceHigh, border: "1px solid rgba(255,255,255,0.1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-white font-bold" style={{ fontFamily: "var(--font-lexend)" }}>
                {reactorLoading ? "Loading…" : `${reactorNames.length} reaction${reactorNames.length !== 1 ? "s" : ""}`}
              </span>
              <button onClick={() => setReactorPopover(null)} style={{ color: C.onSurfaceVar }} className="hover:text-white transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            {reactorLoading && <div className="flex justify-center py-4"><div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-pink-400 animate-spin" /></div>}
            {!reactorLoading && reactorNames.length > 0 && (
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {reactorNames.map((name, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white font-bold" style={{ background: PURPLE }}>
                      {name[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm" style={{ color: C.onSurface }}>{name}</span>
                  </div>
                ))}
              </div>
            )}
            {!reactorLoading && reactorNames.length === 0 && (
              <p className="text-xs text-center py-3" style={{ color: C.onSurfaceVar }}>No reactions yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
