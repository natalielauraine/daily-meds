"use client";

// /brand-crews/[id] — individual brand crew page.
// Public page — anyone can view, login required to join.

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { type BrandCrew, type BrandCrewMember, timeAgo } from "../../../lib/brand-crews";

const GRADIENT = "linear-gradient(135deg, #F43F5E 0%, #EC4899 20%, #D946EF 35%, #F97316 65%, #EAB308 85%, #FACC15 100%)";

export default function BrandCrewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const crewId = params?.id as string;
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [crew, setCrew] = useState<BrandCrew | null>(null);
  const [members, setMembers] = useState<BrandCrewMember[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);

      const { data: crewData } = await supabase
        .from("brand_crews")
        .select("*")
        .eq("id", crewId)
        .eq("is_verified", true)
        .single();

      if (!crewData) { setError("Brand crew not found."); setLoading(false); return; }
      setCrew(crewData);

      // Latest 12 members for display
      const { data: membersData, count } = await supabase
        .from("brand_crew_members")
        .select("*", { count: "exact" })
        .eq("brand_crew_id", crewId)
        .order("joined_at", { ascending: false })
        .limit(12);

      setMembers(membersData ?? []);
      setMemberCount(count ?? 0);

      if (u) {
        const { data: membership } = await supabase
          .from("brand_crew_members")
          .select("id")
          .eq("brand_crew_id", crewId)
          .eq("user_id", u.id)
          .maybeSingle();
        setIsMember(!!membership);
      }

      setLoading(false);
    }
    load();
  }, [crewId]);

  async function handleJoin() {
    if (!user) { router.push("/login"); return; }
    setJoining(true);

    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Anonymous";

    await supabase.from("brand_crew_members").upsert(
      {
        brand_crew_id: crewId,
        user_id: user.id,
        display_name: displayName,
        avatar_url: user.user_metadata?.avatar_url ?? null,
      },
      { onConflict: "brand_crew_id,user_id" }
    );

    setIsMember(true);
    setMemberCount((c) => c + 1);
    setJoining(false);
  }

  async function handleLeave() {
    if (!user) return;
    setLeaving(true);
    await supabase
      .from("brand_crew_members")
      .delete()
      .eq("brand_crew_id", crewId)
      .eq("user_id", user.id);
    setIsMember(false);
    setMemberCount((c) => Math.max(0, c - 1));
    setLeaving(false);
  }

  function copyInviteLink() {
    const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    navigator.clipboard.writeText(`${base}/brand-crews/${crewId}`);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
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

  if (error || !crew) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-white/40 text-sm mb-4">{error || "Crew not found."}</p>
            <Link href="/brand-crews" className="text-sm text-[#8B5CF6] hover:opacity-80">← All brand crews</Link>
          </div>
        </div>
      </div>
    );
  }

  const socialLinks = crew.social_links ?? {};

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">

        {/* Back */}
        <Link href="/brand-crews" className="inline-flex items-center gap-1.5 text-sm text-white/35 hover:text-white/60 transition-colors mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          All brand crews
        </Link>

        {/* Hero card */}
        <div
          className="rounded-[12px] p-6 mb-6"
          style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-start gap-4 mb-4">
            {/* Logo */}
            <div
              className="w-16 h-16 rounded-[12px] flex items-center justify-center text-2xl text-white shrink-0 overflow-hidden"
              style={{ background: GRADIENT, fontWeight: 500 }}
            >
              {crew.logo_url ? (
                <img src={crew.logo_url} alt={crew.name} className="w-full h-full object-cover" />
              ) : (
                crew.name[0]?.toUpperCase()
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl text-white" style={{ fontWeight: 500 }}>{crew.name}</h1>
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "rgba(34,197,94,0.15)" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-[10px] text-green-400">Verified</span>
                </div>
              </div>
              {crew.brand_type && (
                <p className="text-xs text-white/30 uppercase tracking-wide mb-1">{crew.brand_type}</p>
              )}
              <p className="text-xs text-white/35">{memberCount.toLocaleString()} member{memberCount !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {crew.description && (
            <p className="text-sm text-white/55 leading-relaxed mb-5">{crew.description}</p>
          )}

          {/* Social links */}
          {(socialLinks.instagram || socialLinks.tiktok || socialLinks.facebook || socialLinks.twitter || crew.website_url) && (
            <div className="flex flex-wrap gap-2 mb-5">
              {crew.website_url && (
                <a href={crew.website_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white transition-colors"
                  style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                  Website
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white transition-colors"
                  style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}>
                  Instagram
                </a>
              )}
              {socialLinks.tiktok && (
                <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white transition-colors"
                  style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}>
                  TikTok
                </a>
              )}
            </div>
          )}

          {/* Join / Leave / Share */}
          <div className="flex gap-2">
            {isMember ? (
              <>
                <div
                  className="flex-1 py-2.5 rounded-lg text-sm text-green-400 text-center"
                  style={{ border: "0.5px solid rgba(34,197,94,0.25)" }}
                >
                  You&apos;re in the crew ✓
                </div>
                <button
                  onClick={copyInviteLink}
                  className="px-4 py-2.5 rounded-lg text-xs text-white/50 hover:text-white transition-colors"
                  style={{ border: "0.5px solid rgba(255,255,255,0.12)" }}
                >
                  {inviteCopied ? "Copied!" : "Share"}
                </button>
                <button
                  onClick={handleLeave}
                  disabled={leaving}
                  className="px-4 py-2.5 rounded-lg text-xs text-white/30 hover:text-red-400 transition-colors"
                  style={{ border: "0.5px solid rgba(255,255,255,0.08)" }}
                >
                  Leave
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="flex-1 py-2.5 rounded-lg text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ background: GRADIENT, fontWeight: 500 }}
                >
                  {joining ? "Joining…" : "Join this crew"}
                </button>
                <button
                  onClick={copyInviteLink}
                  className="px-4 py-2.5 rounded-lg text-xs text-white/50 hover:text-white transition-colors"
                  style={{ border: "0.5px solid rgba(255,255,255,0.12)" }}
                >
                  {inviteCopied ? "Copied!" : "Share"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Recent members */}
        {members.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-white/40 mb-3 uppercase tracking-wide">
              Recent members
            </p>
            <div
              className="rounded-[10px] p-4"
              style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex flex-wrap gap-3">
                {members.map((m) => (
                  <div key={m.id} className="flex flex-col items-center gap-1">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs text-white overflow-hidden"
                      style={{ background: m.avatar_url ? "transparent" : GRADIENT, fontWeight: 500 }}
                    >
                      {m.avatar_url ? (
                        <img src={m.avatar_url} alt={m.display_name} className="w-full h-full object-cover" />
                      ) : (
                        m.display_name[0]?.toUpperCase() ?? "?"
                      )}
                    </div>
                    <span className="text-[10px] text-white/30 max-w-[40px] truncate text-center">
                      {m.display_name}
                    </span>
                  </div>
                ))}
                {memberCount > 12 && (
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs text-white/40"
                      style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}
                    >
                      +{memberCount - 12}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Group Meds CTA */}
        <Link
          href="/rooms"
          className="flex items-center justify-between rounded-[10px] p-4 transition-opacity hover:opacity-80"
          style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          <div>
            <p className="text-sm text-white" style={{ fontWeight: 500 }}>Meditate together</p>
            <p className="text-xs text-white/35 mt-0.5">Join or schedule a Group Med</p>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" opacity={0.3}>
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </Link>

      </main>

      <Footer />
    </div>
  );
}
