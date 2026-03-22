// Affiliate earnings update — sent monthly to each affiliate with their stats.
// Triggered by a monthly cron job at /api/email/affiliate-earnings.

import { Text, Link, Section, Hr } from "@react-email/components";
import EmailLayout, { emailStyles } from "./_components/EmailLayout";

type AffiliateEarningsEmailProps = {
  name: string;
  month: string;              // e.g. "March 2026"
  clicks: number;             // Link clicks this month
  signups: number;            // New signups attributed to them this month
  earningsThisMonth: number;  // £ earned this month
  totalEarnings: number;      // £ total all-time earnings
  referralCode: string;       // Their unique referral code
  referralUrl: string;        // Full shareable URL
  payoutPending: number;      // £ pending payout
};

export default function AffiliateEarningsEmail({
  name,
  month,
  clicks,
  signups,
  earningsThisMonth,
  totalEarnings,
  referralCode,
  referralUrl,
  payoutPending,
}: AffiliateEarningsEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";
  const firstName = name.split(" ")[0] || name;

  const hasEarnings = earningsThisMonth > 0;

  return (
    <EmailLayout preview={`Your Daily Meds affiliate earnings for ${month}: £${earningsThisMonth.toFixed(2)}`}>

      <Text style={emailStyles.h1}>
        Your {month} earnings 💸
      </Text>

      <Text style={emailStyles.body}>
        Hey {firstName}, here&apos;s your affiliate summary for {month}. You earn 20% on every subscription that comes through your link.
      </Text>

      {/* Stats grid */}
      <div style={emailStyles.infoBox}>

        {/* This month's stats */}
        <Text style={{ ...emailStyles.infoLabel, marginBottom: "12px" }}>This month</Text>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <div>
            <Text style={emailStyles.infoLabel}>Clicks</Text>
            <Text style={{ ...emailStyles.infoValue, fontSize: "22px" }}>{clicks}</Text>
          </div>
          <div>
            <Text style={emailStyles.infoLabel}>Signups</Text>
            <Text style={{ ...emailStyles.infoValue, fontSize: "22px" }}>{signups}</Text>
          </div>
          <div>
            <Text style={emailStyles.infoLabel}>Earned</Text>
            <Text style={{ ...emailStyles.infoValue, fontSize: "22px", color: "#A78BFA" }}>
              £{earningsThisMonth.toFixed(2)}
            </Text>
          </div>
        </div>

        <Hr style={{ ...emailStyles.hr, margin: "0 0 16px" }} />

        {/* All-time totals */}
        <Text style={{ ...emailStyles.infoLabel, marginBottom: "12px" }}>All time</Text>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <Text style={emailStyles.infoLabel}>Total earned</Text>
            <Text style={emailStyles.infoValue}>£{totalEarnings.toFixed(2)}</Text>
          </div>
          <div>
            <Text style={emailStyles.infoLabel}>Pending payout</Text>
            <Text style={{ ...emailStyles.infoValue, color: payoutPending > 0 ? "#A78BFA" : undefined }}>
              £{payoutPending.toFixed(2)}
            </Text>
          </div>
        </div>
      </div>

      {/* Earnings message */}
      {hasEarnings ? (
        <Text style={emailStyles.body}>
          Nice work this month. Payouts are processed automatically — check your affiliate dashboard for payout details and history.
        </Text>
      ) : (
        <Text style={emailStyles.body}>
          No earnings this month — but your link is still live. Share it anywhere your audience might need a reset.
        </Text>
      )}

      {/* Referral link */}
      <Text style={{ ...emailStyles.infoLabel, marginBottom: "8px" }}>Your referral link</Text>
      <div style={{
        backgroundColor: "rgba(255,255,255,0.04)",
        border: "0.5px solid rgba(255,255,255,0.1)",
        borderRadius: "6px",
        padding: "10px 14px",
        marginBottom: "24px",
      }}>
        <Text style={{ ...emailStyles.small, color: "#A78BFA", margin: "0", fontFamily: "monospace" }}>
          {referralUrl}
        </Text>
      </div>

      {/* CTA */}
      <Section style={{ textAlign: "center", margin: "4px 0 24px" }}>
        <Link href={`${appUrl}/affiliate/dashboard`} style={emailStyles.button}>
          View full dashboard →
        </Link>
      </Section>

      <Hr style={emailStyles.hr} />

      <Text style={emailStyles.small}>
        Your referral code is <strong style={{ color: "rgba(255,255,255,0.6)" }}>{referralCode}</strong>.
        Share your link on Instagram, TikTok, or anywhere your audience hangs out.
        You earn 20% of every subscription they start.
      </Text>

    </EmailLayout>
  );
}

AffiliateEarningsEmail.defaultProps = {
  name: "Sarah",
  month: "March 2026",
  clicks: 142,
  signups: 8,
  earningsThisMonth: 31.96,
  totalEarnings: 87.40,
  referralCode: "SARAH20",
  referralUrl: "https://thedailymeds.com?ref=SARAH20",
  payoutPending: 87.40,
};
