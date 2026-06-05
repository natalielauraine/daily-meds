"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "../../lib/supabase-browser";
import html2canvas from "html2canvas";

interface SessionInfo {
  id: string;
  title: string;
  moodCategory: string;
  duration: string;
  gradient: string;
  thumbnail?: string;
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
  const cardRef = useRef<HTMLDivElement>(null);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const shareUrl = `${appUrl}/s/${session.id}${referralCode ? `?r=${referralCode}` : ""}`;
  const caption = `Just completed "${session.title}" on @thedailymeds — ${streak} day streak! Try it free: ${shareUrl}`;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const [{ data: profile }, { data: affiliate }] = await Promise.all([
        supabase.from("users").select("streak").eq("id", user.id).single(),
        supabase.from("affiliates").select("referral_code").eq("user_id", user.id).single(),
      ]);
      if (profile?.streak && typeof profile.streak === "number") setStreak(profile.streak);
      if (affiliate?.referral_code) setReferralCode(affiliate.referral_code);
    });
  }, []);

  const captureCard = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
    } catch {
      return null;
    }
  }, []);

  async function handleDownload() {
    setDownloading(true);
    try {
      const blob = await captureCard();
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

  async function handleShare() {
    setSharing(true);
    try {
      const blob = await captureCard();
      if (blob && navigator.canShare?.({ files: [new File([blob], "share.png", { type: "image/png" })] })) {
        await navigator.share({
          files: [new File([blob], "daily-meds-session.png", { type: "image/png" })],
          title: `${session.title} — Daily Meds`,
          text: caption,
        });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: `${session.title} — Daily Meds`, text: caption, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // cancelled
    } finally {
      setSharing(false);
    }
  }

  async function handleCopyCaption() {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 rounded-t-[20px] overflow-y-auto w-full"
        style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.1)", maxHeight: "92vh", maxWidth: "420px" }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-5 pb-10 pt-3">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white text-base" style={{ fontWeight: 500 }}>Share this session</h3>
              <p className="text-xs text-white/40 mt-0.5">Screenshot or download the card below</p>
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

          {/* ── SCREENSHOTABLE SHARE CARD ── */}
          <div
            ref={cardRef}
            className="rounded-[16px] overflow-hidden mb-4 mx-auto"
            style={{ aspectRatio: "4/5", maxWidth: "340px" }}
          >
            <div className="relative w-full h-full flex flex-col" style={{ background: "#0a0a0a" }}>

              {/* Top: thumbnail or gradient — takes ~55% */}
              <div className="relative flex-1 overflow-hidden">
                {session.thumbnail ? (
                  <img
                    src={session.thumbnail}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="absolute inset-0" style={{ background: session.gradient }} />
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, #0a0a0a 100%)" }} />

                {/* Logo top-left */}
                <div className="absolute top-5 left-5 flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                    <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.95"/>
                    <path d="M10 14C10 14 2 18 2 25C2 29.4 5.6 33 10 33C13 33 15.6 31.4 17 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8"/>
                    <path d="M38 14C38 14 46 18 46 25C46 29.4 42.4 33 38 33C35 33 32.4 31.4 31 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8"/>
                    <circle cx="24" cy="28" r="2" fill="white" opacity="0.9"/>
                  </svg>
                  <span
                    className="text-white text-xs font-black uppercase tracking-tighter"
                    style={{ fontFamily: "var(--font-plus-jakarta)" }}
                  >
                    The Daily Meds
                  </span>
                </div>

                {/* Mood badge top-right */}
                <div
                  className="absolute top-5 right-5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: session.gradient, color: "white" }}
                >
                  {session.moodCategory}
                </div>
              </div>

              {/* Bottom: content area */}
              <div className="px-6 pb-6 pt-2">
                {/* Title */}
                <h2
                  className="text-white uppercase leading-none mb-3"
                  style={{
                    fontFamily: "var(--font-plus-jakarta)",
                    fontWeight: 800,
                    fontSize: "clamp(24px, 5vw, 36px)",
                    letterSpacing: "-0.02em",
                    lineHeight: 0.95,
                  }}
                >
                  {session.title}
                </h2>

                {/* Duration + type */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                    {session.duration}
                  </span>
                  <span className="w-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Guided Meditation
                  </span>
                </div>

                {/* Streak + divider */}
                <div
                  className="flex items-center justify-between pt-4"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔥</span>
                    <span
                      className="text-sm font-bold uppercase tracking-wider"
                      style={{ color: "#ADF225", fontFamily: "var(--font-space-grotesk)" }}
                    >
                      {streak} day streak
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                  >
                    thedailymeds.com
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-white/25 text-center mb-6">
            Screenshot this card or download as an image
          </p>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center justify-center gap-2 py-3.5 rounded-[10px] text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: session.gradient, fontWeight: 500 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              {downloading ? "Saving…" : "Download"}
            </button>
            <button
              onClick={handleShare}
              disabled={sharing}
              className="flex items-center justify-center gap-2 py-3.5 rounded-[10px] text-sm text-white/70 transition-colors hover:text-white disabled:opacity-50"
              style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "0.5px solid rgba(255,255,255,0.15)", fontWeight: 500 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
              </svg>
              {sharing ? "Sharing…" : "Share"}
            </button>
          </div>

          {/* Caption */}
          <div
            className="rounded-[10px] p-4 mb-4"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/40">Caption — tap to copy</p>
              <button
                onClick={handleCopyCaption}
                className="text-xs transition-colors"
                style={{ color: copied ? "#adf225" : "#ff41b3", fontWeight: 500 }}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-white/55 leading-relaxed cursor-pointer select-all" onClick={handleCopyCaption}>
              {caption}
            </p>
          </div>

          {referralCode && (
            <p className="text-[11px] text-white/20 text-center mb-2">
              Your referral code <span className="text-white/35">{referralCode}</span> is included
            </p>
          )}

          <button onClick={onClose} className="w-full py-3 text-sm text-white/30 hover:text-white/60 transition-colors mt-2">
            Close
          </button>
        </div>
      </div>
    </>
  );
}
