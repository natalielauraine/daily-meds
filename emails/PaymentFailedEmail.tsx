// Payment failed email — sent when a Stripe invoice payment fails.
// Triggered by invoice.payment_failed in the Stripe webhook handler.

import { Text, Link, Section, Hr } from "@react-email/components";
import EmailLayout, { emailStyles } from "./_components/EmailLayout";

type PaymentFailedEmailProps = {
  firstName: string; // e.g. "Natalie"
};

export default function PaymentFailedEmail({ firstName }: PaymentFailedEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";

  return (
    <EmailLayout preview="Your card said 'no'. Here's how to fix it.">

      {/* Eyebrow */}
      <Text style={{ ...emailStyles.small, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>
        Payment Update
      </Text>

      {/* Headline */}
      <Text style={{ ...emailStyles.h1, fontSize: "22px", fontWeight: "700", lineHeight: "1.25", marginBottom: "24px" }}>
        Your card said &apos;no&apos;.
        <br />
        <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "18px", fontWeight: "500" }}>
          (We&apos;ve been there.)
        </span>
      </Text>

      {/* Greeting */}
      <Text style={emailStyles.body}>
        Hi {firstName},
      </Text>

      {/* Opening */}
      <Text style={emailStyles.body}>
        Just a quick heads-up: your payment for The Daily Meds didn&apos;t go through.
      </Text>

      {/* Real talk section */}
      <div style={{
        backgroundColor: "rgba(255,255,255,0.03)",
        border: "0.5px solid rgba(255,255,255,0.08)",
        borderLeft: "3px solid rgba(255,255,255,0.2)",
        borderRadius: "0 8px 8px 0",
        padding: "16px 18px",
        margin: "4px 0 24px",
      }}>
        <Text style={{ ...emailStyles.body, margin: "0", color: "rgba(255,255,255,0.7)" }}>
          Maybe your card expired, or maybe the bank account is feeling a bit thin this week.
          No judgment — we&apos;ve all been there.
        </Text>
      </div>

      {/* The pivot */}
      <Text style={emailStyles.body}>
        If you&apos;re genuinely stressed about money right now, we actually have a session in
        the library called{" "}
        <Link href={`${appUrl}/library`} style={{ color: "#ff41b3", textDecoration: "none", fontWeight: "600" }}>
          &apos;Financial Stress&apos;
        </Link>
        {" "}to help you navigate that specific brand of anxiety. Go have a listen.
      </Text>

      <Hr style={emailStyles.hr} />

      {/* Action options */}
      <Text style={{ ...emailStyles.infoLabel, marginBottom: "16px" }}>
        What to do next
      </Text>

      <div style={{
        backgroundColor: "rgba(255,65,179,0.06)",
        border: "0.5px solid rgba(255,65,179,0.2)",
        borderRadius: "8px",
        padding: "14px 16px",
        marginBottom: "10px",
      }}>
        <Text style={{ ...emailStyles.h2, fontSize: "14px", fontWeight: "700", marginBottom: "4px", color: "#ffffff" }}>
          Ready to fix it?
        </Text>
        <Text style={{ ...emailStyles.small, color: "rgba(255,255,255,0.5)", margin: "0", lineHeight: "1.6" }}>
          If it was just a technical glitch or an expired card, update your details
          in the portal below to keep your toolkit open.
        </Text>
      </div>

      <div style={{
        backgroundColor: "rgba(255,255,255,0.02)",
        border: "0.5px solid rgba(255,255,255,0.07)",
        borderRadius: "8px",
        padding: "14px 16px",
        marginBottom: "28px",
      }}>
        <Text style={{ ...emailStyles.h2, fontSize: "14px", fontWeight: "700", marginBottom: "4px", color: "#ffffff" }}>
          Need a hand?
        </Text>
        <Text style={{ ...emailStyles.small, color: "rgba(255,255,255,0.5)", margin: "0", lineHeight: "1.6" }}>
          If you&apos;re struggling, just reply to this email. We&apos;re humans, not robots.
        </Text>
      </div>

      {/* CTA */}
      <Section style={{ textAlign: "center", margin: "0 0 32px" }}>
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
          Update my card
        </Link>
      </Section>

      <Hr style={emailStyles.hr} />

      {/* Sign-off */}
      <Text style={{ ...emailStyles.small, color: "rgba(255,255,255,0.45)", lineHeight: "1.8" }}>
        With gratitude (and a shared understanding of how annoying life can be),
        <br />
        <span style={{ color: "rgba(255,255,255,0.65)", fontWeight: "600" }}>The Daily Meds Team</span>
      </Text>

    </EmailLayout>
  );
}

PaymentFailedEmail.defaultProps = {
  firstName: "Natalie",
};
