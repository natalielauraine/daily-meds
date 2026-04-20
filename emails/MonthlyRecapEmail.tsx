// Monthly Recap + Lifetime Upsell email — sent to active Monthly subscribers.
// Triggered by a cron job on the 1st of each month.
// Stats are pulled from the user's session history in Supabase.

import { Text, Link, Section, Hr } from "@react-email/components";
import EmailLayout, { emailStyles } from "./_components/EmailLayout";

type MonthlyRecapEmailProps = {
  firstName: string;       // e.g. "Natalie"
  totalMinutes: number;    // e.g. 240
  sessionsCount: number;   // e.g. 12
  liveAttendances: number; // e.g. 3
};

export default function MonthlyRecapEmail({
  firstName,
  totalMinutes,
  sessionsCount,
  liveAttendances,
}: MonthlyRecapEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";

  return (
    <EmailLayout preview="Your month at The Daily Meds — plus a special invite.">

      {/* Eyebrow */}
      <Text style={{ ...emailStyles.small, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>
        Your Monthly Recap
      </Text>

      {/* Headline */}
      <Text style={{ ...emailStyles.h1, fontSize: "22px", fontWeight: "700", lineHeight: "1.25", marginBottom: "24px" }}>
        You&apos;ve been showing up
        <br />for yourself lately.
      </Text>

      <Text style={emailStyles.body}>
        Hi {firstName}, here&apos;s how your last 30 days looked:
      </Text>

      {/* ── STAT BOX ── */}
      <div style={{
        background: "linear-gradient(135deg, #1a0010 0%, #1a1a2e 60%, #0a1500 100%)",
        border: "0.5px solid rgba(255,65,179,0.2)",
        borderRadius: "12px",
        padding: "24px",
        margin: "0 0 28px",
      }}>
        {/* Top label */}
        <Text style={{ ...emailStyles.infoLabel, marginBottom: "20px", textAlign: "center" as const }}>
          30-Day Stats
        </Text>

        {/* Three stats in a row */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>

          {/* Minutes */}
          <div style={{
            flex: 1,
            backgroundColor: "rgba(255,255,255,0.04)",
            borderRadius: "8px",
            padding: "14px 10px",
            textAlign: "center" as const,
            border: "0.5px solid rgba(255,255,255,0.07)",
          }}>
            <Text style={{
              fontSize: "28px",
              fontWeight: "800",
              color: "#ff41b3",
              margin: "0 0 4px",
              lineHeight: "1",
              fontFamily: "Inter, -apple-system, sans-serif",
            }}>
              {totalMinutes}
            </Text>
            <Text style={{
              ...emailStyles.small,
              color: "rgba(255,255,255,0.4)",
              margin: "0",
              fontSize: "10px",
              lineHeight: "1.4",
            }}>
              Minutes<br />Gathered
            </Text>
          </div>

          {/* Sessions */}
          <div style={{
            flex: 1,
            backgroundColor: "rgba(255,255,255,0.04)",
            borderRadius: "8px",
            padding: "14px 10px",
            textAlign: "center" as const,
            border: "0.5px solid rgba(255,255,255,0.07)",
          }}>
            <Text style={{
              fontSize: "28px",
              fontWeight: "800",
              color: "#ec723d",
              margin: "0 0 4px",
              lineHeight: "1",
              fontFamily: "Inter, -apple-system, sans-serif",
            }}>
              {sessionsCount}
            </Text>
            <Text style={{
              ...emailStyles.small,
              color: "rgba(255,255,255,0.4)",
              margin: "0",
              fontSize: "10px",
              lineHeight: "1.4",
            }}>
              Sessions<br />Completed
            </Text>
          </div>

          {/* Live */}
          <div style={{
            flex: 1,
            backgroundColor: "rgba(255,255,255,0.04)",
            borderRadius: "8px",
            padding: "14px 10px",
            textAlign: "center" as const,
            border: "0.5px solid rgba(255,255,255,0.07)",
          }}>
            <Text style={{
              fontSize: "28px",
              fontWeight: "800",
              color: "#C4B5FD",
              margin: "0 0 4px",
              lineHeight: "1",
              fontFamily: "Inter, -apple-system, sans-serif",
            }}>
              {liveAttendances}
            </Text>
            <Text style={{
              ...emailStyles.small,
              color: "rgba(255,255,255,0.4)",
              margin: "0",
              fontSize: "10px",
              lineHeight: "1.4",
            }}>
              Live<br />Gatherings
            </Text>
          </div>

        </div>
      </div>

      {/* The pivot */}
      <Text style={emailStyles.body}>
        Whether you joined us to handle a hangover, a comedown, or just to find a moment of
        stillness, we&apos;re proud of you for doing the work.
      </Text>

      <Hr style={emailStyles.hr} />

      {/* ── LIFETIME OFFER CARD ── */}
      <div style={{
        background: "linear-gradient(135deg, #1a0010 0%, #1f1f1f 60%, #0a1500 100%)",
        border: "1.5px solid rgba(255,65,179,0.3)",
        borderRadius: "12px",
        padding: "24px",
        margin: "0 0 28px",
        position: "relative" as const,
      }}>
        {/* Badge */}
        <div style={{ marginBottom: "16px" }}>
          <span style={{
            display: "inline-block",
            background: "linear-gradient(90deg, #ff41b3, #ec723d)",
            color: "#fff",
            borderRadius: "100px",
            padding: "4px 14px",
            fontSize: "10px",
            fontWeight: "700",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
          }}>
            Special Invite — Limited Seats
          </span>
        </div>

        <Text style={{ ...emailStyles.h1, fontSize: "20px", fontWeight: "800", marginBottom: "6px" }}>
          Founding Member
        </Text>

        {/* Price */}
        <div style={{ marginBottom: "16px" }}>
          <span style={{ fontSize: "36px", fontWeight: "800", color: "#E2E2E2", lineHeight: "1", fontFamily: "Inter, -apple-system, sans-serif" }}>
            £297
          </span>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", marginLeft: "8px" }}>
            one-time, never again
          </span>
        </div>

        <Text style={{ ...emailStyles.body, color: "rgba(255,255,255,0.65)" }}>
          You&apos;ve become a core part of this community. We want to offer you a way to stay here
          forever without another monthly bill. We are opening up a few Founding Member seats for a
          one-time payment of £297.
        </Text>

        <Text style={{ ...emailStyles.body, color: "rgba(255,255,255,0.65)", marginBottom: "0" }}>
          Pay once, own your toolkit for life. No more subscriptions, no more price increases.
          Just a permanent home for when life gets messy.
        </Text>

        {/* What's included */}
        <div style={{ marginTop: "18px" }}>
          {[
            "Full library — forever",
            "All future content included",
            "Live sessions with Natalie",
            "No renewals, no surprises",
          ].map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ color: "#adf225", marginRight: "8px", fontSize: "13px" }}>✓</span>
              <Text style={{ ...emailStyles.small, color: "rgba(255,255,255,0.6)", margin: "0" }}>
                {f}
              </Text>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Section style={{ textAlign: "center", margin: "0 0 32px" }}>
        <Link
          href={`${appUrl}/pricing#founder`}
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
            boxShadow: "0 0 30px rgba(255,65,179,0.3)",
          }}
        >
          Become a Founding Member
        </Link>
      </Section>

      <Hr style={emailStyles.hr} />

      {/* Sign-off */}
      <Text style={{ ...emailStyles.small, color: "rgba(255,255,255,0.45)", lineHeight: "1.8" }}>
        With gratitude for your consistency,
        <br />
        <span style={{ color: "rgba(255,255,255,0.65)", fontWeight: "600" }}>The Daily Meds Team</span>
      </Text>

    </EmailLayout>
  );
}

MonthlyRecapEmail.defaultProps = {
  firstName:       "Natalie",
  totalMinutes:    240,
  sessionsCount:   12,
  liveAttendances: 3,
};
