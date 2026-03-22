"use client";

// Affiliate dashboard — shows the logged-in affiliate their stats and referral link.
// Fetches real data from the Supabase affiliates table.
// If the user hasn't applied yet, prompts them to apply.

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase-browser";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

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

// A single stat card in the dashboard grid
function StatCard({
  label,
  value,
  sub,
  gradient,
}: {
  label: string;
  value: string;
  sub?: string;
  gradient: string;
}) {
  return (
    <div
      className="rounded-[12px] p-5"
      style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.07)" }}
    >
      <div className="w-8 h-8 rounded-full mb-3" style={{ background: gradient }} />
      <p className="text-2xl text-white mb-0.5" style={{ fontWeight: 500 }}>{value}</p>
      <p className="text-xs text-white/40">{label}</p>
      {sub && <p className="text-[11px] text-white/20 mt-1">{sub}</p>}
    </div>
  );
}

export default function AffiliateDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [affiliate, setAffiliate] = useState<AffiliateRecord | null>(null);
  const [userId, setUserId] = useState("");
  const [copied, setCopied] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Build the referral link from the affiliate's referral_code
  const referralLink = affiliate
    ? `${appUrl}?ref=${affiliate.referral_code}`
    : "";

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);

      // Try to load the affiliate record for this user
      const { data } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setAffiliate(data ?? null);
      setLoading(false);
    });
  }, []);

  async function copyLink() {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Format a number as £ currency
  function gbp(amount: number) {
    return `£${amount.toFixed(2)}`;
  }

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

  // User hasn't applied yet
  if (!affiliate) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "linear-gradient(135deg, #6B21E8, #22D3EE)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
            </div>
            <h1 className="text-xl text-white mb-2" style={{ fontWeight: 500 }}>
              You haven't applied yet
            </h1>
            <p className="text-sm text-white/40 mb-6 leading-relaxed">
              Join the affiliate programme to get your unique referral link and start earning 20% commission.
            </p>
            <Link
              href="/affiliate"
              className="inline-flex px-6 py-3 rounded-[10px] text-sm text-white transition-opacity hover:opacity-80"
              style={{ background: "linear-gradient(135deg, #6B21E8, #22D3EE)", fontWeight: 500 }}
            >
              Apply now
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const pendingPayout = affiliate.earnings - affiliate.paid_out;
  const conversionRate = affiliate.clicks > 0
    ? `${((affiliate.signups / affiliate.clicks) * 100).toFixed(1)}%`
    : "—";

  // Status badge config
  const statusConfig = {
    pending:  { label: "Application pending", color: "#F97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.3)" },
    approved: { label: "Approved", color: "#10B981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)" },
    rejected: { label: "Not approved", color: "#F43F5E", bg: "rgba(244,63,94,0.1)", border: "rgba(244,63,94,0.3)" },
  };
  const status = statusConfig[affiliate.status];

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
      <Navbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 pb-24">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl text-white" style={{ fontWeight: 500 }}>Affiliate Dashboard</h1>
            <p className="text-sm text-white/35 mt-1">Track your referrals and earnings</p>
          </div>
          {/* Status badge */}
          <div
            className="px-3 py-1.5 rounded-full text-xs"
            style={{ backgroundColor: status.bg, border: `0.5px solid ${status.border}`, color: status.color, fontWeight: 500 }}
          >
            {status.label}
          </div>
        </div>

        {/* Pending message */}
        {affiliate.status === "pending" && (
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-[10px] mb-6 text-sm"
            style={{ backgroundColor: "rgba(249,115,22,0.06)", border: "0.5px solid rgba(249,115,22,0.2)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#F97316" className="shrink-0 mt-0.5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p className="text-white/50 leading-relaxed">
              Your application is under review. We'll email you within 48 hours. Your referral link is ready — you can start sharing now and clicks will be tracked even during review.
            </p>
          </div>
        )}

        {/* ── REFERRAL LINK ── */}
        <div
          className="rounded-[14px] p-5 sm:p-6 mb-6"
          style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-xs text-white/40 mb-3" style={{ letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Your referral link
          </p>
          <div className="flex items-center gap-3">
            <div
              className="flex-1 px-4 py-3 rounded-[8px] min-w-0"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.07)" }}
            >
              <p className="text-sm text-white/60 truncate">{referralLink}</p>
            </div>
            <button
              onClick={copyLink}
              className="shrink-0 px-4 py-3 rounded-[8px] text-sm text-white transition-all"
              style={{
                background: copied
                  ? "rgba(16,185,129,0.15)"
                  : "linear-gradient(135deg, #6B21E8, #22D3EE)",
                border: copied ? "0.5px solid rgba(16,185,129,0.4)" : "none",
                color: copied ? "#10B981" : "white",
                fontWeight: 500,
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-white/20 mt-3">
            Share this link anywhere — everyone who signs up via it is tracked to you.
          </p>
        </div>

        {/* ── STATS GRID ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Total clicks"
            value={affiliate.clicks.toLocaleString()}
            gradient="linear-gradient(135deg, #6B21E8, #22D3EE)"
          />
          <StatCard
            label="Signups"
            value={affiliate.signups.toLocaleString()}
            sub={`${conversionRate} conversion`}
            gradient="linear-gradient(135deg, #F43F5E, #FACC15)"
          />
          <StatCard
            label="Total earned"
            value={gbp(affiliate.earnings)}
            gradient="linear-gradient(135deg, #10B981, #D9F100)"
          />
          <StatCard
            label="Pending payout"
            value={gbp(pendingPayout)}
            sub={`${gbp(affiliate.paid_out)} paid out`}
            gradient="linear-gradient(135deg, #F97316, #FACC15)"
          />
        </div>

        {/* ── HOW TO SHARE ── */}
        <div
          className="rounded-[14px] p-5 sm:p-6 mb-6"
          style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-sm text-white mb-4" style={{ fontWeight: 500 }}>Tips for sharing</h2>
          <div className="flex flex-col gap-3">
            {[
              { platform: "📸 Instagram", tip: "Add your referral link to your bio. Share a story showing your favourite session." },
              { platform: "🎵 TikTok", tip: "Make a video about how meditation helped you with hangover anxiety or comedown stress. Link in bio." },
              { platform: "🐦 Twitter / X", tip: "Post about Daily Meds after a session. Honest and personal posts convert best." },
              { platform: "💬 WhatsApp / iMessage", tip: "Send your link directly to friends who'd benefit. Personal recommendations convert extremely well." },
            ].map((item) => (
              <div key={item.platform} className="flex items-start gap-3">
                <span className="text-sm shrink-0 mt-0.5">{item.platform.split(" ")[0]}</span>
                <div>
                  <p className="text-xs text-white/60" style={{ fontWeight: 500 }}>{item.platform.split(" ").slice(1).join(" ")}</p>
                  <p className="text-xs text-white/30 leading-relaxed">{item.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PAYOUT INFO ── */}
        <div
          className="rounded-[14px] p-5 sm:p-6"
          style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-sm text-white mb-3" style={{ fontWeight: 500 }}>Payouts</h2>
          <p className="text-xs text-white/40 leading-relaxed mb-3">
            Earnings are paid monthly via bank transfer or PayPal. Minimum payout threshold is £20. Contact Natalie directly at{" "}
            <a href="mailto:hello@thedailymeds.com" className="text-white/60 hover:text-white transition-colors">
              hello@thedailymeds.com
            </a>{" "}
            to request a payout or ask any questions.
          </p>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-[8px] text-xs text-white/40"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.06)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            Automated payouts via Stripe are coming soon. For now, request manually by email.
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
