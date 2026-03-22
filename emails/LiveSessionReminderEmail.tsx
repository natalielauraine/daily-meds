// Live session reminder — sent 1 hour before a scheduled live session.
// Triggered by a cron job at /api/email/live-reminder.

import { Text, Link, Section, Hr } from "@react-email/components";
import EmailLayout, { emailStyles } from "./_components/EmailLayout";

type LiveSessionReminderEmailProps = {
  name: string;
  sessionTitle: string;
  startTime: string;      // e.g. "7:00 PM GMT" — formatted before sending
  startDate: string;      // e.g. "Saturday 22 March"
  joinUrl: string;        // Full URL to join the live session
  sessionDescription: string;
};

export default function LiveSessionReminderEmail({
  name,
  sessionTitle,
  startTime,
  startDate,
  joinUrl,
  sessionDescription,
}: LiveSessionReminderEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";
  const firstName = name.split(" ")[0] || name;

  return (
    <EmailLayout preview={`🔴 Live in 1 hour: ${sessionTitle} with Natalie — join from ${appUrl}`}>

      {/* Live badge */}
      <div style={{ marginBottom: "16px" }}>
        <span style={{
          display: "inline-block",
          backgroundColor: "rgba(244,63,94,0.15)",
          border: "0.5px solid rgba(244,63,94,0.3)",
          borderRadius: "100px",
          padding: "3px 10px",
          fontSize: "11px",
          color: "#F87171",
          fontWeight: "500",
        }}>
          ● LIVE IN 1 HOUR
        </span>
      </div>

      <Text style={emailStyles.h1}>{sessionTitle}</Text>

      <Text style={emailStyles.body}>
        Hey {firstName} — your live session with Natalie starts in one hour. Get comfy, find somewhere quiet, and join when you&apos;re ready.
      </Text>

      {/* Session details */}
      <div style={emailStyles.infoBox}>
        <div style={{ marginBottom: "10px" }}>
          <Text style={emailStyles.infoLabel}>Date</Text>
          <Text style={emailStyles.infoValue}>{startDate}</Text>
        </div>
        <div>
          <Text style={emailStyles.infoLabel}>Time</Text>
          <Text style={emailStyles.infoValue}>{startTime}</Text>
        </div>
      </div>

      <Text style={{ ...emailStyles.body, color: "rgba(255,255,255,0.5)" }}>
        {sessionDescription}
      </Text>

      {/* Join CTA */}
      <Section style={{ textAlign: "center", margin: "28px 0 24px" }}>
        <Link href={joinUrl} style={{
          ...emailStyles.button,
          backgroundColor: "#F43F5E",
        }}>
          Join the live session →
        </Link>
      </Section>

      <Hr style={emailStyles.hr} />

      <Text style={emailStyles.small}>
        Running late? The session will stay open — join when you can.
        Can&apos;t make it?{" "}
        <Link href={`${appUrl}/live`} style={{ color: "#A78BFA" }}>
          See future live sessions
        </Link>
        .
      </Text>

    </EmailLayout>
  );
}

LiveSessionReminderEmail.defaultProps = {
  name: "Natalie",
  sessionTitle: "Sunday Reset — Comedown Edition",
  startTime: "7:00 PM GMT",
  startDate: "Sunday 23 March 2026",
  joinUrl: "https://thedailymeds.com/live",
  sessionDescription: "A gentle live group session for the end of the weekend. Breathwork, body scan and a proper reset before Monday.",
};
