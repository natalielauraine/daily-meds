// Payment confirmation email — sent when a user's Stripe payment succeeds.
// Triggered by checkout.session.completed in the Stripe webhook handler.

import { Text, Link, Section, Hr } from "@react-email/components";
import EmailLayout, { emailStyles } from "./_components/EmailLayout";

type PaymentConfirmationEmailProps = {
  name: string;
  planName: string;       // e.g. "Monthly", "Annual", "Lifetime"
  amount: string;         // e.g. "£19.99"
  period: string;         // e.g. "/month", "/year", "one-time"
  nextBillingDate?: string; // e.g. "22 April 2026" — empty for lifetime
};

// What each plan unlocks — shown in the confirmation
const PLAN_FEATURES: Record<string, string[]> = {
  Monthly: [
    "Full session library — all mood categories",
    "Live sessions with Natalie",
    "Group meditation rooms",
    "Playlists and watchlist",
    "Offline downloads",
  ],
  Annual: [
    "Everything in Monthly",
    "Priority support",
    "Early access to new content",
    "Founding member status",
  ],
  Lifetime: [
    "Everything in Annual",
    "Access forever — never pay again",
    "All future content included",
    "Direct access to Natalie",
  ],
};

export default function PaymentConfirmationEmail({
  name,
  planName,
  amount,
  period,
  nextBillingDate,
}: PaymentConfirmationEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";
  const firstName = name.split(" ")[0] || name;
  const features = PLAN_FEATURES[planName] ?? PLAN_FEATURES.Monthly;

  return (
    <EmailLayout preview={`Payment confirmed. Your ${planName} plan is now active.`}>

      <Text style={emailStyles.h1}>You&apos;re in. 🎧</Text>

      <Text style={emailStyles.body}>
        Payment confirmed, {firstName}. Your <strong style={{ color: "#C4B5FD" }}>{planName}</strong> plan is now active — everything is unlocked.
      </Text>

      {/* Payment summary box */}
      <div style={emailStyles.infoBox}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={emailStyles.infoLabel}>Plan</span>
          <span style={{ ...emailStyles.infoValue, fontSize: "13px" }}>{planName}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: nextBillingDate ? "10px" : "0" }}>
          <span style={emailStyles.infoLabel}>Amount paid</span>
          <span style={{ ...emailStyles.infoValue, fontSize: "13px" }}>{amount}{period}</span>
        </div>
        {nextBillingDate && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={emailStyles.infoLabel}>Next billing</span>
            <span style={{ ...emailStyles.infoValue, fontSize: "13px" }}>{nextBillingDate}</span>
          </div>
        )}
      </div>

      {/* What's unlocked */}
      <Text style={{ ...emailStyles.infoLabel, marginBottom: "10px" }}>What you now have access to</Text>
      {features.map((feature) => (
        <Text key={feature} style={{ ...emailStyles.small, color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>
          ✓ &nbsp;{feature}
        </Text>
      ))}

      {/* CTA */}
      <Section style={{ textAlign: "center", margin: "28px 0 24px" }}>
        <Link href={`${appUrl}/library`} style={emailStyles.button}>
          Start listening →
        </Link>
      </Section>

      <Hr style={emailStyles.hr} />

      <Text style={emailStyles.small}>
        Need to manage or cancel your subscription?{" "}
        <Link href={`${appUrl}/profile`} style={{ color: "#A78BFA" }}>
          Go to your profile
        </Link>
        {" "}— you&apos;re in full control, cancel any time.
      </Text>

    </EmailLayout>
  );
}

PaymentConfirmationEmail.defaultProps = {
  name: "Natalie",
  planName: "Annual",
  amount: "£199.99",
  period: "/year",
  nextBillingDate: "22 April 2027",
};
