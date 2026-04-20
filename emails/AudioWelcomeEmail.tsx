// Audio-Only welcome email — sent when a user subscribes to the £9.99/mo Audio plan.
// Triggered by checkout.session.completed in the Stripe webhook handler
// when subscription_status is 'audio'.

import { Text, Link, Section, Hr } from "@react-email/components";
import EmailLayout, { emailStyles } from "./_components/EmailLayout";

type AudioWelcomeEmailProps = {
  firstName: string; // e.g. "Natalie"
};

// The three mood categories shown in the email
const CATEGORIES = [
  {
    label: "The Morning After",
    description: "Try our 'Hungover' or 'Comedown' sessions to reset.",
  },
  {
    label: "The Real Stuff",
    description: "Navigate 'Loneliness' or 'Rejection' with guided support.",
  },
  {
    label: "The Comfort Zone",
    description: "'Snuggle Down' or start your 'Morning Journal' practice.",
  },
];

export default function AudioWelcomeEmail({ firstName }: AudioWelcomeEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";

  return (
    <EmailLayout preview="Whatever you're feeling, we have a med for that.">

      {/* Eyebrow */}
      <Text style={{ ...emailStyles.small, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>
        Audio Access — Active
      </Text>

      {/* Headline */}
      <Text style={{ ...emailStyles.h1, fontSize: "22px", fontWeight: "700", lineHeight: "1.25", marginBottom: "6px" }}>
        Whatever you&apos;re feeling,
      </Text>
      <Text style={{ ...emailStyles.h1, fontSize: "22px", fontWeight: "700", lineHeight: "1.25", marginBottom: "24px" }}>
        we have a med for that.
      </Text>

      {/* Greeting + opening */}
      <Text style={emailStyles.body}>
        Hi {firstName},
      </Text>
      <Text style={emailStyles.body}>
        Welcome to The Daily Meds. We&apos;re here for the real stuff.
      </Text>

      {/* Main body */}
      <Text style={emailStyles.body}>
        You now have full access to the entire audio library. We don&apos;t just do
        &apos;quiet&apos; — we do real life. Whether you&apos;re navigating a rough comedown,
        feeling the weight of rejection, or just want to snuggle down and hide from the world,
        we have a session for exactly where you are right now.
      </Text>

      <Hr style={emailStyles.hr} />

      {/* Category cards */}
      <Text style={{ ...emailStyles.infoLabel, marginBottom: "16px" }}>
        Start here
      </Text>

      {CATEGORIES.map((cat, i) => (
        <div
          key={i}
          style={{
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "0.5px solid rgba(255,255,255,0.08)",
            borderLeft: "3px solid #ff41b3",
            borderRadius: "0 8px 8px 0",
            padding: "14px 16px",
            marginBottom: "12px",
          }}
        >
          <Text style={{ ...emailStyles.h2, fontSize: "14px", fontWeight: "700", marginBottom: "4px", color: "#ffffff" }}>
            {cat.label}
          </Text>
          <Text style={{ ...emailStyles.small, color: "rgba(255,255,255,0.5)", margin: "0" }}>
            {cat.description}
          </Text>
        </div>
      ))}

      {/* CTA */}
      <Section style={{ textAlign: "center", margin: "28px 0 32px" }}>
        <Link
          href={`${appUrl}/library`}
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
          Browse the Library
        </Link>
      </Section>

      <Hr style={emailStyles.hr} />

      {/* Sign-off */}
      <Text style={{ ...emailStyles.small, color: "rgba(255,255,255,0.45)", lineHeight: "1.8" }}>
        With gratitude, thank you for trusting us with your headspace.
        <br />
        <span style={{ color: "rgba(255,255,255,0.65)", fontWeight: "600" }}>The Daily Meds Team</span>
      </Text>

    </EmailLayout>
  );
}

AudioWelcomeEmail.defaultProps = {
  firstName: "Natalie",
};
