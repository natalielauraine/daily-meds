// New session notification — sent to all users when Natalie publishes new content.
// Triggered manually from the admin dashboard at /api/email/new-session.

import { Text, Link, Section, Hr } from "@react-email/components";
import EmailLayout, { emailStyles } from "./_components/EmailLayout";

type NewSessionEmailProps = {
  sessionTitle: string;
  moodCategory: string;   // e.g. "Anxious", "Can't Sleep"
  sessionType: string;    // e.g. "Guided Meditation", "Breathwork", "Sleep Audio"
  duration: string;       // e.g. "18 min"
  sessionUrl: string;     // Full URL to the session page
  isFree: boolean;        // Whether free users can access it
  description: string;    // Short session description
};

// Mood category → gradient colour for the accent
const MOOD_COLOURS: Record<string, string> = {
  "Hungover":        "#6B21E8",
  "After The Sesh":  "#F43F5E",
  "On A Comedown":   "#10B981",
  "Feeling Empty":   "#6B21E8",
  "Can't Sleep":     "#8B3CF7",
  "Anxious":         "#F43F5E",
  "Heartbroken":     "#EC4899",
  "Overwhelmed":     "#F97316",
  "Low Energy":      "#10B981",
  "Morning Reset":   "#F43F5E",
  "Focus Mode":      "#6B21E8",
};

export default function NewSessionEmail({
  sessionTitle,
  moodCategory,
  sessionType,
  duration,
  sessionUrl,
  isFree,
  description,
}: NewSessionEmailProps) {
  const accentColor = MOOD_COLOURS[moodCategory] ?? "#8B5CF6";

  return (
    <EmailLayout preview={`New on Daily Meds: ${sessionTitle} — ${duration} · ${moodCategory}`}>

      {/* New label */}
      <Text style={{ ...emailStyles.infoLabel, marginBottom: "14px", color: "#A78BFA" }}>
        ✦ New session just dropped
      </Text>

      <Text style={emailStyles.h1}>{sessionTitle}</Text>

      {/* Mood + type + duration badges */}
      <div style={{ marginBottom: "16px" }}>
        <span style={{
          ...emailStyles.moodBadge,
          backgroundColor: `${accentColor}20`,
          borderColor: `${accentColor}40`,
          color: "#C4B5FD",
          marginRight: "8px",
        }}>
          {moodCategory}
        </span>
        <span style={{ ...emailStyles.small, color: "rgba(255,255,255,0.35)" }}>
          {sessionType} · {duration}
          {isFree && " · FREE"}
        </span>
      </div>

      <Text style={emailStyles.body}>{description}</Text>

      {/* CTA */}
      <Section style={{ textAlign: "center", margin: "28px 0 24px" }}>
        <Link href={sessionUrl} style={emailStyles.button}>
          Listen now →
        </Link>
      </Section>

      <Hr style={emailStyles.hr} />

      <Text style={emailStyles.small}>
        {isFree
          ? "This session is free — no subscription needed to listen."
          : "This session is available to Monthly, Annual and Lifetime members."}
      </Text>

    </EmailLayout>
  );
}

NewSessionEmail.defaultProps = {
  sessionTitle: "Hungover & Overwhelmed",
  moodCategory: "Hungover",
  sessionType: "Guided Meditation",
  duration: "18 min",
  sessionUrl: "https://thedailymeds.com/session/1",
  isFree: false,
  description: "A gentle reset for when your body and mind are paying the price. No spiritual waffle — just calm.",
};
