"use client";

// /crew/[id] — cinematic crew dashboard.
// Shows the crew hero, live session card, activity feed with emoji reactions,
// invite code, brand challenges, and next encounters.
//
// ── SUPABASE TABLE NEEDED ────────────────────────────────────────────────────
// CREATE TABLE IF NOT EXISTS public.crew_activity_reactions (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   crew_activity_id UUID NOT NULL,
//   from_user_id UUID NOT NULL,
//   from_display_name TEXT,
//   emoji TEXT NOT NULL,
//   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
//   UNIQUE(crew_activity_id, from_user_id, emoji)
// );
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import { formatActivity, timeAgo, type Crew, type CrewMember, type CrewActivity } from "../../../lib/crews";

const GRADIENT = "linear-gradient(135deg, #ff41b3 0%, #ec723d 25%, #adf225 60%, #adf225 80%, #adf225 100%)";
const PINK_ORANGE = "linear-gradient(135deg, #ff41b3 0%, #ec723d 100%)";

// The six reaction emojis — same set as community feed
const ACTIVITY_EMOJIS = ["🔥", "💜", "🙏", "⭐", "💪", "🧘"];

// Shape of a reaction entry per activity item
type ActivityReaction = { emoji: string; count: number; userReacted: boolean };

// Member name colour palette for chat-style display
const NAME_COLOURS = ["#ff41b3", "#adf225", "#ec723d", "#f4e71d", "#a78bfa", "#34d399"];

export default function CrewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const crewId = params?.id as string;
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [crew, setCrew] = useState<Crew | null>(null);
  const [members, setMembers] = useState<CrewMember[]>([]);
  const [activity, setActivity] = useState<CrewActivity[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Reactions: maps activityId → array of { emoji, count, userReacted }
  const [activityReactions, setActivityReactions] = useState<Record<string, ActivityReaction[]>>({});

  // Who-reacted popover
  const [reactorPopover, setReactorPopover] = useState<{ activityId: string; emoji: string } | null>(null);
  const [reactorNames, setReactorNames] = useState<string[]>([]);
  const [reactorLoading, setReactorLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.push("/login"); return; }
      setUser(u);

      // Verify user is a member of this crew
      const { data: membership } = await supabase
        .from("crew_members")
        .select("id")
        .eq("crew_id", crewId)
        .eq("user_id", u.id)
        .maybeSingle();

      if (!membership) {
        setError("You're not a member of this crew.");
        setLoading(false);
        return;
      }

      // Fetch crew details
      const { data: crewData } = await supabase
        .from("crews")
        .select("*")
        .eq("id", crewId)
        .single();

      if (!crewData) { setError("Crew not found."); setLoading(false); return; }
      setCrew(crewData);

      // Fetch members
      const { data: membersData } = await supabase
        .from("crew_members")
        .select("*")
        .eq("crew_id", crewId)
        .order("joined_at");
      setMembers(membersData ?? []);

      // Fetch activity feed (latest 30 events)
      const { data: activityData } = await supabase
        .from("crew_activity")
        .select("*")
        .eq("crew_id", crewId)
        .order("created_at", { ascending: false })
        .limit(30);
      const activities = activityData ?? [];
      setActivity(activities);

      // Fetch reactions for all visible activity items
      if (activities.length > 0) {
        await loadReactions(activities.map((a) => a.id), u.id);
      }

      // Count "completed" events per member this week
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: weekData } = await supabase
        .from("crew_activity")
        .select("user_id")
        .eq("crew_id", crewId)
        .eq("activity_type", "completed")
        .gte("created_at", weekAgo);

      const stats: Record<string, number> = {};
      (weekData ?? []).forEach((a) => {
        stats[a.user_id] = (stats[a.user_id] ?? 0) + 1;
      });
      setWeeklyStats(stats);

      setLoading(false);
    }
    load();
  }, [crewId]);

  // Load all reactions for a list of activity IDs and build the reaction map
  async function loadReactions(activityIds: string[], currentUserId: string) {
    const { data: allReactions } = await supabase
      .from("crew_activity_reactions")
      .select("crew_activity_id, emoji, from_user_id")
      .in("crew_activity_id", activityIds);

    const map: Record<string, ActivityReaction[]> = {};

    (allReactions ?? []).forEach((r) => {
      if (!map[r.crew_activity_id]) map[r.crew_activity_id] = [];
      const existing = map[r.crew_activity_id].find((x) => x.emoji === r.emoji);
      if (existing) {
        existing.count++;
        if (r.from_user_id === currentUserId) existing.userReacted = true;
      } else {
        map[r.crew_activity_id].push({
          emoji: r.emoji,
          count: 1,
          userReacted: r.from_user_id === currentUserId,
        });
      }
    });

    setActivityReactions(map);
  }

  // Realtime: new activity events + reaction changes
  useEffect(() => {
    if (!crewId) return;

    const activityChannel = supabase
      .channel(`crew_activity:${crewId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "crew_activity", filter: `crew_id=eq.${crewId}` },
        (payload) => {
          setActivity((prev) => [payload.new as CrewActivity, ...prev].slice(0, 30));
        }
      )
      .subscribe();

    const membersChannel = supabase
      .channel(`crew_members_detail:${crewId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "crew_members", filter: `crew_id=eq.${crewId}` },
        () => {
          supabase
            .from("crew_members")
            .select("*")
            .eq("crew_id", crewId)
            .order("joined_at")
            .then(({ data }) => setMembers(data ?? []));
        }
      )
      .subscribe();

    const reactionsChannel = supabase
      .channel(`crew_reactions:${crewId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "crew_activity_reactions" },
        async () => {
          const { data: acts } = await supabase
            .from("crew_activity")
            .select("id")
            .eq("crew_id", crewId)
            .limit(30);
          const { data: { user: u } } = await supabase.auth.getUser();
          if (acts && u) {
            await loadReactions(acts.map((a) => a.id), u.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(activityChannel);
      supabase.removeChannel(membersChannel);
      supabase.removeChannel(reactionsChannel);
    };
  }, [crewId]);

  // React or unreact to a crew activity item
  async function handleCrewReact(activityId: string, emoji: string, isReacted: boolean) {
    if (!user) return;

    const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Someone";

    // Optimistic update
    setActivityReactions((prev) => {
      const current = prev[activityId] ? [...prev[activityId]] : [];
      const existing = current.find((r) => r.emoji === emoji);
      if (isReacted) {
        return {
          ...prev,
          [activityId]: current
            .map((r) => r.emoji === emoji ? { ...r, count: r.count - 1, userReacted: false } : r)
            .filter((r) => r.count > 0),
        };
      } else {
        if (existing) {
          return { ...prev, [activityId]: current.map((r) => r.emoji === emoji ? { ...r, count: r.count + 1, userReacted: true } : r) };
        }
        return { ...prev, [activityId]: [...current, { emoji, count: 1, userReacted: true }] };
      }
    });

    if (isReacted) {
      await supabase
        .from("crew_activity_reactions")
        .delete()
        .eq("crew_activity_id", activityId)
        .eq("from_user_id", user.id)
        .eq("emoji", emoji);
    } else {
      await supabase
        .from("crew_activity_reactions")
        .upsert(
          { crew_activity_id: activityId, from_user_id: user.id, from_display_name: displayName, emoji },
          { onConflict: "crew_activity_id,from_user_id,emoji" }
        );
    }
  }

  // Fetch names of everyone who reacted with a given emoji
  async function fetchReactors(activityId: string, emoji: string) {
    setReactorLoading(true);
    setReactorNames([]);

    const { data: reactions } = await supabase
      .from("crew_activity_reactions")
      .select("from_display_name")
      .eq("crew_activity_id", activityId)
      .eq("emoji", emoji)
      .limit(20);

    const names = (reactions ?? [])
      .map((r) => r.from_display_name || "Someone")
      .filter(Boolean);
    setReactorNames(names);
    setReactorLoading(false);
  }

  function copyInviteLink() {
    const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const url = `${base}/crew?invite=${crew?.invite_code}`;
    navigator.clipboard.writeText(url);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  }

  async function handleLeave() {
    if (!user) return;
    if (!confirm("Are you sure you want to leave this crew?")) return;
    setLeaving(true);
    await supabase
      .from("crew_members")
      .delete()
      .eq("crew_id", crewId)
      .eq("user_id", user.id);
    router.push("/crew");
  }

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#0d0d0d" }}>
        <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-pink-400 animate-spin" />
      </div>
    );
  }

  if (error || !crew) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 flex-col gap-4" style={{ backgroundColor: "#0d0d0d" }}>
        <p className="text-white/40 text-sm">{error || "Crew not found."}</p>
        <Link href="/crew" className="text-sm text-[#ff41b3] hover:opacity-80">← Back to crews</Link>
      </div>
    );
  }

  const crewInitial = crew.name[0]?.toUpperCase() ?? "C";
  const totalSessions = Object.values(weeklyStats).reduce((a, b) => a + b, 0);

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0d0d0d", fontFamily: "var(--font-space-grotesk)" }}>

      {/* ── TOP HEADER ──────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3"
        style={{ backgroundColor: "rgba(13,13,13,0.92)", backdropFilter: "blur(16px)", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span
            className="text-base font-black tracking-tight uppercase"
            style={{ background: PINK_ORANGE, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "var(--font-plus-jakarta)" }}
          >
            Daily Meds
          </span>
        </Link>

        {/* Centre nav */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: "Library", href: "/library" },
            { label: "Crews", href: "/crew", active: true },
            { label: "Live", href: "/live" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xs uppercase tracking-widest transition-colors"
              style={{ color: item.active ? "#ff41b3" : "rgba(255,255,255,0.4)", fontWeight: 500 }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
          </button>
          {/* Avatar */}
          <Link href="/profile">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: PINK_ORANGE }}
            >
              {user?.user_metadata?.full_name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U"}
            </div>
          </Link>
        </div>
      </header>

      {/* ── LAYOUT: sidebar + main ───────────────────────────────────────── */}
      <div className="flex pt-[52px] min-h-screen">

        {/* ── LEFT SIDEBAR (desktop only) ─────────────────────────────── */}
        <aside
          className="hidden lg:flex flex-col fixed left-0 top-[52px] bottom-0 w-[72px] items-center py-6 gap-5 z-40"
          style={{ backgroundColor: "rgba(13,13,13,0.95)", borderRight: "0.5px solid rgba(255,255,255,0.05)" }}
        >
          {/* Crew logo */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white"
            style={{ background: PINK_ORANGE }}
          >
            {crewInitial}
          </div>

          <div className="w-full h-px" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />

          {/* Nav icons */}
          {[
            { label: "Home", href: "/", icon: <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/> },
            { label: "Crews", href: "/crew", active: true, icon: <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/> },
            { label: "Sessions", href: "/library", icon: <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/> },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-1 group"
              title={item.label}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={item.active ? "#ff41b3" : "rgba(255,255,255,0.3)"}>
                {item.icon}
              </svg>
              <span className="text-[9px]" style={{ color: item.active ? "#ff41b3" : "rgba(255,255,255,0.25)" }}>
                {item.label}
              </span>
            </Link>
          ))}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Leave crew */}
          <button
            onClick={handleLeave}
            disabled={leaving}
            className="flex flex-col items-center gap-1 transition-opacity hover:opacity-70"
            title="Leave Crew"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,65,65,0.5)">
              <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            </svg>
            <span className="text-[9px] text-red-400/50">Leave</span>
          </button>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
        <main className="flex-1 lg:ml-[72px] pb-24 lg:pb-6">

          {/* ── HERO SECTION ───────────────────────────────────────────── */}
          <div
            className="relative overflow-hidden"
            style={{ background: "linear-gradient(160deg, #1a0520 0%, #0d0d0d 50%, #0a1520 100%)", minHeight: "260px" }}
          >
            {/* Glow orbs */}
            <div
              className="absolute -top-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(255,65,179,0.18) 0%, transparent 70%)" }}
            />
            <div
              className="absolute -bottom-10 right-0 w-80 h-80 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(236,114,61,0.12) 0%, transparent 70%)" }}
            />
            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent 60%, #0d0d0d 100%)" }} />

            <div className="relative z-10 px-5 lg:px-8 pt-10 pb-8">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs mb-4"
                style={{ backgroundColor: "rgba(255,65,179,0.12)", border: "0.5px solid rgba(255,65,179,0.3)", color: "#ff41b3", fontWeight: 500 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff41b3] animate-pulse" />
                Current Crew
              </div>

              {/* Crew name */}
              <h1
                className="text-5xl lg:text-7xl uppercase italic leading-none mb-4"
                style={{
                  fontFamily: "var(--font-plus-jakarta)",
                  fontWeight: 900,
                  background: PINK_ORANGE,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.02em",
                }}
              >
                {crew.name}
              </h1>

              {/* Stats row */}
              <div className="flex items-center gap-5 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {members.slice(0, 4).map((m, i) => (
                      <div
                        key={m.id}
                        className="w-7 h-7 rounded-full border border-[#0d0d0d] flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: GRADIENT, zIndex: 4 - i }}
                      >
                        {m.display_name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-white/50">{members.length} members</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-base">🔥</span>
                  <span className="text-xs text-white/50">{totalSessions} sessions this week</span>
                </div>

                {/* Invite button */}
                <button
                  onClick={() => setShowInvite((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "rgba(255,65,179,0.2)", border: "0.5px solid rgba(255,65,179,0.4)", color: "#ff41b3", fontWeight: 500 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  Invite
                </button>
              </div>
            </div>
          </div>

          {/* ── INVITE PANEL ────────────────────────────────────────────── */}
          {showInvite && (
            <div
              className="mx-5 lg:mx-8 -mt-2 mb-6 rounded-[14px] p-5"
              style={{ backgroundColor: "#1a1a1a", border: "0.5px solid rgba(255,65,179,0.2)" }}
            >
              <p className="text-xs text-white/40 mb-3">Share this code or link with your friends</p>
              <p className="text-3xl text-white tracking-[0.3em] font-mono mb-4" style={{ fontWeight: 500 }}>
                {crew.invite_code}
              </p>
              <button
                onClick={copyInviteLink}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all"
                style={{
                  border: "0.5px solid rgba(255,255,255,0.15)",
                  color: inviteCopied ? "#adf225" : "rgba(255,255,255,0.6)",
                  backgroundColor: inviteCopied ? "rgba(173,242,37,0.08)" : "transparent",
                }}
              >
                {inviteCopied ? (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>Link copied!</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>Copy invite link</>
                )}
              </button>
            </div>
          )}

          {/* ── MAIN GRID ──────────────────────────────────────────────── */}
          <div className="px-5 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5">

            {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
            <div className="lg:col-span-7 flex flex-col gap-5">

              {/* Live Breathing Session Card */}
              <div
                className="rounded-[16px] overflow-hidden"
                style={{ background: "linear-gradient(135deg, #1a0f1e 0%, #0f1a1a 100%)", border: "0.5px solid rgba(255,65,179,0.15)" }}
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "rgba(255,65,179,0.15)", color: "#ff41b3", fontWeight: 600 }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff41b3] animate-pulse" />
                        LIVE
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-base" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
                      Group Breathing Session
                    </h3>
                    <p className="text-xs text-white/40 mt-0.5">Box breathing · 10 min · {members.length} members</p>
                  </div>
                </div>

                {/* Breathing visualization */}
                <div className="flex items-center justify-center py-6 relative">
                  <div className="relative flex items-center justify-center">
                    {/* Outer ring */}
                    <div
                      className="w-28 h-28 rounded-full absolute"
                      style={{ border: "1px solid rgba(255,65,179,0.12)", animation: "ping 3s ease-in-out infinite" }}
                    />
                    <div
                      className="w-20 h-20 rounded-full absolute"
                      style={{ border: "1px solid rgba(255,65,179,0.2)", animation: "ping 3s ease-in-out infinite 0.5s" }}
                    />
                    {/* Core */}
                    <div
                      className="w-16 h-16 rounded-full flex flex-col items-center justify-center"
                      style={{ background: "radial-gradient(circle, rgba(255,65,179,0.3) 0%, rgba(255,65,179,0.05) 100%)", border: "1px solid rgba(255,65,179,0.3)" }}
                    >
                      {/* Lung-style icon */}
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="rgba(255,65,179,0.9)">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9V8h2v9zm4 0h-2V8h2v9z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Member energy bars */}
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                    {members.slice(0, 5).map((m, i) => (
                      <div key={m.id} className="flex items-center gap-1.5">
                        <span className="text-[9px] text-white/30 w-12 text-right truncate">{m.display_name}</span>
                        <div className="w-16 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${40 + (i * 13) % 60}%`,
                              background: GRADIENT,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enter session button */}
                <div className="px-5 pb-5">
                  <Link
                    href="/rooms"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-[10px] text-sm font-bold text-white transition-opacity hover:opacity-80"
                    style={{ background: PINK_ORANGE }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                    Enter Session
                  </Link>
                </div>
              </div>

              {/* Next Encounters */}
              <div
                className="rounded-[16px] p-5"
                style={{ backgroundColor: "#141414", border: "0.5px solid rgba(255,255,255,0.06)" }}
              >
                <h3
                  className="text-xs uppercase tracking-widest text-white/40 mb-4"
                  style={{ fontWeight: 500 }}
                >
                  Next Encounters
                </h3>

                <div
                  className="flex items-center gap-4 p-4 rounded-[12px]"
                  style={{ backgroundColor: "#1c1c1c" }}
                >
                  {/* Date block */}
                  <div
                    className="flex flex-col items-center justify-center w-12 h-12 rounded-xl shrink-0"
                    style={{ background: PINK_ORANGE }}
                  >
                    <span className="text-white text-xs font-bold leading-none">FRI</span>
                    <span className="text-white text-lg font-black leading-tight" style={{ fontFamily: "var(--font-plus-jakarta)" }}>04</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">Morning Reset Together</p>
                    <p className="text-xs text-white/35 mt-0.5">7:00 AM · 20 min · Group breathing</p>
                  </div>

                  {/* Member avatars */}
                  <div className="flex -space-x-1.5 shrink-0">
                    {members.slice(0, 3).map((m, i) => (
                      <div
                        key={m.id}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white border border-[#1c1c1c]"
                        style={{ background: GRADIENT }}
                      >
                        {m.display_name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-white/20 text-center mt-4">No other encounters scheduled</p>
              </div>

              {/* Crew Choice (top sessions this week) */}
              <div
                className="rounded-[16px] p-5"
                style={{ backgroundColor: "#141414", border: "0.5px solid rgba(255,255,255,0.06)" }}
              >
                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4" style={{ fontWeight: 500 }}>
                  Crew Choice
                </h3>
                <div className="flex flex-col gap-3">
                  {[
                    { title: "4-7-8 Breathing", desc: "Anxiety · 8 min", tag: "Most played" },
                    { title: "Morning Reset", desc: "Energy · 10 min", tag: "Crew favourite" },
                  ].map((track, i) => (
                    <Link
                      key={i}
                      href="/library"
                      className="flex items-center gap-3 p-3 rounded-[10px] transition-all hover:opacity-80"
                      style={{ backgroundColor: "#1c1c1c" }}
                    >
                      <div
                        className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center"
                        style={{ background: i === 0 ? PINK_ORANGE : "linear-gradient(135deg, #adf225, #f4e71d)" }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{track.title}</p>
                        <p className="text-xs text-white/35">{track.desc}</p>
                      </div>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: "rgba(255,65,179,0.1)", color: "#ff41b3" }}
                      >
                        {track.tag}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

            </div>

            {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
            <div className="lg:col-span-5 flex flex-col gap-5">

              {/* Crew Collective — activity feed */}
              <div
                className="rounded-[16px] flex flex-col"
                style={{ backgroundColor: "#141414", border: "0.5px solid rgba(255,255,255,0.06)", maxHeight: "520px" }}
              >
                {/* Feed header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
                  <h3 className="text-xs uppercase tracking-widest text-white/40" style={{ fontWeight: 500 }}>
                    Crew Collective
                  </h3>
                  <span className="flex items-center gap-1 text-[10px] text-[#adf225]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#adf225] animate-pulse" />
                    Live
                  </span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                  {activity.length === 0 ? (
                    <p className="text-xs text-white/20 text-center py-8">No activity yet — complete a session to see it here</p>
                  ) : (
                    activity.map((event, idx) => {
                      const reactions = activityReactions[event.id] ?? [];
                      const nameColour = NAME_COLOURS[idx % NAME_COLOURS.length];
                      const displayName = event.display_name || "Someone";
                      return (
                        <div key={event.id} className="flex flex-col gap-1.5">
                          {/* Message bubble */}
                          <div className="flex items-start gap-2">
                            <div
                              className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                              style={{ background: GRADIENT }}
                            >
                              {displayName[0]?.toUpperCase() ?? "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2 mb-0.5">
                                <span className="text-xs font-bold" style={{ color: nameColour }}>{displayName}</span>
                                <span className="text-[10px] text-white/20">{timeAgo(event.created_at)}</span>
                              </div>
                              <div
                                className="inline-block px-3 py-2 rounded-[10px] text-xs text-white/70 leading-relaxed"
                                style={{ backgroundColor: "rgba(255,255,255,0.04)", maxWidth: "100%" }}
                              >
                                {formatActivity(event)}
                              </div>
                            </div>
                          </div>

                          {/* Reaction pills */}
                          {reactions.length > 0 && (
                            <div className="flex items-center gap-1.5 pl-9 flex-wrap">
                              {reactions.map((r) => (
                                <button
                                  key={r.emoji}
                                  onClick={() => handleCrewReact(event.id, r.emoji, r.userReacted)}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all"
                                  style={{
                                    backgroundColor: r.userReacted ? "rgba(255,65,179,0.15)" : "rgba(255,255,255,0.04)",
                                    border: `0.5px solid ${r.userReacted ? "rgba(255,65,179,0.35)" : "rgba(255,255,255,0.08)"}`,
                                  }}
                                >
                                  <span>{r.emoji}</span>
                                  <span className="text-white/50">{r.count}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Quick reaction row (on hover — always shown on mobile) */}
                          <div className="flex items-center gap-1 pl-9">
                            {ACTIVITY_EMOJIS.map((emoji) => {
                              const r = reactions.find((x) => x.emoji === emoji);
                              const isReacted = r?.userReacted ?? false;
                              return (
                                <button
                                  key={emoji}
                                  onClick={() => handleCrewReact(event.id, emoji, isReacted)}
                                  className="text-sm opacity-30 hover:opacity-80 transition-opacity"
                                  title={`React with ${emoji}`}
                                >
                                  {emoji}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Brand Challenges */}
              <div
                className="rounded-[16px] p-5"
                style={{ backgroundColor: "#141414", border: "0.5px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs uppercase tracking-widest text-white/40" style={{ fontWeight: 500 }}>
                    Brand Challenges
                  </h3>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "rgba(244,231,29,0.1)", color: "#f4e71d" }}
                  >
                    2 active
                  </span>
                </div>

                {/* Challenge card */}
                <div
                  className="rounded-[12px] p-4 mb-3"
                  style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", border: "0.5px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                      style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                    >
                      🧘
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">7-Day Crew Streak</p>
                      <p className="text-xs text-white/35">Meditate together daily</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                    <div className="h-full rounded-full" style={{ width: "43%", background: GRADIENT }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-white/25">3 of 7 days</span>
                    <span className="text-[10px] text-white/25">4 days left</span>
                  </div>
                </div>

                {/* Milestone */}
                <div
                  className="flex items-center gap-3 p-3 rounded-[10px]"
                  style={{ backgroundColor: "rgba(173,242,37,0.06)", border: "0.5px solid rgba(173,242,37,0.15)" }}
                >
                  <span className="text-lg">🏆</span>
                  <div>
                    <p className="text-xs text-[#adf225] font-medium">Zen Master milestone</p>
                    <p className="text-[10px] text-white/30 mt-0.5">Complete 10 crew sessions to unlock</p>
                  </div>
                </div>
              </div>

              {/* Members quick view */}
              <div
                className="rounded-[16px] p-5"
                style={{ backgroundColor: "#141414", border: "0.5px solid rgba(255,255,255,0.06)" }}
              >
                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4" style={{ fontWeight: 500 }}>
                  Members
                </h3>
                <div className="flex flex-col gap-2">
                  {members.map((member, i) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white overflow-hidden"
                        style={{ background: member.avatar_url ? "transparent" : GRADIENT }}
                      >
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt={member.display_name} className="w-full h-full object-cover" />
                        ) : (
                          member.display_name[0]?.toUpperCase() ?? "?"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/70 truncate">
                          {member.display_name}
                          {member.user_id === user?.id && <span className="text-white/25 ml-1">(you)</span>}
                          {member.role === "admin" && (
                            <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(255,65,179,0.15)", color: "#ff41b3" }}>admin</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs text-white/50">{weeklyStats[member.user_id] ?? 0}</span>
                        <span className="text-[9px] text-white/20 ml-1">wk</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ────────────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden items-center justify-around px-2 py-3"
        style={{ backgroundColor: "rgba(13,13,13,0.96)", backdropFilter: "blur(16px)", borderTop: "0.5px solid rgba(255,255,255,0.06)" }}
      >
        {[
          { label: "Home", href: "/", icon: <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/> },
          { label: "Crews", href: "/crew", active: true, icon: <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/> },
          { label: "Live", href: "/live", icon: <path d="M8 5v14l11-7z"/> },
          { label: "Awards", href: "/stats", icon: <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z"/> },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-0.5"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={item.active ? "#ff41b3" : "rgba(255,255,255,0.3)"}>
              {item.icon}
            </svg>
            <span className="text-[9px]" style={{ color: item.active ? "#ff41b3" : "rgba(255,255,255,0.3)" }}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      {/* ── WHO REACTED POPOVER ──────────────────────────────────────────── */}
      {reactorPopover && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => setReactorPopover(null)}
        >
          <div
            className="w-full max-w-xs rounded-[16px] p-5"
            style={{ backgroundColor: "#1a1a1a", border: "0.5px solid rgba(255,255,255,0.12)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{reactorPopover.emoji}</span>
                <span className="text-sm text-white/60">
                  {reactorLoading ? "Loading…" : `${reactorNames.length} reaction${reactorNames.length !== 1 ? "s" : ""}`}
                </span>
              </div>
              <button onClick={() => setReactorPopover(null)} className="text-white/30 hover:text-white/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            {reactorLoading && (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-pink-400 animate-spin" />
              </div>
            )}

            {!reactorLoading && reactorNames.length > 0 && (
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {reactorNames.map((name, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs text-white font-bold"
                      style={{ background: GRADIENT }}
                    >
                      {name[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm text-white/70">{name}</span>
                  </div>
                ))}
              </div>
            )}

            {!reactorLoading && reactorNames.length === 0 && (
              <p className="text-xs text-white/30 text-center py-3">No reactions yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
