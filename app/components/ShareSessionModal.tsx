"use client";

// ShareSessionModal — shown automatically when a logged-in user finishes a session.
// Displays a Spotify-style branded share card with their streak.
// Options: download as PNG, share via native share sheet, copy a pre-written caption.

import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase-browser";

interface SessionInfo {
  id: string;
  title: string;
  moodCategory: string;
  duration: string;
  gradient: string;
}

interface Props {
  session: SessionInfo;
  onClose: () => void;
}

export default function ShareSessionModal({ session, onClose }: Props) {
  const [streak, setStreak] = useState(1);
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [imageError, setImageError] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Share URL with UTM params and referral code
  const shareUrl = `${appUrl}?utm_source=share_card&utm_medium=social&utm_campaign=session_complete${referralCode ? `&ref=${referralCode}` : ""}`;

  // Pre-written caption as specified in the brief
  const caption = `Just completed "${session.title}" on @thedailymeds — ${streak} day streak! Try it free: ${shareUrl}`;

  // URL to the server-generated share card image
  const cardImageUrl = `${appUrl}/api/share-card?title=${encodeURIComponent(session.title)}&mood=${encodeURIComponent(session.moodCategory)}&duration=${encodeURIComponent(session.duration)}&streak=${streak}`;

  // Fetch user data on mount — referral code and streak
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      // Use first 8 chars of user ID as a basic referral code
      setReferralCode(user.id.substring(0, 8));

      // Try to get streak from the users table
      const { data } = await supabase
        .from("users")
        .select("streak")
        .eq("id", user.id)
        .single();
      if (data?.streak && typeof data.streak === "number") {
        setStreak(data.streak);
      }
    });
  }, []);

  // Fetch the share card as a PNG blob (used by both download and share)
  async function fetchCardBlob(): Promise<Blob | null> {
    try {
      const res = await fetch(cardImageUrl);
      if (!res.ok) return null;
      return await res.blob();
    } catch {
      return null;
    }
  }

  // Download the card as a PNG file
  async function handleDownload() {
    setDownloading(true);
    try {
      const blob = await fetchCardBlob();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `daily-meds-${session.title.toLowerCase().replace(/\s+/g, "-")}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  // Share via Web Share API — sends the image file if supported, URL otherwise
  async function handleShare() {
    setSharing(true);
    try {
      // Try to share with the image (works on iOS Safari, Android Chrome)
      const blob = await fetchCardBlob();
      if (blob && navigator.canShare?.({ files: [new File([blob], "share.png", { type: "image/png" })] })) {
        await navigator.share({
          files: [new File([blob], "daily-meds-session.png", { type: "image/png" })],
          title: `${session.title} — Daily Meds`,
          text: caption,
        });
        return;
      }
      // Fallback: share just the URL (desktop or older browsers)
      if (navigator.share) {
        await navigator.share({
          title: `${session.title} — Daily Meds`,
          text: caption,
          url: shareUrl,
        });
        return;
      }
      // Final fallback: copy the caption
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // User cancelled — do nothing
    } finally {
      setSharing(false);
    }
  }

  // Copy the pre-written caption to clipboard
  async function handleCopyCaption() {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[20px] overflow-y-auto"
        style={{
          backgroundColor: "#1A1A2E",
          border: "0.5px solid rgba(255,255,255,0.1)",
          maxHeight: "92vh",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-5 pb-10 pt-3">

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white text-base" style={{ fontWeight: 500 }}>
                Session complete 🎉
              </h3>
              <p className="text-xs text-white/40 mt-0.5">Share your achievement</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          {/* ── SHARE CARD PREVIEW ── */}
          <div className="mb-3">
            {imageError ? (
              // Fallback preview if image fails to load
              <div
                className="w-full rounded-[14px] flex flex-col items-center justify-center py-12 gap-3"
                style={{ background: session.gradient, aspectRatio: "1/1" }}
              >
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.95"/>
                  <path d="M24 28L20 35" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M24 28L28 35" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="24" cy="28" r="2" fill="white"/>
                </svg>
                <p className="text-white text-sm text-center px-4" style={{ fontWeight: 500 }}>{session.title}</p>
                <p className="text-white/70 text-xs">{session.moodCategory} · {session.duration}</p>
                <p className="text-white/50 text-xs">🔥 {streak} day streak</p>
              </div>
            ) : (
              // Server-generated share card image
              <img
                src={cardImageUrl}
                alt="Your session share card"
                className="w-full rounded-[14px]"
                style={{ aspectRatio: "1/1", objectFit: "cover" }}
                onError={() => setImageError(true)}
              />
            )}
          </div>

          <p className="text-[11px] text-white/25 text-center mb-6">
            Save this image and share to your stories
          </p>

          {/* ── MAIN ACTION BUTTONS ── */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Download as PNG */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center justify-center gap-2 py-3.5 rounded-[10px] text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: session.gradient, fontWeight: 500 }}
            >
              {downloading ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="animate-spin">
                  <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
              )}
              {downloading ? "Saving…" : "Download"}
            </button>

            {/* Share via native share sheet */}
            <button
              onClick={handleShare}
              disabled={sharing}
              className="flex items-center justify-center gap-2 py-3.5 rounded-[10px] text-sm text-white/70 transition-colors hover:text-white disabled:opacity-50"
              style={{
                backgroundColor: "rgba(255,255,255,0.07)",
                border: "0.5px solid rgba(255,255,255,0.15)",
                fontWeight: 500,
              }}
            >
              {sharing ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="animate-spin">
                  <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                </svg>
              )}
              {sharing ? "Sharing…" : "Share"}
            </button>
          </div>

          {/* ── COPY CAPTION ── */}
          <div
            className="rounded-[10px] p-4 mb-4"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/40">Caption — tap to copy</p>
              <button
                onClick={handleCopyCaption}
                className="text-xs transition-colors"
                style={{ color: copied ? "#10B981" : "#8B5CF6", fontWeight: 500 }}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p
              className="text-xs text-white/55 leading-relaxed cursor-pointer select-all"
              onClick={handleCopyCaption}
            >
              {caption}
            </p>
          </div>

          {/* Referral note */}
          {referralCode && (
            <p className="text-[11px] text-white/20 text-center mb-2">
              Your referral code <span className="text-white/35">{referralCode}</span> is included — earn 20% on every signup
            </p>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="w-full py-3 text-sm text-white/30 hover:text-white/60 transition-colors mt-2"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
