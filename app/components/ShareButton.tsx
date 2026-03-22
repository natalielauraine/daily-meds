"use client";

// ShareButton — tap to share any session.
// On mobile: opens the native share sheet (WhatsApp, iMessage, Instagram etc).
// On desktop: copies the link to clipboard.
// Also shows:
//   - A Spotify-style share card to screenshot and post to stories
//   - Pre-written captions for Instagram, TikTok and Twitter
//   - The user's personal referral link

import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase-browser";

interface Props {
  sessionId: string;
  title: string;
  moodCategory: string;
  duration: string;
  gradient: string;
}

export default function ShareButton({ sessionId, title, moodCategory, duration, gradient }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null); // which item was just copied
  const [referralCode, setReferralCode] = useState("");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Build the share URL — includes the user's referral code if they're logged in
  const shareUrl = referralCode
    ? `${appUrl}/session/${sessionId}?ref=${referralCode}`
    : `${appUrl}/session/${sessionId}`;

  // Get a short referral code from the user's Supabase ID on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setReferralCode(user.id.substring(0, 8));
    });
  }, []);

  // Copy any text to clipboard and show a brief tick confirmation
  async function copyToClipboard(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard not available — do nothing
    }
  }

  // Use the native mobile share sheet if available, otherwise copy the link
  async function handleNativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${title} — Daily Meds`,
          text: `I just listened to "${title}" on Daily Meds. ${moodCategory} sorted.`,
          url: shareUrl,
        });
      } catch {
        // User cancelled share — do nothing
      }
    } else {
      copyToClipboard(shareUrl, "link");
    }
  }

  // Pre-written captions for each platform
  const captions = {
    instagram: `Just did a ${duration} "${title}" session on @thedailymeds and honestly... it worked. If you're feeling ${moodCategory.toLowerCase()}, this one's for you 🎧\n\nLink in bio.\n\n${shareUrl}`,
    tiktok: `POV: you tried "${title}" on Daily Meds and it actually helped 💜 No spiritual waffle, just stuff that works. Go check it out 👇\n\n${shareUrl}`,
    twitter: `"${title}" on @thedailymeds just sorted my ${moodCategory.toLowerCase()} situation. 10/10. ${shareUrl}`,
  };

  return (
    <>
      {/* Share button */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-colors hover:bg-white/[0.08]"
        style={{
          backgroundColor: "rgba(255,255,255,0.06)",
          border: "0.5px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.5)",
          fontWeight: 500,
        }}
        aria-label="Share this session"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
        </svg>
        Share
      </button>

      {/* Share modal */}
      {showModal && (
        <>
          {/* Dark backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Bottom sheet */}
          <div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[20px] px-5 pt-4 pb-8 overflow-y-auto"
            style={{
              backgroundColor: "#1A1A2E",
              border: "0.5px solid rgba(255,255,255,0.1)",
              maxHeight: "90vh",
            }}
          >
            {/* Drag handle */}
            <div className="w-8 h-1 rounded-full bg-white/20 mx-auto mb-5" />

            <h3 className="text-white text-base mb-5" style={{ fontWeight: 500 }}>
              Share this session
            </h3>

            {/* ── SPOTIFY-STYLE SHARE CARD ── */}
            <div
              className="rounded-[14px] p-5 mb-2 flex items-center gap-4"
              style={{ background: gradient }}
            >
              {/* Session info */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm mb-0.5 truncate" style={{ fontWeight: 500 }}>
                  {title}
                </p>
                <p className="text-white/70 text-xs">{moodCategory} · {duration}</p>
                <p className="text-white/40 text-[10px] mt-2">thedailymeds.com</p>
              </div>
              {/* Logo mark */}
              <svg width="36" height="36" viewBox="0 0 48 48" fill="none" opacity={0.9} className="shrink-0">
                <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white"/>
                <path d="M10 14C10 14 2 18 2 25C2 29.4 5.6 33 10 33C13 33 15.6 31.4 17 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M38 14C38 14 46 18 46 25C46 29.4 42.4 33 38 33C35 33 32.4 31.4 31 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M24 28L20 35" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M24 28L28 35" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="24" cy="28" r="2" fill="white"/>
              </svg>
            </div>
            <p className="text-[11px] text-white/25 text-center mb-5">
              Screenshot this card to share to your stories
            </p>

            {/* ── SHARE + COPY BUTTONS ── */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={handleNativeShare}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[10px] text-sm text-white transition-opacity hover:opacity-80"
                style={{ background: gradient, fontWeight: 500 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                </svg>
                Share
              </button>
              <button
                onClick={() => copyToClipboard(shareUrl, "link")}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[10px] text-sm transition-colors"
                style={{
                  backgroundColor: copied === "link" ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.06)",
                  border: copied === "link" ? "0.5px solid rgba(16,185,129,0.4)" : "0.5px solid rgba(255,255,255,0.12)",
                  color: copied === "link" ? "#10B981" : "rgba(255,255,255,0.6)",
                  fontWeight: 500,
                }}
              >
                {copied === "link" ? "Copied!" : "Copy link"}
              </button>
            </div>

            {/* ── YOUR REFERRAL LINK ── */}
            {referralCode && (
              <div className="mb-6">
                <p className="text-xs text-white/40 mb-2">Your referral link</p>
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[8px]"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "0.5px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <p className="text-xs text-white/40 flex-1 truncate">{shareUrl}</p>
                  <button
                    onClick={() => copyToClipboard(shareUrl, "ref")}
                    className="text-xs shrink-0 transition-colors"
                    style={{ color: copied === "ref" ? "#10B981" : "#8B5CF6", fontWeight: 500 }}
                  >
                    {copied === "ref" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-[11px] text-white/20 mt-1.5">
                  Anyone who signs up via your link earns you 20% affiliate commission
                </p>
              </div>
            )}

            {/* ── PRE-WRITTEN CAPTIONS ── */}
            <div>
              <p className="text-xs text-white/40 mb-3">Pre-written captions</p>
              <div className="flex flex-col gap-2">
                {(["instagram", "tiktok", "twitter"] as const).map((platform) => {
                  const meta = {
                    instagram: { icon: "📸", label: "Instagram" },
                    tiktok:    { icon: "🎵", label: "TikTok" },
                    twitter:   { icon: "🐦", label: "Twitter / X" },
                  };
                  return (
                    <div
                      key={platform}
                      className="p-3 rounded-[8px]"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.03)",
                        border: "0.5px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/50">
                          {meta[platform].icon} {meta[platform].label}
                        </span>
                        <button
                          onClick={() => copyToClipboard(captions[platform], platform)}
                          className="text-[11px] transition-colors"
                          style={{
                            color: copied === platform ? "#10B981" : "#8B5CF6",
                            fontWeight: 500,
                          }}
                        >
                          {copied === platform ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <p className="text-[11px] text-white/30 leading-relaxed line-clamp-3">
                        {captions[platform]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-5 py-3 text-sm text-white/35 hover:text-white/60 transition-colors"
            >
              Close
            </button>
          </div>
        </>
      )}
    </>
  );
}
