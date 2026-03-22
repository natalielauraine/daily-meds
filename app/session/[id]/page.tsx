"use client";

// Session player page — shown when a user clicks on a session card.
// Displays session info (artwork, title, mood, description) and the audio player.
// Video sessions use a Vimeo embed instead of the audio player.
// Mock data is used here until Supabase sessions are added in a later step.

import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AudioPlayer from "../../components/AudioPlayer";

// ── MOCK SESSIONS ─────────────────────────────────────────────────────────────
// Placeholder data — replace with real Supabase queries once content is uploaded.
// audioUrl is left empty for now; add real Supabase Storage URLs when ready.

const MOCK_SESSIONS = [
  {
    id: "1",
    title: "Hungover & Overwhelmed",
    description: "A gentle reset for when your body and mind are paying the price. No spiritual waffle — just calm. This session guides you through slow breathing and a body scan to ease that tight, anxious morning-after feeling.",
    duration: "18 min",
    durationSeconds: 1080,
    type: "Guided Meditation",
    moodCategory: "Hungover",
    gradient: "linear-gradient(135deg, #6B21E8 0%, #8B3CF7 25%, #6366F1 60%, #3B82F6 80%, #22D3EE 100%)",
    glowColor: "#6B21E8",
    isFree: true,
    mediaType: "audio" as const,
    audioUrl: "",
  },
  {
    id: "2",
    title: "Come Down Slowly",
    description: "When the night is over but your nervous system hasn't got the memo. This session uses grounding techniques to bring you back to earth gently — no rush, no pressure.",
    duration: "22 min",
    durationSeconds: 1320,
    type: "Breathwork",
    moodCategory: "On A Comedown",
    gradient: "linear-gradient(135deg, #10B981 0%, #22C55E 35%, #84CC16 70%, #D9F100 100%)",
    glowColor: "#10B981",
    isFree: false,
    mediaType: "audio" as const,
    audioUrl: "",
  },
  {
    id: "3",
    title: "3am Brain",
    description: "Your mind is racing and sleep feels impossible. This session quiets the mental noise with slow breathing and a progressive body relaxation that actually works.",
    duration: "14 min",
    durationSeconds: 840,
    type: "Sleep Audio",
    moodCategory: "Can't Sleep",
    gradient: "linear-gradient(135deg, #8B3CF7 0%, #6366F1 100%)",
    glowColor: "#8B3CF7",
    isFree: true,
    mediaType: "audio" as const,
    audioUrl: "",
  },
  {
    id: "4",
    title: "Anxiety First Aid",
    description: "For when anxiety hits out of nowhere and you need something that actually helps right now. Box breathing plus a quick grounding exercise to bring you back into your body.",
    duration: "8 min",
    durationSeconds: 480,
    type: "Breathwork",
    moodCategory: "Anxious",
    gradient: "linear-gradient(135deg, #F43F5E 0%, #F97316 100%)",
    glowColor: "#F43F5E",
    isFree: true,
    mediaType: "audio" as const,
    audioUrl: "",
  },
  {
    id: "5",
    title: "The Morning After",
    description: "You went hard last night. That's fine. This is your gentle re-entry into the world. Start slow, breathe through it, feel human again.",
    duration: "12 min",
    durationSeconds: 720,
    type: "Guided Meditation",
    moodCategory: "After The Sesh",
    gradient: "linear-gradient(135deg, #F43F5E 0%, #EC4899 20%, #D946EF 35%, #F97316 65%, #EAB308 85%, #FACC15 100%)",
    glowColor: "#F43F5E",
    isFree: false,
    mediaType: "audio" as const,
    audioUrl: "",
  },
];

// Maps mood category to its gradient for the badge
const MOOD_GRADIENTS: Record<string, string> = {
  Hungover: "linear-gradient(135deg, #6B21E8, #22D3EE)",
  "After The Sesh": "linear-gradient(135deg, #F43F5E, #FACC15)",
  "On A Comedown": "linear-gradient(135deg, #10B981, #D9F100)",
  "Feeling Empty": "linear-gradient(135deg, #6B21E8, #22D3EE)",
  "Can't Sleep": "linear-gradient(135deg, #8B3CF7, #6366F1)",
  Anxious: "linear-gradient(135deg, #F43F5E, #F97316)",
  Heartbroken: "linear-gradient(135deg, #EC4899, #D946EF)",
  Overwhelmed: "linear-gradient(135deg, #F97316, #FACC15)",
  "Low Energy": "linear-gradient(135deg, #10B981, #22C55E)",
  "Morning Reset": "linear-gradient(135deg, #F43F5E, #FACC15)",
  "Focus Mode": "linear-gradient(135deg, #6B21E8, #6366F1)",
};

export default function SessionPage() {
  const params = useParams();
  const id = params?.id as string;

  // Find the session from mock data — will be a Supabase query later
  const session = MOCK_SESSIONS.find((s) => s.id === id);

  // Show a friendly message if the session doesn't exist
  if (!session) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white/40 text-sm mb-4">Session not found.</p>
            <Link href="/" className="text-white/60 hover:text-white text-sm transition-colors">
              ← Back to home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const moodGradient = MOOD_GRADIENTS[session.moodCategory] ?? session.gradient;

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back
        </Link>

        {/* ── SESSION ARTWORK + INFO ── */}
        <div className="flex flex-col items-center text-center mb-10">

          {/* Large gradient circle with lotus icon */}
          <div
            className="relative w-36 h-36 rounded-full flex items-center justify-center mb-6"
            style={{
              background: session.gradient,
              boxShadow: `0 0 60px 20px ${session.glowColor}40`,
            }}
          >
            <svg width="64" height="64" viewBox="0 0 48 48" fill="none">
              <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.95"/>
              <path d="M10 14C10 14 2 18 2 25C2 29.4 5.6 33 10 33C13 33 15.6 31.4 17 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85"/>
              <path d="M38 14C38 14 46 18 46 25C46 29.4 42.4 33 38 33C35 33 32.4 31.4 31 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85"/>
              <path d="M24 28L20 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75"/>
              <path d="M24 28L28 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75"/>
              <circle cx="24" cy="28" r="2" fill="white" opacity="0.9"/>
            </svg>

            {/* Free badge */}
            {session.isFree && (
              <div
                className="absolute top-2 right-2 text-white text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: "rgba(16,185,129,0.9)", fontWeight: 500 }}
              >
                FREE
              </div>
            )}
          </div>

          {/* Type + duration row */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-white/40">{session.type}</span>
            <span className="text-white/20">·</span>
            <span className="text-xs text-white/40">{session.duration}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl text-white mb-3" style={{ fontWeight: 500 }}>
            {session.title}
          </h1>

          {/* Mood badge */}
          <span
            className="text-xs px-3 py-1 rounded-full text-white mb-4"
            style={{ background: moodGradient, fontWeight: 500 }}
          >
            {session.moodCategory}
          </span>

          {/* Description */}
          <p className="text-sm text-white/50 leading-relaxed max-w-md">
            {session.description}
          </p>
        </div>

        {/* ── PLAYER CARD ── */}
        <div
          className="rounded-[10px] p-6 sm:p-8"
          style={{
            backgroundColor: "#1A1A2E",
            border: "0.5px solid rgba(255,255,255,0.08)",
          }}
        >
          {session.mediaType === "audio" ? (
            <AudioPlayer audioUrl={session.audioUrl} gradient={session.gradient} />
          ) : (
            // Video session — Vimeo embed (for pre-recorded video meditations)
            <div className="aspect-video w-full rounded-lg overflow-hidden">
              <p className="text-white/40 text-sm text-center pt-20">
                Video player coming soon
              </p>
            </div>
          )}

          {/* No audio file notice — shown during development when audioUrl is empty */}
          {session.mediaType === "audio" && !session.audioUrl && (
            <p className="text-center text-xs text-white/20 mt-5">
              Audio file not yet uploaded — add the URL to Supabase Storage to enable playback.
            </p>
          )}
        </div>

        {/* ── RELATED SESSIONS ── */}
        <div className="mt-10">
          <h2 className="text-sm text-white/50 mb-4" style={{ fontWeight: 500 }}>
            More like this
          </h2>
          <div className="flex flex-col gap-3">
            {MOCK_SESSIONS
              .filter((s) => s.id !== session.id)
              .slice(0, 3)
              .map((related) => (
                <Link
                  key={related.id}
                  href={`/session/${related.id}`}
                  className="flex items-center gap-4 p-3 rounded-[10px] hover:bg-white/[0.04] transition-colors"
                  style={{ border: "0.5px solid rgba(255,255,255,0.06)" }}
                >
                  {/* Small gradient circle */}
                  <div
                    className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center"
                    style={{ background: related.gradient }}
                  >
                    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                      <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.9"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate" style={{ fontWeight: 500 }}>{related.title}</p>
                    <p className="text-xs text-white/35">{related.type} · {related.duration}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
                  </svg>
                </Link>
              ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
