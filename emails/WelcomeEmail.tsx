// Welcome email — sent when a new user creates a Daily Meds account.
// Triggered by the Supabase auth webhook at /api/webhooks/supabase-auth.

import { Text, Link, Section, Hr } from "@react-email/components";
import EmailLayout, { emailStyles } from "./_components/EmailLayout";

type WelcomeEmailProps = {
  name: string;   // The user's display name
  email: string;  // Their email address
};

export default function WelcomeEmail({ name, email }: WelcomeEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";
  const firstName = name.split(" ")[0] || name;

  return (
    <EmailLayout preview={`Welcome to Daily Meds, ${firstName}. Your reset starts here.`}>

      {/* Greeting */}
      <Text style={emailStyles.h1}>
        Hey {firstName} 👋
      </Text>

      <Text style={emailStyles.body}>
        Welcome to Daily Meds — audio for emotional emergencies. Meditation for life's most awkward moments.
      </Text>

      <Text style={emailStyles.body}>
        No spiritual waffle. No toxic positivity. Just practical, grounded sessions for when things get messy — hungover, anxious, heartbroken, can't sleep, on a comedown. Real stuff, for real moments.
      </Text>

      {/* What they get */}
      <div style={emailStyles.infoBox}>
        <Text style={{ ...emailStyles.infoLabel, marginBottom: "10px" }}>Your free plan includes</Text>
        {[
          "Access to all free sessions",
          "Breathing timer (box, 4-7-8, custom)",
          "3 mood categories to explore",
          "No credit card needed — ever",
        ].map((item) => (
          <Text key={item} style={{ ...emailStyles.small, color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>
            ✓ &nbsp;{item}
          </Text>
        ))}
      </div>

      {/* CTA */}
      <Section style={{ textAlign: "center", margin: "28px 0 24px" }}>
        <Link href={`${appUrl}/free`} style={emailStyles.button}>
          Start listening →
        </Link>
      </Section>

      <Hr style={emailStyles.hr} />

      {/* Soft upsell */}
      <Text style={emailStyles.small}>
        Want the full library? Sessions for every mood, live sessions with me, group rooms and more — from £19.99/month.{" "}
        <Link href={`${appUrl}/pricing`} style={{ color: "#A78BFA" }}>
          See plans
        </Link>
      </Text>

      <Hr style={emailStyles.hr} />

      <Text style={emailStyles.small}>
        Sent to {email}. You&apos;re receiving this because you just created a Daily Meds account.
      </Text>

    </EmailLayout>
  );
}

// Default props for React Email preview / testing
WelcomeEmail.defaultProps = {
  name: "Natalie",
  email: "natalie@example.com",
};
