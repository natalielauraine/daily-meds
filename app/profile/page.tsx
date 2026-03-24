"use client";

// User profile page — shows the logged-in user's avatar, membership status,
// quick stats and recent session history.
// Fetches the real user from Supabase on mount. Mock data used for session history
// until Supabase user_progress table is populated with real content.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StatusBadge from "../components/ui/StatusBadge";

// ── MOCK SESSION HISTORY ───────────────────────────────────────────────────────
// Replace with a real Supabase query to user_progress once content is uploaded.

const MOCK_HISTORY = [
  { id: "1", title: "Hungover & Overwhelmed", type: "Guided Meditation", duration: "18 min", moodCategory: "Hungover", gradient: "linear-gradient(135deg, #6B21E8, #22D3EE)", completedAt: "Today" },
  { id: "3", title: "3am Brain", type: "Sleep Audio", duration: "14 min", moodCategory: "Can't Sleep", gradient: "linear-gradient(135deg, #8B3CF7, #6366F1)", completedAt: "Yesterday" },
  { id: "4", title: "Anxiety First Aid", type: "Breathwork", duration: "8 min", moodCategory: "Anxious", gradient: "linear-gradient(135deg, #F43F5E, #F97316)", completedAt: "2 days ago" },
  { id: "2", title: "Come Down Slowly", type: "Breathwork", duration: "22 min", moodCategory: "On A Comedown", gradient: "linear-gradient(135deg, #10B981, #D9F100)", completedAt: "4 days ago" },
  { id: "5", title: "The Morning After", type: "Guided Meditation", duration: "12 min", moodCategory: "After The Sesh", gradient: "linear-gradient(135deg, #F43F5E, #FACC15)", completedAt: "Last week" },
];

// Membership tier config — label, colours, description
const MEMBERSHIP_CONFIG: Record<string, { label: string; gradient: string; description: string }> = {
  free: {
    label: "Free",
    gradient: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))",
    description: "Access to free sessions only",
  },
  monthly: {
    label: "Monthly",
    gradient: "linear-gradient(135deg, #8B5CF6, #6366F1)",
    description: "Full library access · £19.99/mo",
  },
  annual: {
    label: "Annual",
    gradient: "linear-gradient(135deg, #F97316, #EAB308)",
    description: "Full library + downloads · £199.99/yr",
  },
  lifetime: {
    label: "Lifetime",
    gradient: "linear-gradient(135deg, #F43F5E, #D946EF, #6366F1, #22D3EE)",
    description: "Everything, forever",
  },
};

// Quick stat card — shown in the row below the avatar
function QuickStat({ value, label, href }: { value: string; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex-1 flex flex-col items-center gap-1 py-4 rounded-[10px] hover:bg-white/[0.04] transition-colors"
      style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
    >
      <span className="text-xl text-white" style={{ fontWeight: 500 }}>{value}</span>
      <span className="text-xs text-white/40">{label}</span>
    </Link>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [renewalDate, setRenewalDate] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState("");

  // Fetch the current user and their subscription status on mount
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);

      // Fetch subscription_status from our users table
      const { data: profile } = await supabase
        .from("users")
        .select("subscription_status")
        .eq("id", data.user.id)
        .single();
      if (profile?.subscription_status) setSubscriptionStatus(profile.subscription_status);

      // Fetch renewal date from Stripe (only matters for paid subscribers)
      if (profile?.subscription_status && profile.subscription_status !== "free") {
        const portalRes = await fetch("/api/stripe/customer-portal");
        if (portalRes.ok) {
          const portalData = await portalRes.json();
          if (portalData.renewalDate) setRenewalDate(portalData.renewalDate);
        }
      }

      setLoading(false);
    });
  }, []);

  // Open the Stripe Customer Portal so users can manage or cancel their subscription
  async function handleManageSubscription() {
    setPortalLoading(true);
    setPortalError("");
    try {
      const res = await fetch("/api/stripe/customer-portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setPortalError(data.error ?? "Could not open billing portal. Please try again.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setPortalError("Network error — please try again.");
    } finally {
      setPortalLoading(false);
    }
  }

  // Sign out and redirect home
  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  // Get display name — prefer Google name, fall back to email prefix
  const displayName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split("@")[0]
    || "Your Account";

  // First letter of name for the avatar initial
  const avatarInitial = displayName[0]?.toUpperCase() || "U";

  // Google avatar photo (if user signed in with Google)
  const avatarPhoto = user?.user_metadata?.avatar_url || null;

  const membershipKey = MEMBERSHIP_CONFIG[subscriptionStatus] ? subscriptionStatus : "free";
  const membership = MEMBERSHIP_CONFIG[membershipKey];

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-purple-400 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">

        {/* ── PROFILE HEADER ── */}
        <div
          className="rounded-[10px] p-6 sm:p-8 mb-6 flex flex-col items-center text-center"
          style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          {/* Avatar — Google photo if available, otherwise coloured initial */}
          <div className="mb-4">
            {avatarPhoto ? (
              <img
                src={avatarPhoto}
                alt={displayName}
                className="w-20 h-20 rounded-full object-cover"
                style={{ border: "2px solid rgba(255,255,255,0.12)" }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl text-white"
                style={{
                  background: "linear-gradient(135deg, #8B5CF6, #6366F1)",
                  fontWeight: 500,
                  border: "2px solid rgba(255,255,255,0.12)",
                }}
              >
                {avatarInitial}
              </div>
            )}
          </div>

          {/* Name */}
          <h1 className="text-xl text-white mb-1" style={{ fontWeight: 500 }}>
            {displayName}
          </h1>

          {/* Email */}
          <p className="text-sm text-white/40 mb-4">{user?.email}</p>

          {/* Membership badge */}
          <div className="mb-5">
            <StatusBadge tier={subscriptionStatus} />
          </div>

          <p className="text-xs text-white/30 mb-1">{membership.description}</p>

          {/* Renewal date — shown for monthly/annual subscribers */}
          {renewalDate && (
            <p className="text-xs text-white/25 mb-5">Renews {renewalDate}</p>
          )}
          {/* Lifetime — never renews */}
          {membershipKey === "lifetime" && (
            <p className="text-xs text-white/25 mb-5">Never expires</p>
          )}
          {/* Free or no renewal info — just add spacing */}
          {!renewalDate && membershipKey !== "lifetime" && (
            <div className="mb-5" />
          )}

          {/* Upgrade button — only shown to free users */}
          {membershipKey === "free" && (
            <Link
              href="/pricing"
              className="px-5 py-2 rounded-md text-sm text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
            >
              Upgrade to Premium
            </Link>
          )}

          {/* Manage subscription button — only shown to paid members */}
          {membershipKey !== "free" && (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="px-5 py-2 rounded-md text-sm text-white/70 transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ border: "0.5px solid rgba(255,255,255,0.15)", fontWeight: 500 }}
              >
                {portalLoading ? "Loading…" : "Manage subscription"}
              </button>
              {portalError && <p className="text-xs text-red-400">{portalError}</p>}
            </div>
          )}
        </div>

        {/* ── QUICK STATS ROW ── */}
        <div className="flex gap-3 mb-6">
          <QuickStat value="7" label="Day streak" href="/stats" />
          <QuickStat value="28" label="Sessions" href="/stats" />
          <QuickStat value="342" label="Minutes" href="/stats" />
        </div>

        {/* ── RECENT SESSIONS ── */}
        <div
          className="rounded-[10px] p-6 mb-6"
          style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm text-white" style={{ fontWeight: 500 }}>Recent sessions</h2>
            <Link href="/stats" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              View all stats →
            </Link>
          </div>

          <div className="flex flex-col gap-1">
            {MOCK_HISTORY.map((session) => (
              <Link
                key={session.id}
                href={`/session/${session.id}`}
                className="flex items-center gap-3 p-3 -mx-3 rounded-lg hover:bg-white/[0.04] transition-colors group"
              >
                {/* Small gradient circle */}
                <div
                  className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center"
                  style={{ background: session.gradient }}
                >
                  <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
                    <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.9"/>
                  </svg>
                </div>

                {/* Session info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 truncate group-hover:text-white transition-colors" style={{ fontWeight: 500 }}>
                    {session.title}
                  </p>
                  <p className="text-xs text-white/35">{session.type} · {session.duration}</p>
                </div>

                {/* Date */}
                <span className="text-xs text-white/25 shrink-0">{session.completedAt}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── ACCOUNT SETTINGS ── */}
        <div
          className="rounded-[10px] overflow-hidden"
          style={{ border: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          {/* Row — membership (links to pricing for free users, opens portal for paid) */}
          {membershipKey === "free" ? (
            <Link
              href="/pricing"
              className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors"
              style={{ backgroundColor: "#1A1A2E", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
            >
              <span className="text-sm text-white/70">Membership &amp; billing</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
              </svg>
            </Link>
          ) : (
            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors text-left disabled:opacity-50"
              style={{ backgroundColor: "#1A1A2E", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
            >
              <span className="text-sm text-white/70">Membership &amp; billing</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
              </svg>
            </button>
          )}

          {/* Row — playlists */}
          <Link
            href="/playlists"
            className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors"
            style={{ backgroundColor: "#1A1A2E", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
          >
            <span className="text-sm text-white/70">My playlists</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
            </svg>
          </Link>

          {/* Row — stats */}
          <Link
            href="/stats"
            className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors"
            style={{ backgroundColor: "#1A1A2E", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
          >
            <span className="text-sm text-white/70">My stats</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
            </svg>
          </Link>

          {/* Row — affiliate */}
          <Link
            href="/affiliate"
            className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors"
            style={{ backgroundColor: "#1A1A2E", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
          >
            <span className="text-sm text-white/70">Affiliate programme</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
            </svg>
          </Link>

          {/* Row — sign out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors text-left"
            style={{ backgroundColor: "#1A1A2E" }}
          >
            <span className="text-sm text-red-400/80">Sign out</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(248,113,113,0.5)">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
          </button>
        </div>

      </main>

      <Footer />
    </div>
  );
}
