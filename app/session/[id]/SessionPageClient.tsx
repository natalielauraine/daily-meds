"use client";

// Session player page — shown when a user clicks a session card.
// Handles both audio sessions (custom player) and video sessions (Vimeo embed).
// The heart icon saves the session to the watchlist in localStorage.

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AudioPlayer from "../../components/AudioPlayer";
import VideoPlayer from "../../components/VideoPlayer";
import AddToPlaylistModal from "../../components/AddToPlaylistModal";
import ShareButton from "../../components/ShareButton";
import { toggleWatchlist, isInWatchlist } from "../../../lib/watchlist";
import { toggleSaved, isSaved } from "../../../lib/downloads";
import { createClient } from "../../../lib/supabase-browser";
import { usePlayer } from "../../../lib/player-context";
import { MOCK_SESSIONS, SessionData } from "../../../lib/sessions-data";

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

// Session is fetched server-side in page.tsx and passed in as a prop.
// Falls back to null if not found in Supabase or mock data.
export default function SessionPageClient({ session }: { session: SessionData | null }) {
  const searchParams = useSearchParams();

  // ?t= param from Continue Watching — position in seconds to resume from
  const resumeAt = Number(searchParams.get("t") || 0);

  const { playSession, currentSession, isPlaying, currentTime, duration } = usePlayer();
  const hasAutoPlayed = useRef(false);

  // Watchlist state — heart is filled when session is saved
  const [hearted, setHearted] = useState(false);
  // Saved-in-app state — bookmark icon filled when saved within the app
  const [savedInApp, setSavedInApp] = useState(false);
  // Playlist modal open/closed
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  // User's subscription tier — fetched from Supabase to gate premium content
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  // Whether the user is logged in — used to show the signup prompt for free sessions
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Whether the signup prompt has been dismissed
  const [signupPromptDismissed, setSignupPromptDismissed] = useState(false);

  // Check watchlist + saved state on mount (localStorage is client-only)
  useEffect(() => {
    if (session) {
      setHearted(isInWatchlist(session.id));
      setSavedInApp(isSaved(session.id));
    }
  }, [session?.id]);

  // Fetch subscription status from Supabase so we know if user can play premium content
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setIsLoggedIn(!!user);
      if (!user) return;
      const { data } = await supabase
        .from("users")
        .select("subscription_status")
        .eq("id", user.id)
        .single();
      if (data?.subscription_status) setSubscriptionStatus(data.subscription_status);
    });
  }, []);

  // Detect when this session has finished playing
  const isThisSession = currentSession?.id === session?.id;
  const sessionEnded = isThisSession && !isPlaying && currentTime > 0 && duration > 0 && currentTime >= duration - 1;

  // Show signup prompt when a free session ends and the user is not logged in
  const showSignupPrompt = sessionEnded && !isLoggedIn && session?.isFree === true && !signupPromptDismissed;

  // Auto-resume from the position in the URL (?t=123) when coming from Continue Watching.
  // Waits for subscriptionStatus to load before checking if the user can play the session.
  useEffect(() => {
    if (!resumeAt || !session || hasAutoPlayed.current) return;
    const isPaid = subscriptionStatus !== "free";
    const userCanPlay = session.isFree || isPaid;
    if (!userCanPlay) return;
    hasAutoPlayed.current = true;
    playSession(
      {
        id: session.id,
        title: session.title,
        moodCategory: session.moodCategory,
        gradient: session.gradient,
        audioUrl: session.audioUrl,
        duration: session.duration,
      },
      resumeAt
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionStatus]);

  function handleHeart() {
    if (!session) return;
    const nowSaved = toggleWatchlist(session.id);
    setHearted(nowSaved);
  }

  function handleSave() {
    if (!session) return;
    const nowSaved = toggleSaved(session.id);
    setSavedInApp(nowSaved);
  }

  if (!session) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white/40 text-sm mb-4">Session not found.</p>
            <Link href="/" className="text-white/60 hover:text-white text-sm transition-colors">← Back to home</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const moodGradient = MOOD_GRADIENTS[session.moodCategory] ?? session.gradient;

  // Free users can only play free sessions — paid members can play everything
  const isPaidMember = subscriptionStatus !== "free";
  const canPlay = session.isFree || isPaidMember;

  // Shape the session data into the format PlayerContext expects
  const playerSession = {
    id: session.id,
    title: session.title,
    moodCategory: session.moodCategory,
    gradient: session.gradient,
    audioUrl: session.audioUrl,
    duration: session.duration,
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-24">

        {/* Back button */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-8">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back
        </Link>

        {/* ── SESSION ARTWORK + INFO ── */}
        <div className="flex flex-col items-center text-center mb-10">

          {/* Large gradient circle */}
          <div
            className="relative w-36 h-36 rounded-full flex items-center justify-center mb-6"
            style={{ background: session.gradient, boxShadow: `0 0 60px 20px ${session.glowColor}40` }}
          >
            <svg width="64" height="64" viewBox="0 0 48 48" fill="none">
              <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.95"/>
              <path d="M10 14C10 14 2 18 2 25C2 29.4 5.6 33 10 33C13 33 15.6 31.4 17 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85"/>
              <path d="M38 14C38 14 46 18 46 25C46 29.4 42.4 33 38 33C35 33 32.4 31.4 31 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85"/>
              <path d="M24 28L20 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75"/>
              <path d="M24 28L28 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75"/>
              <circle cx="24" cy="28" r="2" fill="white" opacity="0.9"/>
            </svg>
            {session.isFree && (
              <div className="absolute top-2 right-2 text-white text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(16,185,129,0.9)", fontWeight: 500 }}>
                FREE
              </div>
            )}
          </div>

          {/* Type + duration */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-white/40">{session.type}</span>
            <span className="text-white/20">·</span>
            <span className="text-xs text-white/40">{session.duration}</span>
          </div>

          {/* Title + heart button */}
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-2xl text-white" style={{ fontWeight: 500 }}>{session.title}</h1>
            <button
              onClick={handleHeart}
              className="transition-transform hover:scale-110 active:scale-95"
              aria-label={hearted ? "Remove from watchlist" : "Save to watchlist"}
            >
              {hearted ? (
                // Filled heart — saved
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#F43F5E">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              ) : (
                // Outline heart — not saved
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1.8">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              )}
            </button>
          </div>

          {/* Mood badge */}
          <span className="text-xs px-3 py-1 rounded-full text-white mb-4" style={{ background: moodGradient, fontWeight: 500 }}>
            {session.moodCategory}
          </span>

          {/* Description */}
          <p className="text-sm text-white/50 leading-relaxed max-w-md">{session.description}</p>

          {/* Save + Playlist + Share action buttons */}
          <div className="flex items-center gap-3 mt-5 flex-wrap justify-center">
            {/* Save to app button */}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-colors"
              style={{
                backgroundColor: savedInApp ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.06)",
                border: savedInApp ? "0.5px solid rgba(139,92,246,0.5)" : "0.5px solid rgba(255,255,255,0.12)",
                color: savedInApp ? "#8B5CF6" : "rgba(255,255,255,0.5)",
                fontWeight: 500,
              }}
              aria-label={savedInApp ? "Remove from saved" : "Save session"}
            >
              {savedInApp ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                </svg>
              )}
              {savedInApp ? "Saved" : "Save"}
            </button>

            {/* Add to playlist button */}
            <button
              onClick={() => setShowPlaylistModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-colors hover:bg-white/[0.08]"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "0.5px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.5)",
                fontWeight: 500,
              }}
              aria-label="Add to playlist"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 6h18v2H3zm0 5h12v2H3zm0 5h18v2H3zm16-3v-3h-2v3h-3v2h3v3h2v-3h3v-2z"/>
              </svg>
              Add to playlist
            </button>

            {/* Share button */}
            <ShareButton
              sessionId={session.id}
              title={session.title}
              moodCategory={session.moodCategory}
              duration={session.duration}
              gradient={session.gradient}
            />
          </div>
        </div>

        {/* Playlist modal */}
        {showPlaylistModal && session && (
          <AddToPlaylistModal
            sessionId={session.id}
            onClose={() => setShowPlaylistModal(false)}
          />
        )}

        {/* ── PLAYER CARD ── */}
        <div
          className="rounded-[10px] p-6 sm:p-8 mb-10"
          style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          {canPlay ? (
            session.mediaType === "audio" ? (
              <>
                <AudioPlayer session={playerSession} gradient={session.gradient} />
                {!session.audioUrl && (
                  <p className="text-center text-xs text-white/20 mt-5">
                    Audio file not yet uploaded — add the URL to Supabase Storage to enable playback.
                  </p>
                )}
              </>
            ) : (
              <VideoPlayer vimeoId={session.vimeoId} title={session.title} />
            )
          ) : (
            /* Upgrade prompt — shown to free users on premium sessions */
            <div className="flex flex-col items-center text-center py-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                style={{ background: "rgba(139,92,246,0.12)", border: "0.5px solid rgba(139,92,246,0.3)" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(139,92,246,0.8)">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </div>
              <h3 className="text-base text-white mb-2" style={{ fontWeight: 500 }}>
                This is a premium session
              </h3>
              <p className="text-sm text-white/40 mb-6 max-w-xs leading-relaxed">
                Upgrade to get full access to every session in the library — starting from £19.99/month.
              </p>
              <Link
                href="/pricing"
                className="px-6 py-3 rounded-[10px] text-sm text-white transition-opacity hover:opacity-80"
                style={{ background: session.gradient, fontWeight: 500 }}
              >
                See plans
              </Link>
            </div>
          )}
        </div>

        {/* ── RELATED SESSIONS ── */}
        <div>
          <h2 className="text-sm text-white/50 mb-4" style={{ fontWeight: 500 }}>More like this</h2>
          <div className="flex flex-col gap-3">
            {MOCK_SESSIONS.filter((s) => s.id !== session.id).slice(0, 3).map((related) => (
              <Link
                key={related.id}
                href={`/session/${related.id}`}
                className="flex items-center gap-4 p-3 rounded-[10px] hover:bg-white/[0.04] transition-colors"
                style={{ border: "0.5px solid rgba(255,255,255,0.06)" }}
              >
                <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center" style={{ background: related.gradient }}>
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

      {/* ── SIGNUP PROMPT — shown to logged-out users after a free session ends ── */}
      {showSignupPrompt && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300"
          style={{ background: "linear-gradient(to top, #0D0D1A 60%, transparent)" }}
        >
          <div
            className="max-w-lg mx-auto rounded-[10px] p-5 relative"
            style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.12)" }}
          >
            {/* Dismiss button */}
            <button
              onClick={() => setSignupPromptDismissed(true)}
              className="absolute top-3 right-3 text-white/30 hover:text-white/60 transition-colors"
              aria-label="Dismiss"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>

            <div className="flex items-start gap-4 pr-6">
              {/* Gradient icon */}
              <div
                className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center"
                style={{ background: session?.gradient }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                  <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.9"/>
                </svg>
              </div>

              <div className="flex-1">
                <p className="text-sm text-white mb-0.5" style={{ fontWeight: 500 }}>
                  Liked that session?
                </p>
                <p className="text-xs text-white/50 mb-4 leading-relaxed">
                  Create a free account to save your progress, build playlists, and access more sessions.
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/signup?next=/session/${session?.id}`}
                    className="px-4 py-2 rounded-md text-xs text-white transition-opacity hover:opacity-80"
                    style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
                  >
                    Create free account
                  </Link>
                  <Link
                    href="/pricing"
                    className="px-4 py-2 rounded-md text-xs transition-colors hover:bg-white/[0.06]"
                    style={{ color: "rgba(255,255,255,0.5)", border: "0.5px solid rgba(255,255,255,0.15)" }}
                  >
                    See all plans
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
