"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase-browser";

/* ── Types ───────────────────────────────────────────────── */
type Highlight = {
  title: string;
  subtitle?: string;
  image_url?: string;
  video_url?: string;
  accent?: "primary" | "secondary" | "tertiary";
};

type Resource = {
  label: string;
  description?: string;
  url?: string;
  icon?: string;
  category: "buy" | "research";
};

type Episode = {
  id: string;
  slug: string;
  title: string;
  episode_number: number;
  season?: number;
  guest_name: string;
  guest_role: string;
  guest_bio: string;
  guest_photo_url: string;
  cover_image_url: string;
  audio_url: string;
  duration: string;
  description: string;
  pull_quote: string;
  highlights: Highlight[];
  resources: Resource[];
  transcript: string;
  tags: string[];
  stat1_value: string;
  stat1_label: string;
  stat2_value: string;
  stat2_label: string;
  published: boolean;
};

const ACCENT_COLORS: Record<string, { text: string; glow: string; hover: string; border: string }> = {
  primary:   { text: "#ff6a9e", glow: "0 0 20px rgba(255,65,142,0.4)",  hover: "#ff6a9e", border: "rgba(255,106,158,0.5)" },
  secondary: { text: "#52e32c", glow: "0 0 20px rgba(82,227,44,0.4)",   hover: "#52e32c", border: "rgba(82,227,44,0.5)"   },
  tertiary:  { text: "#ffb598", glow: "0 0 20px rgba(255,181,152,0.4)", hover: "#ffb598", border: "rgba(255,181,152,0.5)" },
};

const PROMO_MOODS = [
  { label: "Feeling Anxious", dur: "12 min", color: "#ff6a9e" },
  { label: "Just Breathe",    dur: "5 min",  color: "#52e32c" },
  { label: "Hungover",        dur: "20 min", color: "#ffb598" },
  { label: "Snuggle Down",    dur: "45 min", color: "#e5e5e5" },
];

export default function EpisodePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [ep, setEp] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [videoModal, setVideoModal] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      if (!slug) return;
      const { data } = await supabase
        .from("podcasts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();
      setEp(data ?? null);
      setLoading(false);
    }
    load();
  }, [slug]);

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setPlaying(!playing);
  }

  if (loading) {
    return (
      <div style={{ background: "#0e0e0e", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#ababab", fontFamily: "var(--font-manrope)" }}>Loading…</p>
      </div>
    );
  }

  if (!ep) {
    return (
      <div style={{ background: "#0e0e0e", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <p style={{ fontFamily: "var(--font-lexend)", fontWeight: 900, fontSize: 28, color: "white", textTransform: "uppercase" }}>Episode not found</p>
        <Link href="/podcasts" style={{ color: "#ff6a9e", textDecoration: "none", fontSize: 14, fontFamily: "var(--font-manrope)" }}>← Back to episodes</Link>
      </div>
    );
  }

  const highlights: Highlight[] = ep.highlights ?? [];
  const resources: Resource[] = ep.resources ?? [];
  const buyResources = resources.filter((r) => r.category === "buy");
  const researchResources = resources.filter((r) => r.category === "research");
  const episodeLabel = ep.season ? `S${ep.season}E${ep.episode_number}` : `EP${ep.episode_number}`;

  return (
    <div
      style={{ background: "#0e0e0e", minHeight: "100vh", color: "#e5e5e5", fontFamily: "var(--font-manrope)" }}
      className="selection:bg-[#ff6a9e] selection:text-white"
    >
      {/* Hidden audio */}
      {ep.audio_url && (
        <audio ref={audioRef} src={ep.audio_url} onEnded={() => setPlaying(false)} />
      )}

      {/* ── Video Modal ── */}
      {videoModal && (
        <div
          onClick={() => setVideoModal(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.92)", backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "100%", maxWidth: 900 }}>
            <button
              onClick={() => setVideoModal(null)}
              style={{
                position: "absolute", top: -44, right: 0,
                background: "none", border: "none", color: "#ababab", fontSize: 28, cursor: "pointer",
              }}
            >×</button>
            <div style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "16/9", background: "#131313" }}>
              {videoModal.includes("youtube.com") || videoModal.includes("youtu.be") ? (
                <iframe
                  src={videoModal.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              ) : videoModal.includes("vimeo.com") ? (
                <iframe
                  src={videoModal.replace("vimeo.com/", "player.vimeo.com/video/")}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              ) : (
                <video src={videoModal} controls autoPlay style={{ width: "100%", height: "100%" }} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── STICKY NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        backdropFilter: "blur(20px)", background: "rgba(25,25,25,0.7)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <Link
          href="/podcasts"
          style={{ display: "flex", alignItems: "center", gap: 8, color: "#e5e5e5", textDecoration: "none", transition: "color 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ff6a9e")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#e5e5e5")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          <span style={{ fontFamily: "var(--font-manrope)", fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>Episodes</span>
        </Link>
        <div style={{ display: "flex", gap: 20 }}>
          <button
            onClick={() => navigator.share?.({ title: ep.title, url: window.location.href })}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#ababab", transition: "color 0.2s", padding: 0 }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ff6a9e")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#ababab")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
            </svg>
          </button>
          <button
            onClick={() => setBookmarked(!bookmarked)}
            style={{ background: "none", border: "none", cursor: "pointer", color: bookmarked ? "#ff6a9e" : "#ababab", transition: "color 0.2s", padding: 0 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={bookmarked ? "#ff6a9e" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* ── 1. HERO ── */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", marginBottom: 128 }}>
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {ep.guest_name && (
                <span style={{
                  fontFamily: "var(--font-lexend)", fontWeight: 700,
                  fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
                  color: "#ffa17b",
                }}>
                  Guest: {ep.guest_name}
                </span>
              )}
              <h1 style={{
                fontFamily: "var(--font-lexend)", fontWeight: 900,
                fontSize: "clamp(40px, 5.5vw, 72px)", lineHeight: 0.9,
                letterSpacing: "-0.05em", textTransform: "uppercase",
                color: "white",
                textShadow: "0 0 12px rgba(255,65,142,0.4)",
              }}>
                {ep.title}
              </h1>
            </div>
            {ep.pull_quote && (
              <p style={{
                fontFamily: "var(--font-manrope)", fontSize: 20, fontWeight: 300,
                lineHeight: 1.6, color: "#ababab",
                borderLeft: "2px solid #ff6a9e", paddingLeft: 24,
              }}>
                "{ep.pull_quote}"
              </p>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, paddingTop: 8 }}>
              <button
                onClick={togglePlay}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: "#ff6a9e", color: "#470020",
                  padding: "16px 32px", borderRadius: 999,
                  fontFamily: "var(--font-lexend)", fontWeight: 700,
                  fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase",
                  border: "none", cursor: "pointer", transition: "transform 0.15s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1.05)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  {playing
                    ? <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>
                    : <path d="M8 5v14l11-7z"/>}
                </svg>
                {playing ? "Pause" : "Play Episode"}
              </button>
              <button
                style={{
                  background: "#262626", color: "#e5e5e5",
                  padding: "16px 32px", borderRadius: 999,
                  fontFamily: "var(--font-lexend)", fontWeight: 700,
                  fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase",
                  border: "none", cursor: "pointer", transition: "background 0.2s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#2c2c2c")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#262626")}
              >
                Add to Queue
              </button>
            </div>
          </div>

          {/* Right: Cover Art */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ position: "relative" }}
              onMouseEnter={(e) => {
                const img = e.currentTarget.querySelector("img");
                if (img) img.style.filter = "grayscale(0%)";
                const glow = e.currentTarget.querySelector(".cover-glow") as HTMLElement;
                if (glow) glow.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                const img = e.currentTarget.querySelector("img");
                if (img) img.style.filter = "grayscale(100%)";
                const glow = e.currentTarget.querySelector(".cover-glow") as HTMLElement;
                if (glow) glow.style.opacity = "0.5";
              }}
            >
              {/* Glow blob */}
              <div className="cover-glow" style={{
                position: "absolute", inset: -16, borderRadius: "50%",
                background: "rgba(255,65,142,0.2)", filter: "blur(40px)",
                opacity: 0.5, transition: "opacity 0.4s", pointerEvents: "none",
              }} />
              <div style={{ position: "relative", width: "100%", maxWidth: 480, borderRadius: 8, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}>
                {ep.cover_image_url ? (
                  <img
                    src={ep.cover_image_url}
                    alt={ep.title}
                    style={{ width: "100%", aspectRatio: "1", objectFit: "cover", filter: "grayscale(100%)", transition: "filter 0.7s", display: "block" }}
                  />
                ) : (
                  <div style={{ width: "100%", aspectRatio: "1", background: "linear-gradient(135deg, #1a0a14, #0a140a)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="#ff6a9e" opacity={0.2}>
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </div>
                )}
                {/* Now Streaming badge */}
                <div style={{
                  position: "absolute", bottom: 24, left: 24, right: 24,
                  backdropFilter: "blur(20px)", background: "rgba(25,25,25,0.7)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 4, padding: "16px 20px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div>
                    <p style={{ fontFamily: "var(--font-lexend)", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#ff6a9e" }}>
                      {playing ? "Now Streaming" : "The Daily Meds"}
                    </p>
                    <p style={{ fontFamily: "var(--font-lexend)", fontWeight: 600, fontSize: 13 }}>{episodeLabel}</p>
                  </div>
                  {ep.duration && (
                    <span style={{ fontFamily: "var(--font-manrope)", fontSize: 11, opacity: 0.6 }}>{ep.duration}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. GUEST BIO ── */}
        {(ep.guest_name || ep.guest_bio) && (
          <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "flex-start", marginBottom: 128 }}>
            {/* Photo */}
            <div style={{ position: "relative" }}>
              {ep.guest_photo_url ? (
                <img
                  src={ep.guest_photo_url}
                  alt={ep.guest_name}
                  style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: 8, filter: "brightness(0.75)", border: "1px solid rgba(255,255,255,0.05)" }}
                />
              ) : (
                <div style={{ width: "100%", aspectRatio: "4/5", borderRadius: 8, background: "#131313", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="#ababab" opacity={0.2}>
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              )}
              {ep.guest_role && (
                <div style={{
                  position: "absolute", top: 32, right: -32,
                  background: "#ffb598", color: "#3f1200",
                  padding: "24px", borderRadius: 8,
                  maxWidth: 200,
                }}>
                  <p style={{ fontFamily: "var(--font-lexend)", fontWeight: 700, fontSize: 13, textTransform: "uppercase", lineHeight: 1.3 }}>
                    {ep.guest_role}
                  </p>
                </div>
              )}
            </div>

            {/* Bio text */}
            <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <h2 style={{
                  fontFamily: "var(--font-lexend)", fontWeight: 900, fontSize: 40,
                  textTransform: "uppercase", letterSpacing: "-0.04em", color: "white",
                  textShadow: "0 0 12px rgba(254,138,88,0.4)",
                }}>
                  {ep.guest_name ?? "The Guest"}
                </h2>
                {ep.guest_bio && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, color: "#ababab", lineHeight: 1.8, fontSize: 17 }}>
                    {ep.guest_bio.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                )}
              </div>
              {(ep.stat1_value || ep.stat2_value) && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 48 }}>
                  {ep.stat1_value && (
                    <div>
                      <span style={{ display: "block", color: "#ff6a9e", fontFamily: "var(--font-lexend)", fontWeight: 700, fontSize: 26 }}>{ep.stat1_value}</span>
                      <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.6 }}>{ep.stat1_label}</span>
                    </div>
                  )}
                  {ep.stat2_value && (
                    <div>
                      <span style={{ display: "block", color: "#ff6a9e", fontFamily: "var(--font-lexend)", fontWeight: 700, fontSize: 26 }}>{ep.stat2_value}</span>
                      <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.6 }}>{ep.stat2_label}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 3. KEY TAKEAWAYS ── */}
        {highlights.length > 0 && (
          <section style={{ marginBottom: 128 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48 }}>
              <h2 style={{ fontFamily: "var(--font-lexend)", fontWeight: 900, fontSize: 30, textTransform: "uppercase", letterSpacing: "-0.04em", color: "white" }}>
                Key Takeaways
              </h2>
              <span style={{ fontFamily: "var(--font-manrope)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.4 }}>
                {highlights.some((h) => h.video_url) ? "Click to watch" : "Swipe to explore"}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              {highlights.map((h, i) => {
                const accentKey = h.accent ?? (["primary", "secondary", "tertiary"][i % 3] as "primary" | "secondary" | "tertiary");
                const accent = ACCENT_COLORS[accentKey];
                return (
                  <div
                    key={i}
                    onClick={() => h.video_url && setVideoModal(h.video_url)}
                    style={{
                      position: "relative", aspectRatio: "4/5",
                      background: "#131313", borderRadius: 8, overflow: "hidden",
                      border: "1px solid rgba(255,255,255,0.05)",
                      cursor: h.video_url ? "pointer" : "default",
                      boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
                      transition: "border-color 0.5s, transform 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = accent.border;
                      const img = el.querySelector(".hi-img") as HTMLElement;
                      if (img) { img.style.filter = "grayscale(0%)"; img.style.transform = "scale(1.1)"; img.style.opacity = "1"; }
                      const btn = el.querySelector(".hi-btn") as HTMLElement;
                      if (btn) { btn.style.background = accent.hover; btn.style.borderColor = accent.hover; }
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = "rgba(255,255,255,0.05)";
                      const img = el.querySelector(".hi-img") as HTMLElement;
                      if (img) { img.style.filter = "grayscale(100%)"; img.style.transform = "scale(1)"; img.style.opacity = "0.6"; }
                      const btn = el.querySelector(".hi-btn") as HTMLElement;
                      if (btn) { btn.style.background = "rgba(25,25,25,0.7)"; btn.style.borderColor = "rgba(255,255,255,0.2)"; }
                    }}
                  >
                    {h.image_url && (
                      <img className="hi-img" src={h.image_url} alt={h.title} style={{
                        position: "absolute", inset: 0, width: "100%", height: "100%",
                        objectFit: "cover", filter: "grayscale(100%)", opacity: 0.6,
                        transition: "filter 0.7s, transform 0.7s, opacity 0.7s",
                      }} />
                    )}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 40%, rgba(0,0,0,0.85) 100%)" }} />
                    {/* Play button */}
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div className="hi-btn" style={{
                        width: 64, height: 64, borderRadius: "50%",
                        backdropFilter: "blur(20px)", background: "rgba(25,25,25,0.7)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: accent.glow,
                        transition: "background 0.3s, border-color 0.3s",
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 3 }}>
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                    {/* Bottom text */}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 24 }}>
                      <h3 style={{
                        fontFamily: "var(--font-lexend)", fontWeight: 700, fontSize: 17,
                        textTransform: "uppercase", letterSpacing: "-0.03em",
                        color: "white", lineHeight: 1.2, marginBottom: 8,
                        textShadow: accent.glow,
                      }}>
                        {h.title}
                      </h3>
                      {h.subtitle && (
                        <p style={{ fontFamily: "var(--font-manrope)", fontSize: 10, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700 }}>
                          {h.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 4. RESOURCES ── */}
        {resources.length > 0 && (
          <section style={{ marginBottom: 128 }}>
            <h2 style={{ fontFamily: "var(--font-lexend)", fontWeight: 900, fontSize: 40, textTransform: "uppercase", letterSpacing: "-0.05em", color: "white", textAlign: "center", marginBottom: 64 }}>
              Toolkit &amp; Research
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 48 }}>
              {/* Buy */}
              {buyResources.length > 0 && (
                <div>
                  <h4 style={{ fontFamily: "var(--font-lexend)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em", color: "#ff6a9e", marginBottom: 32 }}>
                    Things to Buy
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {buyResources.map((r, i) => (
                      <a key={i} href={r.url ?? "#"} target="_blank" rel="noopener noreferrer"
                        style={{
                          display: "flex", alignItems: "center", gap: 16,
                          padding: 16, background: "#191919", borderRadius: 8,
                          textDecoration: "none", color: "#e5e5e5",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#1f1f1f")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#191919")}
                      >
                        <div style={{ width: 48, height: 48, background: "#2c2c2c", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="#ababab">
                            <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm0 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                          </svg>
                        </div>
                        <div>
                          <p style={{ fontFamily: "var(--font-manrope)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>{r.label}</p>
                          {r.description && <p style={{ fontSize: 12, opacity: 0.5 }}>{r.description}</p>}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Research */}
              {researchResources.length > 0 && (
                <div>
                  <h4 style={{ fontFamily: "var(--font-lexend)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em", color: "#52e32c", marginBottom: 32 }}>
                    Science &amp; Research
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {researchResources.map((r, i) => (
                      <a key={i} href={r.url ?? "#"} target="_blank" rel="noopener noreferrer"
                        style={{
                          padding: 24, background: "#131313", borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.05)",
                          textDecoration: "none", color: "#e5e5e5",
                          transition: "border-color 0.2s", display: "block",
                        }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(82,227,44,0.3)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)")}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#52e32c" style={{ marginBottom: 16 }}>
                          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/>
                        </svg>
                        <p style={{ fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{r.label}</p>
                        {r.description && <p style={{ fontSize: 12, opacity: 0.6, lineHeight: 1.5 }}>{r.description}</p>}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 5. TRANSCRIPT ── */}
        {ep.transcript && (
          <section style={{ maxWidth: 768, margin: "0 auto 128px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 64 }}>
            <div style={{ background: "#131313", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "rgba(255,106,158,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#ff6a9e", fontFamily: "var(--font-lexend)", fontWeight: 700, fontSize: 13,
                  }}>
                    {ep.guest_name ? ep.guest_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "EP"}
                  </div>
                  <div>
                    <p style={{ fontFamily: "var(--font-manrope)", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>
                      Transcript{ep.guest_name ? `: ${ep.guest_name}` : ""}
                    </p>
                    {ep.duration && <p style={{ fontSize: 12, opacity: 0.5 }}>Runtime: {ep.duration}</p>}
                  </div>
                </div>
                <p style={{ color: "rgba(171,171,171,0.6)", lineHeight: 1.8, fontSize: 15 }}>
                  "{ep.transcript.slice(0, 300)}{ep.transcript.length > 300 ? "…" : ""}"
                </p>
                <button
                  onClick={() => setTranscriptOpen(!transcriptOpen)}
                  style={{
                    width: "100%", padding: "16px",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                    background: "none", color: "white", cursor: "pointer",
                    fontFamily: "var(--font-lexend)", fontWeight: 700,
                    fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "none")}
                >
                  {transcriptOpen ? "Collapse Transcript" : "Read Full Transcript"}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ transform: transcriptOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </button>
                {transcriptOpen && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24 }}>
                    <p style={{ color: "#ababab", lineHeight: 2, fontSize: 15, whiteSpace: "pre-wrap" }}>{ep.transcript}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── 6. DAILY MEDS PROMO BANNER ── */}
        <section style={{ marginBottom: 80 }}>
          <div style={{ borderRadius: 24, padding: 2, background: "linear-gradient(135deg, rgba(255,65,142,0.4), rgba(255,181,152,0.2), rgba(82,227,44,0.4))" }}>
            <div style={{ background: "rgba(0,0,0,0.9)", borderRadius: 22, padding: "64px 80px" }}>
              <div style={{ textAlign: "center", marginBottom: 64 }}>
                <h2 style={{
                  fontFamily: "var(--font-lexend)", fontWeight: 900,
                  fontSize: "clamp(32px, 4.5vw, 60px)", lineHeight: 0.95,
                  textTransform: "uppercase", letterSpacing: "-0.05em", color: "white",
                  textShadow: "0 0 12px rgba(255,65,142,0.4)",
                  marginBottom: 16,
                }}>
                  Meditation that meets<br/>you where you are.
                </h2>
                <p style={{ color: "#ababab", maxWidth: 480, margin: "0 auto", fontSize: 15 }}>
                  No gurus. No fluff. Just the honest science of finding focus in the noise.
                </p>
              </div>

              {/* Mood cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 64 }}>
                {PROMO_MOODS.map((mood) => (
                  <div
                    key={mood.label}
                    style={{
                      background: "#1f1f1f", padding: 24, borderRadius: 16,
                      cursor: "pointer", transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = `${mood.color}18`)}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#1f1f1f")}
                  >
                    <h5 style={{ fontFamily: "var(--font-lexend)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.6, marginBottom: 32 }}>
                      {mood.label}
                    </h5>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill={mood.color} opacity={0.4}>
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                      </svg>
                      <span style={{ fontFamily: "var(--font-lexend)", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>{mood.dur}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 48 }}>
                <Link
                  href="/free"
                  style={{
                    fontFamily: "var(--font-manrope)", fontSize: 11, textTransform: "uppercase",
                    letterSpacing: "0.15em", color: "#ababab", textDecoration: "none",
                    transition: "color 0.2s", padding: "16px 0",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "white")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#ababab")}
                >
                  Browse Free Meditations
                </Link>
                <Link
                  href="/signup"
                  style={{
                    background: "#ff6a9e", color: "#470020",
                    padding: "16px 40px", borderRadius: 999,
                    fontFamily: "var(--font-lexend)", fontWeight: 700,
                    fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
                    textDecoration: "none", transition: "transform 0.15s",
                    display: "inline-block",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
                >
                  Subscribe (£19.99/mo)
                </Link>
                <Link
                  href="/pricing"
                  style={{
                    border: "1px solid #ffb598", color: "#ffb598",
                    padding: "16px 40px", borderRadius: 999,
                    fontFamily: "var(--font-lexend)", fontWeight: 700,
                    fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
                    textDecoration: "none", transition: "all 0.2s",
                    display: "inline-block",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#ffb598"; (e.currentTarget as HTMLElement).style.color = "#3f1200"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#ffb598"; }}
                >
                  Founder Membership (£249.99)
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#000000", paddingTop: 80, paddingBottom: 80, paddingLeft: 24, paddingRight: 24, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 24, height: 24, color: "#ff6a9e" }}>
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"/>
                </svg>
              </div>
              <h2 style={{ fontFamily: "var(--font-lexend)", fontWeight: 900, fontSize: 20, textTransform: "uppercase", letterSpacing: "-0.04em", color: "white" }}>
                The Daily Meds
              </h2>
            </div>
            <p style={{ fontSize: 13, color: "#ababab", maxWidth: 320, lineHeight: 1.7 }}>
              Intelligent, grounded, and slightly rebellious wellness for the modern mind.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h6 style={{ fontFamily: "var(--font-lexend)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "white" }}>Connect</h6>
            {["Instagram", "YouTube", "Discord"].map((l) => (
              <a key={l} href="#" style={{ fontSize: 13, color: "#ababab", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ff6a9e")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#ababab")}
              >{l}</a>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h6 style={{ fontFamily: "var(--font-lexend)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "white" }}>App</h6>
            {[["Library", "/library"], ["Pricing", "/pricing"], ["Community", "/community"], ["Podcast", "/podcasts"]].map(([l, href]) => (
              <Link key={l} href={href} style={{ fontSize: 13, color: "#ababab", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ff6a9e")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#ababab")}
              >{l}</Link>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h6 style={{ fontFamily: "var(--font-lexend)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "white" }}>Legal</h6>
            {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Support", "/about"]].map(([l, href]) => (
              <Link key={l} href={href} style={{ fontSize: 13, color: "#ababab", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ff6a9e")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#ababab")}
              >{l}</Link>
            ))}
          </div>
        </div>
        <div style={{
          maxWidth: 1200, margin: "80px auto 0", paddingTop: 32,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontFamily: "var(--font-manrope)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.4,
        }}>
          <span>© {new Date().getFullYear()} The Daily Meds</span>
          <span>Made with love in Ibiza by Natalie Lauraine</span>
        </div>
      </footer>
    </div>
  );
}
