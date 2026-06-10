"use client";

import { useState } from "react";
import Link from "next/link";
import { MOOD_GRADIENTS } from "@/lib/design-tokens";

export type LibrarySession = {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: string;
  mood_category: string;
  mood_categories: string[];
  media_type: "audio" | "video";
  is_free: boolean;
  is_coming_soon?: boolean;
  gradient: string;
  thumbnail?: string;
};

export function LibraryCard({ session, isPaidMember }: { session: LibrarySession; isPaidMember: boolean }) {
  const [hovered, setHovered] = useState(false);
  const comingSoon = session.is_coming_soon;

  const primaryMood = session.mood_categories?.[0] ?? session.mood_category;
  const moodGradient = MOOD_GRADIENTS[primaryMood] ?? "linear-gradient(135deg, #ff41b3, #ec723d)";

  const thumbnailContent = (
    <>
      <div className="absolute inset-0" style={{ background: session.gradient }} />
      {session.thumbnail && (
        <img src={session.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div
        className="absolute bottom-0 left-0 right-0 h-14"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)" }}
      />

      {comingSoon ? (
        <>
          {/* Dark overlay for coming soon */}
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)" }} />
          {/* Coming Soon badge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest backdrop-blur-md"
              style={{
                background: "rgba(236,114,61,0.2)",
                color: "#ec723d",
                border: "1px solid rgba(236,114,61,0.3)",
                fontFamily: "var(--font-space-grotesk)",
                fontWeight: 700,
              }}
            >
              Coming Soon
            </span>
          </div>
        </>
      ) : (
        <>
          {/* Lotus icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.22)", backdropFilter: "blur(4px)" }}
            >
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.95"/>
                <path d="M10 14C10 14 2 18 2 25C2 29.4 5.6 33 10 33C13 33 15.6 31.4 17 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85"/>
                <path d="M38 14C38 14 46 18 46 25C46 29.4 42.4 33 38 33C35 33 32.4 31.4 31 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85"/>
                <path d="M24 28L20 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75"/>
                <path d="M24 28L28 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75"/>
                <circle cx="24" cy="28" r="2" fill="white" opacity="0.9"/>
              </svg>
            </div>
          </div>
          {/* Play button on hover */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
            style={{ opacity: hovered ? 1 : 0 }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "#ff41b3", boxShadow: "0 0 20px rgba(255,65,179,0.6)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ marginLeft: "2px" }}>
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          {/* Free badge */}
          {session.is_free && (
            <div
              className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded"
              style={{
                background: "rgba(173,242,37,0.85)",
                color: "#131313",
                fontFamily: "var(--font-space-grotesk)",
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              FREE
            </div>
          )}
          {/* Lock icon for premium sessions for non-members */}
          {!session.is_free && !isPaidMember && (
            <div
              className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </div>
          )}
          {/* Duration */}
          <div
            className="absolute bottom-2 left-2 text-white/80 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
            {session.duration}
          </div>
        </>
      )}
    </>
  );

  return (
      <div
        className={`group flex flex-col ${comingSoon ? "cursor-default" : "cursor-pointer"}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* ── THUMBNAIL ── */}
        <div
          className="relative rounded-[10px] overflow-hidden mb-3 transition-transform duration-200"
          style={{
            aspectRatio: "16/9",
            transform: hovered && !comingSoon ? "scale(1.02)" : "scale(1)",
            border: "0.5px solid rgba(255,255,255,0.08)",
          }}
        >
          {comingSoon ? (
            <div className="absolute inset-0">{thumbnailContent}</div>
          ) : (
            <Link href={`/session/${session.id}`} className="absolute inset-0 block">
              {thumbnailContent}
            </Link>
          )}
        </div>

        {/* ── CARD INFO ── */}
        {comingSoon ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 self-start">
              <span
                className="text-[9px] px-2 py-0.5 rounded-full text-white uppercase"
                style={{
                  background: moodGradient,
                  fontFamily: "var(--font-space-grotesk)",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
              >
                {primaryMood}
              </span>
              {(session.mood_categories?.length ?? 0) > 1 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full text-cream/50" style={{ background: "rgba(255,255,255,0.06)" }}>
                  +{session.mood_categories!.length - 1}
                </span>
              )}
            </div>
            <h3
              className="text-sm leading-snug"
              style={{
                fontFamily: "var(--font-plus-jakarta)",
                fontWeight: 700,
                color: "rgba(226,226,226,0.85)",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {session.title}
            </h3>
          </div>
        ) : (
          <Link href={`/session/${session.id}`} className="flex flex-col gap-1">
            <div className="flex items-center gap-1 self-start">
              <span
                className="text-[9px] px-2 py-0.5 rounded-full text-white uppercase"
                style={{
                  background: moodGradient,
                  fontFamily: "var(--font-space-grotesk)",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
              >
                {primaryMood}
              </span>
              {(session.mood_categories?.length ?? 0) > 1 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full text-cream/50" style={{ background: "rgba(255,255,255,0.06)" }}>
                  +{session.mood_categories!.length - 1}
                </span>
              )}
            </div>
            <h3
              className="text-sm leading-snug transition-colors group-hover:text-white"
              style={{
                fontFamily: "var(--font-plus-jakarta)",
                fontWeight: 700,
                color: "rgba(226,226,226,0.85)",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {session.title}
            </h3>
            <p
              className="text-[10px] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-space-grotesk)", color: "rgba(246,241,230,0.6)" }}
            >
              {session.type}
            </p>
          </Link>
        )}
      </div>
  );
}
