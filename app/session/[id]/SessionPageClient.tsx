"use client";

// Session player page — cinematic fullscreen design.
// Fullscreen gradient/video hero, floating glassmorphic player bar, bottom nav.
// Keeps all existing logic: subscription gating, continue watching, share modal, PiP.

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { toggleWatchlist, isInWatchlist } from "../../../lib/watchlist";
import { createClient } from "../../../lib/supabase-browser";
import { usePlayer } from "../../../lib/player-context";
import { MOCK_SESSIONS, SessionData } from "../../../lib/sessions-data";
import AddToPlaylistModal from "../../components/AddToPlaylistModal";
import ShareSessionModal from "../../components/ShareSessionModal";

// ── HELPERS ───────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatRemaining(current: number, total: number): string {
  const remaining = Math.max(total - current, 0);
  return `${formatTime(remaining)} Remaining`;
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function SessionPageClient({ session }: { session: SessionData | null }) {
  const searchParams = useSearchParams();
  const resumeAt = Number(searchParams.get("t") || 0);

  const {
    currentSession, isPlaying, currentTime, duration,
    volume, isMuted, speed,
    playSession, togglePlay, seek, setVolume, setIsMuted, setSpeed,
  } = usePlayer();

  const hasAutoPlayed = useRef(false);

  // ── STATE ──────────────────────────────────────────────────────────────────
  const [hearted, setHearted]                       = useState(false);
  const [userId, setUserId]                         = useState<string | null>(null);
  const [savedInApp, setSavedInApp]                 = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [isLoggedIn, setIsLoggedIn]                 = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [showPlaylistModal, setShowPlaylistModal]   = useState(false);
  const [showShareModal, setShowShareModal]         = useState(false);
  const [shareModalShown, setShareModalShown]       = useState(false);
  const [signupPromptDismissed, setSignupPromptDismissed] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider]     = useState(false);

  // PiP state
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const pipVideoRef  = useRef<HTMLVideoElement>(null);
  const [isPiP, setIsPiP]             = useState(false);
  const [pipSupported, setPipSupported] = useState(false);

  // ── DERIVED ────────────────────────────────────────────────────────────────
  const isThisSession    = currentSession?.id === session?.id;
  const displayTime      = isThisSession ? currentTime : 0;
  const displayDuration  = isThisSession ? duration : 0;
  const displayPlaying   = isThisSession && isPlaying;
  const progressPercent  = displayDuration > 0 ? (displayTime / displayDuration) * 100 : 0;
  const isPaidMember     = subscriptionStatus !== "free";
  const canPlay          = session ? (session.isFree || isPaidMember) : false;
  const sessionEnded     = isThisSession && !isPlaying && currentTime > 0 && duration > 0 && currentTime >= duration - 1;
  const showSignupPrompt = sessionEnded && !isLoggedIn && session?.isFree === true && !signupPromptDismissed;

  const playerSession = session ? {
    id: session.id,
    title: session.title,
    moodCategory: session.moodCategory,
    gradient: session.gradient,
    audioUrl: session.audioUrl,
    duration: session.duration,
  } : null;

  // Session number from mock data index (1-based)
  const sessionIndex = session ? (MOCK_SESSIONS.findIndex((s) => s.id === session.id) + 1) : 0;
  const sessionLabel = sessionIndex > 0 ? `Session ${String(sessionIndex).padStart(2, "0")}` : session?.type || "Session";

  // Related sessions — exclude current, show up to 3
  const relatedSessions = MOCK_SESSIONS.filter((s) => s.id !== session?.id).slice(0, 3);

  // ── EFFECTS ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (session) setHearted(isInWatchlist(session.id));
  }, [session?.id]);

  useEffect(() => {
    setPipSupported(typeof document !== "undefined" && !!document.pictureInPictureEnabled);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setIsLoggedIn(!!user);
      if (!user) { setSubscriptionLoading(false); return; }
      setUserId(user.id);
      const [subRes, savedRes] = await Promise.all([
        supabase.from("users").select("subscription_status").eq("id", user.id).single(),
        session
          ? supabase.from("downloads").select("id").eq("user_id", user.id).eq("session_id", session.id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      if (subRes.data?.subscription_status) setSubscriptionStatus(subRes.data.subscription_status);
      setSavedInApp(!!savedRes.data);
      setSubscriptionLoading(false);
    });
  }, []);

  // Auto-resume from ?t= param
  useEffect(() => {
    if (!resumeAt || !session || !playerSession || hasAutoPlayed.current) return;
    if (!canPlay) return;
    hasAutoPlayed.current = true;
    playSession(playerSession, resumeAt);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionStatus]);

  // Auto-show share modal when session finishes
  useEffect(() => {
    if (sessionEnded && isLoggedIn && !shareModalShown) {
      setShareModalShown(true);
      setTimeout(() => setShowShareModal(true), 800);
    }
  }, [sessionEnded, isLoggedIn]);

  // Draw session artwork onto hidden canvas for PiP
  useEffect(() => {
    if (!session) return;
    const canvas = canvasRef.current;
    const video  = pipVideoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const colors = session.gradient.match(/#[0-9A-Fa-f]{6}/g) ?? ["#1F1F1F", "#1F1F1F"];
    const bg = ctx.createLinearGradient(0, 0, 320, 180);
    bg.addColorStop(0, colors[0]);
    bg.addColorStop(1, colors[colors.length - 1]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 320, 180);
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(0, 0, 320, 180);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(session.title, 160, 90);
    if (!video.srcObject) video.srcObject = canvas.captureStream(0);
  }, [session?.id, session?.gradient]);

  useEffect(() => {
    function onLeave() { setIsPiP(false); }
    document.addEventListener("leavepictureinpicture", onLeave);
    return () => document.removeEventListener("leavepictureinpicture", onLeave);
  }, []);

  // ── HANDLERS ───────────────────────────────────────────────────────────────

  function handleHeart() {
    if (!session) return;
    setHearted(toggleWatchlist(session.id));
  }

  async function handleSave() {
    if (!session || !userId) return;
    const supabase = createClient();
    if (savedInApp) {
      setSavedInApp(false);
      await supabase.from("downloads").delete().eq("user_id", userId).eq("session_id", session.id);
    } else {
      setSavedInApp(true);
      await supabase.from("downloads").upsert({ user_id: userId, session_id: session.id }, { onConflict: "user_id,session_id" });
    }
  }

  async function togglePiP() {
    const video = pipVideoRef.current;
    if (!video) return;
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      setIsPiP(false);
    } else {
      try {
        await video.play();
        await video.requestPictureInPicture();
        setIsPiP(true);
      } catch { /* silently ignore */ }
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isThisSession) return;
    seek(Number(e.target.value));
  }

  function handlePlay() {
    if (!playerSession) return;
    if (isThisSession) togglePlay();
    else playSession(playerSession);
  }

  // ── NOT FOUND ──────────────────────────────────────────────────────────────

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#010101" }}>
        <div className="text-center">
          <p className="text-white/40 text-sm mb-4">Session not found.</p>
          <Link href="/" className="text-white/60 hover:text-white text-sm transition-colors">← Back to home</Link>
        </div>
      </div>
    );
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: "#010101", color: "white" }}>

      {/* Hidden PiP elements */}
      <canvas ref={canvasRef} width={320} height={180} style={{ display: "none" }} />
      <video ref={pipVideoRef} muted playsInline style={{ display: "none" }} />

      {/* ── TOP NAV ── */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4">
        <Link href="/">
          <span
            className="text-2xl font-black uppercase tracking-tighter"
            style={{ fontFamily: "var(--font-plus-jakarta)", color: "#ADF225" }}
          >
            THE DAILY MEDS
          </span>
        </Link>
        <div className="flex items-center gap-5">
          <Link href="/library" aria-label="Search">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)" className="hover:fill-white transition-colors">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </Link>
          <Link href="/profile" aria-label="Profile">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)" className="hover:fill-white transition-colors">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </Link>
        </div>
      </nav>

      {/* ── HERO (fullscreen) ── */}
      <section className="relative w-full overflow-hidden" style={{ height: "100svh", minHeight: "600px" }}>

        {/* Background: video embed or gradient */}
        {session.mediaType === "video" && session.vimeoId ? (
          <iframe
            src={`https://player.vimeo.com/video/${session.vimeoId}?autoplay=1&loop=1&muted=1&title=0&byline=0&portrait=0&color=ff41b3&transparent=0&dnt=1`}
            className="absolute inset-0 w-full h-full"
            style={{ border: "none", transform: "scale(1.05)" }}
            allow="autoplay; fullscreen"
          />
        ) : (
          /* Audio session — gradient background with animated glow */
          <div
            className="absolute inset-0"
            style={{ background: session.gradient }}
          >
            {/* Animated pulsing glow when playing */}
            {displayPlaying && (
              <div
                className="absolute inset-0 animate-pulse"
                style={{ background: "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.08) 0%, transparent 70%)" }}
              />
            )}
          </div>
        )}

        {/* Cinematic vignette — bottom-heavy dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, transparent 10%, rgba(1,1,1,0.75) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(1,1,1,0.98) 0%, rgba(1,1,1,0.3) 40%, rgba(1,1,1,0.1) 100%)",
          }}
        />

        {/* Grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
            backgroundSize: "200px",
          }}
        />

        {/* Session metadata — bottom-left overlay, sits above the floating player bar */}
        <div className="absolute left-6 md:left-12 z-10 max-w-2xl" style={{ bottom: "220px" }}>
          <div className="flex items-center gap-3 mb-4">
            {/* Session badge */}
            <span
              className="px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-full"
              style={{ backgroundColor: "#FF418E", color: "white" }}
            >
              {sessionLabel}
            </span>
            {/* Time remaining */}
            {displayDuration > 0 && (
              <span
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-space-grotesk)" }}
              >
                {formatRemaining(displayTime, displayDuration)}
              </span>
            )}
            {/* Free badge */}
            {session.isFree && (
              <span
                className="px-2 py-0.5 text-[10px] font-black tracking-widest uppercase rounded-full"
                style={{ backgroundColor: "#ADF225", color: "#000" }}
              >
                Free
              </span>
            )}
          </div>

          {/* Huge title */}
          <h1
            className="uppercase leading-none mb-4 text-white"
            style={{
              fontSize: "clamp(36px, 6vw, 72px)",
              fontFamily: "var(--font-plus-jakarta)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 0.9,
            }}
          >
            {session.title}
          </h1>

          {/* Author */}
          <p
            className="flex items-center gap-3 text-lg font-bold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-space-grotesk)" }}
          >
            <span className="w-8 h-px" style={{ backgroundColor: "#FF418E" }} />
            Natalie Lauraine
          </p>
        </div>
      </section>

      {/* ── FLOATING PLAYER BAR ── */}
      <section className="fixed z-50 left-1/2 -translate-x-1/2" style={{ bottom: "80px", width: "90%", maxWidth: "900px" }}>
        <div
          className="rounded-[32px] px-6 md:px-10 py-5"
          style={{
            background: "rgba(14,14,14,0.65)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
          }}
        >
          {/* ── PROGRESS BAR ── */}
          <div className="relative w-full mb-6 group cursor-pointer" style={{ height: "6px" }}>
            <div className="absolute inset-0 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
            {/* Filled gradient */}
            <div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{
                width: `${progressPercent}%`,
                background: "linear-gradient(90deg, #FE8A58, #FF418E)",
                boxShadow: "0 0 12px rgba(255,65,142,0.4)",
                transition: "width 0.1s linear",
              }}
            />
            {/* Scrub thumb — appears on hover */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progressPercent}% - 8px)` }}
            />
            {/* Invisible range input for interaction */}
            <input
              type="range"
              min={0}
              max={displayDuration || 0}
              step={0.5}
              value={displayTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              style={{ margin: 0 }}
            />
          </div>

          {/* ── CONTROLS ── */}
          <div className="flex items-center justify-between">

            {/* Left: secondary actions */}
            <div className="flex items-center gap-5">
              {/* Heart */}
              <button
                onClick={handleHeart}
                className="transition-all active:scale-90"
                style={{ color: hearted ? "#FF418E" : "rgba(255,255,255,0.5)" }}
                aria-label={hearted ? "Remove from watchlist" : "Save to watchlist"}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill={hearted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={hearted ? "0" : "1.8"}>
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>

              {/* Save / bookmark */}
              <button
                onClick={handleSave}
                className="transition-all active:scale-90"
                style={{ color: savedInApp ? "#ADF225" : "rgba(255,255,255,0.5)" }}
                aria-label={savedInApp ? "Unsave" : "Save"}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill={savedInApp ? "currentColor" : "none"} stroke="currentColor" strokeWidth={savedInApp ? "0" : "1.8"}>
                  <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                </svg>
              </button>
            </div>

            {/* Center: primary playback */}
            <div className="flex items-center gap-6 md:gap-10">
              {/* Skip back 30s */}
              <button
                onClick={() => seek(Math.max(0, displayTime - 30))}
                className="transition-all active:scale-90"
                style={{ color: "rgba(255,255,255,0.5)" }}
                aria-label="Skip back 30 seconds"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                  <text x="12" y="16" textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="bold">30</text>
                </svg>
              </button>

              {/* Play / Pause — large white circle */}
              {subscriptionLoading ? (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                </div>
              ) : canPlay ? (
                <button
                  onClick={handlePlay}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xl"
                  style={{ backgroundColor: "white" }}
                  aria-label={displayPlaying ? "Pause" : "Play"}
                >
                  {displayPlaying ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#010101">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#010101" style={{ marginLeft: "3px" }}>
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
              ) : (
                <Link
                  href={isLoggedIn ? "/pricing" : "/signup"}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-2xl"
                  style={{ backgroundColor: "#FF418E" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                </Link>
              )}

              {/* Skip forward 30s */}
              <button
                onClick={() => seek(Math.min(displayDuration, displayTime + 30))}
                className="transition-all active:scale-90"
                style={{ color: "rgba(255,255,255,0.5)" }}
                aria-label="Skip forward 30 seconds"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.01 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
                  <text x="12" y="16" textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="bold">30</text>
                </svg>
              </button>
            </div>

            {/* Right: utilities */}
            <div className="flex items-center gap-5">
              {/* Volume */}
              <div className="relative">
                <button
                  onClick={() => setShowVolumeSlider((v) => !v)}
                  className="transition-all active:scale-90"
                  style={{ color: isMuted ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.5)" }}
                  aria-label="Volume"
                >
                  {isMuted || volume === 0 ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                    </svg>
                  )}
                </button>
                {showVolumeSlider && (
                  <div
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 p-3 rounded-xl"
                    style={{ background: "rgba(14,14,14,0.95)", border: "1px solid rgba(255,255,255,0.1)", width: "120px" }}
                  >
                    <input
                      type="range" min={0} max={1} step={0.01}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => { const v = Number(e.target.value); setVolume(v); setIsMuted(v === 0); }}
                      className="w-full accent-[#FF418E]"
                    />
                  </div>
                )}
              </div>

              {/* Speed */}
              <button
                onClick={() => {
                  const speeds = [0.75, 1, 1.25, 1.5];
                  const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
                  setSpeed(next);
                }}
                className="text-xs font-bold transition-all active:scale-90"
                style={{ color: speed !== 1 ? "#ADF225" : "rgba(255,255,255,0.5)", fontFamily: "var(--font-space-grotesk)", minWidth: "36px" }}
                aria-label="Playback speed"
              >
                {speed}x
              </button>

              {/* PiP */}
              {pipSupported && (
                <button
                  onClick={togglePiP}
                  className="transition-all active:scale-90"
                  style={{ color: isPiP ? "#ADF225" : "rgba(255,255,255,0.5)" }}
                  aria-label={isPiP ? "Exit picture in picture" : "Picture in picture"}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <rect x="11" y="10" width="9" height="6" rx="0.5" fill="currentColor" stroke="none" opacity="0.8"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── BELOW-FOLD CONTENT ── */}
      <div className="px-6 md:px-12 pt-12 pb-48" style={{ marginTop: "calc(100svh - 60px)" }}>

        {/* Lock message if can't play */}
        {!subscriptionLoading && !canPlay && (
          <div
            className="max-w-2xl mx-auto mb-10 p-6 rounded-2xl text-center"
            style={{ background: "rgba(255,65,142,0.08)", border: "1px solid rgba(255,65,142,0.2)" }}
          >
            <p className="text-white font-bold mb-1" style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}>
              {isLoggedIn ? "Premium session" : "Members only"}
            </p>
            <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>
              {isLoggedIn
                ? "Upgrade to unlock every session in the library."
                : "Create a free account or log in to access this session."}
            </p>
            <div className="flex gap-3 justify-center">
              {!isLoggedIn && (
                <Link href="/signup" className="px-5 py-2 rounded-full text-sm font-bold text-white" style={{ backgroundColor: "#FF418E" }}>
                  Sign up free
                </Link>
              )}
              <Link href={isLoggedIn ? "/pricing" : "/login"} className="px-5 py-2 rounded-full text-sm font-bold" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
                {isLoggedIn ? "See plans" : "Log in"}
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">

          {/* Experience Notes */}
          <div className="md:col-span-2">
            <h3
              className="text-sm uppercase tracking-widest mb-5"
              style={{ color: "#ADF225", fontFamily: "var(--font-space-grotesk)", fontWeight: 700 }}
            >
              Experience Notes
            </h3>
            <div
              className="p-7 rounded-3xl"
              style={{ backgroundColor: "#141313", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <p className="leading-relaxed text-lg italic" style={{ color: "rgba(255,255,255,0.55)" }}>
                "{session.description}"
              </p>
            </div>

            {/* Action pills */}
            <div className="flex gap-3 mt-5 flex-wrap">
              <button
                onClick={() => setShowPlaylistModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 6h18v2H3zm0 5h12v2H3zm0 5h18v2H3zm16-3v-3h-2v3h-3v2h3v3h2v-3h3v-2z"/>
                </svg>
                Add to playlist
              </button>
              {isLoggedIn && (
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors hover:bg-white/10"
                  style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                  </svg>
                  Share card
                </button>
              )}
            </div>
          </div>

          {/* Upcoming Rituals */}
          <div>
            <h3
              className="text-sm uppercase tracking-widest mb-5"
              style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-space-grotesk)", fontWeight: 700 }}
            >
              Upcoming Rituals
            </h3>
            <div className="flex flex-col gap-3">
              {relatedSessions.map((related, i) => (
                <Link
                  key={related.id}
                  href={`/session/${related.id}`}
                  className="flex items-center gap-4 p-3 rounded-2xl transition-colors hover:bg-white/5"
                  style={{ backgroundColor: "#1a1919" }}
                >
                  {/* Gradient thumbnail */}
                  <div
                    className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center"
                    style={{ background: related.gradient }}
                  >
                    <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                      <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.9"/>
                      <path d="M10 14C10 14 2 18 2 25C2 29.4 5.6 33 10 33C13 33 15.6 31.4 17 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8"/>
                      <path d="M38 14C38 14 46 18 46 25C46 29.4 42.4 33 38 33C35 33 32.4 31.4 31 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8"/>
                      <circle cx="24" cy="28" r="2" fill="white" opacity="0.9"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-[10px] font-bold tracking-widest uppercase mb-0.5"
                      style={{ color: "#FF418E", fontFamily: "var(--font-space-grotesk)" }}
                    >
                      {i === 0 ? "Next Session" : "Up Next"}
                    </p>
                    <h4
                      className="text-sm text-white uppercase truncate"
                      style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}
                    >
                      {related.title}
                    </h4>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {related.duration} · {related.type}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM NAV ── */}
      <div
        className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-5 pt-3"
        style={{
          background: "rgba(14,14,14,0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "32px 32px 0 0",
          boxShadow: "0 -8px 32px rgba(173,242,37,0.04)",
        }}
      >
        <Link href="/" className="flex flex-col items-center gap-1 p-3 transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Sanctuary</span>
        </Link>
        <Link href="/library" className="flex flex-col items-center gap-1 p-3 transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Explore</span>
        </Link>
        {/* Active tab — lime glow */}
        <div
          className="flex flex-col items-center gap-1 p-3 rounded-full"
          style={{ backgroundColor: "#ADF225", boxShadow: "0 0 18px #ADF225", color: "#000" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Rituals</span>
        </div>
        <Link href="/profile" className="flex flex-col items-center gap-1 p-3 transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Profile</span>
        </Link>
      </div>

      {/* ── MODALS ── */}
      {showPlaylistModal && (
        <AddToPlaylistModal sessionId={session.id} onClose={() => setShowPlaylistModal(false)} />
      )}
      {showShareModal && (
        <ShareSessionModal
          session={{ id: session.id, title: session.title, moodCategory: session.moodCategory, duration: session.duration, gradient: session.gradient }}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* ── SIGNUP PROMPT (post-session, logged-out) ── */}
      {showSignupPrompt && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md p-5 rounded-2xl"
          style={{ background: "rgba(14,14,14,0.95)", border: "1px solid rgba(255,65,142,0.3)", backdropFilter: "blur(20px)" }}
        >
          <button
            onClick={() => setSignupPromptDismissed(true)}
            className="absolute top-3 right-3 p-1 transition-colors"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
          <p className="text-white font-bold mb-1" style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}>Liked that?</p>
          <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
            Create a free account to save your progress and unlock more sessions.
          </p>
          <div className="flex gap-3">
            <Link href={`/signup?next=/session/${session.id}`} className="px-5 py-2 rounded-full text-sm font-bold text-white" style={{ backgroundColor: "#FF418E" }}>
              Sign up free
            </Link>
            <Link href="/pricing" className="px-5 py-2 rounded-full text-sm" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
              See plans
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
