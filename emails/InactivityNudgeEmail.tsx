// Inactivity Nudge email — sent to users who haven't logged in for 4 days.
// Tone: direct and helpful. No guilt, no crying emojis.
// Triggered by the /api/email/inactivity-nudge cron job (runs daily at 9am).

import { Text, Link, Section, Hr } from "@react-email/components";
import EmailLayout, { emailStyles } from "./_components/EmailLayout";

type InactivityNudgeEmailProps = {
  firstName: string;
};

export default function InactivityNudgeEmail({ firstName }: InactivityNudgeEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";
  // Update this path to the actual 'Instant Calm' session slug once it's in the library
  const quickResetUrl = `${appUrl}/library`;

  return (
    <EmailLayout preview="A 5-minute reset?">

      {/* Headline */}
      <Text style={{
        ...emailStyles.h1,
        fontSize: "28px",
        fontWeight: "800",
        lineHeight: "1.2",
        marginBottom: "6px",
        letterSpacing: "-0.5px",
      }}>
        A 5-minute reset?
      </Text>

      {/* Greeting + opener */}
      <Text style={{ ...emailStyles.body }}>
        Hi {firstName},
      </Text>

      <Text style={{ ...emailStyles.body }}>
        We noticed you haven&apos;t been around for a few days.
      </Text>

      {/* Real talk section — left-bordered quote style */}
      <div style={{
        backgroundColor: "rgba(255,255,255,0.03)",
        border: "0.5px solid rgba(255,255,255,0.08)",
        borderLeft: "3px solid #ff41b3",
        borderRadius: "0 8px 8px 0",
        padding: "16px 18px",
        margin: "0 0 24px",
      }}>
        <Text style={{ ...emailStyles.body, margin: "0", color: "rgba(255,255,255,0.75)" }}>
          We get it—life gets loud, schedules get messy, and sometimes the last thing
          you want to do is &apos;work&apos; on your headspace.
        </Text>
      </div>

      {/* The solution */}
      <Text style={{ ...emailStyles.body }}>
        You don&apos;t need to do a full gathering or a long session. Just take 5 minutes.
        Whether you&apos;re dealing with a frantic morning or a heavy evening, we have a
        short reset waiting for you.
      </Text>

      {/* Action cards */}
      <div style={{ margin: "0 0 28px" }}>

        {/* Quick Reset */}
        <div style={{
          backgroundColor: "rgba(255,65,179,0.06)",
          border: "0.5px solid rgba(255,65,179,0.2)",
          borderRadius: "8px",
          padding: "16px 18px",
          marginBottom: "10px",
        }}>
          <Text style={{
            margin: "0 0 4px",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "1.5px",
            textTransform: "uppercase" as const,
            color: "#ff41b3",
          }}>
            Quick Reset
          </Text>
          <Text style={{ ...emailStyles.body, margin: "0", color: "rgba(255,255,255,0.75)", fontSize: "14px" }}>
            Try our 5-minute &apos;Instant Calm&apos; session.
          </Text>
        </div>

        {/* Snuggle Down */}
        <div style={{
          backgroundColor: "rgba(236,114,61,0.06)",
          border: "0.5px solid rgba(236,114,61,0.2)",
          borderRadius: "8px",
          padding: "16px 18px",
        }}>
          <Text style={{
            margin: "0 0 4px",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "1.5px",
            textTransform: "uppercase" as const,
            color: "#ec723d",
          }}>
            Snuggle Down
          </Text>
          <Text style={{ ...emailStyles.body, margin: "0", color: "rgba(255,255,255,0.75)", fontSize: "14px" }}>
            If today was just too much, try our sleep prep.
          </Text>
        </div>

      </div>

      {/* CTA */}
      <Section style={{ textAlign: "center", margin: "0 0 32px" }}>
        <Link
          href={quickResetUrl}
          style={{
            background: "linear-gradient(90deg, #ff41b3, #ec723d)",
            color: "#ffffff",
            borderRadius: "8px",
            padding: "16px 36px",
            fontSize: "13px",
            fontWeight: "800",
            textDecoration: "none",
            display: "inline-block",
            textAlign: "center" as const,
            letterSpacing: "2px",
            textTransform: "uppercase" as const,
          }}
        >
          Take 5 minutes
        </Link>
      </Section>

      <Hr style={emailStyles.hr} />

      {/* Sign-off */}
      <Text style={{ ...emailStyles.small, color: "rgba(255,255,255,0.45)", lineHeight: "1.8" }}>
        We&apos;re here when you&apos;re ready.
        <br />
        <span style={{ color: "rgba(255,255,255,0.65)", fontWeight: "600" }}>The Daily Meds Team</span>
      </Text>

    </EmailLayout>
  );
}

InactivityNudgeEmail.defaultProps = {
  firstName: "Friend",
};
