// Guest welcome email — sent when a user checks out without an account.
// Provides a magic link generated via Supabase Admin API to set their password.

import { Text, Link, Section, Hr, Button } from "@react-email/components";
import EmailLayout, { emailStyles } from "./_components/EmailLayout";

type GuestWelcomeEmailProps = {
  firstName: string;
  magicLink: string;
};

export default function GuestWelcomeEmail({
  firstName,
  magicLink,
}: GuestWelcomeEmailProps) {
  return (
    <EmailLayout preview="Your payment was successful. Here is your access link.">

      {/* Greeting */}
      <Text style={{ ...emailStyles.small, marginBottom: "6px", letterSpacing: "2px", textTransform: "uppercase" }}>
        The Daily Meds
      </Text>

      <Text style={{ ...emailStyles.h1, fontSize: "24px", fontWeight: "600", marginBottom: "4px" }}>
        Welcome home,
      </Text>
      <Text style={{ ...emailStyles.h1, fontSize: "24px", fontWeight: "600", marginBottom: "24px" }}>
        your account is ready.
      </Text>

      <Text style={emailStyles.body}>
        Hi {firstName},
      </Text>

      <Text style={emailStyles.body}>
        We successfully received your payment! Since you didn&apos;t have an account
        with us, we&apos;ve securely created one for you using your payment email address.
      </Text>
      
      <Text style={emailStyles.body}>
        Click the button below to instantly log in and set up your password so you can access the library.
      </Text>

      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button
          href={magicLink}
          style={{
            ...emailStyles.button,
            display: "inline-block",
            padding: "16px 32px",
          }}
        >
          Set Password & Log In
        </Button>
      </Section>

      <Text style={{ ...emailStyles.small, color: "rgba(255,255,255,0.4)" }}>
        If the button doesn&apos;t work, copy and paste this link into your browser:
        <br />
        <Link href={magicLink} style={{ color: "#8B5CF6", textDecoration: "underline" }}>{magicLink}</Link>
      </Text>

    </EmailLayout>
  );
}
