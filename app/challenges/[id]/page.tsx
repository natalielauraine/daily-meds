"use client";

// /challenges/[id] — challenge detail page.
// Shows user's progress, leaderboard, share button and abandon option.

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  type Challenge,
  type ChallengeParticipant,
  challengeGradient,
  daysRemaining,
  progressPercent,
  progressLabel,
  TYPE_ICONS,
  TYPE_LABELS,
} from "../../../lib/challenges";

export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params?.id as string;
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([]);
  const [myParticipation, setMyParticipation] = useState<ChallengeParticipant | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [abandoning, setAbandoning] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);

      const { data: c } = await supabase
        .from("challenges")
        .select("*")
        .eq("id", challengeId)
        .single();

      if (!c) { setError("Challenge not found."); setLoading(false); return; }
      setChallenge(c);

      const { data: parts } = await supabase
        .from("challenge_participants")
        .select("*")
        .eq("challenge_id", challengeId)
        .order("progress_value", { ascending: false });

      setParticipants(parts ?? []);
      if (u) {
        setMyParticipation((parts ?? []).find((p) => p.user_id === u.id) ?? null);
      }

      setLoading(false);
    }
    load();
  }, [challengeId]);

  // Realtime: participant progress updates
  useEffect(() => {
    if (!challengeId) return;
    const channel = supabase
      .channel(`challenge:${challengeId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "challenge_participants", filter: `challenge_id=eq.${challengeId}` },
        () => {
          supabase
            .from("challenge_participants")
            .select("*")
            .eq("challenge_id", challengeId)
            .order("progress_value", { ascending: false })
            .then(({ data }) => {
              setParticipants(data ?? []);
              if (user) setMyParticipation((data ?? []).find((p) => p.user_id === user.id) ?? null);
            });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [challengeId, user]);

  async function handleJoin() {
    if (!user || !challenge) { router.push("/login"); return; }
    setJoining(true);
    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Anonymous";

    const { data: p } = await supabase
      .from("challenge_participants")
      .upsert(
        { challenge_id: challengeId, user_id: user.id, display_name: displayName },
        { onConflict: "challenge_id,user_id" }
      )
      .select()
      .single();

    if (p) setMyParticipation(p);
    setJoining(false);
  }

  async function handleAbandon() {
    if (!user || !confirm("Abandon this challenge? Your progress will be lost.")) return;
    setAbandoning(true);
    await supabase
      .from("challenge_participants")
      .delete()
      .eq("challenge_id", challengeId)
      .eq("user_id", user.id);
    router.push("/challenges");
  }

  function handleShare() {
    const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const url = `${base}/challenges/${challengeId}`;
    const progress = myParticipation
      ? `I'm ${progressPercent(myParticipation.progress_value, challenge!.target_value)}% through the "${challenge?.title}" challenge on Daily Meds`
      : `Check out the "${challenge?.title}" challenge on Daily Meds`;

    if (navigator.share) {
      navigator.share({ title: challenge?.title ?? "Daily Meds Challenge", text: progress, url });
    } else {
      navigator.clipboard.writeText(`${progress} — ${url}`);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#131313" }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-pink-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#131313" }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-white/40 text-sm mb-4">{error || "Challenge not found."}</p>
            <Link href="/challenges" className="text-sm text-[#ff41b3]">← All challenges</Link>
          </div>
        </div>
      </div>
    );
  }

  const gradient = challengeGradient(challenge);
  const progress = myParticipation ? progressPercent(myParticipation.progress_value, challenge.target_value) : 0;
  const remaining = myParticipation ? daysRemaining(myParticipation.started_at, challenge.duration_days) : challenge.duration_days;

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#131313" }}>
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">

        {/* Back */}
        <Link href="/challenges" className="inline-flex items-center gap-1.5 text-sm text-white/35 hover:text-white/60 transition-colors mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Challenges
        </Link>

        {/* Challenge header */}
        <div
          className="rounded-[12px] p-6 mb-6"
          style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center text-2xl"
              style={{ background: gradient }}
            >
              {TYPE_ICONS[challenge.challenge_type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl text-white" style={{ fontWeight: 500 }}>{challenge.title}</h1>
                {challenge.is_official && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "rgba(255,65,179,0.2)", color: "#ff41b3" }}
                  >
                    Official
                  </span>
                )}
              </div>
              <p className="text-xs text-white/30">
                {TYPE_LABELS[challenge.challenge_type]} · {challenge.duration_days} days · {participants.length} participants
              </p>
            </div>
          </div>

          {challenge.description && (
            <p className="text-sm text-white/50 leading-relaxed mb-5">{challenge.description}</p>
          )}

          {/* My progress */}
          {myParticipation ? (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-white/50">{progressLabel(challenge, myParticipation.progress_value)}</p>
                <p className="text-xs text-white/40">{remaining}d remaining</p>
              </div>
              <div className="h-2 w-full rounded-full mb-1" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progress}%`, background: gradient }}
                />
              </div>
              <p className="text-xs text-right" style={{ color: progress === 100 ? "#4ADE80" : "rgba(255,255,255,0.25)" }}>
                {progress === 100 ? "Complete! 🎉" : `${progress}% done`}
              </p>
            </div>
          ) : (
            <div
              className="rounded-lg p-3 mb-5 text-center"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}
            >
              <p className="text-xs text-white/30">You haven&apos;t joined this challenge yet</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {!myParticipation ? (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="flex-1 py-2.5 rounded-lg text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ background: gradient, fontWeight: 500 }}
              >
                {joining ? "Joining…" : "Join Challenge"}
              </button>
            ) : (
              <>
                <button
                  onClick={handleShare}
                  className="flex-1 py-2.5 rounded-lg text-sm text-white transition-opacity hover:opacity-80"
                  style={{ background: gradient, fontWeight: 500 }}
                >
                  {shareCopied ? "Link copied!" : "Share my progress"}
                </button>
                {!myParticipation.completed && (
                  <button
                    onClick={handleAbandon}
                    disabled={abandoning}
                    className="px-4 py-2.5 rounded-lg text-sm text-white/30 hover:text-red-400 transition-colors"
                    style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}
                  >
                    Abandon
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        {participants.length > 0 && (
          <div>
            <p className="text-xs text-white/40 mb-3 uppercase tracking-wide">
              {participants.length > 1 ? "Leaderboard" : "Participants"}
            </p>
            <div
              className="rounded-[10px] overflow-hidden"
              style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)" }}
            >
              {participants.map((p, i) => {
                const pProgress = progressPercent(p.progress_value, challenge.target_value);
                const isMe = p.user_id === user?.id;
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{
                      borderTop: i > 0 ? "0.5px solid rgba(255,255,255,0.05)" : "none",
                      backgroundColor: isMe ? "rgba(255,65,179,0.05)" : "transparent",
                    }}
                  >
                    {/* Rank */}
                    <p
                      className="text-sm w-6 text-center shrink-0"
                      style={{ color: i === 0 ? "#f4e71d" : i === 1 ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)", fontWeight: 500 }}
                    >
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                    </p>

                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs text-white"
                      style={{ background: gradient, fontWeight: 500 }}
                    >
                      {p.display_name[0]?.toUpperCase() ?? "?"}
                    </div>

                    {/* Name + progress bar */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate" style={{ fontWeight: isMe ? 500 : 400 }}>
                        {p.display_name}{isMe && <span className="text-white/30 text-xs ml-1">(you)</span>}
                        {p.completed && <span className="text-green-400 text-xs ml-1">✓</span>}
                      </p>
                      <div className="h-1 w-full rounded-full mt-1" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pProgress}%`, background: gradient }}
                        />
                      </div>
                    </div>

                    {/* Progress value */}
                    <p className="text-xs text-white/40 shrink-0">{p.progress_value}/{challenge.target_value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
