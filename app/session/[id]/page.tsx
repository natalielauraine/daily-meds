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
  Hungover:         "linear-gradient(135deg, #6B21E8 0%, #8B3CF7 25%, #6366F1 60%, #3B82F6 80%, #22D3EE 100%)",
  "After The Sesh": "linear-gradient(135deg, #F43F5E 0%, #EC4899 20%, #D946EF 35%, #F97316 65%, #EAB308 85%, #FACC15 100%)",
  "On A Comedown":  "linear-gradient(135deg, #10B981 0%, #22C55E 35%, #84CC16 70%, #D9F100 100%)",
  "Feeling Empty":  "linear-gradient(135deg, #6B21E8 0%, #8B3CF7 25%, #6366F1 60%, #3B82F6 80%, #22D3EE 100%)",
  "Can't Sleep":    "linear-gradient(135deg, #8B3CF7 0%, #6366F1 100%)",
  Anxious:          "linear-gradient(135deg, #F43F5E 0%, #F97316 100%)",
  Heartbroken:      "linear-gradient(135deg, #EC4899 0%, #D946EF 100%)",
  Overwhelmed:      "linear-gradient(135deg, #F97316 0%, #FACC15 100%)",
  "Low Energy":     "linear-gradient(135deg, #10B981 0%, #22C55E 100%)",
  "Morning Reset":  "linear-gradient(135deg, #F43F5E 0%, #FACC15 100%)",
  "Focus Mode":     "linear-gradient(135deg, #6B21E8 0%, #6366F1 100%)",
};

const MOOD_GLOW: Record<string, string> = {
  Hungover:         "#6B21E8",
  "After The Sesh": "#F43F5E",
  "On A Comedown":  "#10B981",
  "Feeling Empty":  "#6B21E8",
  "Can't Sleep":    "#8B3CF7",
  Anxious:          "#F43F5E",
  Heartbroken:      "#EC4899",
  Overwhelmed:      "#F97316",
  "Low Energy":     "#10B981",
  "Morning Reset":  "#F43F5E",
  "Focus Mode":     "#6B21E8",
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
      gradient: MOOD_GRADIENTS[moodCategory] || "linear-gradient(135deg, #6B21E8, #22D3EE)",
      glowColor: MOOD_GLOW[moodCategory] || "#6B21E8",
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
