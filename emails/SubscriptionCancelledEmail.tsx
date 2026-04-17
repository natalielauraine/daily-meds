// Subscription cancelled email — sent when a user's Stripe subscription ends.
// Triggered by customer.subscription.deleted in the Stripe webhook handler.

import { Text, Link, Section, Hr } from "@react-email/components";
import EmailLayout, { emailStyles } from "./_components/EmailLayout";

type SubscriptionCancelledEmailProps = {
  firstName: string;      // e.g. "Natalie"
  periodEndDate: string;  // e.g. "22 April 2026" — last day of paid access
};

export default function SubscriptionCancelledEmail({
  firstName,
  periodEndDate,
}: SubscriptionCancelledEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";

  return (
    <EmailLayout preview="No hard feelings. Your free sessions are still yours.">

      {/* Eyebrow */}
      <Text style={{ ...emailStyles.small, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>
        Subscription Confirmed Cancelled
      </Text>

      {/* Headline */}
      <Text style={{ ...emailStyles.h1, fontSize: "22px", fontWeight: "700", lineHeight: "1.25", marginBottom: "24px" }}>
        No hard feelings.
        <br />
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "18px", fontWeight: "500" }}>
          We&apos;re still here if you need us.
        </span>
      </Text>

      {/* Greeting + opening */}
      <Text style={emailStyles.body}>
        Hi {firstName},
      </Text>
      <Text style={emailStyles.body}>
        This email is just to confirm that your subscription has been cancelled. You&apos;ll
        still have full access to the library until{" "}
        <strong style={{ color: "#ffffff" }}>{periodEndDate}</strong>.
      </Text>

      {/* Real talk */}
      <div style={{
        backgroundColor: "rgba(255,255,255,0.03)",
        border: "0.5px solid rgba(255,255,255,0.08)",
        borderLeft: "3px solid rgba(255,255,255,0.15)",
        borderRadius: "0 8px 8px 0",
        padding: "16px 18px",
        margin: "4px 0 24px",
      }}>
        <Text style={{ ...emailStyles.body, margin: "0", color: "rgba(255,255,255,0.65)" }}>
          Life changes, priorities shift, and sometimes you just need one less monthly bill.
          We get it.
        </Text>
      </div>

      {/* Safety net */}
      <div style={{
        backgroundColor: "rgba(255,65,179,0.05)",
        border: "0.5px solid rgba(255,65,179,0.15)",
        borderRadius: "8px",
        padding: "18px",
        margin: "0 0 24px",
      }}>
        <Text style={{ ...emailStyles.infoLabel, marginBottom: "10px" }}>
          What you keep — forever
        </Text>
        <Text style={{ ...emailStyles.body, margin: "0", color: "rgba(255,255,255,0.7)", lineHeight: "1.7" }}>
          Even though your paid plan is ending, your account isn&apos;t going anywhere. You still
          have access to our{" "}
          <strong style={{ color: "#ffffff" }}>free sessions</strong> at all times. Whether
          it&apos;s a rough morning or you just need to &apos;Snuggle Down&apos;, those sessions
          are yours forever.
        </Text>
      </div>

      {/* Door's open */}
      <Text style={emailStyles.body}>
        When things get heavy again — whether it&apos;s a comedown, a breakup, or just the Tuesday
        blues — we&apos;ll be right here. You can jump back in whenever you&apos;re ready.
        No awkwardness.
      </Text>

      {/* CTA */}
      <Section style={{ textAlign: "center", margin: "28px 0 32px" }}>
        <Link
          href={`${appUrl}/free`}
          style={{
            background: "linear-gradient(90deg, #ff41b3, #ec723d)",
            color: "#ffffff",
            borderRadius: "8px",
            padding: "15px 36px",
            fontSize: "13px",
            fontWeight: "700",
            textDecoration: "none",
            display: "inline-block",
            textAlign: "center" as const,
            letterSpacing: "1.5px",
            textTransform: "uppercase" as const,
          }}
        >
          Browse the free sessions
        </Link>
      </Section>

      <Hr style={emailStyles.hr} />

      {/* Sign-off */}
      <Text style={{ ...emailStyles.small, color: "rgba(255,255,255,0.45)", lineHeight: "1.8" }}>
        With gratitude for the time you spent with us,
        <br />
        <span style={{ color: "rgba(255,255,255,0.65)", fontWeight: "600" }}>The Daily Meds Team</span>
      </Text>

    </EmailLayout>
  );
}

SubscriptionCancelledEmail.defaultProps = {
  firstName:     "Natalie",
  periodEndDate: "22 April 2026",
};
