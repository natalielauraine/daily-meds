"use client";

// /brand-crews — public page showing all verified brand crews.
// Anyone can view. Login required to join.

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { type BrandCrew, type BrandCrewMember } from "../../lib/brand-crews";

const GRADIENT = "linear-gradient(135deg, #ff41b3 0%, #ff41b3 20%, #ff41b3 35%, #ec723d 65%, #f4e71d 85%, #f4e71d 100%)";

type BrandCrewWithCount = BrandCrew & { memberCount: number; isMember: boolean };

export default function BrandCrewsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [crews, setCrews] = useState<BrandCrewWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);

      // Fetch all verified brand crews
      const { data: crewData } = await supabase
        .from("brand_crews")
        .select("*")
        .eq("is_verified", true)
        .order("created_at", { ascending: false });

      if (!crewData) { setLoading(false); return; }

      // Get member counts and check if the current user is already a member
      const enriched = await Promise.all(
        crewData.map(async (crew) => {
          const { count } = await supabase
            .from("brand_crew_members")
            .select("*", { count: "exact", head: true })
            .eq("brand_crew_id", crew.id);

          let isMember = false;
          if (u) {
            const { data: membership } = await supabase
              .from("brand_crew_members")
              .select("id")
              .eq("brand_crew_id", crew.id)
              .eq("user_id", u.id)
              .maybeSingle();
            isMember = !!membership;
          }

          return { ...crew, memberCount: count ?? 0, isMember };
        })
      );

      setCrews(enriched);
      setLoading(false);
    }
    load();
  }, []);

  async function handleJoin(crew: BrandCrewWithCount) {
    if (!user) { router.push("/login"); return; }
    setJoiningId(crew.id);

    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Anonymous";

    await supabase.from("brand_crew_members").upsert(
      {
        brand_crew_id: crew.id,
        user_id: user.id,
        display_name: displayName,
        avatar_url: user.user_metadata?.avatar_url ?? null,
      },
      { onConflict: "brand_crew_id,user_id" }
    );

    // Update local state immediately
    setCrews((prev) =>
      prev.map((c) =>
        c.id === crew.id ? { ...c, isMember: true, memberCount: c.memberCount + 1 } : c
      )
    );
    setJoiningId(null);
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#131313" }}>
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">

        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: GRADIENT }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white" opacity={0.9}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-2xl text-white mb-2" style={{ fontWeight: 500 }}>Brand Crews</h1>
          <p className="text-sm text-white/40 max-w-md mx-auto">
            Meditate with the communities you love. Join a crew from a festival, brand or organisation you're part of.
          </p>
        </div>

        {/* Brand crew grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-pink-400 animate-spin" />
          </div>
        ) : crews.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/30 text-sm">No brand crews yet — check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {crews.map((crew) => (
              <div
                key={crew.id}
                className="rounded-[12px] p-6 flex flex-col"
                style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)" }}
              >
                {/* Logo */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-[10px] flex items-center justify-center text-white text-lg overflow-hidden shrink-0"
                    style={{ background: GRADIENT, fontWeight: 500 }}
                  >
                    {crew.logo_url ? (
                      <img src={crew.logo_url} alt={crew.name} className="w-full h-full object-cover" />
                    ) : (
                      crew.name[0]?.toUpperCase()
                    )}
                  </div>
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "rgba(34,197,94,0.15)" }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-[10px] text-green-400">Verified</span>
                  </div>
                </div>

                {/* Name + description */}
                <h2 className="text-white text-base mb-1" style={{ fontWeight: 500 }}>{crew.name}</h2>
                {crew.brand_type && (
                  <p className="text-[11px] text-white/30 mb-2 uppercase tracking-wide">{crew.brand_type}</p>
                )}
                <p className="text-xs text-white/45 leading-relaxed mb-4 flex-1">
                  {crew.description ?? "A brand crew on Daily Meds."}
                </p>

                {/* Member count */}
                <p className="text-xs text-white/30 mb-4">
                  {crew.memberCount.toLocaleString()} member{crew.memberCount !== 1 ? "s" : ""}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/brand-crews/${crew.id}`}
                    className="flex-1 py-2 rounded-lg text-xs text-white/60 text-center transition-colors hover:text-white"
                    style={{ border: "0.5px solid rgba(255,255,255,0.12)" }}
                  >
                    View crew
                  </Link>
                  {crew.isMember ? (
                    <div
                      className="flex-1 py-2 rounded-lg text-xs text-green-400 text-center"
                      style={{ border: "0.5px solid rgba(34,197,94,0.2)" }}
                    >
                      Joined ✓
                    </div>
                  ) : (
                    <button
                      onClick={() => handleJoin(crew)}
                      disabled={joiningId === crew.id}
                      className="flex-1 py-2 rounded-lg text-xs text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                      style={{ background: GRADIENT, fontWeight: 500 }}
                    >
                      {joiningId === crew.id ? "Joining…" : "Join crew"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Apply CTA */}
        <div
          className="rounded-[12px] p-6 text-center"
          style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-sm text-white mb-1" style={{ fontWeight: 500 }}>Are you a brand or festival?</p>
          <p className="text-xs text-white/40 mb-4">Create a branded crew for your audience and meditate together.</p>
          <Link
            href="/partnerships"
            className="inline-block px-6 py-2.5 rounded-lg text-sm text-white transition-opacity hover:opacity-80"
            style={{ background: GRADIENT, fontWeight: 500 }}
          >
            Apply to create a Brand Crew
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
