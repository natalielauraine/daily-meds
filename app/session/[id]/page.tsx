// Server component wrapper for the session page.
// Exports generateMetadata so search engines and social platforms
// get a unique title, description and OG image for every session.
// The actual interactive page lives in SessionPageClient.tsx.

import type { Metadata } from "next";
import { Suspense } from "react";
import { MOCK_SESSIONS } from "../../../lib/sessions-data";
import SessionPageClient from "./SessionPageClient";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";

// Next.js calls this at build time (or on first request) to generate
// the <title> and <meta> tags for each session URL.
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const session = MOCK_SESSIONS.find((s) => s.id === params.id);

  // Fallback metadata if session ID isn't found
  if (!session) {
    return {
      title: "Session Not Found",
      robots: { index: false, follow: false },
    };
  }

  // Build the OG image URL — points to our branded image generator at /api/og
  const ogImageUrl = `${APP_URL}/api/og?title=${encodeURIComponent(session.title)}&mood=${encodeURIComponent(session.moodCategory)}&duration=${encodeURIComponent(session.duration)}`;

  const description = session.description.slice(0, 160); // Keep under 160 chars for Google

  return {
    title: session.title,
    description,
    openGraph: {
      title: `${session.title} — Daily Meds`,
      description,
      url: `${APP_URL}/session/${session.id}`,
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${session.title} — ${session.moodCategory} — Daily Meds`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${session.title} — Daily Meds`,
      description,
      images: [ogImageUrl],
    },
  };
}

// Render the client component inside Suspense — required because SessionPageClient
// uses useSearchParams() which needs a Suspense boundary in Next.js 14.
export default function SessionPage() {
  return (
    <Suspense fallback={null}>
      <SessionPageClient />
    </Suspense>
  );
}
