// Going Live email — sent to all Premium/Annual/Lifetime members 15 minutes
// before a live session starts. Triggered manually or via the live session
// admin panel when Natalie is about to go live.

import { Text, Link, Section, Hr } from "@react-email/components";
import EmailLayout, { emailStyles } from "./_components/EmailLayout";

type GoingLiveEmailProps = {
  firstName: string; // e.g. "Natalie"
  liveUrl: string;   // e.g. "https://thedailymeds.com/live"
};

export default function GoingLiveEmail({ firstName, liveUrl }: GoingLiveEmailProps) {
  return (
    <EmailLayout preview="We're going live in 15 minutes. Join us?">

      {/* Live badge */}
      <div style={{ marginBottom: "20px" }}>
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(255,65,179,0.12)",
          border: "0.5px solid rgba(255,65,179,0.3)",
          borderRadius: "100px",
          padding: "5px 14px",
          fontSize: "11px",
          fontWeight: "700",
          color: "#ff41b3",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
        }}>
          <span style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            backgroundColor: "#ff41b3",
            display: "inline-block",
          }} />
          Live in 15 minutes
        </span>
      </div>

      {/* Headline */}
      <Text style={{
        ...emailStyles.h1,
        fontSize: "28px",
        fontWeight: "800",
        lineHeight: "1.2",
        marginBottom: "6px",
        letterSpacing: "-0.5px",
      }}>
        We&apos;re opening
        <br />the room.
      </Text>

      <Text style={{ ...emailStyles.body, marginBottom: "24px" }}>
        Hi {firstName}, we are gathering in just a few minutes.
      </Text>

      {/* Real talk */}
      <Text style={{ ...emailStyles.body }}>
        Whatever kind of day you&apos;re having — whether you&apos;re flying high or just
        trying to crawl through the next hour — there&apos;s a seat for you here.
      </Text>

      {/* The hook */}
      <div style={{
        backgroundColor: "rgba(255,255,255,0.03)",
        border: "0.5px solid rgba(255,255,255,0.08)",
        borderLeft: "3px solid #ff41b3",
        borderRadius: "0 8px 8px 0",
        padding: "16px 18px",
        margin: "0 0 28px",
      }}>
        <Text style={{ ...emailStyles.body, margin: "0", color: "rgba(255,255,255,0.75)", fontStyle: "italic" }}>
          No need to overthink it. No need to look any certain way.
          Just show up as you are.
        </Text>
      </div>

      {/* When / Where */}
      <div style={{
        backgroundColor: "rgba(255,65,179,0.06)",
        border: "0.5px solid rgba(255,65,179,0.18)",
        borderRadius: "8px",
        padding: "18px",
        margin: "0 0 28px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
          <span style={emailStyles.infoLabel}>When</span>
          <span style={{ ...emailStyles.infoValue, fontSize: "13px", color: "#ff41b3", fontWeight: "700" }}>
            Starting in 15 minutes
          </span>
        </div>
        <div style={{ borderTop: "0.5px solid rgba(255,65,179,0.1)", paddingTop: "12px", display: "flex", justifyContent: "space-between" }}>
          <span style={emailStyles.infoLabel}>Where</span>
          <span style={{ ...emailStyles.infoValue, fontSize: "13px" }}>
            The Daily Meds Live Room
          </span>
        </div>
      </div>

      {/* CTA — extra large for mobile */}
      <Section style={{ textAlign: "center", margin: "0 0 32px" }}>
        <Link
          href={liveUrl}
          style={{
            background: "linear-gradient(90deg, #ff41b3, #ec723d)",
            color: "#ffffff",
            borderRadius: "8px",
            padding: "18px 40px",
            fontSize: "14px",
            fontWeight: "800",
            textDecoration: "none",
            display: "inline-block",
            textAlign: "center" as const,
            letterSpacing: "2px",
            textTransform: "uppercase" as const,
            boxShadow: "0 0 30px rgba(255,65,179,0.35)",
          }}
        >
          Join the gathering
        </Link>
      </Section>

      <Hr style={emailStyles.hr} />

      {/* Sign-off */}
      <Text style={{ ...emailStyles.small, color: "rgba(255,255,255,0.45)", lineHeight: "1.8" }}>
        See you in there,
        <br />
        <span style={{ color: "rgba(255,255,255,0.65)", fontWeight: "600" }}>The Daily Meds Team</span>
      </Text>

    </EmailLayout>
  );
}

GoingLiveEmail.defaultProps = {
  firstName: "Natalie",
  liveUrl:   "https://thedailymeds.com/live",
};
