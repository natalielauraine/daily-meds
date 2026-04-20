"use client";

// Profile / Settings page — same card design language as /stats.
// Left: avatar card with change-photo. Right: bento settings cards.
// Account, Security, Subscription, Preferences, Danger Zone.

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "../../lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ── REUSABLE CARD ─────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{ backgroundColor: "#1a1a1a", border: "0.5px solid rgba(255,255,255,0.07)" }}
    >
      {children}
    </div>
  );
}

// ── SETTING ROW ───────────────────────────────────────────────────────────────

function SettingRow({
  label,
  value,
  accent = "rgba(255,255,255,0.5)",
  onClick,
  href,
  danger = false,
}: {
  label: string;
  value?: string;
  accent?: string;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
}) {
  const inner = (
    <div
      className="flex items-center justify-between px-5 py-4 transition-colors cursor-pointer"
      style={{ borderBottom: "0.5px solid rgba(255,255,255,0.05)" }}
      onClick={onClick}
    >
      <div className="flex flex-col gap-0.5">
        <span
          className="text-sm"
          style={{ color: danger ? "#ff5555" : "#e2e2e2", fontFamily: "var(--font-manrope)", fontWeight: 500 }}
        >
          {label}
        </span>
        {value && (
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-manrope)" }}>
            {value}
          </span>
        )}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill={danger ? "#ff5555" : "rgba(255,255,255,0.2)"}>
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
      </svg>
    </div>
  );

  if (href) return <Link href={href} className="block hover:bg-white/[0.02]">{inner}</Link>;
  return <div className="hover:bg-white/[0.02]">{inner}</div>;
}

// ── INLINE EDIT FIELD ─────────────────────────────────────────────────────────

function InlineEdit({
  label,
  value,
  type = "text",
  onSave,
  accent,
}: {
  label: string;
  value: string;
  type?: string;
  onSave: (v: string) => Promise<void>;
  accent?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(val);
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  }

  if (editing) {
    return (
      <div
        className="flex flex-col gap-3 px-5 py-4"
        style={{ borderBottom: "0.5px solid rgba(255,255,255,0.05)" }}
      >
        <label className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-lexend)" }}>
          {label}
        </label>
        <input
          type={type}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
          style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,65,142,0.4)" }}
          autoFocus
        />
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: accent || "#ff41b3", color: "#fff", fontFamily: "var(--font-lexend)" }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => { setEditing(false); setVal(value); }}
            className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-lexend)" }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] cursor-pointer transition-colors"
      style={{ borderBottom: "0.5px solid rgba(255,255,255,0.05)" }}
      onClick={() => setEditing(true)}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-sm" style={{ color: "#e2e2e2", fontWeight: 500, fontFamily: "var(--font-manrope)" }}>{label}</span>
        <span className="text-xs" style={{ color: saved ? "#adf225" : "rgba(255,255,255,0.3)", fontFamily: "var(--font-manrope)" }}>
          {saved ? "Saved" : (value || "Not set")}
        </span>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
      </svg>
    </div>
  );
}

// ── SECTION LABEL ─────────────────────────────────────────────────────────────

function SectionLabel({ children, accent = "#ff41b3" }: { children: string; accent?: string }) {
  return (
    <p
      className="text-xs uppercase tracking-widest px-5 pt-5 pb-3"
      style={{ color: accent, fontFamily: "var(--font-space-grotesk)", fontWeight: 700 }}
    >
      {children}
    </p>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [passwordMsg, setPasswordMsg] = useState("");
  const [upgradingToLifetime, setUpgradingToLifetime] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.push("/login"); return; }
      setUser(u);
      setAvatarUrl(u.user_metadata?.avatar_url);

      const { data: profile } = await supabase
        .from("users")
        .select("subscription_status")
        .eq("id", u.id)
        .single();
      if (profile?.subscription_status) setSubscriptionStatus(profile.subscription_status);

      setLoading(false);
    }
    load();
  }, []);

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Member";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  function formatMemberSince(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  }

  // ── HANDLERS ──────────────────────────────────────────────────────────────

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!upErr) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } });
      setAvatarUrl(data.publicUrl);
    }
    setUploadingAvatar(false);
  }

  async function handleUpdateName(name: string) {
    await supabase.auth.updateUser({ data: { full_name: name } });
    setUser((u) => u ? { ...u, user_metadata: { ...u.user_metadata, full_name: name } } : u);
  }

  async function handleUpdateEmail(email: string) {
    await supabase.auth.updateUser({ email });
  }

  async function handleSendPasswordReset() {
    if (!user?.email) return;
    await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    setPasswordMsg("Reset link sent to your email.");
    setTimeout(() => setPasswordMsg(""), 4000);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleUpgradeToLifetime() {
    setUpgradingToLifetime(true);
    try {
      const res = await fetch("/api/stripe/upgrade-to-lifetime", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Lifetime upgrade error:", data.error);
        setUpgradingToLifetime(false);
      }
    } catch {
      setUpgradingToLifetime(false);
    }
  }

  const PLAN_LABELS: Record<string, { label: string; color: string }> = {
    free:     { label: "Free Plan",            color: "rgba(255,255,255,0.4)" },
    trial:    { label: "Trial · 7 days",        color: "#ff41b3" },
    audio:    { label: "Audio · £9.99/mo",      color: "#ff41b3" },
    monthly:  { label: "Monthly · £19.99/mo",   color: "#ff41b3" },
    annual:   { label: "Annual · £199.99/yr",   color: "#ec723d" },
    lifetime: { label: "Lifetime Member",       color: "#adf225" },
  };
  const plan = PLAN_LABELS[subscriptionStatus] ?? PLAN_LABELS.free;

  // Show founding member upsell for any paid plan that isn't lifetime
  const showFoundingMemberUpsell = subscriptionStatus !== "free" && subscriptionStatus !== "lifetime";

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#131313" }}>
      <Navbar />

      {/* ── HERO HEADER ── */}
      <div
        className="relative w-full"
        style={{
          background: "linear-gradient(180deg, rgba(30,10,25,0.9) 0%, #131313 100%)",
          paddingTop: "64px",
          paddingBottom: "48px",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: "#ff41b3", fontFamily: "var(--font-space-grotesk)", fontWeight: 700 }}
          >
            Your account
          </p>
          <h1
            className="text-4xl sm:text-5xl text-white uppercase"
            style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 }}
          >
            Profile &amp;<br />Settings
          </h1>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16" style={{ marginTop: "-16px" }}>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl h-80 animate-pulse" style={{ backgroundColor: "#1a1a1a" }} />
            <div className="lg:col-span-2 flex flex-col gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl h-36 animate-pulse" style={{ backgroundColor: "#1a1a1a" }} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* ── LEFT: AVATAR CARD ── */}
            <Card className="p-6 flex flex-col items-center text-center gap-4 self-start">

              {/* Avatar with pink gradient border */}
              <div className="relative">
                <div
                  className="p-[3px] rounded-2xl"
                  style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)" }}
                >
                  <div
                    className="w-28 h-28 rounded-xl overflow-hidden flex items-center justify-center"
                    style={{ backgroundColor: "#1a1a1a" }}
                  >
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt={displayName} width={112} height={112} className="w-full h-full object-cover" unoptimized />
                    ) : (
                      <span className="text-4xl text-white" style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}>
                        {avatarInitial}
                      </span>
                    )}
                  </div>
                </div>

                {/* Upload overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: "#ff41b3", border: "2px solid #131313" }}
                  title="Change photo"
                >
                  {uploadingAvatar ? (
                    <div className="w-3 h-3 rounded-full border border-white/30 border-t-white animate-spin" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>

              {/* Name + email */}
              <div>
                <h2 className="text-xl text-white mb-0.5" style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}>
                  {displayName}
                </h2>
                <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>{user?.email}</p>
                {/* Plan badge */}
                <span
                  className="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-widest"
                  style={{
                    background: subscriptionStatus === "free" ? "rgba(255,255,255,0.06)" : "rgba(255,65,179,0.15)",
                    border: `0.5px solid ${subscriptionStatus === "free" ? "rgba(255,255,255,0.1)" : "rgba(255,65,179,0.3)"}`,
                    color: plan.color,
                    fontFamily: "var(--font-space-grotesk)",
                  }}
                >
                  {plan.label}
                </span>
              </div>

              <div className="w-full" style={{ height: "0.5px", backgroundColor: "rgba(255,255,255,0.07)" }} />

              {/* Quick links */}
              <div className="w-full flex flex-col gap-2">
                <Link
                  href="/stats"
                  className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors hover:bg-white/[0.04]"
                  style={{ backgroundColor: "#111111" }}
                >
                  <span className="text-sm text-white/60" style={{ fontFamily: "var(--font-manrope)" }}>View your stats</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </Link>
                <Link
                  href="/library"
                  className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors hover:bg-white/[0.04]"
                  style={{ backgroundColor: "#111111" }}
                >
                  <span className="text-sm text-white/60" style={{ fontFamily: "var(--font-manrope)" }}>Browse library</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </Link>
              </div>

              {user?.created_at && (
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-space-grotesk)" }}>
                  Member since {formatMemberSince(user.created_at)}
                </p>
              )}
            </Card>

            {/* ── RIGHT: SETTINGS BENTO ── */}
            <div className="lg:col-span-2 flex flex-col gap-4">

              {/* ACCOUNT */}
              <Card>
                <SectionLabel accent="#ff41b3">Account</SectionLabel>
                <InlineEdit
                  label="Display name"
                  value={displayName}
                  onSave={handleUpdateName}
                  accent="#ff41b3"
                />
                <InlineEdit
                  label="Email address"
                  value={user?.email || ""}
                  type="email"
                  onSave={handleUpdateEmail}
                  accent="#ff41b3"
                />
                <div
                  className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] cursor-pointer transition-colors"
                  onClick={handleSendPasswordReset}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm" style={{ color: "#e2e2e2", fontWeight: 500, fontFamily: "var(--font-manrope)" }}>Change password</span>
                    <span className="text-xs" style={{ color: passwordMsg ? "#adf225" : "rgba(255,255,255,0.3)", fontFamily: "var(--font-manrope)" }}>
                      {passwordMsg || "Send reset link to your email"}
                    </span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </div>
              </Card>

              {/* SUBSCRIPTION & BILLING */}
              <Card>
                <SectionLabel accent="#ec723d">Subscription &amp; Billing</SectionLabel>
                <div
                  className="flex items-center justify-between px-5 py-4"
                  style={{ borderBottom: "0.5px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm" style={{ color: "#e2e2e2", fontWeight: 500, fontFamily: "var(--font-manrope)" }}>Current plan</span>
                    <span className="text-xs font-bold" style={{ color: plan.color, fontFamily: "var(--font-manrope)" }}>
                      {plan.label}
                    </span>
                  </div>
                  {subscriptionStatus === "free" && (
                    <Link
                      href="/pricing"
                      className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:scale-105"
                      style={{ background: "#ff41b3", color: "#fff", fontFamily: "var(--font-lexend)" }}
                    >
                      Upgrade
                    </Link>
                  )}
                </div>
                {showFoundingMemberUpsell && (
                  <div
                    className="mx-4 my-4 rounded-2xl overflow-hidden"
                    style={{ background: "linear-gradient(135deg, rgba(255,65,179,0.12), rgba(236,114,61,0.12))", border: "0.5px solid rgba(255,65,179,0.25)" }}
                  >
                    <div className="px-5 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1">
                          <p className="text-xs uppercase tracking-widest font-bold" style={{ color: "#ec723d", fontFamily: "var(--font-space-grotesk)" }}>
                            Founding Member
                          </p>
                          <p className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
                            Own it forever · £297 once
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-manrope)" }}>
                            Lifetime access, no recurring charges, locked-in price.
                          </p>
                        </div>
                        <button
                          onClick={handleUpgradeToLifetime}
                          disabled={upgradingToLifetime}
                          className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)", color: "#fff", fontFamily: "var(--font-lexend)" }}
                        >
                          {upgradingToLifetime ? "…" : "Upgrade"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <SettingRow label="Billing details" value="Manage payment method" href="/pricing" />
                <SettingRow label="Billing history" value="View past invoices" href="/pricing" />
                {subscriptionStatus !== "free" && (
                  <SettingRow label="Cancel subscription" value="You'll keep access until the end of your period" href="/pricing" />
                )}
              </Card>

              {/* PREFERENCES */}
              <Card>
                <SectionLabel accent="#adf225">Preferences</SectionLabel>
                <SettingRow label="Notifications" value="Manage push and email alerts" href="/profile" />
                <SettingRow label="Language" value="English" href="/profile" />
                <SettingRow label="Offline downloads" value="Manage downloaded sessions" href="/downloads" />
                <SettingRow label="Playlists" value="View and edit your playlists" href="/playlists" />
              </Card>

              {/* DANGER ZONE */}
              <Card>
                <SectionLabel accent="rgba(255,85,85,0.8)">Account Actions</SectionLabel>
                <div
                  className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] cursor-pointer transition-colors"
                  style={{ borderBottom: "0.5px solid rgba(255,255,255,0.05)" }}
                  onClick={handleSignOut}
                >
                  <span className="text-sm" style={{ color: "#e2e2e2", fontWeight: 500, fontFamily: "var(--font-manrope)" }}>Sign out</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                </div>
                <div
                  className="flex items-center justify-between px-5 py-4 hover:bg-red-500/5 cursor-pointer transition-colors"
                  onClick={() => {/* TODO: delete account flow */}}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm" style={{ color: "#ff5555", fontWeight: 500, fontFamily: "var(--font-manrope)" }}>Delete account</span>
                    <span className="text-xs" style={{ color: "rgba(255,85,85,0.4)", fontFamily: "var(--font-manrope)" }}>Permanently remove your data</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,85,85,0.4)">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </div>
              </Card>

            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
