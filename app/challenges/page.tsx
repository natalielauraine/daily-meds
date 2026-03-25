"use client";

// /challenges — the main challenges hub.
// Shows active, official and community challenges.
// Users can join challenges or create their own.

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  type Challenge,
  type ChallengeParticipant,
  challengeGradient,
  daysRemaining,
  progressPercent,
  progressLabel,
  TYPE_ICONS,
  TYPE_LABELS,
} from "../../lib/challenges";

type ChallengeWithMeta = Challenge & {
  participantCount: number;
  participation: ChallengeParticipant | null;
};

export default function ChallengesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [active, setActive] = useState<ChallengeWithMeta[]>([]);
  const [official, setOfficial] = useState<ChallengeWithMeta[]>([]);
  const [community, setCommunity] = useState<ChallengeWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  // Create challenge modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    challenge_type: "sessions",
    target_value: "7",
    duration_days: "30",
    is_public: true,
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
      await fetchChallenges(u?.id ?? null);
      setLoading(false);
    }
    load();
  }, []);

  async function fetchChallenges(userId: string | null) {
    // Fetch all visible challenges
    const { data: allChallenges } = await supabase
      .from("challenges")
      .select("*")
      .order("is_official", { ascending: false })
      .order("created_at", { ascending: false });

    if (!allChallenges) return;

    // Fetch user's participations
    let participations: ChallengeParticipant[] = [];
    if (userId) {
      const { data } = await supabase
        .from("challenge_participants")
        .select("*")
        .eq("user_id", userId);
      participations = data ?? [];
    }

    // Fetch participant counts for all challenges
    const counts: Record<string, number> = {};
    await Promise.all(
      allChallenges.map(async (c) => {
        const { count } = await supabase
          .from("challenge_participants")
          .select("*", { count: "exact", head: true })
          .eq("challenge_id", c.id);
        counts[c.id] = count ?? 0;
      })
    );

    // Build enriched list
    const enriched: ChallengeWithMeta[] = allChallenges.map((c) => ({
      ...c,
      participantCount: counts[c.id] ?? 0,
      participation: participations.find((p) => p.challenge_id === c.id) ?? null,
    }));

    // Split into buckets
    setActive(enriched.filter((c) => c.participation && !c.participation.completed));
    setOfficial(enriched.filter((c) => c.is_official && !c.participation));
    setCommunity(enriched.filter((c) => !c.is_official && !c.participation));
  }

  async function handleJoin(challenge: ChallengeWithMeta) {
    if (!user) { router.push("/login"); return; }

    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Anonymous";

    await supabase.from("challenge_participants").upsert(
      { challenge_id: challenge.id, user_id: user.id, display_name: displayName },
      { onConflict: "challenge_id,user_id" }
    );

    router.push(`/challenges/${challenge.id}`);
  }

  function updateForm(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreate() {
    if (!form.title.trim() || !user) return;
    setCreating(true);
    setCreateError("");

    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Anonymous";

    const { data: challenge, error: cErr } = await supabase
      .from("challenges")
      .insert({
        title: form.title.trim(),
        description: form.description.trim() || null,
        challenge_type: form.challenge_type,
        target_value: parseInt(form.target_value) || 7,
        duration_days: parseInt(form.duration_days) || 30,
        is_official: false,
        is_public: form.is_public,
        created_by: user.id,
      })
      .select()
      .single();

    if (cErr || !challenge) {
      setCreateError(cErr?.message ?? "Could not create challenge");
      setCreating(false);
      return;
    }

    // Auto-join the creator
    await supabase.from("challenge_participants").insert({
      challenge_id: challenge.id,
      user_id: user.id,
      display_name: displayName,
    });

    router.push(`/challenges/${challenge.id}`);
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

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl text-white" style={{ fontWeight: 500 }}>Challenges</h1>
            <p className="text-xs text-white/40 mt-0.5">Build your meditation habit, one challenge at a time</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-lg text-sm text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
          >
            + Create
          </button>
        </div>

        {/* Active challenges */}
        {active.length > 0 && (
          <section className="mb-10">
            <p className="text-xs text-white/40 mb-4 uppercase tracking-wide">Active Challenges</p>
            <div className="flex flex-col gap-3">
              {active.map((c) => (
                <ChallengeCard key={c.id} challenge={c} onJoin={handleJoin} showProgress />
              ))}
            </div>
          </section>
        )}

        {/* Official challenges */}
        {official.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <p className="text-xs text-white/40 uppercase tracking-wide">Official Challenges</p>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "rgba(139,92,246,0.2)", color: "#8B5CF6" }}
              >
                by Daily Meds
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {official.map((c) => (
                <ChallengeCard key={c.id} challenge={c} onJoin={handleJoin} />
              ))}
            </div>
          </section>
        )}

        {/* Community challenges */}
        {community.length > 0 && (
          <section className="mb-8">
            <p className="text-xs text-white/40 mb-4 uppercase tracking-wide">Community Challenges</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {community.map((c) => (
                <ChallengeCard key={c.id} challenge={c} onJoin={handleJoin} />
              ))}
            </div>
          </section>
        )}

        {/* Completed challenges notice */}
        {active.length === 0 && official.length === 0 && community.length === 0 && (
          <div className="text-center py-16">
            <p className="text-2xl mb-3">🎯</p>
            <p className="text-white/30 text-sm mb-1">No challenges yet</p>
            <p className="text-white/20 text-xs">Create one or check back soon for official challenges</p>
          </div>
        )}

      </main>

      <Footer />

      {/* Create challenge modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
          style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}
        >
          <div
            className="w-full max-w-md rounded-[14px] p-6 max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.12)" }}
          >
            <h2 className="text-white text-base mb-5" style={{ fontWeight: 500 }}>Create a Challenge</h2>

            <div className="flex flex-col gap-4">

              <div>
                <label className="block text-xs text-white/40 mb-1.5">Challenge title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  placeholder="e.g. My 14 Day Focus Challenge"
                  maxLength={80}
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}
                />
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="What's this challenge about?"
                  rows={2}
                  maxLength={300}
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none resize-none"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}
                />
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-1.5">Challenge type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["sessions", "days", "minutes", "mood"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateForm("challenge_type", type)}
                      className="py-2.5 px-3 rounded-lg text-xs text-left transition-colors"
                      style={{
                        backgroundColor: form.challenge_type === type ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.04)",
                        border: `0.5px solid ${form.challenge_type === type ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
                        color: form.challenge_type === type ? "#C4B5FD" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      <span className="mr-1.5">{TYPE_ICONS[type]}</span>
                      {TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Target</label>
                  <input
                    type="number"
                    value={form.target_value}
                    onChange={(e) => updateForm("target_value", e.target.value)}
                    min={1}
                    max={365}
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", colorScheme: "dark" }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Duration (days)</label>
                  <input
                    type="number"
                    value={form.duration_days}
                    onChange={(e) => updateForm("duration_days", e.target.value)}
                    min={1}
                    max={365}
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", colorScheme: "dark" }}
                  />
                </div>
              </div>

              {/* Public / Private */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Public challenge</p>
                  <p className="text-xs text-white/30">Others can discover and join this</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateForm("is_public", !form.is_public)}
                  className="w-11 h-6 rounded-full transition-colors relative"
                  style={{ backgroundColor: form.is_public ? "#8B5CF6" : "rgba(255,255,255,0.1)" }}
                >
                  <div
                    className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all"
                    style={{ left: form.is_public ? "calc(100% - 20px)" : "4px" }}
                  />
                </button>
              </div>

              {createError && <p className="text-xs text-red-400">{createError}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm text-white/50 transition-colors hover:text-white"
                  style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !form.title.trim()}
                  className="flex-1 py-2.5 rounded-lg text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                  style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
                >
                  {creating ? "Creating…" : "Create & Join"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CHALLENGE CARD ────────────────────────────────────────────────────────────

function ChallengeCard({
  challenge,
  onJoin,
  showProgress = false,
}: {
  challenge: ChallengeWithMeta;
  onJoin: (c: ChallengeWithMeta) => void;
  showProgress?: boolean;
}) {
  const gradient = challengeGradient(challenge);
  const participation = challenge.participation;
  const progress = participation ? progressPercent(participation.progress_value, challenge.target_value) : 0;
  const remaining = participation ? daysRemaining(participation.started_at, challenge.duration_days) : challenge.duration_days;

  return (
    <Link
      href={`/challenges/${challenge.id}`}
      className="block rounded-[10px] p-5 transition-all hover:scale-[1.01]"
      style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
    >
      {/* Top row */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-lg"
          style={{ background: gradient }}
        >
          {TYPE_ICONS[challenge.challenge_type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h3 className="text-sm text-white" style={{ fontWeight: 500 }}>{challenge.title}</h3>
            {challenge.is_official && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: "rgba(139,92,246,0.2)", color: "#8B5CF6" }}
              >
                Official
              </span>
            )}
            {participation?.completed && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: "rgba(34,197,94,0.2)", color: "#4ADE80" }}
              >
                Completed ✓
              </span>
            )}
          </div>
          <p className="text-xs text-white/35 line-clamp-2">{challenge.description}</p>
        </div>
      </div>

      {/* Progress bar — shown for active challenges */}
      {showProgress && participation && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-white/40">{progressLabel(challenge, participation.progress_value)}</p>
            <p className="text-xs text-white/30">{progress}%</p>
          </div>
          <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%`, background: gradient }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <p className="text-xs text-white/30">
            {challenge.participantCount} joined
          </p>
          {showProgress && participation ? (
            <p className="text-xs text-white/25">{remaining}d left</p>
          ) : (
            <p className="text-xs text-white/25">{challenge.duration_days} days</p>
          )}
        </div>

        {!participation && (
          <button
            onClick={(e) => { e.preventDefault(); onJoin(challenge); }}
            className="px-3 py-1.5 rounded-lg text-xs text-white transition-opacity hover:opacity-80"
            style={{ background: gradient, fontWeight: 500 }}
          >
            Join
          </button>
        )}
      </div>
    </Link>
  );
}
