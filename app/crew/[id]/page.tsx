"use client";

// /crew/[id] — individual crew page.
// Shows members, activity feed, invite code and a link to schedule a Group Med.
// Privacy rule: never shows what session a member listened to — only activity type.

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import { formatActivity, timeAgo, type Crew, type CrewMember, type CrewActivity } from "../../../lib/crews";

const GRADIENT = "linear-gradient(135deg, #6B21E8 0%, #8B3CF7 25%, #6366F1 60%, #3B82F6 80%, #22D3EE 100%)";

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
      setActivity(activityData ?? []);

      // Count "completed" events per member this week (used as sessions this week)
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

  // Realtime: new activity events
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

    // Realtime: member list changes
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

    return () => {
      supabase.removeChannel(activityChannel);
      supabase.removeChannel(membersChannel);
    };
  }, [crewId]);

  // Copy the invite link to clipboard
  function copyInviteLink() {
    const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const url = `${base}/crew?invite=${crew?.invite_code}`;
    navigator.clipboard.writeText(url);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  }

  // Leave the crew
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

        {/* Invite section — shown when Invite is clicked */}
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
                {/* Avatar */}
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

                {/* Name + role */}
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

                {/* Sessions this week */}
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
              {activity.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 rounded-[10px] px-4 py-3"
                  style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.06)" }}
                >
                  {/* Activity dot */}
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: GRADIENT }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/70">{formatActivity(event)}</p>
                  </div>
                  <p className="text-[11px] text-white/25 shrink-0 mt-0.5">{timeAgo(event.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
