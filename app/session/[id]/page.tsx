// Server component wrapper for the session page.
// Fetches the session from Supabase, falls back to MOCK_SESSIONS if not found.
// Exports generateMetadata so search engines get a unique title and OG image per session.
// The interactive player lives in SessionPageClient.tsx.

import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import { MOCK_SESSIONS, SessionData } from "../../../lib/sessions-data";
import SessionPageClient from "./SessionPageClient";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";

// Derive gradient and glow colour from the mood category
// (these aren't stored in the DB — they come from the brand design system)
const MOOD_GRADIENTS: Record<string, string> = {
  Hungover:         "linear-gradient(135deg, #ff41b3, #ec723d)",
  "After The Sesh": "linear-gradient(135deg, #ff41b3, #f4e71d)",
  "On A Comedown":  "linear-gradient(135deg, #adf225, #f4e71d)",
  "Feeling Empty":  "linear-gradient(135deg, #ff41b3, #ec723d)",
  "Can't Sleep":    "linear-gradient(135deg, #ff41b3, #adf225)",
  Anxious:          "linear-gradient(135deg, #ec723d, #f4e71d)",
  Heartbroken:      "linear-gradient(135deg, #ff41b3, #ec723d)",
  Overwhelmed:      "linear-gradient(135deg, #ec723d, #f4e71d)",
  "Low Energy":     "linear-gradient(135deg, #adf225, #f4e71d)",
  "Morning Reset":  "linear-gradient(135deg, #ff41b3, #f4e71d)",
  "Focus Mode":     "linear-gradient(135deg, #adf225, #ec723d)",
};

const MOOD_GLOW: Record<string, string> = {
  Hungover:         "#ff41b3",
  "After The Sesh": "#ff41b3",
  "On A Comedown":  "#adf225",
  "Feeling Empty":  "#ff41b3",
  "Can't Sleep":    "#ff41b3",
  Anxious:          "#ec723d",
  Heartbroken:      "#ff41b3",
  Overwhelmed:      "#ec723d",
  "Low Energy":     "#adf225",
  "Morning Reset":  "#ff41b3",
  "Focus Mode":     "#adf225",
};

// Fetch a single session from Supabase by its ID.
// Returns null if not found or if Supabase isn't configured.
async function fetchSessionFromSupabase(id: string): Promise<SessionData | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    const supabase = createClient(url, key);
    const { data } = await supabase
      .from("sessions")
      .select("id, title, description, duration, mood_category, media_type, vimeo_id, audio_url, is_free, thumbnail")
      .eq("id", id)
      .single();

    if (!data) return null;

    const moodCategory = data.mood_category || "";
    return {
      id: data.id,
      title: data.title || "",
      description: data.description || "",
      duration: data.duration || "",
      type: data.media_type === "video" ? "Video" : "Audio",
      moodCategory,
      gradient: MOOD_GRADIENTS[moodCategory] || "linear-gradient(135deg, #ff41b3, #ec723d)",
      glowColor: MOOD_GLOW[moodCategory] || "#ff41b3",
      isFree: data.is_free ?? false,
      mediaType: data.media_type || "audio",
      audioUrl: data.audio_url || "",
      vimeoId: data.vimeo_id || "",
    };
  } catch {
    return null;
  }
}

// Next.js calls this to generate the <title> and <meta> tags for each session URL.
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  // Try Supabase first, fall back to mock data
  const session =
    (await fetchSessionFromSupabase(params.id)) ??
    MOCK_SESSIONS.find((s) => s.id === params.id) ??
    null;

  if (!session) {
    return {
      title: "Session Not Found",
      robots: { index: false, follow: false },
    };
  }

  const ogImageUrl = `${APP_URL}/api/og?title=${encodeURIComponent(session.title)}&mood=${encodeURIComponent(session.moodCategory)}&duration=${encodeURIComponent(session.duration)}`;
  const description = session.description.slice(0, 160);

  return {
    title: session.title,
    description,
    openGraph: {
      title: `${session.title} — Daily Meds`,
      description,
      url: `${APP_URL}/session/${session.id}`,
      type: "website",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${session.title} — ${session.moodCategory} — Daily Meds` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${session.title} — Daily Meds`,
      description,
      images: [ogImageUrl],
    },
  };
}

// Fetch the session server-side and pass it down to the client component.
// SessionPageClient is wrapped in Suspense because it uses useSearchParams().
export default async function SessionPage({ params }: { params: { id: string } }) {
  // Try Supabase first, fall back to mock data
  const session =
    (await fetchSessionFromSupabase(params.id)) ??
    MOCK_SESSIONS.find((s) => s.id === params.id) ??
    null;

  return (
    <Suspense fallback={null}>
      <SessionPageClient session={session} />
    </Suspense>
  );
}
