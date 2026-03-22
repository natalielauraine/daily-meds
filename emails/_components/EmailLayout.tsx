// Shared email layout — wraps every Daily Meds email template.
// Dark themed to match the app. Logo at top, content in the middle, footer at bottom.
// React Email renders this to HTML that works across Gmail, Outlook, Apple Mail etc.

import {
  Html,
  Head,
  Body,
  Preview,
  Container,
  Section,
  Text,
  Link,
  Hr,
} from "@react-email/components";
import { ReactNode } from "react";

type EmailLayoutProps = {
  preview: string;        // Short text shown in email client list view (before you open)
  children: ReactNode;    // The main email content — each template provides this
};

// Inline styles — React Email converts these to inline style attributes so they
// work in Outlook and other clients that strip <style> tags from the <head>.

const styles = {
  body: {
    backgroundColor: "#0D0D1A",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    margin: "0",
    padding: "0",
  } as React.CSSProperties,

  container: {
    maxWidth: "560px",
    margin: "0 auto",
    padding: "40px 20px 32px",
  } as React.CSSProperties,

  // Logo bar at the top of every email
  logoSection: {
    textAlign: "center" as const,
    marginBottom: "28px",
  } as React.CSSProperties,

  logoText: {
    fontSize: "13px",
    letterSpacing: "3px",
    fontWeight: "500",
    margin: "0",
    color: "#ffffff",
  } as React.CSSProperties,

  // Purple gradient top strip on the card
  gradientBar: {
    background: "linear-gradient(90deg, #6B21E8, #8B5CF6, #22D3EE)",
    height: "3px",
    borderRadius: "10px 10px 0 0",
    margin: "0",
  } as React.CSSProperties,

  // Main content card
  card: {
    backgroundColor: "#1A1A2E",
    borderRadius: "0 0 10px 10px",
    border: "0.5px solid rgba(255,255,255,0.08)",
    borderTop: "none",
    padding: "32px 32px 36px",
  } as React.CSSProperties,

  // Divider line used inside templates
  hr: {
    borderColor: "rgba(255,255,255,0.08)",
    margin: "24px 0",
  } as React.CSSProperties,

  // Footer below the card
  footer: {
    textAlign: "center" as const,
    marginTop: "24px",
  } as React.CSSProperties,

  footerText: {
    color: "rgba(255,255,255,0.25)",
    fontSize: "11px",
    margin: "0 0 4px",
    lineHeight: "1.6",
  } as React.CSSProperties,

  footerLink: {
    color: "rgba(255,255,255,0.35)",
    textDecoration: "underline",
  } as React.CSSProperties,
};

export default function EmailLayout({ preview, children }: EmailLayoutProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";

  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Logo */}
          <Section style={styles.logoSection}>
            <Text style={styles.logoText}>
              <span style={{ color: "#F43F5E" }}>THE </span>
              <span style={{ color: "#F97316" }}>DAILY </span>
              <span style={{ color: "#22C55E" }}>MEDS</span>
            </Text>
          </Section>

          {/* Purple gradient top bar on the card */}
          <div style={styles.gradientBar} />

          {/* Main content card */}
          <div style={styles.card}>
            {children}
          </div>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              By Natalie Lauraine &nbsp;·&nbsp;{" "}
              <Link href={`${appUrl}`} style={styles.footerLink}>
                thedailymeds.com
              </Link>
            </Text>
            <Text style={styles.footerText}>
              You&apos;re receiving this because you have a Daily Meds account.{" "}
              <Link href={`${appUrl}/profile`} style={styles.footerLink}>
                Manage email preferences
              </Link>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// ── Shared style tokens — imported by individual templates ───────────────────

export const emailStyles = {
  h1: {
    color: "#ffffff",
    fontSize: "22px",
    fontWeight: "500",
    margin: "0 0 12px",
    lineHeight: "1.3",
  } as React.CSSProperties,

  h2: {
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "500",
    margin: "0 0 8px",
    lineHeight: "1.4",
  } as React.CSSProperties,

  body: {
    color: "rgba(255,255,255,0.65)",
    fontSize: "15px",
    lineHeight: "1.7",
    margin: "0 0 20px",
  } as React.CSSProperties,

  small: {
    color: "rgba(255,255,255,0.35)",
    fontSize: "12px",
    lineHeight: "1.6",
    margin: "0",
  } as React.CSSProperties,

  // Purple CTA button
  button: {
    backgroundColor: "#8B5CF6",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "14px 28px",
    fontSize: "14px",
    fontWeight: "500",
    textDecoration: "none",
    display: "inline-block",
    textAlign: "center" as const,
  } as React.CSSProperties,

  // Subtle info box
  infoBox: {
    backgroundColor: "rgba(139,92,246,0.08)",
    border: "0.5px solid rgba(139,92,246,0.2)",
    borderRadius: "8px",
    padding: "16px",
    margin: "20px 0",
  } as React.CSSProperties,

  infoLabel: {
    color: "rgba(255,255,255,0.35)",
    fontSize: "10px",
    fontWeight: "500",
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
    margin: "0 0 2px",
  } as React.CSSProperties,

  infoValue: {
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "500",
    margin: "0",
  } as React.CSSProperties,

  hr: {
    borderColor: "rgba(255,255,255,0.08)",
    margin: "24px 0",
  } as React.CSSProperties,

  gradientText: {
    background: "linear-gradient(90deg, #8B5CF6, #22D3EE)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  } as React.CSSProperties,

  moodBadge: {
    display: "inline-block",
    backgroundColor: "rgba(139,92,246,0.15)",
    border: "0.5px solid rgba(139,92,246,0.25)",
    borderRadius: "100px",
    padding: "3px 10px",
    fontSize: "11px",
    color: "#C4B5FD",
    fontWeight: "500",
    margin: "0 0 16px",
  } as React.CSSProperties,
};
