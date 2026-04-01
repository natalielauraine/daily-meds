"use client";

// Live room page — cinematic layout with video player + community chat.
// Left: session title, video/Daily.co player, emoji reactions.
// Right: live community chat panel with scrollable messages + input.
// Footer: session timer, global reach, energy level stats.

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// ── TYPES ─────────────────────────────────────────────────────────────────────

type ChatMessage = {
  id: number;
  name: string;
  time: string;
  text: string;
  colorClass: string; // tailwind color for the name
  initials?: string;  // shown if no avatar
};

// ── MOCK CHAT DATA (replaced by real-time messages when Daily.co is live) ─────

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 1, name: "Sarah K.", time: "10:42 PM", text: "This visual aesthetic is everything tonight. Feeling so grounded.", colorClass: "#ff41b3" },
  { id: 2, name: "Marcus R.", time: "10:43 PM", text: "Breathing together ✨", colorClass: "#ec723d" },
  { id: 3, name: "Julian D.", time: "10:44 PM", text: "The hum in the background audio is so soothing. Is that a live synthesizer?", colorClass: "#ADF225", initials: "JD" },
  { id: 4, name: "Eliza Flow", time: "10:45 PM", text: "Just joined from London. Deep breaths everyone. 💖", colorClass: "#B8A0C9" },
  { id: 5, name: "Nico T.", time: "10:46 PM", text: "Sending peace to all 1,284 of you.", colorClass: "#ff41b3" },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────

function now(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function LiveRoomPage() {
  const params = useParams();
  const roomName = params?.roomName as string;

  const dailyDomain = process.env.NEXT_PUBLIC_DAILY_DOMAIN;
  const roomUrl = dailyDomain ? `https://${dailyDomain}/${roomName}` : null;

  // ── STATE ──────────────────────────────────────────────────────────────────
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [reactions, setReactions] = useState({ heart: 1200, peace: 842, sparkle: 2100, meditate: 540, wave: 920 });
  const [secondsLeft, setSecondsLeft] = useState(24 * 60 + 12); // 24m 12s mock countdown

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Format the countdown as "Xm Ys Remaining"
  function formatCountdown(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s.toString().padStart(2, "0")}s Remaining`;
  }

  // Add a new message when user submits
  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, name: "You", time: now(), text: trimmed, colorClass: "#ADF225", initials: "Y" },
    ]);
    setInputText("");
  }

  // Increment a reaction count on click
  function handleReact(key: keyof typeof reactions) {
    setReactions((prev) => ({ ...prev, [key]: prev[key] + 1 }));
  }

  // Format large numbers as "1.2k"
  function fmt(n: number): string {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
  }

  // Whether Daily.co is actually ready to stream
  const canStream = !!dailyDomain && joined;

  // ── LIVE ROOM LAYOUT ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0D1712", color: "white" }}>

      {/* ── HEADER ── */}
      <header
        className="flex items-center justify-between px-4 md:px-10 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div style={{ color: "#ADF225" }}>
            <svg fill="none" viewBox="0 0 48 48" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"/>
            </svg>
          </div>
          <Link href="/">
            <span className="text-lg font-bold" style={{ fontFamily: "var(--font-plus-jakarta)", color: "white" }}>
              The Daily Meds
            </span>
          </Link>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <button
            className="flex items-center justify-center w-10 h-10 rounded-lg transition-colors"
            style={{ background: "rgba(255,255,255,0.06)" }}
            aria-label="Notifications"
          >
            <svg fill="currentColor" height="20" width="20" viewBox="0 0 256 256" style={{ color: "rgba(255,255,255,0.7)" }}>
              <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"/>
            </svg>
          </button>
          {/* Profile */}
          <button
            className="flex items-center justify-center w-10 h-10 rounded-lg transition-colors"
            style={{ background: "rgba(255,255,255,0.06)" }}
            aria-label="Profile"
          >
            <svg fill="currentColor" height="20" width="20" viewBox="0 0 256 256" style={{ color: "rgba(255,255,255,0.7)" }}>
              <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM74.08,197.5a64,64,0,0,1,107.84,0,87.83,87.83,0,0,1-107.84,0ZM96,120a32,32,0,1,1,32,32A32,32,0,0,1,96,120Zm97.76,66.41a79.66,79.66,0,0,0-36.06-28.75,48,48,0,1,0-59.4,0,79.66,79.66,0,0,0-36.06,28.75,88,88,0,1,1,131.52,0Z"/>
            </svg>
          </button>
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)", color: "white", fontFamily: "var(--font-plus-jakarta)" }}
          >
            NL
          </div>
        </div>
      </header>

      {/* ── MAIN GRID ── */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 px-4 md:px-10 pt-8 pb-6">

        {/* ── LEFT COLUMN: player + reactions ── */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Session title */}
          <div className="flex flex-col px-1">
            <h1
              className="uppercase leading-tight tracking-wider"
              style={{
                fontFamily: "var(--font-plus-jakarta)",
                fontWeight: 800,
                fontSize: "clamp(28px, 4vw, 40px)",
                color: "white",
              }}
            >
              Midnight Ritual: The Re-Center
            </h1>
            <p
              className="mt-1 text-base italic font-medium"
              style={{ color: "#ADF225", opacity: 0.85 }}
            >
              You are here. They are here. We are breathing together.
            </p>
          </div>

          {/* Video panel */}
          <div
            className="relative w-full rounded-2xl overflow-hidden group"
            style={{
              background: "rgba(21, 36, 34, 0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(173, 242, 37, 0.12)",
            }}
          >
            {/* Video area: Daily.co iframe when live, otherwise gradient placeholder */}
            <div className="aspect-video w-full relative">
              {canStream ? (
                <iframe
                  src={`${roomUrl}?theme=dark`}
                  allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
                  className="absolute inset-0 w-full h-full"
                  style={{ border: "none" }}
                  title="Daily Meds Live Session"
                />
              ) : (
                /* Gradient placeholder shown before joining or when Daily.co isn't set up */
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                  style={{ background: "linear-gradient(135deg, #1a0a12 0%, #0d1a12 50%, #0a1020 100%)" }}
                >
                  {/* Pulsing glow orb */}
                  <div
                    className="w-24 h-24 rounded-full animate-pulse flex items-center justify-center"
                    style={{ background: "radial-gradient(circle, rgba(255,65,179,0.3) 0%, transparent 70%)" }}
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(255,65,179,0.15)", border: "1px solid rgba(255,65,179,0.3)" }}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="#ff41b3">
                        <path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                      </svg>
                    </div>
                  </div>
                  {!dailyDomain ? (
                    <p className="text-xs text-center px-8" style={{ color: "rgba(255,255,255,0.3)" }}>
                      Add <code style={{ color: "rgba(255,255,255,0.5)" }}>NEXT_PUBLIC_DAILY_DOMAIN</code> to .env.local to go live
                    </p>
                  ) : (
                    <button
                      onClick={() => setJoined(true)}
                      className="px-8 py-3 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80"
                      style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)", fontFamily: "var(--font-plus-jakarta)" }}
                    >
                      Join Live Session
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* LIVE badge */}
            <div
              className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wider"
              style={{ background: "rgba(220,38,38,0.9)" }}
            >
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Live
            </div>

            {/* Hover play overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(13,23,18,0.2)" }}>
              <button
                className="w-20 h-20 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{
                  background: "rgba(173, 242, 37, 0.15)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(173,242,37,0.3)",
                }}
                aria-label="Play"
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>

            {/* Bottom bar: viewer count + controls */}
            <div
              className="absolute bottom-0 inset-x-0 p-4 flex items-center justify-between"
              style={{ background: "linear-gradient(to top, rgba(13,23,18,0.85) 0%, transparent 100%)" }}
            >
              {/* Viewer count with overlapping avatars */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {["#ff41b3", "#ec723d", "#ADF225"].map((color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2"
                      style={{ background: color, color: "white", borderColor: "#0D1712", fontFamily: "var(--font-plus-jakarta)" }}
                    >
                      {["SK", "MR", "EF"][i]}
                    </div>
                  ))}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2"
                    style={{ background: "#ADF225", color: "#000", borderColor: "#0D1712", fontFamily: "var(--font-plus-jakarta)" }}
                  >
                    +1.2k
                  </div>
                </div>
                <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                  1,284 breathing with you
                </span>
              </div>

              {/* Volume + fullscreen */}
              <div className="flex items-center gap-2">
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: "rgba(21,36,34,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(173,242,37,0.15)" }}
                  aria-label="Volume"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                  </svg>
                </button>
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: "rgba(21,36,34,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(173,242,37,0.15)" }}
                  aria-label="Fullscreen"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Emoji reactions */}
          <div className="flex items-center gap-3 px-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            <span
              className="text-xs font-bold uppercase tracking-widest mr-1 shrink-0"
              style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-space-grotesk)" }}
            >
              React:
            </span>
            {[
              { key: "heart" as const, emoji: "💖", count: reactions.heart, label: "#ff41b3" },
              { key: "peace" as const, emoji: "✌️", count: reactions.peace, label: "#ec723d" },
              { key: "sparkle" as const, emoji: "✨", count: reactions.sparkle, label: "#ADF225" },
              { key: "meditate" as const, emoji: "🧘", count: reactions.meditate, label: "#B8A0C9" },
              { key: "wave" as const, emoji: "🌊", count: reactions.wave, label: "#ec723d" },
            ].map(({ key, emoji, count, label }) => (
              <button
                key={key}
                onClick={() => handleReact(key)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full shrink-0 transition-all hover:scale-105 active:scale-95"
                style={{
                  background: "rgba(21,36,34,0.7)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(173,242,37,0.12)",
                }}
              >
                <span className="text-lg leading-none">{emoji}</span>
                <span className="text-xs font-bold" style={{ color: label, fontFamily: "var(--font-space-grotesk)" }}>
                  {fmt(count)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── RIGHT COLUMN: community chat ── */}
        <div className="lg:col-span-4 flex flex-col" style={{ height: "600px", maxHeight: "800px" }}>
          <div
            className="flex flex-col h-full rounded-2xl overflow-hidden"
            style={{
              background: "rgba(21,36,34,0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(173,242,37,0.12)",
            }}
          >
            {/* Chat header */}
            <div
              className="p-5 flex items-center justify-between shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <h3
                className="text-sm font-bold uppercase tracking-widest"
                style={{ fontFamily: "var(--font-plus-jakarta)", color: "white" }}
              >
                Community Chat
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#ADF225" }} />
                <span
                  className="text-[10px] font-bold uppercase"
                  style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-space-grotesk)" }}
                >
                  Live
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5" style={{ scrollbarWidth: "none" }}>
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold border"
                    style={{
                      backgroundColor: msg.colorClass + "22",
                      borderColor: msg.colorClass + "44",
                      color: msg.colorClass,
                      fontFamily: "var(--font-plus-jakarta)",
                    }}
                  >
                    {msg.initials ?? msg.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  {/* Content */}
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: msg.colorClass, fontFamily: "var(--font-plus-jakarta)" }}>
                        {msg.name}
                      </span>
                      <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-space-grotesk)" }}>
                        {msg.time}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                      {msg.text}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <div
              className="p-4 shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(13,23,18,0.5)" }}
            >
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full rounded-xl py-3 px-4 text-sm outline-none"
                  style={{
                    background: "rgba(13,23,18,0.8)",
                    border: "1px solid rgba(173,242,37,0.1)",
                    color: "white",
                  }}
                />
                <button
                  type="submit"
                  className="absolute right-2 p-1.5 rounded-lg transition-colors hover:bg-lime-400/10"
                  style={{ color: "#ADF225" }}
                  aria-label="Send"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </form>
              <div className="mt-3 flex items-center justify-between px-1">
                <div className="flex gap-3">
                  <button className="transition-colors" style={{ color: "rgba(255,255,255,0.3)" }} aria-label="Emoji">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                    </svg>
                  </button>
                  <button className="transition-colors" style={{ color: "rgba(255,255,255,0.3)" }} aria-label="GIF">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.5 9H13v6h-1.5zM9 9H6c-.6 0-1 .5-1 1v4c0 .5.4 1 1 1h3c.6 0 1-.5 1-1v-2H8.5v1.5h-2v-3H10V10c0-.5-.4-1-1-1zm10 1.5V9h-4.5v6H16v-2h2v-1.5h-2v-1z"/>
                    </svg>
                  </button>
                </div>
                <p
                  className="text-[10px] font-bold uppercase tracking-tight"
                  style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-space-grotesk)" }}
                >
                  Press enter to send
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER STATS ── */}
      <footer
        className="mt-auto py-10 px-4 md:px-10 grid grid-cols-1 md:grid-cols-3 gap-8"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Current Session */}
        <div className="flex flex-col gap-2">
          <span
            className="text-[10px] font-bold tracking-[0.2em] uppercase"
            style={{ color: "#ADF225", fontFamily: "var(--font-space-grotesk)" }}
          >
            Current Session
          </span>
          <p
            className="text-xl font-bold"
            style={{ fontFamily: "var(--font-plus-jakarta)", color: "white" }}
          >
            {formatCountdown(secondsLeft)}
          </p>
        </div>

        {/* Global Reach */}
        <div className="flex flex-col gap-2">
          <span
            className="text-[10px] font-bold tracking-[0.2em] uppercase"
            style={{ color: "#ec723d", fontFamily: "var(--font-space-grotesk)" }}
          >
            Global Reach
          </span>
          <p
            className="text-xl font-bold"
            style={{ fontFamily: "var(--font-plus-jakarta)", color: "white" }}
          >
            42 Countries Participating
          </p>
        </div>

        {/* Energy Level */}
        <div className="flex flex-col gap-2">
          <span
            className="text-[10px] font-bold tracking-[0.2em] uppercase"
            style={{ color: "#B8A0C9", fontFamily: "var(--font-space-grotesk)" }}
          >
            Energy Level
          </span>
          <div className="flex items-center gap-3">
            <p
              className="text-xl font-bold"
              style={{ fontFamily: "var(--font-plus-jakarta)", color: "white" }}
            >
              Collective Calm
            </p>
            {/* Energy bars */}
            <div className="flex items-end gap-0.5 h-5">
              {[0.2, 0.4, 0.6, 0.8, 1].map((opacity, i) => (
                <span
                  key={i}
                  className="w-1 h-4 rounded-full"
                  style={{
                    backgroundColor: "#B8A0C9",
                    opacity,
                    animation: i === 4 ? "pulse 1.5s infinite" : undefined,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

// ── PAGE SHELL (shared wrapper for non-live states) ────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0D1712", color: "white" }}>
      <header
        className="flex items-center justify-between px-4 md:px-10 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <div style={{ color: "#ADF225" }}>
            <svg fill="none" viewBox="0 0 48 48" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"/>
            </svg>
          </div>
          <Link href="/">
            <span className="text-lg font-bold" style={{ fontFamily: "var(--font-plus-jakarta)", color: "white" }}>The Daily Meds</span>
          </Link>
        </div>
        <Link href="/live" className="text-sm transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
          ← Back to Live
        </Link>
      </header>
      {children}
    </div>
  );
}
