"use client";

// Affiliate dashboard — "Partner Pulse" design.
// Sidebar nav + cinematic headline + bento stat grid + referral link + tier progress + payouts table.
// Fetches real data from the Supabase affiliates table.

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase-browser";

interface AffiliateRecord {
  id: string;
  referral_code: string;
  status: "pending" | "approved" | "rejected";
  clicks: number;
  signups: number;
  earnings: number;
  paid_out: number;
  created_at: string;
}

// ── GLASS PANEL ───────────────────────────────────────────────────────────────
function GlassPanel({ children, className = "", accentBorder, style }: {
  children: React.ReactNode;
  className?: string;
  accentBorder?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-2xl relative overflow-hidden ${className}`}
      style={{
        background: "rgba(0,10,10,0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderLeft: accentBorder ? `4px solid ${accentBorder}` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
function Sidebar({ active, onNav }: { active: string; onNav: (s: string) => void }) {
  const items = [
    { key: "overview",  label: "Overview",         icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
    { key: "referrals", label: "Referrals",        icon: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" },
    { key: "payouts",   label: "Payouts",          icon: "M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" },
    { key: "assets",    label: "Creative Assets",  icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  ];

  return (
    <aside
      className="hidden lg:flex flex-col w-64 fixed left-0 top-0 h-full z-40 pt-20 pb-6 px-4"
      style={{ background: "rgba(0,5,5,0.7)", backdropFilter: "blur(20px)", borderRight: "1px solid rgba(255,255,255,0.05)" }}
    >
      <nav className="flex flex-col gap-1 flex-1">
        {items.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNav(item.key)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 text-left w-full"
              style={{
                background: isActive ? "linear-gradient(90deg, rgba(255,65,179,0.2), transparent)" : "transparent",
                borderLeft: isActive ? "4px solid #ff41b3" : "4px solid transparent",
                color: isActive ? "#ffffff" : "rgba(255,255,255,0.4)",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d={item.icon} />
              </svg>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Support + logout */}
      <div className="flex flex-col gap-1 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <a
          href="mailto:hello@thedailymeds.com"
          className="w-full text-center py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-80"
          style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)" }}
        >
          Get Support
        </a>
        <Link
          href="/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
          </svg>
          Back to app
        </Link>
      </div>
    </aside>
  );
}

// ── TOP NAV ───────────────────────────────────────────────────────────────────
function TopNav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
      style={{ background: "rgba(0,5,5,0.7)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-8">
        <Link href="/">
          <span
            className="text-xl font-black tracking-tight"
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
        <div className="hidden md:flex items-center gap-1">
          <span
            className="px-3 py-1 rounded text-sm font-bold"
            style={{ color: "#ff41b3", fontFamily: "var(--font-plus-jakarta)" }}
          >
            Dashboard
          </span>
          <span className="px-3 py-1 rounded text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Affiliates</span>
          <span className="px-3 py-1 rounded text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Campaigns</span>
        </div>
      </div>
      {/* Right icons */}
      <div className="flex items-center gap-2">
        <Link href="/profile" className="p-2 rounded-full transition-colors hover:bg-white/5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        </Link>
      </div>
    </nav>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────

export default function AffiliateDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [affiliate, setAffiliate] = useState<AffiliateRecord | null>(null);
  const [activeNav, setActiveNav] = useState("overview");
  const [copied, setCopied] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";
  const referralLink = affiliate ? `${appUrl}?ref=${affiliate.referral_code}` : "";

  // Tier progress: 100 signups = Senior → Master (25% commission)
  const MASTER_TIER_TARGET = 100;
  const tierProgress = affiliate ? Math.min((affiliate.signups / MASTER_TIER_TARGET) * 100, 100) : 0;
  const remainingForMaster = affiliate ? Math.max(MASTER_TIER_TARGET - affiliate.signups, 0) : MASTER_TIER_TARGET;

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setAffiliate(data ?? null);
      setLoading(false);
    });
  }, []);

  function copyLink() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function gbp(n: number) {
    return `£${n.toFixed(2)}`;
  }

  const conversionRate = affiliate && affiliate.clicks > 0
    ? ((affiliate.signups / affiliate.clicks) * 100).toFixed(1)
    : "0.0";

  const pendingPayout = affiliate ? affiliate.earnings - (affiliate.paid_out ?? 0) : 0;

  // ── LOADING ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#001010" }}>
        <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-pink-400 animate-spin" />
      </div>
    );
  }

  // ── NOT YET AN AFFILIATE ─────────────────────────────────────────────────────
  if (!affiliate) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#001010" }}>
        <div className="text-center max-w-sm">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
            </svg>
          </div>
          <h1 className="text-xl text-white mb-2" style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}>
            No affiliate account yet
          </h1>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
            Apply to the Daily Meds affiliate programme and start earning 20% on every referral.
          </p>
          <Link
            href="/affiliate"
            className="inline-flex px-6 py-3 rounded-xl text-sm text-white font-bold transition-opacity hover:opacity-80"
            style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)" }}
          >
            Apply now
          </Link>
        </div>
      </div>
    );
  }

  // ── FULL DASHBOARD ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: "#001010", color: "#e0fafa" }}>
      <TopNav />
      <Sidebar active={activeNav} onNav={setActiveNav} />

      {/* Background glow blobs */}
      <div className="fixed top-0 right-0 w-[700px] h-[700px] rounded-full -z-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,65,179,0.06) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
      <div className="fixed bottom-0 left-64 w-[500px] h-[500px] rounded-full -z-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(236,114,61,0.05) 0%, transparent 70%)", transform: "translate(-20%, 20%)" }} />

      {/* Main content — offset by sidebar + topnav */}
      <main className="lg:ml-64 pt-20 px-6 md:px-10 pb-16">

        {/* ── HEADER ── */}
        <header className="mb-10 mt-8">
          <h1
            className="text-5xl md:text-7xl font-black uppercase leading-none mb-4"
            style={{
              fontFamily: "var(--font-plus-jakarta)",
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #ff41b3, #ec723d)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "none",
              filter: "drop-shadow(0 0 20px rgba(255,65,179,0.4))",
            }}
          >
            Partner Pulse
          </h1>
          <p
            className="text-sm uppercase tracking-[0.2em] font-bold italic"
            style={{ color: "#ec723d", fontFamily: "var(--font-space-grotesk)" }}
          >
            "If they pressed play, you helped them find their way."
          </p>
        </header>

        {/* ── BENTO STAT GRID ── */}
        <div className="grid grid-cols-12 gap-5 mb-8">

          {/* Total Commission — large card */}
          <div className="col-span-12 md:col-span-6 lg:col-span-5">
            <GlassPanel className="p-8 h-full relative group">
              {/* Lotus decoration */}
              <div
                className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 group-hover:opacity-15 transition-opacity rounded-full"
                style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)" }}
              />
              <div className="flex items-start justify-between mb-8">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(255,65,179,0.15)", border: "1px solid rgba(255,65,179,0.2)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#ff41b3">
                    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                  </svg>
                </div>
                <span
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: "#ff41b3", fontFamily: "var(--font-space-grotesk)" }}
                >
                  Total Commission
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-6xl font-black text-white"
                  style={{ fontFamily: "var(--font-plus-jakarta)" }}
                >
                  {gbp(affiliate.earnings).split(".")[0]}
                </span>
                <span className="text-3xl font-bold" style={{ color: "#ff41b3" }}>
                  .{gbp(affiliate.earnings).split(".")[1] ?? "00"}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: "rgba(224,250,250,0.5)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#4ade80"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"/></svg>
                {gbp(pendingPayout)} pending payout
              </div>
            </GlassPanel>
          </div>

          {/* Total Referrals */}
          <div className="col-span-12 md:col-span-6 lg:col-span-3">
            <GlassPanel className="p-8 h-full" accentBorder="#ec723d">
              <div className="mb-6">
                <span
                  className="text-xs font-bold tracking-widest uppercase block mb-2"
                  style={{ color: "#ec723d", fontFamily: "var(--font-space-grotesk)" }}
                >
                  Total Referrals
                </span>
                <span
                  className="text-6xl font-black text-white"
                  style={{ fontFamily: "var(--font-plus-jakarta)" }}
                >
                  {affiliate.signups.toLocaleString()}
                </span>
              </div>
              <p className="text-sm" style={{ color: "rgba(224,250,250,0.35)" }}>
                {affiliate.clicks.toLocaleString()} link clicks total
              </p>
            </GlassPanel>
          </div>

          {/* Conversion Rate */}
          <div className="col-span-12 lg:col-span-4">
            <GlassPanel className="p-8 h-full flex flex-col justify-between">
              <div>
                <span
                  className="text-xs font-bold tracking-widest uppercase block mb-2"
                  style={{ color: "#adf225", fontFamily: "var(--font-space-grotesk)" }}
                >
                  Conversion Rate
                </span>
                <span
                  className="text-6xl font-black text-white"
                  style={{ fontFamily: "var(--font-plus-jakarta)" }}
                >
                  {conversionRate}%
                </span>
              </div>
              <div>
                <div className="h-2 rounded-full overflow-hidden mt-6 mb-3" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(parseFloat(conversionRate) / 20 * 100, 100)}%`,
                      background: "linear-gradient(90deg, #ff41b3, #ec723d)",
                    }}
                  />
                </div>
                <p
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "rgba(224,250,250,0.3)", fontFamily: "var(--font-space-grotesk)" }}
                >
                  Industry average: 4.2%
                </p>
              </div>
            </GlassPanel>
          </div>
        </div>

        {/* ── REFERRAL LINK + TIER PROGRESS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">

          {/* Broadcast Your Aura */}
          <GlassPanel className="p-8" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <h2
              className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3"
              style={{ fontFamily: "var(--font-plus-jakarta)", color: "#ff41b3" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
              </svg>
              Broadcast Your Aura
            </h2>
            <div
              className="flex items-center gap-3 rounded-xl p-4 mb-4"
              style={{ backgroundColor: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <code
                className="flex-1 text-base truncate"
                style={{ color: "#ff41b3", fontFamily: "monospace" }}
              >
                {referralLink.replace("https://", "")}
              </code>
              <button
                onClick={copyLink}
                className="px-5 py-2 rounded-lg text-xs font-black uppercase tracking-tight text-white transition-all active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #ff41b3, #ec723d)",
                  boxShadow: "0 0 20px rgba(255,65,179,0.3)",
                }}
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
            <p className="text-sm italic" style={{ color: "rgba(224,250,250,0.4)", lineHeight: 1.6 }}>
              "Your unique resonance matters. Share the practice and earn rewards for every soul that finds their centre through your recommendation."
            </p>
          </GlassPanel>

          {/* Master Journey tier */}
          <GlassPanel className="p-8">
            <div className="flex items-end justify-between mb-6">
              <h2
                className="text-xl font-black uppercase tracking-tight"
                style={{ fontFamily: "var(--font-plus-jakarta)", color: "white" }}
              >
                Master Journey
              </h2>
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#ff41b3", fontFamily: "var(--font-space-grotesk)" }}
              >
                {Math.round(tierProgress)}% Complete
              </span>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span
                className="text-xs font-bold py-1 px-3 rounded-full uppercase"
                style={{ background: "rgba(255,65,179,0.15)", color: "#ff41b3", border: "1px solid rgba(255,65,179,0.3)" }}
              >
                {affiliate.signups >= 50 ? "Senior Tier" : "Starter Tier"}
              </span>
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "white", fontFamily: "var(--font-space-grotesk)" }}
              >
                Master Tier
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-4 rounded-full overflow-hidden mb-4" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
              <div
                className="h-full rounded-full relative"
                style={{
                  width: `${tierProgress}%`,
                  background: "linear-gradient(90deg, #ff41b3, #ec723d, #f4e71d)",
                  transition: "width 0.8s ease",
                }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(244,231,29,0.15)", border: "1px solid rgba(244,231,29,0.3)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#f4e71d">
                  <path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01L12 1z"/>
                </svg>
              </div>
              <p className="text-sm" style={{ color: "rgba(224,250,250,0.6)" }}>
                {remainingForMaster > 0 ? (
                  <>Only <strong className="text-white">{remainingForMaster}</strong> more referrals to unlock <strong style={{ color: "#f4e71d" }}>25% Commission</strong> on all future sales.</>
                ) : (
                  <>You've reached <strong style={{ color: "#f4e71d" }}>Master Tier</strong> — earning 25% on every sale!</>
                )}
              </p>
            </div>
          </GlassPanel>
        </div>

        {/* ── PAYOUTS TABLE ── */}
        <GlassPanel className="overflow-hidden">
          <div className="px-8 py-6 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h3
              className="text-lg font-black uppercase tracking-tight"
              style={{ fontFamily: "var(--font-plus-jakarta)", color: "#ff41b3" }}
            >
              Manifested Payouts
            </h3>
            <button
              className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors hover:text-white"
              style={{ color: "rgba(224,250,250,0.3)", fontFamily: "var(--font-space-grotesk)" }}
            >
              View Archive
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                <tr>
                  {["Transaction ID", "Date", "Amount", "Method", "Status"].map((col) => (
                    <th
                      key={col}
                      className="px-6 py-4 text-right last:text-right first:text-left"
                      style={{ fontSize: "10px", letterSpacing: "0.2em", fontFamily: "var(--font-space-grotesk)", fontWeight: 700, color: "rgba(224,250,250,0.35)", textTransform: "uppercase" }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Empty state — payouts will appear here once processed */}
                {affiliate.paid_out === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-14 text-center" style={{ color: "rgba(224,250,250,0.2)" }}>
                      <div className="flex flex-col items-center gap-3">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                          <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                        </svg>
                        <p className="text-sm">No payouts yet</p>
                        <p className="text-xs" style={{ color: "rgba(224,250,250,0.15)" }}>
                          Reach £20 in earnings and contact <a href="mailto:hello@thedailymeds.com" className="underline hover:text-white transition-colors">hello@thedailymeds.com</a> to request your first payout.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  // Placeholder rows — real payout rows will come from a payouts table later
                  <tr style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="px-6 py-4 font-mono text-xs" style={{ color: "rgba(224,250,250,0.4)" }}>#TRX-000001</td>
                    <td className="px-6 py-4 text-sm text-white">—</td>
                    <td className="px-6 py-4 text-sm font-bold text-white">{gbp(affiliate.paid_out)}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: "rgba(224,250,250,0.5)" }}>Bank Transfer</td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                        style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}
                      >
                        Paid
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassPanel>

        {/* ── FOOTER ── */}
        <footer className="mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(224,250,250,0.25)", fontFamily: "var(--font-space-grotesk)" }}>
            © 2024 The Daily Meds Cinematic Meditation
          </p>
          <div className="flex gap-6 text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            <a href="#" className="transition-colors hover:text-white" style={{ color: "rgba(224,250,250,0.25)" }}>Help Center</a>
            <a href="#" className="transition-colors hover:text-white" style={{ color: "rgba(224,250,250,0.25)" }}>Terms</a>
            <a href="#" className="transition-colors hover:text-white" style={{ color: "rgba(224,250,250,0.25)" }}>Privacy</a>
            <a href="mailto:hello@thedailymeds.com" style={{ color: "#ff41b3" }}>Contact Support</a>
          </div>
        </footer>

      </main>
    </div>
  );
}
