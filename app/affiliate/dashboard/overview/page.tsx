"use client";

// /affiliate/dashboard/overview — Admin view of ALL affiliates for The Daily Meds.
// Shows total affiliates, money made, money going out, per-affiliate breakdown table.
// Supabase: fetches all rows from the affiliates table (admin only).

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase-browser";

interface AffiliateRow {
  id: string;
  user_id: string;
  referral_code: string;
  status: "pending" | "approved" | "rejected";
  clicks: number;
  signups: number;
  earnings: number;
  paid_out: number;
  created_at: string;
  // joined via users table when available
  full_name?: string;
  email?: string;
}

// ── HELPERS ──────────────────────────────────────────────────────────────────

function gbp(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ── GLASS CARD ────────────────────────────────────────────────────────────────

function GlassCard({
  children,
  className = "",
  accentTop,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  accentTop?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-2xl relative overflow-hidden ${className}`}
      style={{
        background: "rgba(0,10,10,0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderTop: accentTop ? `2px solid ${accentTop}` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── STATUS BADGE ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AffiliateRow["status"] }) {
  const map = {
    approved:  { bg: "rgba(173,242,37,0.12)",  color: "#adf225", label: "Approved"  },
    pending:   { bg: "rgba(244,231,29,0.12)",  color: "#f4e71d", label: "Pending"   },
    rejected:  { bg: "rgba(255,65,179,0.12)",  color: "#ff41b3", label: "Rejected"  },
  };
  const s = map[status];
  return (
    <span
      className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}33` }}
    >
      {s.label}
    </span>
  );
}

// ── STAT TILE ─────────────────────────────────────────────────────────────────

function StatTile({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
  icon: string;
}) {
  return (
    <GlassCard accentTop={accent} className="p-7 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-black uppercase tracking-[0.2em]"
          style={{ color: accent, fontFamily: "var(--font-space-grotesk)" }}
        >
          {label}
        </span>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}18`, border: `1px solid ${accent}33` }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={accent}>
            <path d={icon} />
          </svg>
        </div>
      </div>
      <div>
        <p
          className="text-4xl font-black text-white leading-none"
          style={{ fontFamily: "var(--font-plus-jakarta)" }}
        >
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-2" style={{ color: "rgba(224,250,250,0.4)" }}>
            {sub}
          </p>
        )}
      </div>
    </GlassCard>
  );
}

// ── MINI BAR CHART ────────────────────────────────────────────────────────────

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color, transition: "width 0.6s ease" }}
        />
      </div>
      <span className="text-xs w-8 text-right" style={{ color: "rgba(255,255,255,0.4)" }}>
        {Math.round(pct)}%
      </span>
    </div>
  );
}

// ── TOP NAV ───────────────────────────────────────────────────────────────────

function TopNav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
      style={{
        background: "rgba(0,5,5,0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-6">
        <Link href="/">
          <span
            className="text-lg font-black tracking-tight"
            style={{
              fontFamily: "var(--font-plus-jakarta)",
              background: "linear-gradient(90deg, #ff41b3, #ec723d)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            The Daily Meds
          </span>
        </Link>
        <div className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
          <Link href="/admin" className="hover:text-white/60 transition-colors">Admin</Link>
          <span className="mx-1.5">/</span>
          <span style={{ color: "#ff41b3" }}>Affiliate Overview</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors hover:bg-white/5"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to Admin
        </Link>
      </div>
    </nav>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────

export default function AffiliateOverviewPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading]         = useState(true);
  const [affiliates, setAffiliates]   = useState<AffiliateRow[]>([]);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AffiliateRow["status"]>("all");
  const [sortBy, setSortBy]           = useState<"earnings" | "signups" | "clicks" | "created_at">("earnings");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Fetch all affiliates
      const { data: rows } = await supabase
        .from("affiliates")
        .select("*")
        .order("created_at", { ascending: false });

      if (!rows) { setLoading(false); return; }

      // Try to enrich with user names/emails from the users table
      const userIds = rows.map((r: AffiliateRow) => r.user_id).filter(Boolean);
      let userMap: Record<string, { full_name?: string; email?: string }> = {};

      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from("users")
          .select("id, full_name, email")
          .in("id", userIds);

        if (users) {
          users.forEach((u: { id: string; full_name?: string; email?: string }) => {
            userMap[u.id] = { full_name: u.full_name, email: u.email };
          });
        }
      }

      const enriched: AffiliateRow[] = rows.map((r: AffiliateRow) => ({
        ...r,
        full_name: userMap[r.user_id]?.full_name,
        email:     userMap[r.user_id]?.email,
      }));

      setAffiliates(enriched);
      setLoading(false);
    }

    load();
  }, []);

  // ── DERIVED STATS ──────────────────────────────────────────────────────────

  const approved   = affiliates.filter((a) => a.status === "approved");
  const pending    = affiliates.filter((a) => a.status === "pending");
  const totalMade  = affiliates.reduce((s, a) => s + (a.earnings    ?? 0), 0);
  const totalPaid  = affiliates.reduce((s, a) => s + (a.paid_out    ?? 0), 0);
  const totalOwed  = totalMade - totalPaid;
  const totalRefs  = affiliates.reduce((s, a) => s + (a.signups     ?? 0), 0);
  const totalClicks = affiliates.reduce((s, a) => s + (a.clicks     ?? 0), 0);

  const topEarner  = [...affiliates].sort((a, b) => (b.earnings ?? 0) - (a.earnings ?? 0))[0];
  const maxEarnings = topEarner?.earnings ?? 1;

  // ── FILTERED / SORTED TABLE ────────────────────────────────────────────────

  const visible = affiliates
    .filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (a.full_name ?? "").toLowerCase().includes(q) ||
        (a.email     ?? "").toLowerCase().includes(q) ||
        a.referral_code.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "created_at") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return (b[sortBy] ?? 0) - (a[sortBy] ?? 0);
    });

  // ── LOADING ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#001010" }}>
        <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-pink-400 animate-spin" />
      </div>
    );
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#001010", color: "#e0fafa" }}>
      <TopNav />

      {/* Background glows */}
      <div
        className="fixed top-0 right-0 w-[600px] h-[600px] -z-10 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,65,179,0.06) 0%, transparent 70%)",
          transform: "translate(30%,-30%)",
        }}
      />
      <div
        className="fixed bottom-0 left-0 w-[400px] h-[400px] -z-10 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(173,242,37,0.04) 0%, transparent 70%)",
          transform: "translate(-20%,20%)",
        }}
      />

      <main className="pt-24 pb-20 px-6 md:px-10 max-w-7xl mx-auto">

        {/* ── PAGE HEADER ── */}
        <header className="mb-10">
          <p
            className="text-xs uppercase tracking-[0.2em] mb-2 font-bold"
            style={{ color: "#ff41b3", fontFamily: "var(--font-space-grotesk)" }}
          >
            Admin · Affiliate Programme
          </p>
          <h1
            className="text-5xl md:text-6xl font-black uppercase leading-none mb-3"
            style={{
              fontFamily: "var(--font-plus-jakarta)",
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #ff41b3 0%, #ec723d 60%, #f4e71d 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 20px rgba(255,65,179,0.3))",
            }}
          >
            Affiliate Overview
          </h1>
          <p className="text-sm" style={{ color: "rgba(224,250,250,0.4)" }}>
            Every partner, every pound, every referral — all in one place.
          </p>
        </header>

        {/* ── KPI TILES ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatTile
            label="Total Affiliates"
            value={affiliates.length.toString()}
            sub={`${approved.length} approved · ${pending.length} pending`}
            accent="#ff41b3"
            icon="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
          />
          <StatTile
            label="Total Earned"
            value={gbp(totalMade)}
            sub="Commission accrued across all affiliates"
            accent="#ec723d"
            icon="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"
          />
          <StatTile
            label="Paid Out"
            value={gbp(totalPaid)}
            sub="Successfully disbursed"
            accent="#adf225"
            icon="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
          />
          <StatTile
            label="Owed / Pending"
            value={gbp(totalOwed)}
            sub="Outstanding balance to pay out"
            accent="#f4e71d"
            icon="M11.5 2C6.81 2 3 5.81 3 10.5S6.81 19 11.5 19h.5v3c4.86-2.34 8-7 8-11.5C20 5.81 16.19 2 11.5 2zm1 14.5h-2v-2h2v2zm0-4h-2c0-3.25 3-3 3-5 0-1.1-.9-2-2-2s-2 .9-2 2h-2c0-2.21 1.79-4 4-4s4 1.79 4 4c0 2.5-3 2.75-3 5z"
          />
          <StatTile
            label="Total Referrals"
            value={totalRefs.toLocaleString()}
            sub="New members from affiliate links"
            accent="#ff41b3"
            icon="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"
          />
          <StatTile
            label="Total Clicks"
            value={totalClicks.toLocaleString()}
            sub="Link visits tracked"
            accent="#ec723d"
            icon="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
          />
        </div>

        {/* ── MONEY FLOW CARD ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          <GlassCard className="p-8 lg:col-span-2">
            <h2
              className="text-sm font-black uppercase tracking-widest mb-8"
              style={{ color: "#ff41b3", fontFamily: "var(--font-space-grotesk)" }}
            >
              Money Flow
            </h2>
            <div className="flex flex-col gap-6">
              {/* Revenue In */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm" style={{ color: "rgba(224,250,250,0.5)" }}>Commissions accrued (owed to affiliates)</span>
                  <span className="text-sm font-bold text-white">{gbp(totalMade)}</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full" style={{ width: "100%", background: "linear-gradient(90deg,#ff41b3,#ec723d)" }} />
                </div>
              </div>
              {/* Paid Out */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm" style={{ color: "rgba(224,250,250,0.5)" }}>Already paid out</span>
                  <span className="text-sm font-bold" style={{ color: "#adf225" }}>{gbp(totalPaid)}</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: totalMade > 0 ? `${(totalPaid / totalMade) * 100}%` : "0%",
                      background: "#adf225",
                    }}
                  />
                </div>
              </div>
              {/* Owed */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm" style={{ color: "rgba(224,250,250,0.5)" }}>Outstanding — still owed</span>
                  <span className="text-sm font-bold" style={{ color: "#f4e71d" }}>{gbp(totalOwed)}</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: totalMade > 0 ? `${(totalOwed / totalMade) * 100}%` : "0%",
                      background: "#f4e71d",
                    }}
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Programme health */}
          <GlassCard className="p-8 flex flex-col justify-between" accentTop="#adf225">
            <div>
              <h2
                className="text-sm font-black uppercase tracking-widest mb-6"
                style={{ color: "#adf225", fontFamily: "var(--font-space-grotesk)" }}
              >
                Programme Health
              </h2>
              <div className="flex flex-col gap-5">
                <div>
                  <div className="flex justify-between text-xs mb-1.5" style={{ color: "rgba(224,250,250,0.4)" }}>
                    <span>Approval rate</span>
                    <span className="text-white font-bold">
                      {affiliates.length > 0 ? Math.round((approved.length / affiliates.length) * 100) : 0}%
                    </span>
                  </div>
                  <MiniBar value={approved.length} max={affiliates.length} color="#adf225" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5" style={{ color: "rgba(224,250,250,0.4)" }}>
                    <span>Overall conversion (click→signup)</span>
                    <span className="text-white font-bold">
                      {totalClicks > 0 ? ((totalRefs / totalClicks) * 100).toFixed(1) : "0.0"}%
                    </span>
                  </div>
                  <MiniBar value={totalRefs} max={totalClicks} color="#ff41b3" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5" style={{ color: "rgba(224,250,250,0.4)" }}>
                    <span>Paid out vs owed</span>
                    <span className="text-white font-bold">
                      {totalMade > 0 ? Math.round((totalPaid / totalMade) * 100) : 0}%
                    </span>
                  </div>
                  <MiniBar value={totalPaid} max={totalMade} color="#ec723d" />
                </div>
              </div>
            </div>

            <div
              className="mt-6 rounded-xl p-4 text-xs leading-relaxed"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "rgba(224,250,250,0.4)" }}
            >
              Avg commission per affiliate:{" "}
              <strong className="text-white">
                {approved.length > 0 ? gbp(totalMade / approved.length) : "—"}
              </strong>
              <br />
              Avg referrals per affiliate:{" "}
              <strong className="text-white">
                {approved.length > 0 ? (totalRefs / approved.length).toFixed(1) : "—"}
              </strong>
            </div>
          </GlassCard>
        </div>

        {/* ── AFFILIATE TABLE ── */}
        <GlassCard className="overflow-hidden">
          {/* Table header / filters */}
          <div
            className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <h3
              className="text-sm font-black uppercase tracking-widest shrink-0"
              style={{ color: "#ff41b3", fontFamily: "var(--font-space-grotesk)" }}
            >
              All Affiliates
              <span
                className="ml-2 px-2 py-0.5 rounded-full text-[10px]"
                style={{ background: "rgba(255,65,179,0.15)", color: "#ff41b3", border: "1px solid rgba(255,65,179,0.2)" }}
              >
                {visible.length}
              </span>
            </h3>

            <div className="flex flex-1 items-center gap-3 flex-wrap">
              {/* Search */}
              <input
                type="text"
                placeholder="Search name, email or code…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-[180px] px-4 py-2 rounded-xl text-sm text-white placeholder-white/20 outline-none"
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />

              {/* Status filter */}
              <div className="flex items-center gap-1">
                {(["all", "approved", "pending", "rejected"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all"
                    style={{
                      background: statusFilter === s ? "rgba(255,65,179,0.2)" : "transparent",
                      color: statusFilter === s ? "#ff41b3" : "rgba(255,255,255,0.3)",
                      border: `1px solid ${statusFilter === s ? "rgba(255,65,179,0.3)" : "transparent"}`,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 rounded-xl text-xs text-white outline-none appearance-none"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                <option value="earnings">Sort: Earnings</option>
                <option value="signups">Sort: Referrals</option>
                <option value="clicks">Sort: Clicks</option>
                <option value="created_at">Sort: Newest</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {visible.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="rgba(255,255,255,0.1)">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
              <p className="text-sm" style={{ color: "rgba(224,250,250,0.3)" }}>No affiliates match your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                    {["Affiliate", "Code", "Status", "Clicks", "Referrals", "Conv.", "Earned", "Paid Out", "Owed", "Joined"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-4 text-left whitespace-nowrap"
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.18em",
                          fontFamily: "var(--font-space-grotesk)",
                          fontWeight: 700,
                          color: "rgba(224,250,250,0.3)",
                          textTransform: "uppercase",
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((a, i) => {
                    const conv = a.clicks > 0 ? ((a.signups / a.clicks) * 100).toFixed(1) : "—";
                    const owed = (a.earnings ?? 0) - (a.paid_out ?? 0);
                    return (
                      <tr
                        key={a.id}
                        style={{
                          borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        }}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Name / email */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-white">
                              {a.full_name || "—"}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: "rgba(224,250,250,0.35)" }}>
                              {a.email || a.user_id?.slice(0, 12) + "…"}
                            </p>
                          </div>
                        </td>

                        {/* Referral code */}
                        <td className="px-5 py-4">
                          <code
                            className="text-xs px-2 py-1 rounded-md"
                            style={{
                              backgroundColor: "rgba(255,65,179,0.1)",
                              color: "#ff41b3",
                              fontFamily: "monospace",
                            }}
                          >
                            {a.referral_code}
                          </code>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <StatusBadge status={a.status} />
                        </td>

                        {/* Clicks */}
                        <td className="px-5 py-4 text-white/70">{(a.clicks ?? 0).toLocaleString()}</td>

                        {/* Referrals */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{(a.signups ?? 0).toLocaleString()}</span>
                            <div className="hidden md:block w-16">
                              <MiniBar value={a.signups ?? 0} max={topEarner?.signups ?? 1} color="#ec723d" />
                            </div>
                          </div>
                        </td>

                        {/* Conversion */}
                        <td className="px-5 py-4">
                          <span
                            className="text-xs font-bold"
                            style={{
                              color:
                                parseFloat(conv) >= 5
                                  ? "#adf225"
                                  : parseFloat(conv) >= 2
                                  ? "#f4e71d"
                                  : "rgba(224,250,250,0.4)",
                            }}
                          >
                            {conv}{conv !== "—" ? "%" : ""}
                          </span>
                        </td>

                        {/* Earned */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{gbp(a.earnings ?? 0)}</span>
                            <div className="hidden md:block w-16">
                              <MiniBar value={a.earnings ?? 0} max={maxEarnings} color="#ff41b3" />
                            </div>
                          </div>
                        </td>

                        {/* Paid out */}
                        <td className="px-5 py-4" style={{ color: "#adf225" }}>
                          {gbp(a.paid_out ?? 0)}
                        </td>

                        {/* Owed */}
                        <td className="px-5 py-4">
                          <span
                            className="font-bold"
                            style={{ color: owed > 0 ? "#f4e71d" : "rgba(224,250,250,0.25)" }}
                          >
                            {gbp(owed)}
                          </span>
                        </td>

                        {/* Joined */}
                        <td className="px-5 py-4 text-xs whitespace-nowrap" style={{ color: "rgba(224,250,250,0.35)" }}>
                          {fmtDate(a.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* Totals footer */}
                <tfoot>
                  <tr
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.1)",
                      backgroundColor: "rgba(255,65,179,0.04)",
                    }}
                  >
                    <td className="px-5 py-4 text-xs font-black uppercase tracking-widest" style={{ color: "#ff41b3" }} colSpan={3}>
                      Totals
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-white/60">{totalClicks.toLocaleString()}</td>
                    <td className="px-5 py-4 text-xs font-bold text-white">{totalRefs.toLocaleString()}</td>
                    <td className="px-5 py-4 text-xs font-bold" style={{ color: totalClicks > 0 ? "#adf225" : "rgba(224,250,250,0.3)" }}>
                      {totalClicks > 0 ? `${((totalRefs / totalClicks) * 100).toFixed(1)}%` : "—"}
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-white">{gbp(totalMade)}</td>
                    <td className="px-5 py-4 text-xs font-bold" style={{ color: "#adf225" }}>{gbp(totalPaid)}</td>
                    <td className="px-5 py-4 text-xs font-bold" style={{ color: "#f4e71d" }}>{gbp(totalOwed)}</td>
                    <td className="px-5 py-4" />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </GlassCard>

        {/* ── FOOTER ── */}
        <footer
          className="mt-12 pt-6 flex items-center justify-between text-xs"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: "rgba(224,250,250,0.2)", fontFamily: "var(--font-space-grotesk)" }}
        >
          <span>© 2024 The Daily Meds — Admin Portal</span>
          <div className="flex gap-4">
            <Link href="/admin" className="hover:text-white/50 transition-colors">Admin Home</Link>
            <Link href="/affiliate/dashboard" className="hover:text-white/50 transition-colors">Affiliate Dashboard</Link>
          </div>
        </footer>

      </main>
    </div>
  );
}
