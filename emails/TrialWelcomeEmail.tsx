// Trial welcome email — sent immediately when a user starts their £1 trial.
// Triggered by checkout.session.completed in the Stripe webhook handler
// when subscription status is 'trial'.

import { Text, Link, Section, Hr } from "@react-email/components";
import EmailLayout, { emailStyles } from "./_components/EmailLayout";

type TrialWelcomeEmailProps = {
  firstName: string;      // e.g. "Natalie"
  nextLiveTime: string;   // e.g. "Saturday 19 April at 10:00 AM GMT"
  trialEndDate: string;   // e.g. "24 April 2026"
};

export default function TrialWelcomeEmail({
  firstName,
  nextLiveTime,
  trialEndDate,
}: TrialWelcomeEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";

  return (
    <EmailLayout preview="Welcome home. Your 7-day All-Access trial is now active.">

      {/* Greeting */}
      <Text style={{ ...emailStyles.small, marginBottom: "6px", letterSpacing: "2px", textTransform: "uppercase" }}>
        The Daily Meds
      </Text>

      <Text style={{ ...emailStyles.h1, fontSize: "24px", fontWeight: "600", marginBottom: "4px" }}>
        Welcome home,
      </Text>
      <Text style={{ ...emailStyles.h1, fontSize: "24px", fontWeight: "600", marginBottom: "24px" }}>
        we&apos;ve been waiting for you.
      </Text>

      <Text style={emailStyles.body}>
        Hi {firstName},
      </Text>

      <Text style={emailStyles.body}>
        Your 7-day All-Access trial is now active. Whether you are here to improve your sleep,
        reduce stress, or connect with our community, we are honoured to have you with us.
      </Text>

      <Hr style={emailStyles.hr} />

      {/* Action items */}
      <Text style={{ ...emailStyles.infoLabel, marginBottom: "16px" }}>
        Where to begin
      </Text>

      {/* Action 1 — Live session */}
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "20px" }}>
        <div style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ff41b3, #ec723d)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginRight: "14px",
          marginTop: "2px",
        }}>
          <span style={{ color: "#fff", fontSize: "13px", fontWeight: "700" }}>1</span>
        </div>
        <div>
          <Text style={{ ...emailStyles.h2, marginBottom: "4px" }}>
            Join a Live Session
          </Text>
          <Text style={{ ...emailStyles.small, color: "rgba(255,255,255,0.5)", margin: "0" }}>
            Our next live meditation is at{" "}
            <span style={{ color: "#C4B5FD", fontWeight: "600" }}>{nextLiveTime}</span>.
          </Text>
        </div>
      </div>

      {/* Action 2 — Library */}
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "20px" }}>
        <div style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ff41b3, #ec723d)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginRight: "14px",
          marginTop: "2px",
        }}>
          <span style={{ color: "#fff", fontSize: "13px", fontWeight: "700" }}>2</span>
        </div>
        <div>
          <Text style={{ ...emailStyles.h2, marginBottom: "4px" }}>
            Explore the Library
          </Text>
          <Text style={{ ...emailStyles.small, color: "rgba(255,255,255,0.5)", margin: "0" }}>
            The audio sessions await you.
          </Text>
        </div>
      </div>

      {/* Action 3 — Intention */}
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "28px" }}>
        <div style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ff41b3, #ec723d)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginRight: "14px",
          marginTop: "2px",
        }}>
          <span style={{ color: "#fff", fontSize: "13px", fontWeight: "700" }}>3</span>
        </div>
        <div>
          <Text style={{ ...emailStyles.h2, marginBottom: "4px" }}>
            Set your intention before you begin
          </Text>
          <Text style={{ ...emailStyles.small, color: "rgba(255,255,255,0.5)", margin: "0" }}>
            Why did you join today? Keep that reason close.
          </Text>
        </div>
      </div>

      {/* CTA button */}
      <Section style={{ textAlign: "center", margin: "8px 0 32px" }}>
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
          Enter the Library
        </Link>
      </Section>

      <Hr style={emailStyles.hr} />

      {/* Trial disclaimer */}
      <div style={{
        ...emailStyles.infoBox,
        background: "rgba(255,255,255,0.03)",
        border: "0.5px solid rgba(255,255,255,0.08)",
        marginBottom: "24px",
      }}>
        <Text style={{ ...emailStyles.small, color: "rgba(255,255,255,0.4)", margin: "0", lineHeight: "1.7" }}>
          <strong style={{ color: "rgba(255,255,255,0.55)" }}>Note:</strong> Your trial runs for 7 days.
          On <strong style={{ color: "rgba(255,255,255,0.55)" }}>{trialEndDate}</strong>, your subscription
          will continue at <strong style={{ color: "rgba(255,255,255,0.55)" }}>£19.99/mo</strong>.
          You can manage or change your plan at any time in your{" "}
          <Link href={`${appUrl}/profile`} style={{ color: "#A78BFA" }}>
            dashboard
          </Link>.
        </Text>
      </div>

      {/* Sign-off */}
      <Text style={{ ...emailStyles.small, color: "rgba(255,255,255,0.45)", lineHeight: "1.8" }}>
        With gratitude, we appreciate your faith in your choice to join us,
        <br />
        <span style={{ color: "rgba(255,255,255,0.65)", fontWeight: "600" }}>The Daily Meds Team</span>
      </Text>

    </EmailLayout>
  );
}

TrialWelcomeEmail.defaultProps = {
  firstName:    "Natalie",
  nextLiveTime: "Saturday 19 April at 10:00 AM GMT",
  trialEndDate: "24 April 2026",
};
