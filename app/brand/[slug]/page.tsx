"use client";

// Brand Partnership Portal — accessed at /brand/[slug] (e.g. /brand/aethel)
// Brands see their audience reach, revenue, and upcoming sponsored live sessions.
// Data fetched from Supabase brand_partnerships + brand_sessions tables.
// Each brand gets a unique slug. Natalie shares the link with the brand directly.

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase-browser";

// ── TYPES ─────────────────────────────────────────────────────────────────────

type BrandPartnership = {
  id: string;
  slug: string;
  brand_name: string;
  meditators_reached: number;
  meditators_delta: number;       // % change vs last period, e.g. 12 = +12%
  engagement_rate: number;        // e.g. 88 = 88%
  affiliate_signups: number;
  total_earned: number;           // in £
  currency: string;
};

type BrandSession = {
  id: string;
  title: string;
  scheduled_at: string;           // ISO timestamp
  sponsor_segment: string;        // e.g. "Product Integration: Sleep Rituals"
  is_live: boolean;
};

// ── HELPERS ───────────────────────────────────────────────────────────────────

function formatCurrency(amount: number, currency = "GBP"): string {
  const symbol = currency === "USD" ? "$" : "£";
  if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1).replace(".0", "")}k`;
  }
  return `${symbol}${amount.toLocaleString()}`;
}

function formatScheduled(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return { date, time };
}

// ── GLASS STAT CARD ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  badge,
  badgeColor = "#52e32c",
  large = false,
}: {
  label: string;
  value: string;
  badge?: string;
  badgeColor?: string;
  large?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-8"
      style={{
        background: "rgba(25,25,25,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <p
        className="text-xs uppercase tracking-widest mb-4"
        style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-space-grotesk)", fontWeight: 700 }}
      >
        {label}
      </p>
      <div className="flex items-baseline gap-4">
        <span
          style={{
            fontSize: large ? "clamp(40px, 6vw, 64px)" : "clamp(36px, 5vw, 56px)",
            fontFamily: "var(--font-plus-jakarta)",
            fontWeight: 800,
            color: "white",
            lineHeight: 1,
            filter: "drop-shadow(0 0 12px rgba(255,255,255,0.15))",
          }}
        >
          {value}
        </span>
        {badge && (
          <span
            className="text-sm font-bold"
            style={{ color: badgeColor, fontFamily: "var(--font-space-grotesk)" }}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

// ── UPCOMING RITUAL ITEM ──────────────────────────────────────────────────────

function RitualItem({ session }: { session: BrandSession }) {
  const { date, time } = formatScheduled(session.scheduled_at);
  return (
    <div className="group cursor-pointer">
      <div className="flex items-start justify-between mb-1.5">
        <span
          className="text-[10px] uppercase tracking-widest font-bold"
          style={{ color: "#ec723d", fontFamily: "var(--font-space-grotesk)" }}
        >
          {session.is_live ? "Live" : "Session"} • {date}
        </span>
        <span
          className="text-[10px] uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-space-grotesk)" }}
        >
          {time}
        </span>
      </div>
      <h4
        className="text-base text-white mb-1 group-hover:text-[#ff41b3] transition-colors"
        style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}
      >
        {session.title}
      </h4>
      <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
        {session.sponsor_segment}
      </p>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────

export default function BrandPortalPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [brand, setBrand] = useState<BrandPartnership | null>(null);
  const [sessions, setSessions] = useState<BrandSession[]>([]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    async function load() {
      if (!slug) return;

      // Fetch the brand partnership record by slug
      const { data: brandData, error } = await supabase
        .from("brand_partnerships")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error || !brandData) {
        // Brand not found — show not found state
        setNotFound(true);
        setLoading(false);
        return;
      }

      setBrand(brandData as BrandPartnership);

      // Fetch upcoming brand sessions (future ones first)
      const { data: sessionData } = await supabase
        .from("brand_sessions")
        .select("*")
        .eq("brand_partnership_id", brandData.id)
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(5);

      setSessions((sessionData as BrandSession[]) ?? []);
      setLoading(false);
    }

    load();
  }, [slug]);

  // ── LOADING ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.9), #0e0e0e)" }}
      >
        <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-pink-400 animate-spin" />
      </div>
    );
  }

  // ── NOT FOUND ─────────────────────────────────────────────────────────────────
  if (notFound || !brand) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.9), #0e0e0e)", color: "white" }}
      >
        <h1
          className="text-5xl uppercase mb-4"
          style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}
        >
          Portal not found
        </h1>
        <p className="text-white/40 mb-8">
          This brand portal doesn't exist yet. Contact Natalie to set up your partnership.
        </p>
        <a
          href="mailto:hello@thedailymeds.com"
          className="px-8 py-3 rounded-xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)" }}
        >
          Get in touch
        </a>
      </div>
    );
  }

  const brandNameUpper = brand.brand_name.toUpperCase();

  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{
        backgroundColor: "#0e0e0e",
        backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(14,14,14,0.97) 40%, #0e0e0e 100%)",
        color: "#e5e5e5",
      }}
    >
      {/* Ambient glow blobs */}
      <div
        className="fixed top-0 right-0 w-[600px] h-[600px] pointer-events-none -z-10"
        style={{ background: "radial-gradient(circle, rgba(255,65,179,0.07) 0%, transparent 70%)", transform: "translate(30%,-30%)" }}
      />
      <div
        className="fixed bottom-0 left-0 w-[500px] h-[500px] pointer-events-none -z-10"
        style={{ background: "radial-gradient(circle, rgba(82,227,44,0.04) 0%, transparent 70%)", transform: "translate(-20%,20%)" }}
      />

      {/* ── TOP NAV ── */}
      <nav className="flex items-center justify-between px-6 md:px-12 lg:px-20 py-8">
        <div className="flex items-center gap-6">
          {/* Back link */}
          <Link
            href="/"
            className="flex items-center gap-2 text-sm transition-colors hover:text-white"
            style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-space-grotesk)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "11px" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Return to Main
          </Link>

          {/* Divider */}
          <div className="h-6 w-px" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />

          {/* Brand logo + name */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)" }}
            >
              <svg width="14" height="14" viewBox="0 0 48 48" fill="none">
                <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.9"/>
                <path d="M10 14C10 14 2 18 2 25C2 29.4 5.6 33 10 33C13 33 15.6 31.4 17 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8"/>
                <path d="M38 14C38 14 46 18 46 25C46 29.4 42.4 33 38 33C35 33 32.4 31.4 31 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8"/>
                <circle cx="24" cy="28" r="2" fill="white" opacity="0.9"/>
              </svg>
            </div>
            <h1
              className="text-lg font-black uppercase tracking-tight"
              style={{ fontFamily: "var(--font-plus-jakarta)" }}
            >
              The Daily Meds{" "}
              <span style={{ color: "#ff41b3" }}>×</span>{" "}
              {brandNameUpper}
            </h1>
          </div>
        </div>

        {/* Portal status */}
        <div className="hidden md:flex flex-col items-end">
          <span
            className="text-[10px] uppercase tracking-widest mb-1"
            style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-space-grotesk)" }}
          >
            Portal Status
          </span>
          <span
            className="text-xs font-bold uppercase flex items-center gap-1.5"
            style={{ color: "#52e32c", fontFamily: "var(--font-space-grotesk)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "#52e32c", boxShadow: "0 0 8px #52e32c" }}
            />
            Live Syncing
          </span>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main className="flex-1 px-6 md:px-12 lg:px-20 pb-24">

        {/* ── HERO ── */}
        <section className="mt-6 mb-16">
          <h2
            className="uppercase leading-none mb-4"
            style={{
              fontSize: "clamp(40px, 7vw, 80px)",
              fontFamily: "var(--font-plus-jakarta)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 0.9,
            }}
          >
            Brand Partnership{" "}
            <br />
            <span
              style={{
                color: "#ff41b3",
                filter: "drop-shadow(0 0 16px rgba(255,65,179,0.45))",
              }}
            >
              Portal
            </span>
          </h2>
          <p
            className="text-lg italic max-w-xl mt-5"
            style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500 }}
          >
            "If they pressed play, your brand was there to ground them."
          </p>
        </section>

        {/* ── CONTENT GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: Stats */}
          <div className="lg:col-span-8 space-y-10">

            {/* THE PRESENCE */}
            <div>
              <div className="flex items-baseline justify-between mb-6">
                <h3
                  className="text-2xl uppercase tracking-tight text-white"
                  style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}
                >
                  The Presence
                </h3>
                <span
                  className="text-[10px] uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-space-grotesk)", fontWeight: 700 }}
                >
                  Last 30 Days
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <StatCard
                  label="Meditators Joining You"
                  value={brand.meditators_reached.toLocaleString()}
                  badge={brand.meditators_delta > 0 ? `+${brand.meditators_delta}%` : `${brand.meditators_delta}%`}
                  badgeColor="#52e32c"
                />
                <StatCard
                  label="Engagement Rate"
                  value={`${brand.engagement_rate}%`}
                  badge="Optimal"
                  badgeColor="#52e32c"
                />
              </div>
            </div>

            {/* THE REVENUE */}
            <div>
              <div className="flex items-baseline justify-between mb-6">
                <h3
                  className="text-2xl uppercase tracking-tight text-white"
                  style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}
                >
                  The Revenue
                </h3>
                <span
                  className="text-[10px] uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-space-grotesk)", fontWeight: 700 }}
                >
                  Live Ledger
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <StatCard
                  label="Affiliate Sign-ups"
                  value={brand.affiliate_signups.toLocaleString()}
                  badge="Conversion Spike"
                  badgeColor="#ff41b3"
                />
                {/* Total Earned — pink number */}
                <div
                  className="rounded-xl p-8"
                  style={{
                    background: "rgba(25,25,25,0.6)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <p
                    className="text-xs uppercase tracking-widest mb-4"
                    style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-space-grotesk)", fontWeight: 700 }}
                  >
                    Total Earned
                  </p>
                  <span
                    style={{
                      fontSize: "clamp(40px, 6vw, 64px)",
                      fontFamily: "var(--font-plus-jakarta)",
                      fontWeight: 800,
                      color: "#ff41b3",
                      lineHeight: 1,
                      filter: "drop-shadow(0 0 16px rgba(255,65,179,0.4))",
                    }}
                  >
                    {formatCurrency(brand.total_earned, brand.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Upcoming Rituals sidebar */}
          <div className="lg:col-span-4">
            <div
              className="rounded-xl p-8 h-full flex flex-col"
              style={{
                background: "rgba(25,25,25,0.6)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div className="flex items-center justify-between mb-10">
                <h3
                  className="text-xl uppercase tracking-tight text-white"
                  style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}
                >
                  Upcoming Rituals
                </h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff41b3">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
              </div>

              {sessions.length > 0 ? (
                <div className="flex flex-col gap-8 flex-1">
                  {sessions.map((session) => (
                    <RitualItem key={session.id} session={session} />
                  ))}
                </div>
              ) : (
                /* Empty state — no upcoming sessions yet */
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(255,255,255,0.12)" className="mb-3">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
                    No upcoming sessions yet
                  </p>
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.15)" }}>
                    Natalie will add your sponsored sessions here
                  </p>
                </div>
              )}

              {/* Add New Ritual — only shown to Natalie (admin) */}
              <Link
                href="/admin/content"
                className="w-full mt-10 py-4 rounded-xl text-sm font-black uppercase tracking-widest text-white text-center transition-all hover:opacity-80 active:scale-95"
                style={{ background: "#ff41b3", display: "block" }}
              >
                Add New Ritual
              </Link>
            </div>
          </div>
        </div>

        {/* ── CTA SECTION ── */}
        <section
          className="mt-16 flex flex-col md:flex-row items-center justify-between gap-8 py-12"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div>
            <p
              className="text-2xl uppercase tracking-tight text-white mb-2"
              style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}
            >
              Ready for more?
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)" }}>
              Expand your partnership reach to the global community.
            </p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <button
              className="px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-white/10"
              style={{ border: "1px solid rgba(255,255,255,0.15)", backgroundColor: "rgba(38,38,38,0.8)" }}
              onClick={() => window.print()}
            >
              Download Report
            </button>
            <a
              href="mailto:hello@thedailymeds.com?subject=Campaign%20Manager%20Request"
              className="px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:bg-[#ff41b3] hover:text-white"
              style={{ backgroundColor: "white", color: "black" }}
            >
              Campaign Manager
            </a>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer
        className="px-6 md:px-12 lg:px-20 py-10"
        style={{ backgroundColor: "#000000", borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3 opacity-40">
            <svg width="20" height="20" viewBox="0 0 48 48" fill="white">
              <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" opacity="0.9"/>
              <path d="M10 14C10 14 2 18 2 25C2 29.4 5.6 33 10 33C13 33 15.6 31.4 17 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8"/>
              <path d="M38 14C38 14 46 18 46 25C46 29.4 42.4 33 38 33C35 33 32.4 31.4 31 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8"/>
              <circle cx="24" cy="28" r="2" fill="white" opacity="0.9"/>
            </svg>
            <span
              className="text-white text-sm font-bold uppercase tracking-wider"
              style={{ fontFamily: "var(--font-plus-jakarta)" }}
            >
              The Daily Meds
            </span>
          </div>

          {/* Links */}
          <div
            className="flex gap-10 text-[10px] uppercase tracking-widest font-bold"
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-space-grotesk)" }}
          >
            <a href="#" className="hover:text-[#ff41b3] transition-colors">Privacy Architecture</a>
            <a href="#" className="hover:text-[#ff41b3] transition-colors">Terms of Presence</a>
            <a href="mailto:hello@thedailymeds.com" className="hover:text-[#ff41b3] transition-colors">Partner API</a>
          </div>

          <p
            className="text-[10px] uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-space-grotesk)" }}
          >
            © 2024 The Daily Meds
          </p>
        </div>
      </footer>
    </div>
  );
}
