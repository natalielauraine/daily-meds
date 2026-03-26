"use client";

// /community — the Daily Meds social feed.
// Privacy-first: nothing is shared without the user explicitly opting in.
// Never shows session titles — only mood categories and activity types.

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { type Crew } from "../../lib/crews";
import { type Challenge, challengeGradient, TYPE_ICONS } from "../../lib/challenges";

// Mood category gradients for post pills
const MOOD_GRADIENTS: Record<string, string> = {
  "Hungover":       "linear-gradient(135deg, #6B21E8, #22D3EE)",
  "After The Sesh": "linear-gradient(135deg, #F43F5E, #FACC15)",
  "On A Comedown":  "linear-gradient(135deg, #10B981, #D9F100)",
  "Feeling Empty":  "linear-gradient(135deg, #6B21E8, #22D3EE)",
  "Can't Sleep":    "linear-gradient(135deg, #8B3CF7, #6366F1)",
  "Anxious":        "linear-gradient(135deg, #F43F5E, #F97316)",
  "Heartbroken":    "linear-gradient(135deg, #EC4899, #D946EF)",
  "Overwhelmed":    "linear-gradient(135deg, #F97316, #FACC15)",
  "Low Energy":     "linear-gradient(135deg, #10B981, #22C55E)",
  "Morning Reset":  "linear-gradient(135deg, #F43F5E, #FACC15)",
  "Focus Mode":     "linear-gradient(135deg, #6B21E8, #6366F1)",
};

const PURPLE = "linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%)";

// The six reaction emojis — matches the design spec
const POST_EMOJIS = ["🔥", "💜", "🙏", "⭐", "💪", "🧘"];

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

export default function CommunityPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengeCounts, setChallengeCounts] = useState<Record<string, number>>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [settings, setSettings] = useState({ show_in_feed: false, show_in_leaderboard: false });
  const [todayStats, setTodayStats] = useState({ posts: 0, uniqueUsers: 0 });
  const [loading, setLoading] = useState(true);

  // Who-reacted popover — which post+emoji pill was tapped
  const [reactorPopover, setReactorPopover] = useState<{ postId: string; emoji: string } | null>(null);
  const [reactorNames, setReactorNames] = useState<string[]>([]);
  const [reactorLoading, setReactorLoading] = useState(false);

  // Share a win modal
  const [showShare, setShowShare] = useState(false);
  const [shareForm, setShareForm] = useState({ mood_category: "", note: "", post_type: "session" });
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState("");

  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);

      // Load all data in parallel
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

      // Get participant counts for challenges
      if (challengeData.length) {
        const counts: Record<string, number> = {};
        await Promise.all(challengeData.map(async (c) => {
          const { count } = await supabase
            .from("challenge_participants")
            .select("*", { count: "exact", head: true })
            .eq("challenge_id", c.id);
          counts[c.id] = count ?? 0;
        }));
        setChallengeCounts(counts);
      }

      if (settingsRes.data) setSettings(settingsRes.data);

      // Today's stats from posts
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const todayPosts = postsRes.filter(p => new Date(p.created_at) >= today);
      const uniqueUsers = new Set(todayPosts.map(p => p.user_id)).size;
      setTodayStats({ posts: todayPosts.length, uniqueUsers });

      // Leaderboard: top posters this week among opted-in users
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: lbData } = await supabase
        .from("community_posts")
        .select("user_id, display_name, avatar_url")
        .gte("created_at", weekAgo);

      if (lbData) {
        const counts: Record<string, LeaderboardEntry> = {};
        lbData.forEach((p) => {
          if (!counts[p.user_id]) counts[p.user_id] = { display_name: p.display_name, avatar_url: p.avatar_url, session_count: 0 };
          counts[p.user_id].session_count++;
        });
        setLeaderboard(
          Object.values(counts).sort((a, b) => b.session_count - a.session_count).slice(0, 10)
        );
      }

      setLoading(false);
    }
    load();
  }, []);

  // Realtime: new posts
  useEffect(() => {
    const channel = supabase
      .channel("community_feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_posts" }, async () => {
        const updated = await fetchPosts(user?.id ?? null);
        setPosts(updated);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "community_post_reactions" }, async () => {
        const updated = await fetchPosts(user?.id ?? null);
        setPosts(updated);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Fetch posts with reaction counts
  async function fetchPosts(userId: string | null): Promise<CommunityPost[]> {
    const { data: rawPosts } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!rawPosts) return [];

    const { data: allReactions } = await supabase
      .from("community_post_reactions")
      .select("post_id, emoji, user_id");

    const reactionMap: Record<string, { emoji: string; count: number; userReacted: boolean }[]> = {};

    (allReactions ?? []).forEach((r) => {
      if (!reactionMap[r.post_id]) reactionMap[r.post_id] = [];
      const existing = reactionMap[r.post_id].find(x => x.emoji === r.emoji);
      if (existing) {
        existing.count++;
        if (userId && r.user_id === userId) existing.userReacted = true;
      } else {
        reactionMap[r.post_id].push({ emoji: r.emoji, count: 1, userReacted: !!(userId && r.user_id === userId) });
      }
    });

    return rawPosts.map(p => ({ ...p, reactions: reactionMap[p.id] ?? [] }));
  }

  async function handleReact(postId: string, emoji: string, userAlreadyReacted: boolean) {
    if (!user) return;
    if (userAlreadyReacted) {
      await supabase.from("community_post_reactions").delete()
        .eq("post_id", postId).eq("user_id", user.id);
    } else {
      await supabase.from("community_post_reactions")
        .upsert({ post_id: postId, user_id: user.id, emoji }, { onConflict: "post_id,user_id" });
    }
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const updated = [...p.reactions];
      const existing = updated.find(r => r.emoji === emoji);
      if (userAlreadyReacted) {
        return { ...p, reactions: updated.map(r => r.emoji === emoji ? { ...r, count: r.count - 1, userReacted: false } : r).filter(r => r.count > 0) };
      } else {
        if (existing) {
          return { ...p, reactions: updated.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, userReacted: true } : r) };
        } else {
          return { ...p, reactions: [...updated, { emoji, count: 1, userReacted: true }] };
        }
      }
    }));
  }

  // Fetch the display names of everyone who reacted with a given emoji on a post
  async function fetchReactors(postId: string, emoji: string) {
    setReactorLoading(true);
    setReactorNames([]);

    // Get all user_ids who reacted with this emoji
    const { data: reactions } = await supabase
      .from("community_post_reactions")
      .select("user_id")
      .eq("post_id", postId)
      .eq("emoji", emoji)
      .limit(20);

    if (!reactions || reactions.length === 0) {
      setReactorLoading(false);
      return;
    }

    // Look up their names from the users table
    const { data: users } = await supabase
      .from("users")
      .select("id, name")
      .in("id", reactions.map((r) => r.user_id));

    const names = (users ?? []).map((u) => u.name || "Someone");
    setReactorNames(names);
    setReactorLoading(false);
  }

  async function handleShare() {
    if (!user) return;
    if (!settings.show_in_feed) {
      setShareError("Enable community visibility in your Profile settings first.");
      return;
    }
    setSharing(true);
    setShareError("");

    const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Anonymous";

    const { error } = await supabase.from("community_posts").insert({
      user_id: user.id,
      display_name: displayName,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      post_type: shareForm.post_type,
      mood_category: shareForm.mood_category || null,
      note: shareForm.note.trim() || null,
      streak_count: 0,
    });

    if (error) { setShareError(error.message); setSharing(false); return; }
    setShowShare(false);
    setShareForm({ mood_category: "", note: "", post_type: "session" });
    setSharing(false);
  }

  function postText(post: CommunityPost): string {
    if (post.post_type === "streak") return `hit a ${post.streak_count}-day streak 🔥`;
    if (post.post_type === "challenge") return `completed a challenge 🎯`;
    if (post.mood_category) return `completed a ${post.mood_category} meditation`;
    return `completed a meditation`;
  }

  function timeAgo(iso: string): string {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-xl text-white" style={{ fontWeight: 500 }}>Community</h1>
            <p className="text-xs text-white/40 mt-0.5">You&apos;re not alone in this</p>
          </div>
          {user && (
            <button
              onClick={() => setShowShare(true)}
              className="px-4 py-2 rounded-lg text-sm text-white transition-opacity hover:opacity-80"
              style={{ background: PURPLE, fontWeight: 500 }}
            >
              Share a win
            </button>
          )}
        </div>

        {/* Today's Activity banner */}
        <div
          className="rounded-[12px] p-5 mb-8 flex flex-wrap gap-6"
          style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          <div>
            <p className="text-2xl text-white mb-0.5" style={{ fontWeight: 500 }}>{todayStats.uniqueUsers}</p>
            <p className="text-xs text-white/35">people shared today</p>
          </div>
          <div>
            <p className="text-2xl text-white mb-0.5" style={{ fontWeight: 500 }}>{todayStats.posts}</p>
            <p className="text-xs text-white/35">sessions shared today</p>
          </div>
          <div className="flex-1 flex items-center justify-end">
            <p className="text-xs text-white/20 text-right leading-relaxed max-w-[200px]">
              Share your wins to appear in the community feed
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── MAIN FEED (left) ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/40 mb-4 uppercase tracking-wide">Community Feed</p>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-purple-400 animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div
                className="rounded-[10px] p-8 text-center"
                style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
              >
                <p className="text-2xl mb-2">✨</p>
                <p className="text-sm text-white/30 mb-1">No posts yet</p>
                <p className="text-xs text-white/20">Be the first to share a win</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {posts.map((post) => {
                  const moodGradient = post.mood_category ? (MOOD_GRADIENTS[post.mood_category] ?? PURPLE) : PURPLE;
                  return (
                    <div
                      key={post.id}
                      className="rounded-[10px] p-4"
                      style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div
                          className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm text-white overflow-hidden"
                          style={{ background: post.avatar_url ? "transparent" : PURPLE, fontWeight: 500 }}
                        >
                          {post.avatar_url
                            ? <img src={post.avatar_url} alt={post.display_name} className="w-full h-full object-cover" />
                            : post.display_name[0]?.toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Name + action */}
                          <p className="text-sm text-white leading-snug">
                            <span style={{ fontWeight: 500 }}>{post.display_name}</span>
                            {" "}
                            <span className="text-white/50">{postText(post)}</span>
                          </p>

                          {/* Mood pill */}
                          {post.mood_category && (
                            <span
                              className="inline-block text-[10px] text-white px-2 py-0.5 rounded-full mt-1"
                              style={{ background: moodGradient, opacity: 0.85 }}
                            >
                              {post.mood_category}
                            </span>
                          )}

                          {/* Optional note */}
                          {post.note && (
                            <p className="text-xs text-white/45 mt-1.5 leading-relaxed">{post.note}</p>
                          )}

                          {/* Reactions row */}
                          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                            {POST_EMOJIS.map((emoji) => {
                              const r = post.reactions.find(x => x.emoji === emoji);
                              const isReacted = r?.userReacted ?? false;
                              return (
                                // Pill wrapper — split into two tappable zones
                                <div
                                  key={emoji}
                                  className="flex items-center rounded-lg text-xs overflow-hidden"
                                  style={{
                                    backgroundColor: isReacted ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)",
                                    border: `0.5px solid ${isReacted ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.07)"}`,
                                  }}
                                >
                                  {/* Left side: emoji — tap to react or unreact */}
                                  <button
                                    onClick={() => handleReact(post.id, emoji, isReacted)}
                                    className="px-2 py-1 transition-opacity hover:opacity-70"
                                    style={{ color: isReacted ? "#C4B5FD" : "rgba(255,255,255,0.35)" }}
                                  >
                                    {emoji}
                                  </button>
                                  {/* Right side: count — tap to see who reacted */}
                                  {r && r.count > 0 && (
                                    <button
                                      onClick={() => {
                                        setReactorPopover({ postId: post.id, emoji });
                                        fetchReactors(post.id, emoji);
                                      }}
                                      className="pr-2 py-1 transition-opacity hover:opacity-70"
                                      style={{ color: isReacted ? "#C4B5FD" : "rgba(255,255,255,0.4)" }}
                                    >
                                      {r.count}
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Time */}
                        <p className="text-[10px] text-white/20 shrink-0 mt-0.5">{timeAgo(post.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={feedEndRef} />
              </div>
            )}
          </div>

          {/* ── SIDEBAR (right) ──────────────────────────────────────── */}
          <div className="w-full lg:w-72 flex flex-col gap-6 shrink-0">

            {/* Find Your Crew */}
            {crews.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-white/40 uppercase tracking-wide">Find Your Crew</p>
                  <Link href="/crew" className="text-xs text-[#8B5CF6] hover:opacity-80">See all</Link>
                </div>
                <div className="flex flex-col gap-2">
                  {crews.map((crew) => (
                    <Link
                      key={crew.id}
                      href={`/crew/${crew.id}`}
                      className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 transition-opacity hover:opacity-80"
                      style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.07)" }}
                    >
                      <div
                        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs text-white"
                        style={{ background: PURPLE, fontWeight: 500 }}
                      >
                        {crew.name[0]?.toUpperCase()}
                      </div>
                      <p className="text-sm text-white/70 truncate">{crew.name}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Active Challenges */}
            {challenges.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-white/40 uppercase tracking-wide">Active Challenges</p>
                  <Link href="/challenges" className="text-xs text-[#8B5CF6] hover:opacity-80">See all</Link>
                </div>
                <div className="flex flex-col gap-2">
                  {challenges.map((c) => {
                    const grad = challengeGradient(c);
                    return (
                      <Link
                        key={c.id}
                        href={`/challenges/${c.id}`}
                        className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 transition-opacity hover:opacity-80"
                        style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.07)" }}
                      >
                        <div
                          className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm"
                          style={{ background: grad }}
                        >
                          {TYPE_ICONS[c.challenge_type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/70 truncate">{c.title}</p>
                          <p className="text-[10px] text-white/25">{challengeCounts[c.id] ?? 0} joined</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <div>
                <p className="text-xs text-white/40 mb-3 uppercase tracking-wide">Most Active This Week</p>
                <div
                  className="rounded-[10px] overflow-hidden"
                  style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.07)" }}
                >
                  {leaderboard.map((entry, i) => (
                    <div
                      key={entry.display_name}
                      className="flex items-center gap-2.5 px-3 py-2.5"
                      style={{ borderTop: i > 0 ? "0.5px solid rgba(255,255,255,0.05)" : "none" }}
                    >
                      <p className="text-sm w-5 text-center shrink-0"
                        style={{ color: i === 0 ? "#FACC15" : "rgba(255,255,255,0.2)" }}>
                        {i === 0 ? "🌟" : `${i + 1}`}
                      </p>
                      <div
                        className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs text-white overflow-hidden"
                        style={{ background: entry.avatar_url ? "transparent" : PURPLE, fontWeight: 500 }}
                      >
                        {entry.avatar_url
                          ? <img src={entry.avatar_url} alt={entry.display_name} className="w-full h-full object-cover" />
                          : entry.display_name[0]?.toUpperCase()}
                      </div>
                      <p className="text-xs text-white/60 flex-1 truncate">{entry.display_name}</p>
                      <p className="text-xs text-white/30 shrink-0">{entry.session_count}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-white/15 mt-2 text-center">
                  Only users who post appear here
                </p>
              </div>
            )}

            {/* Privacy notice */}
            <div
              className="rounded-[10px] p-4"
              style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-xs text-white/40 mb-1" style={{ fontWeight: 500 }}>Your privacy</p>
              <p className="text-[11px] text-white/25 leading-relaxed mb-2">
                Nothing is shared without your consent. Enable community visibility in your profile to appear here.
              </p>
              {user && (
                <Link href="/profile" className="text-[11px] text-[#8B5CF6] hover:opacity-80">
                  Manage settings →
                </Link>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />

      {/* Share a win modal */}
      {showShare && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
          style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowShare(false); }}
        >
          <div
            className="w-full max-w-sm rounded-[14px] p-6"
            style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.12)" }}
          >
            <h2 className="text-white text-base mb-1" style={{ fontWeight: 500 }}>Share a win</h2>
            <p className="text-xs text-white/30 mb-5">Celebrate with the community — never shows what you listened to</p>

            {/* Post type */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { value: "session", label: "Meditation", icon: "🧘" },
                { value: "streak", label: "Streak", icon: "🔥" },
                { value: "challenge", label: "Challenge", icon: "🎯" },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setShareForm(f => ({ ...f, post_type: t.value }))}
                  className="py-2.5 rounded-lg text-xs flex flex-col items-center gap-1 transition-colors"
                  style={{
                    backgroundColor: shareForm.post_type === t.value ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)",
                    border: `0.5px solid ${shareForm.post_type === t.value ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
                    color: shareForm.post_type === t.value ? "#C4B5FD" : "rgba(255,255,255,0.45)",
                  }}
                >
                  <span className="text-lg">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Mood category — only for session type */}
            {shareForm.post_type === "session" && (
              <div className="mb-4">
                <label className="block text-xs text-white/40 mb-1.5">Mood (optional)</label>
                <select
                  value={shareForm.mood_category}
                  onChange={(e) => setShareForm(f => ({ ...f, mood_category: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", colorScheme: "dark" }}
                >
                  <option value="">Select mood...</option>
                  {["Hungover","After The Sesh","On A Comedown","Feeling Empty","Can't Sleep","Anxious","Heartbroken","Overwhelmed","Low Energy","Morning Reset","Focus Mode"].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Optional note */}
            <div className="mb-5">
              <label className="block text-xs text-white/40 mb-1.5">Add a note (optional)</label>
              <textarea
                value={shareForm.note}
                onChange={(e) => setShareForm(f => ({ ...f, note: e.target.value }))}
                placeholder="How are you feeling? Share the vibe..."
                rows={2}
                maxLength={200}
                className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none resize-none"
                style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}
              />
            </div>

            {shareError && (
              <p className="text-xs text-amber-400 mb-3">{shareError}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowShare(false)}
                className="flex-1 py-2.5 rounded-lg text-sm text-white/50 hover:text-white transition-colors"
                style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={sharing}
                className="flex-1 py-2.5 rounded-lg text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{ background: PURPLE, fontWeight: 500 }}
              >
                {sharing ? "Sharing…" : "Share"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Who reacted popover */}
      {reactorPopover && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
          style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
          onClick={() => setReactorPopover(null)}
        >
          <div
            className="w-full max-w-xs rounded-[14px] p-5"
            style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.12)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{reactorPopover.emoji}</span>
                <span className="text-sm text-white/60">
                  {reactorLoading ? "Loading…" : `${reactorNames.length} reaction${reactorNames.length !== 1 ? "s" : ""}`}
                </span>
              </div>
              <button onClick={() => setReactorPopover(null)} className="text-white/30 hover:text-white/60 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            {/* Loading spinner */}
            {reactorLoading && (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-purple-400 animate-spin" />
              </div>
            )}

            {/* Names list */}
            {!reactorLoading && reactorNames.length > 0 && (
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {reactorNames.map((name, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs text-white"
                      style={{ background: "linear-gradient(135deg, #8B5CF6, #6366F1)", fontWeight: 500 }}
                    >
                      {name[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm text-white/70">{name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!reactorLoading && reactorNames.length === 0 && (
              <p className="text-xs text-white/30 text-center py-3">No reactions yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
