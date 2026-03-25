"use client";

// /crew — the user's crew hub.
// Shows all crews they belong to, lets them create a new crew or join one by invite code.

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { generateCrewCode, formatActivity, timeAgo, type Crew, type CrewActivity } from "../../lib/crews";

type CrewWithMeta = Crew & {
  memberCount: number;
  latestActivity: string;
};

export default function CrewPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [crews, setCrews] = useState<CrewWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  // Create crew modal
  const [showCreate, setShowCreate] = useState(false);
  const [crewName, setCrewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Join crew by code
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.push("/login"); return; }
      setUser(u);
      await fetchCrews(u.id);
      setLoading(false);
    }
    load();
  }, []);

  // Fetch all crews the user belongs to, with member count and latest activity
  async function fetchCrews(userId: string) {
    const { data: memberships } = await supabase
      .from("crew_members")
      .select("crew_id")
      .eq("user_id", userId);

    if (!memberships?.length) { setCrews([]); return; }

    const crewIds = memberships.map((m) => m.crew_id);

    const { data: crewData } = await supabase
      .from("crews")
      .select("*")
      .in("id", crewIds)
      .order("created_at", { ascending: false });

    if (!crewData) { setCrews([]); return; }

    // Enrich each crew with member count and latest activity text
    const enriched = await Promise.all(
      crewData.map(async (crew) => {
        const { count } = await supabase
          .from("crew_members")
          .select("*", { count: "exact", head: true })
          .eq("crew_id", crew.id);

        const { data: latest } = await supabase
          .from("crew_activity")
          .select("*")
          .eq("crew_id", crew.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        let latestActivity = "No activity yet";
        if (latest) {
          latestActivity = `${formatActivity(latest as CrewActivity)} · ${timeAgo(latest.created_at)}`;
        }

        return { ...crew, memberCount: count ?? 0, latestActivity };
      })
    );

    setCrews(enriched);
  }

  // Create a new crew — creator becomes admin member
  async function handleCreate() {
    if (!crewName.trim() || !user) return;
    setCreating(true);
    setCreateError("");

    const inviteCode = generateCrewCode();
    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Anonymous";

    const { data: crew, error: crewErr } = await supabase
      .from("crews")
      .insert({ name: crewName.trim(), invite_code: inviteCode, created_by: user.id })
      .select()
      .single();

    if (crewErr || !crew) {
      setCreateError(crewErr?.message ?? "Could not create crew");
      setCreating(false);
      return;
    }

    // Add creator as admin
    await supabase.from("crew_members").insert({
      crew_id: crew.id,
      user_id: user.id,
      display_name: displayName,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      role: "admin",
    });

    // Post "joined" activity
    await supabase.from("crew_activity").insert({
      crew_id: crew.id,
      user_id: user.id,
      display_name: displayName,
      activity_type: "joined",
      metadata: {},
    });

    router.push(`/crew/${crew.id}`);
  }

  // Join a crew by entering an invite code
  async function handleJoin() {
    if (!joinCode.trim() || !user) return;
    setJoining(true);
    setJoinError("");

    const { data: crew, error: crewErr } = await supabase
      .from("crews")
      .select("*")
      .eq("invite_code", joinCode.trim().toUpperCase())
      .maybeSingle();

    if (crewErr || !crew) {
      setJoinError("Crew not found — check the invite code and try again.");
      setJoining(false);
      return;
    }

    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Anonymous";

    const { error: joinErr } = await supabase.from("crew_members").upsert(
      {
        crew_id: crew.id,
        user_id: user.id,
        display_name: displayName,
        avatar_url: user.user_metadata?.avatar_url ?? null,
        role: "member",
      },
      { onConflict: "crew_id,user_id" }
    );

    if (joinErr) {
      setJoinError(joinErr.message);
      setJoining(false);
      return;
    }

    // Post "joined" activity
    await supabase.from("crew_activity").insert({
      crew_id: crew.id,
      user_id: user.id,
      display_name: displayName,
      activity_type: "joined",
      metadata: {},
    });

    router.push(`/crew/${crew.id}`);
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-purple-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl text-white" style={{ fontWeight: 500 }}>My Crew</h1>
            <p className="text-xs text-white/40 mt-0.5">Your private meditation groups</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-lg text-sm text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
          >
            + Create Crew
          </button>
        </div>

        {/* Join by invite code */}
        <div
          className="rounded-[10px] p-4 mb-6 flex items-center gap-3"
          style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter 8-character invite code..."
            maxLength={8}
            className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none tracking-widest font-mono"
          />
          <button
            onClick={handleJoin}
            disabled={joining || joinCode.trim().length < 8}
            className="px-4 py-2 rounded-lg text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-30"
            style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
          >
            {joining ? "Joining…" : "Join Crew"}
          </button>
        </div>
        {joinError && <p className="text-xs text-red-400 mb-4 -mt-3">{joinError}</p>}

        {/* Crew list */}
        {crews.length === 0 ? (
          <div className="text-center py-20">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #6B21E8, #8B3CF7, #6366F1, #3B82F6, #22D3EE)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white" opacity={0.9}>
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
            <p className="text-white/30 text-sm mb-1">No crews yet</p>
            <p className="text-white/20 text-xs">Create one or enter an invite code above</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {crews.map((crew) => (
              <Link
                key={crew.id}
                href={`/crew/${crew.id}`}
                className="block rounded-[10px] p-5 transition-all hover:scale-[1.01]"
                style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-white text-base" style={{ fontWeight: 500 }}>{crew.name}</h2>
                    <p className="text-xs text-white/30 mt-0.5">
                      {crew.memberCount} member{crew.memberCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #6B21E8, #8B3CF7, #6366F1, #3B82F6, #22D3EE)",
                      fontWeight: 500,
                    }}
                  >
                    {crew.name[0]?.toUpperCase()}
                  </div>
                </div>
                <p className="text-xs text-white/35">{crew.latestActivity}</p>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Create Crew modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowCreate(false); setCrewName(""); setCreateError(""); } }}
        >
          <div
            className="w-full max-w-sm rounded-[14px] p-6"
            style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.12)" }}
          >
            <h2 className="text-white text-base mb-1" style={{ fontWeight: 500 }}>Create a Crew</h2>
            <p className="text-xs text-white/35 mb-5">An 8-character invite code is generated automatically for you to share.</p>

            <label className="block text-xs text-white/40 mb-1.5">Crew name</label>
            <input
              type="text"
              value={crewName}
              onChange={(e) => setCrewName(e.target.value)}
              placeholder="e.g. Morning Meditators"
              maxLength={50}
              autoFocus
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none mb-5"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />

            {createError && <p className="text-xs text-red-400 mb-3">{createError}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => { setShowCreate(false); setCrewName(""); setCreateError(""); }}
                className="flex-1 py-2.5 rounded-lg text-sm text-white/50 transition-colors hover:text-white"
                style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !crewName.trim()}
                className="flex-1 py-2.5 rounded-lg text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
              >
                {creating ? "Creating…" : "Create Crew"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
