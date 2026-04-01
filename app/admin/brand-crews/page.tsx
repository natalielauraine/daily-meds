"use client";

// /admin/brand-crews — manage brand crew applications.
// Natalie can approve or reject applications here.
// Approving sets is_verified = true and sends an email to the brand.

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../../lib/supabase-browser";
import { type BrandCrew, BRAND_TYPES } from "../../../lib/brand-crews";

type BrandCrewWithCount = BrandCrew & { memberCount: number };

export default function AdminBrandCrewsPage() {
  const supabase = createClient();

  const [crews, setCrews] = useState<BrandCrewWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCrews();
  }, []);

  async function fetchCrews() {
    // Admin uses service role via API — but for listing we can use the anon client
    // since we'll add a service role policy. For now fetch all via a direct query.
    const { data } = await supabase
      .from("brand_crews")
      .select("*")
      .order("created_at", { ascending: false });

    if (!data) { setLoading(false); return; }

    const enriched = await Promise.all(
      data.map(async (crew) => {
        const { count } = await supabase
          .from("brand_crew_members")
          .select("*", { count: "exact", head: true })
          .eq("brand_crew_id", crew.id);
        return { ...crew, memberCount: count ?? 0 };
      })
    );

    setCrews(enriched);
    setLoading(false);
  }

  async function handleAction(crewId: string, action: "approve" | "reject") {
    setActionLoading(crewId);
    setMessage("");

    const res = await fetch("/api/admin/brand-crews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crewId, action }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(`Error: ${data.error}`);
    } else {
      setMessage(action === "approve" ? "Crew approved and email sent." : "Crew rejected.");
      // Update local state
      setCrews((prev) =>
        prev.map((c) =>
          c.id === crewId
            ? { ...c, status: action === "approve" ? "approved" : "rejected", is_verified: action === "approve" }
            : c
        )
      );
    }

    setActionLoading(null);
  }

  const filtered = filter === "all" ? crews : crews.filter((c) => c.status === filter);

  const counts = {
    pending: crews.filter((c) => c.status === "pending").length,
    approved: crews.filter((c) => c.status === "approved").length,
    rejected: crews.filter((c) => c.status === "rejected").length,
    all: crews.length,
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto" style={{ backgroundColor: "#131313" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-xs text-white/30 hover:text-white/60 mb-1 block">← Admin</Link>
          <h1 className="text-xl text-white" style={{ fontWeight: 500 }}>Brand Crew Applications</h1>
        </div>
        <Link
          href="/brand-crews"
          className="text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          View public page →
        </Link>
      </div>

      {message && (
        <div
          className="rounded-lg px-4 py-3 mb-6 text-sm"
          style={{
            backgroundColor: message.startsWith("Error") ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
            border: `0.5px solid ${message.startsWith("Error") ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
            color: message.startsWith("Error") ? "#F87171" : "#4ADE80",
          }}
        >
          {message}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["pending", "approved", "rejected", "all"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className="px-3 py-1.5 rounded-lg text-xs transition-colors capitalize"
            style={{
              backgroundColor: filter === tab ? "#ff41b3" : "rgba(255,255,255,0.05)",
              color: filter === tab ? "white" : "rgba(255,255,255,0.4)",
            }}
          >
            {tab} ({counts[tab]})
          </button>
        ))}
      </div>

      {/* Applications list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-pink-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-white/30 text-sm text-center py-16">No {filter} applications.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((crew) => (
            <div
              key={crew.id}
              className="rounded-[10px] p-5"
              style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h2 className="text-white text-base" style={{ fontWeight: 500 }}>{crew.name}</h2>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full capitalize"
                      style={{
                        backgroundColor:
                          crew.status === "approved" ? "rgba(34,197,94,0.15)" :
                          crew.status === "rejected" ? "rgba(239,68,68,0.15)" :
                          "rgba(234,179,8,0.15)",
                        color:
                          crew.status === "approved" ? "#4ADE80" :
                          crew.status === "rejected" ? "#F87171" :
                          "#FDE047",
                      }}
                    >
                      {crew.status}
                    </span>
                    {crew.brand_type && (
                      <span className="text-[10px] text-white/30 uppercase tracking-wide">{crew.brand_type}</span>
                    )}
                  </div>
                  <p className="text-xs text-white/40 mb-1">{crew.contact_email}</p>
                  {crew.website_url && (
                    <a href={crew.website_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-[#ff41b3] hover:opacity-80">{crew.website_url}</a>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-white" style={{ fontWeight: 500 }}>{crew.memberCount}</p>
                  <p className="text-[10px] text-white/25">members</p>
                </div>
              </div>

              {crew.description && (
                <p className="text-xs text-white/45 leading-relaxed mb-4">{crew.description}</p>
              )}

              {/* Social links */}
              {(crew.social_links?.instagram || crew.social_links?.tiktok) && (
                <div className="flex gap-3 mb-4">
                  {crew.social_links?.instagram && (
                    <a href={crew.social_links.instagram} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-white/30 hover:text-white/60">Instagram ↗</a>
                  )}
                  {crew.social_links?.tiktok && (
                    <a href={crew.social_links.tiktok} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-white/30 hover:text-white/60">TikTok ↗</a>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-[10px] text-white/20">
                  Applied {new Date(crew.created_at).toLocaleDateString("en-GB")}
                  {" · "}Code: <span className="font-mono">{crew.invite_code}</span>
                </p>

                {/* Approve / Reject buttons — only shown for pending */}
                {crew.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(crew.id, "reject")}
                      disabled={actionLoading === crew.id}
                      className="px-3 py-1.5 rounded-lg text-xs text-red-400 transition-colors hover:bg-red-400/10 disabled:opacity-40"
                      style={{ border: "0.5px solid rgba(239,68,68,0.3)" }}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(crew.id, "approve")}
                      disabled={actionLoading === crew.id}
                      className="px-3 py-1.5 rounded-lg text-xs text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                      style={{ backgroundColor: "#ff41b3", fontWeight: 500 }}
                    >
                      {actionLoading === crew.id ? "Approving…" : "Approve"}
                    </button>
                  </div>
                )}

                {/* Re-approve rejected crews */}
                {crew.status === "rejected" && (
                  <button
                    onClick={() => handleAction(crew.id, "approve")}
                    disabled={actionLoading === crew.id}
                    className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white transition-colors"
                    style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}
                  >
                    Approve anyway
                  </button>
                )}

                {/* View live page for approved */}
                {crew.status === "approved" && (
                  <Link
                    href={`/brand-crews/${crew.id}`}
                    className="text-xs text-[#ff41b3] hover:opacity-80"
                  >
                    View live page →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
