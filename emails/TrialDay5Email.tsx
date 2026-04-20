// Day 5 trial reminder email — sent 48 hours before the £1 trial rolls into £19.99/mo.
// Triggered by a cron job or scheduled send at day 5 of the trial.

import { Text, Link, Section, Hr } from "@react-email/components";
import EmailLayout, { emailStyles } from "./_components/EmailLayout";

type TrialDay5EmailProps = {
  firstName: string;    // e.g. "Natalie"
  trialEndDate: string; // e.g. "24 April 2026"
};

const OPTIONS = [
  {
    label: "Stay Premium",
    detail: "Keep full access to Lives + Audio for £19.99/mo.",
    highlight: true,
  },
  {
    label: "Switch to Audio",
    detail: "Just want the library? Move to the £9.99/mo plan in your dashboard.",
    highlight: false,
  },
  {
    label: "Manage Anytime",
    detail: "You're in control. Cancel or change your plan whenever you need to via the Stripe portal.",
    highlight: false,
  },
];

export default function TrialDay5Email({ firstName, trialEndDate }: TrialDay5EmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";

  return (
    <EmailLayout preview={`Your trial ends in 48 hours. Here's what happens next.`}>

      {/* Eyebrow */}
      <Text style={{ ...emailStyles.small, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>
        Trial Update
      </Text>

      {/* Headline */}
      <Text style={{ ...emailStyles.h1, fontSize: "22px", fontWeight: "700", lineHeight: "1.25", marginBottom: "24px" }}>
        Keeping your toolkit open.
      </Text>

      {/* Greeting + opening */}
      <Text style={emailStyles.body}>
        Hi {firstName},
      </Text>
      <Text style={emailStyles.body}>
        We hope you&apos;ve been finding what you need at The Daily Meds these last few days.
        Whether you&apos;ve joined us for a Live session or tucked into the library to deal with
        a rough morning, we&apos;re glad you&apos;re here.
      </Text>

      {/* 48-hour notice box */}
      <div style={{
        backgroundColor: "rgba(255,65,179,0.07)",
        border: "0.5px solid rgba(255,65,179,0.25)",
        borderRadius: "8px",
        padding: "16px 18px",
        margin: "4px 0 24px",
      }}>
        <Text style={{ ...emailStyles.body, margin: "0", color: "rgba(255,255,255,0.8)" }}>
          Your All-Access trial ends in{" "}
          <strong style={{ color: "#ff41b3" }}>48 hours</strong>. On{" "}
          <strong style={{ color: "#ffffff" }}>{trialEndDate}</strong>, your subscription
          will continue at <strong style={{ color: "#ffffff" }}>£19.99/mo</strong>.
        </Text>
      </div>

      {/* The choice */}
      <Text style={emailStyles.body}>
        We want you here because the platform helps you navigate the real stuff — from the
        snuggle-down nights to the rejection and hangovers. If you&apos;re getting value from
        the Live sessions and the full library, you don&apos;t need to do a thing.
      </Text>

      <Hr style={emailStyles.hr} />

      {/* Options */}
      <Text style={{ ...emailStyles.infoLabel, marginBottom: "16px" }}>
        Your options
      </Text>

      {OPTIONS.map((opt, i) => (
        <div
          key={i}
          style={{
            backgroundColor: opt.highlight ? "rgba(255,65,179,0.06)" : "rgba(255,255,255,0.02)",
            border: opt.highlight
              ? "0.5px solid rgba(255,65,179,0.2)"
              : "0.5px solid rgba(255,255,255,0.07)",
            borderRadius: "8px",
            padding: "14px 16px",
            marginBottom: "10px",
          }}
        >
          <Text style={{
            ...emailStyles.h2,
            fontSize: "14px",
            fontWeight: "700",
            marginBottom: "4px",
            color: opt.highlight ? "#ff41b3" : "#ffffff",
          }}>
            {opt.highlight ? "★  " : ""}{opt.label}
          </Text>
          <Text style={{ ...emailStyles.small, color: "rgba(255,255,255,0.5)", margin: "0", lineHeight: "1.6" }}>
            {opt.detail}
          </Text>
        </div>
      ))}

      {/* CTA */}
      <Section style={{ textAlign: "center", margin: "28px 0 32px" }}>
        <Link
          href={`${appUrl}/profile`}
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
          Go to my dashboard
        </Link>
      </Section>

      <Hr style={emailStyles.hr} />

      {/* Sign-off */}
      <Text style={{ ...emailStyles.small, color: "rgba(255,255,255,0.45)", lineHeight: "1.8" }}>
        With gratitude, thanks for being part of the community.
        <br />
        <span style={{ color: "rgba(255,255,255,0.65)", fontWeight: "600" }}>The Daily Meds Team</span>
      </Text>

    </EmailLayout>
  );
}

TrialDay5Email.defaultProps = {
  firstName:    "Natalie",
  trialEndDate: "24 April 2026",
};
