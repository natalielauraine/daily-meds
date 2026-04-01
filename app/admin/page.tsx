"use client";

// Admin dashboard — the first page Natalie sees when she goes to /admin.
// Shows: total users, paid members, revenue estimate, subscription breakdown,
// and the 5 most recent signups.

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminShell from "./AdminShell";
import { MOCK_SESSIONS } from "../../lib/sessions-data";

type Stats = {
  totalUsers: number;
  paidMembers: number;
  freeUsers: number;
  monthlyMembers: number;
  annualMembers: number;
  lifetimeMembers: number;
  monthlyRevenue: number;
  recentUsers: { email: string; name: string; subscription_status: string; created_at: string }[];
};

// Colour per subscription tier
function tierColour(status: string) {
  if (status === "monthly")  return "#ff41b3";
  if (status === "annual")   return "#adf225";
  if (status === "lifetime") return "#adf225";
  return "rgba(255,255,255,0.2)";
}

function tierLabel(status: string) {
  if (status === "monthly")  return "Monthly";
  if (status === "annual")   return "Annual";
  if (status === "lifetime") return "Lifetime";
  if (status === "payment_failed") return "Failed";
  return "Free";
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AdminShell>
      <div className="px-6 py-8 max-w-4xl mx-auto">

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-2xl text-white mb-1" style={{ fontWeight: 500 }}>Dashboard</h1>
          <p className="text-sm text-white/40">Overview of Daily Meds</p>
        </div>

        {/* ── STAT CARDS ───────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[0,1,2,3].map((i) => (
              <div key={i} className="h-24 rounded-[10px] animate-pulse" style={{ backgroundColor: "#1F1F1F" }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Users"    value={stats?.totalUsers ?? 0}  />
            <StatCard label="Paid Members"   value={stats?.paidMembers ?? 0} accent="#ff41b3" />
            <StatCard label="Free Users"     value={stats?.freeUsers ?? 0}   />
            <StatCard
              label="Est. Monthly Revenue"
              value={`£${stats?.monthlyRevenue?.toFixed(0) ?? 0}`}
              accent="#adf225"
            />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">

          {/* ── SUBSCRIPTION BREAKDOWN ─────────────────────────── */}
          <div
            className="rounded-[10px] p-5"
            style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)" }}
          >
            <h2 className="text-sm text-white mb-4" style={{ fontWeight: 500 }}>Subscription Breakdown</h2>
            {loading ? (
              <div className="flex flex-col gap-3">
                {[0,1,2,3].map((i) => <div key={i} className="h-7 rounded animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.04)" }} />)}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {[
                  { label: "Monthly",  count: stats?.monthlyMembers  ?? 0, colour: "#ff41b3" },
                  { label: "Annual",   count: stats?.annualMembers   ?? 0, colour: "#adf225" },
                  { label: "Lifetime", count: stats?.lifetimeMembers ?? 0, colour: "#adf225" },
                  { label: "Free",     count: stats?.freeUsers       ?? 0, colour: "rgba(255,255,255,0.2)" },
                ].map(({ label, count, colour }) => {
                  const total = stats?.totalUsers || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={label}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-white/50">{label}</span>
                        <span className="text-xs text-white/70">{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: colour }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── RECENT SIGNUPS ─────────────────────────────────── */}
          <div
            className="rounded-[10px] p-5"
            style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm text-white" style={{ fontWeight: 500 }}>Recent Signups</h2>
              <Link href="/admin/users" className="text-xs text-white/30 hover:text-white/60 transition-colors">
                See all →
              </Link>
            </div>
            {loading ? (
              <div className="flex flex-col gap-3">
                {[0,1,2,3,4].map((i) => <div key={i} className="h-8 rounded animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.04)" }} />)}
              </div>
            ) : stats?.recentUsers?.length ? (
              <div className="flex flex-col gap-2">
                {stats.recentUsers.map((u) => (
                  <div key={u.email} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs text-white/70 truncate">{u.name || u.email}</p>
                      <p className="text-[10px] text-white/30 truncate">{u.email}</p>
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full shrink-0 ml-2"
                      style={{ backgroundColor: `${tierColour(u.subscription_status)}20`, color: tierColour(u.subscription_status), fontWeight: 500 }}
                    >
                      {tierLabel(u.subscription_status)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/25">No users yet</p>
            )}
          </div>

        </div>

        {/* ── QUICK LINKS ────────────────────────────────────────── */}
        <div className="mt-6">
          <h2 className="text-sm text-white/40 mb-3" style={{ fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>Quick actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Add session",     href: "/admin/content",  colour: "#ff41b3" },
              { label: "Schedule live",   href: "/admin/live",     colour: "#ff41b3" },
              { label: "View users",      href: "/admin/users",    colour: "#adf225" },
              { label: "Edit OG images",  href: "/admin/social",   colour: "#adf225" },
            ].map(({ label, href, colour }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-center py-3 px-4 rounded-[10px] text-xs text-white transition-opacity hover:opacity-80 text-center"
                style={{ backgroundColor: `${colour}18`, border: `0.5px solid ${colour}30`, color: colour, fontWeight: 500 }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── CONTENT SUMMARY ──────────────────────────────────── */}
        <div className="mt-6">
          <div
            className="rounded-[10px] p-5"
            style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm text-white" style={{ fontWeight: 500 }}>Content Library</h2>
              <Link href="/admin/content" className="text-xs text-white/30 hover:text-white/60 transition-colors">
                Manage →
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-2xl text-white" style={{ fontWeight: 500 }}>{MOCK_SESSIONS.length}</p>
                <p className="text-xs text-white/40">Total sessions</p>
              </div>
              <div>
                <p className="text-2xl text-white" style={{ fontWeight: 500 }}>
                  {MOCK_SESSIONS.filter((s) => s.isFree).length}
                </p>
                <p className="text-xs text-white/40">Free sessions</p>
              </div>
              <div>
                <p className="text-2xl text-white" style={{ fontWeight: 500 }}>
                  {MOCK_SESSIONS.filter((s) => !s.isFree).length}
                </p>
                <p className="text-xs text-white/40">Premium</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminShell>
  );
}

// ── STAT CARD COMPONENT ───────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div
      className="rounded-[10px] p-4"
      style={{
        backgroundColor: "#1F1F1F",
        border: accent ? `0.5px solid ${accent}25` : "0.5px solid rgba(255,255,255,0.08)",
      }}
    >
      <p className="text-xs text-white/40 mb-2">{label}</p>
      <p
        className="text-2xl"
        style={{ fontWeight: 500, color: accent ?? "white" }}
      >
        {value}
      </p>
    </div>
  );
}
