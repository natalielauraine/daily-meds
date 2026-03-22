// Session layout — server component that generates Open Graph metadata for each session.
// This wraps the session page and adds the og:image, og:title and twitter card tags
// so that when someone shares a session link, it shows a beautiful branded preview.

import { Metadata } from "next";
import { MOCK_SESSIONS } from "../../../lib/sessions-data";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Generate metadata for each session dynamically based on the session ID in the URL
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const session = MOCK_SESSIONS.find((s) => s.id === params.id);

  if (!session) {
    return { title: "Session — Daily Meds" };
  }

  // Build the URL for the auto-generated OG image
  const ogImageUrl = `${APP_URL}/api/og?title=${encodeURIComponent(session.title)}&mood=${encodeURIComponent(session.moodCategory)}&duration=${encodeURIComponent(session.duration)}`;

  return {
    title: `${session.title} — Daily Meds`,
    description: session.description,
    openGraph: {
      title: session.title,
      description: session.description,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: session.title }],
      siteName: "Daily Meds",
    },
    twitter: {
      card: "summary_large_image",
      title: session.title,
      description: session.description,
      images: [ogImageUrl],
    },
  };
}

// Just render the children (the session page) — this layout only adds metadata
export default function SessionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
