// Trial ending reminder email — sent 3 days before a £1 trial expires.
// Triggered by customer.subscription.trial_will_end in the Stripe webhook handler.

import { Text, Link, Section, Hr } from "@react-email/components";
import EmailLayout, { emailStyles } from "./_components/EmailLayout";

type TrialEndingEmailProps = {
  name: string;
  trialEndDate: string;   // e.g. "22 April 2026"
  amount: string;         // e.g. "£19.99"
};

export default function TrialEndingEmail({
  name,
  trialEndDate,
  amount,
}: TrialEndingEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";
  const firstName = name.split(" ")[0] || name;

  return (
    <EmailLayout preview={`Your trial ends on ${trialEndDate} — here's what happens next.`}>

      <Text style={emailStyles.h1}>Your trial is ending soon.</Text>

      <Text style={emailStyles.body}>
        Hey {firstName} — just a heads up. Your 7-day all-access trial ends on{" "}
        <strong style={{ color: "#C4B5FD" }}>{trialEndDate}</strong>.
      </Text>

      <Text style={emailStyles.body}>
        After that, you&apos;ll automatically roll onto the Premium plan at{" "}
        <strong style={{ color: "#C4B5FD" }}>{amount}/month</strong>. Nothing to do —
        your card on file will be charged automatically and your access continues without interruption.
      </Text>

      {/* Summary box */}
      <div style={emailStyles.infoBox}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={emailStyles.infoLabel}>Trial ends</span>
          <span style={{ ...emailStyles.infoValue, fontSize: "13px" }}>{trialEndDate}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={emailStyles.infoLabel}>Plan after trial</span>
          <span style={{ ...emailStyles.infoValue, fontSize: "13px" }}>Premium — {amount}/month</span>
        </div>
      </div>

      <Text style={{ ...emailStyles.small, color: "rgba(255,255,255,0.5)", marginBottom: "24px" }}>
        Premium includes full audio library, live sessions with Natalie, and group meditation rooms.
        If it&apos;s not for you, cancel any time before your trial ends and you won&apos;t be charged anything more.
      </Text>

      {/* CTA */}
      <Section style={{ textAlign: "center", margin: "28px 0 24px" }}>
        <Link href={`${appUrl}/library`} style={emailStyles.button}>
          Keep exploring →
        </Link>
      </Section>

      <Hr style={emailStyles.hr} />

      <Text style={emailStyles.small}>
        Want to cancel before the trial ends?{" "}
        <Link href={`${appUrl}/profile`} style={{ color: "#A78BFA" }}>
          Go to your profile
        </Link>{" "}
        — you&apos;re in full control.
      </Text>

    </EmailLayout>
  );
}

TrialEndingEmail.defaultProps = {
  name: "Natalie",
  trialEndDate: "22 April 2026",
  amount: "£19.99",
};
