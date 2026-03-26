"use client";

// /crew/[id] — individual crew page.
// Shows members, activity feed with emoji reactions, invite code and a link to schedule a Group Med.
// Privacy rule: never shows what session a member listened to — only activity type.
//
// ── SUPABASE TABLE NEEDED ────────────────────────────────────────────────────
// Run this SQL in Supabase → SQL editor before using emoji reactions on activity:
//
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

const GRADIENT = "linear-gradient(135deg, #6B21E8 0%, #8B3CF7 25%, #6366F1 60%, #3B82F6 80%, #22D3EE 100%)";

// The six reaction emojis — same set as community feed
const ACTIVITY_EMOJIS = ["🔥", "💜", "🙏", "⭐", "💪", "🧘"];

// Shape of a reaction entry per activity item
type ActivityReaction = { emoji: string; count: number; userReacted: boolean };

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

    // Realtime: reload reactions when any crew_activity_reaction changes
    const reactionsChannel = supabase
      .channel(`crew_reactions:${crewId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "crew_activity_reactions" },
        async () => {
          // Re-fetch activity ids and reload reactions
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
        // Remove reaction
        return {
          ...prev,
          [activityId]: current
            .map((r) => r.emoji === emoji ? { ...r, count: r.count - 1, userReacted: false } : r)
            .filter((r) => r.count > 0),
        };
      } else {
        // Add reaction
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

  // Fetch names of everyone who reacted with a given emoji to an activity
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

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center" style={{ backgroundColor: "#0D0D1A" }}>
        <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-purple-400 animate-spin" />
      </div>
    );
  }

  if (error || !crew) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-4" style={{ backgroundColor: "#0D0D1A" }}>
        <p className="text-white/40 text-sm mb-4">{error || "Crew not found."}</p>
        <Link href="/crew" className="text-sm text-[#8B5CF6] hover:opacity-80">← Back to crews</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>

      {/* Top bar */}
      <div
        className="sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between"
        style={{ backgroundColor: "#0D0D1A", borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}
      >
        <Link
          href="/crew"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Crews
        </Link>
        <p className="text-sm text-white/70 truncate mx-4" style={{ fontWeight: 500 }}>{crew.name}</p>
        <button
          onClick={handleLeave}
          disabled={leaving}
          className="text-xs text-white/30 hover:text-red-400 transition-colors"
        >
          Leave
        </button>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">

        {/* Crew header */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl text-white shrink-0"
            style={{ background: GRADIENT, fontWeight: 500 }}
          >
            {crew.name[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl text-white" style={{ fontWeight: 500 }}>{crew.name}</h1>
            <p className="text-xs text-white/35 mt-0.5">{members.length} member{members.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={() => setShowInvite((v) => !v)}
            className="px-3 py-2 rounded-lg text-xs text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
          >
            Invite
          </button>
        </div>

        {/* Invite section */}
        {showInvite && (
          <div
            className="rounded-[10px] p-5 mb-6"
            style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
          >
            <p className="text-xs text-white/40 mb-3">Share this code or link with your friends</p>
            <div className="flex items-center gap-3 mb-3">
              <p className="text-2xl text-white tracking-[0.3em] font-mono" style={{ fontWeight: 500 }}>
                {crew.invite_code}
              </p>
            </div>
            <button
              onClick={copyInviteLink}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors"
              style={{
                border: "0.5px solid rgba(255,255,255,0.15)",
                color: inviteCopied ? "#22C55E" : "rgba(255,255,255,0.6)",
              }}
            >
              {inviteCopied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  Link copied!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                  Copy invite link
                </>
              )}
            </button>
          </div>
        )}

        {/* Schedule Group Med button */}
        <Link
          href="/rooms"
          className="flex items-center justify-between rounded-[10px] p-4 mb-6 transition-opacity hover:opacity-80"
          style={{ background: GRADIENT }}
        >
          <div>
            <p className="text-sm text-white" style={{ fontWeight: 500 }}>Schedule a Group Med</p>
            <p className="text-xs text-white/70 mt-0.5">Meditate together in real time</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" opacity={0.8}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
        </Link>

        {/* Members */}
        <div className="mb-8">
          <p className="text-xs text-white/40 mb-3 uppercase tracking-wide">Members</p>
          <div
            className="rounded-[10px] overflow-hidden"
            style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
          >
            {members.map((member, i) => (
              <div
                key={member.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderTop: i > 0 ? "0.5px solid rgba(255,255,255,0.05)" : "none" }}
              >
                <div
                  className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm text-white overflow-hidden"
                  style={{ background: member.avatar_url ? "transparent" : GRADIENT, fontWeight: 500 }}
                >
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt={member.display_name} className="w-full h-full object-cover" />
                  ) : (
                    member.display_name[0]?.toUpperCase() ?? "?"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white truncate" style={{ fontWeight: member.user_id === user?.id ? 500 : 400 }}>
                      {member.display_name}
                      {member.user_id === user?.id && (
                        <span className="text-white/30 text-xs ml-1">(you)</span>
                      )}
                    </p>
                    {member.role === "admin" && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: "rgba(139,92,246,0.2)", color: "#8B5CF6" }}
                      >
                        admin
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-white" style={{ fontWeight: 500 }}>
                    {weeklyStats[member.user_id] ?? 0}
                  </p>
                  <p className="text-[10px] text-white/25">this week</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div>
          <p className="text-xs text-white/40 mb-3 uppercase tracking-wide">Activity</p>
          {activity.length === 0 ? (
            <p className="text-xs text-white/20 text-center py-8">No activity yet — complete a meditation to see it here</p>
          ) : (
            <div className="flex flex-col gap-2">
              {activity.map((event) => {
                const reactions = activityReactions[event.id] ?? [];
                return (
                  <div
                    key={event.id}
                    className="rounded-[10px] px-4 py-3"
                    style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.06)" }}
                  >
                    {/* Activity text row */}
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: GRADIENT }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/70">{formatActivity(event)}</p>
                      </div>
                      <p className="text-[11px] text-white/25 shrink-0 mt-0.5">{timeAgo(event.created_at)}</p>
                    </div>

                    {/* Emoji reaction pills */}
                    <div className="flex items-center gap-1.5 mt-2.5 flex-wrap pl-5">
                      {ACTIVITY_EMOJIS.map((emoji) => {
                        const r = reactions.find((x) => x.emoji === emoji);
                        const isReacted = r?.userReacted ?? false;
                        return (
                          <div
                            key={emoji}
                            className="flex items-center rounded-lg text-xs overflow-hidden"
                            style={{
                              backgroundColor: isReacted ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.03)",
                              border: `0.5px solid ${isReacted ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.06)"}`,
                            }}
                          >
                            {/* Emoji — tap to react or unreact */}
                            <button
                              onClick={() => handleCrewReact(event.id, emoji, isReacted)}
                              className="px-1.5 py-0.5 transition-opacity hover:opacity-70"
                              style={{ color: isReacted ? "#C4B5FD" : "rgba(255,255,255,0.3)" }}
                            >
                              {emoji}
                            </button>
                            {/* Count — tap to see who reacted */}
                            {r && r.count > 0 && (
                              <button
                                onClick={() => {
                                  setReactorPopover({ activityId: event.id, emoji });
                                  fetchReactors(event.id, emoji);
                                }}
                                className="pr-1.5 py-0.5 transition-opacity hover:opacity-70"
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
                );
              })}
            </div>
          )}
        </div>

      </div>

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

            {reactorLoading && (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-purple-400 animate-spin" />
              </div>
            )}

            {!reactorLoading && reactorNames.length > 0 && (
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {reactorNames.map((name, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs text-white"
                      style={{ background: GRADIENT, fontWeight: 500 }}
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
