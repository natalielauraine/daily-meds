// Streak reminder email — sent to users who haven't listened in 3+ days.
// Triggered by a daily cron job at /api/email/streak-reminder.
// Gentle nudge to come back — not pushy.

import { Text, Link, Section, Hr } from "@react-email/components";
import EmailLayout, { emailStyles } from "./_components/EmailLayout";

type StreakReminderEmailProps = {
  name: string;
  daysSinceLastSession: number;  // How many days they've been away
  currentStreak: number;         // Their current streak (0 if broken)
  suggestedSessionTitle: string; // A relevant session to suggest
  suggestedSessionUrl: string;
  suggestedMood: string;
};

// Message copy changes based on how long they've been away
function getHeadline(days: number): string {
  if (days === 3) return "It's been a few days…";
  if (days <= 5)  return "We've been thinking about you.";
  if (days <= 7)  return "A week away. How are you doing?";
  return "You've got a session waiting.";
}

function getBody(name: string, days: number, streak: number): string {
  const first = name.split(" ")[0] || name;
  if (days === 3) {
    return `Hey ${first} — just checking in. You last listened ${days} days ago. Life gets busy. No judgement.`;
  }
  if (streak > 0) {
    return `Hey ${first} — your ${streak}-day streak is still alive, just about. One session is all it takes to keep it going.`;
  }
  return `Hey ${first} — it's been ${days} days. Whatever's going on, there's probably a session for it.`;
}

export default function StreakReminderEmail({
  name,
  daysSinceLastSession,
  currentStreak,
  suggestedSessionTitle,
  suggestedSessionUrl,
  suggestedMood,
}: StreakReminderEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";

  return (
    <EmailLayout preview={`${getHeadline(daysSinceLastSession)} Come back to Daily Meds.`}>

      <Text style={emailStyles.h1}>{getHeadline(daysSinceLastSession)}</Text>

      <Text style={emailStyles.body}>
        {getBody(name, daysSinceLastSession, currentStreak)}
      </Text>

      {/* Streak status */}
      {currentStreak > 0 && (
        <div style={emailStyles.infoBox}>
          <Text style={emailStyles.infoLabel}>Your streak</Text>
          <Text style={emailStyles.infoValue}>{currentStreak} days 🔥</Text>
        </div>
      )}

      {/* Suggested session */}
      <Text style={{ ...emailStyles.infoLabel, marginBottom: "8px" }}>Suggested for you</Text>
      <div style={{
        backgroundColor: "rgba(255,255,255,0.04)",
        border: "0.5px solid rgba(255,255,255,0.08)",
        borderRadius: "8px",
        padding: "14px 16px",
        marginBottom: "24px",
      }}>
        <Text style={{ ...emailStyles.small, color: "#C4B5FD", marginBottom: "4px" }}>{suggestedMood}</Text>
        <Text style={{ ...emailStyles.h2, margin: "0" }}>{suggestedSessionTitle}</Text>
      </div>

      {/* CTA */}
      <Section style={{ textAlign: "center", margin: "4px 0 24px" }}>
        <Link href={suggestedSessionUrl} style={emailStyles.button}>
          Listen now →
        </Link>
      </Section>

      <Hr style={emailStyles.hr} />

      <Text style={emailStyles.small}>
        Not in the mood for that one?{" "}
        <Link href={`${appUrl}/library`} style={{ color: "#A78BFA" }}>
          Browse all sessions
        </Link>
        {" "}and find what fits.
      </Text>

    </EmailLayout>
  );
}

StreakReminderEmail.defaultProps = {
  name: "Natalie",
  daysSinceLastSession: 4,
  currentStreak: 3,
  suggestedSessionTitle: "Anxiety First Aid",
  suggestedSessionUrl: "https://thedailymeds.com/session/4",
  suggestedMood: "Anxious",
};
