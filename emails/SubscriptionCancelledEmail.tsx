// Subscription cancelled email — sent when a user's Stripe subscription ends.
// Triggered by customer.subscription.deleted in the Stripe webhook handler.

import { Text, Link, Section, Hr } from "@react-email/components";
import EmailLayout, { emailStyles } from "./_components/EmailLayout";

type SubscriptionCancelledEmailProps = {
  name: string;
  accessUntil: string;  // e.g. "22 April 2026" — when premium access ends
};

export default function SubscriptionCancelledEmail({
  name,
  accessUntil,
}: SubscriptionCancelledEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";
  const firstName = name.split(" ")[0] || name;

  return (
    <EmailLayout preview="Your Daily Meds subscription has ended. Your free access remains.">

      <Text style={emailStyles.h1}>Subscription ended</Text>

      <Text style={emailStyles.body}>
        Hey {firstName}, your Daily Meds subscription has been cancelled as requested.
      </Text>

      {/* Access end date */}
      <div style={emailStyles.infoBox}>
        <Text style={emailStyles.infoLabel}>Premium access until</Text>
        <Text style={emailStyles.infoValue}>{accessUntil}</Text>
      </div>

      <Text style={emailStyles.body}>
        After that date, your account moves to the free plan. You&apos;ll keep access to all free sessions and the breathing timer — they&apos;re always yours.
      </Text>

      <Text style={emailStyles.body}>
        No hard feelings. If life gets calmer (or messier again) you can come back any time.
      </Text>

      {/* Re-subscribe CTA */}
      <Section style={{ textAlign: "center", margin: "28px 0 24px" }}>
        <Link href={`${appUrl}/pricing`} style={emailStyles.button}>
          Resubscribe any time
        </Link>
      </Section>

      <Hr style={emailStyles.hr} />

      {/* Keep in touch */}
      <Text style={emailStyles.small}>
        Still want free sessions?{" "}
        <Link href={`${appUrl}/free`} style={{ color: "#A78BFA" }}>
          Browse the free library
        </Link>
        {" "}— no subscription needed.
      </Text>

      <Hr style={emailStyles.hr} />

      <Text style={emailStyles.small}>
        If you cancelled by mistake or have a question, just reply to this email.
      </Text>

    </EmailLayout>
  );
}

SubscriptionCancelledEmail.defaultProps = {
  name: "Natalie",
  accessUntil: "22 April 2026",
};
