import { Text, Link, Section, Hr } from "@react-email/components";
import EmailLayout, { emailStyles } from "./_components/EmailLayout";

type ConfirmationEmailProps = {
  type: "signup" | "recovery" | "magic_link" | "invite";
  confirmUrl: string;
  email: string;
};

const content = {
  signup: {
    preview: "Confirm your Daily Meds account",
    heading: "Confirm your email",
    body: "You're almost in. Click below to verify your email address and activate your Daily Meds account.",
    cta: "Confirm email →",
    expiry: "This link expires in 24 hours.",
  },
  recovery: {
    preview: "Reset your Daily Meds password",
    heading: "Reset your password",
    body: "We received a request to reset the password for your account. Click below to set a new one.",
    cta: "Reset password →",
    expiry: "This link expires in 1 hour. If you didn't request this, you can safely ignore it.",
  },
  magic_link: {
    preview: "Your Daily Meds sign-in link",
    heading: "Sign in to Daily Meds",
    body: "Here's your one-click sign-in link. No password needed.",
    cta: "Sign in →",
    expiry: "This link expires in 1 hour and can only be used once.",
  },
  invite: {
    preview: "You've been invited to Daily Meds",
    heading: "You're invited",
    body: "You've been invited to join Daily Meds — audio for emotional emergencies. Click below to set up your account.",
    cta: "Accept invite →",
    expiry: "This invite expires in 24 hours.",
  },
};

export default function ConfirmationEmail({ type, confirmUrl, email }: ConfirmationEmailProps) {
  const c = content[type];

  return (
    <EmailLayout preview={c.preview}>
      <Text style={emailStyles.h1}>{c.heading}</Text>

      <Text style={emailStyles.body}>{c.body}</Text>

      <Section style={{ textAlign: "center", margin: "28px 0 24px" }}>
        <Link href={confirmUrl} style={emailStyles.button}>
          {c.cta}
        </Link>
      </Section>

      <Text style={{ ...emailStyles.small, color: "rgba(255,255,255,0.45)", marginBottom: "0" }}>
        {c.expiry}
      </Text>

      <Hr style={emailStyles.hr} />

      <Text style={emailStyles.small}>
        Sent to {email}. If you didn't request this, no action is needed.
      </Text>
    </EmailLayout>
  );
}

ConfirmationEmail.defaultProps = {
  type: "signup",
  confirmUrl: "https://thedailymeds.com/auth/callback",
  email: "user@example.com",
};
