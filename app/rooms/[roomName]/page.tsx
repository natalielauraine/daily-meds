"use client";

// Group session detail page — /rooms/[id]
// The [roomName] folder name is kept for routing compatibility; the parameter
// is now a UUID (the group_session id from Supabase).
//
// Flow:
//  1. Countdown to scheduled_at — shows participant list, join/leave buttons
//  2. When countdown hits 0 — first connected client updates status to "active";
//     all clients receive the change via Supabase realtime and start together
//  3. Active — shows session timer, plays audio if a track was selected
//  4. Completed — shows shared stats (how many finished, total minutes as a group)

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "../../../lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import {
  formatSessionTime,
  formatCountdown,
  secondsUntil,
  type GroupSession,
  type GroupParticipant,
} from "../../../lib/group-sessions";

const EMOJIS = ["❤️", "🧡", "💛", "💚", "💙", "💜", "🤍", "🤎", "🔥", "⭐", "🌟", "💫", "✨", "🏁", "🚩"];
const FALLBACK_GRADIENT = "linear-gradient(135deg, #ff41b3 0%, #ec723d 25%, #adf225 60%, #adf225 80%, #adf225 100%)";

type FloatingEmoji = { id: number; emoji: string; x: number };

type ChatMessage = {
  id: string;
  user_id: string;
  display_name: string;
  content: string;
  created_at: string;
  likes: number;
};

export default function GroupSessionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params?.roomName as string; // UUID — folder named roomName for compat
  const inviteCode = searchParams?.get("invite");

  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<GroupSession | null>(null);
  const [participants, setParticipants] = useState<GroupParticipant[]>([]);
  const [isParticipant, setIsParticipant] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  // Countdown before session starts (seconds)
  const [secondsToStart, setSecondsToStart] = useState(0);
  // Countdown during the active session (seconds remaining)
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioReady, setAudioReady] = useState(false); // user tapped play after autoplay blocked

  // Floating emojis state
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const emojiIdRef = useRef(0);

  // Waiting room chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Flag emoji picker (active session reactions)
  const [flagPickerOpen, setFlagPickerOpen] = useState(false);

  // Emoji picker inside the chat input
  const [chatEmojiOpen, setChatEmojiOpen] = useState(false);

  // Bell sound played via Web Audio when the session ends
  const playBell = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(528, ctx.currentTime);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 3);
    } catch { /* Web Audio not available — skip */ }
  }, []);

  // ── INITIAL LOAD ────────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      // Fetch the group session
      const { data: sess, error: sessErr } = await supabase
        .from("group_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (sessErr || !sess) {
        setError("Session not found.");
        setLoading(false);
        return;
      }

      // Private session — verify invite code or existing participation
      if (!sess.is_public && currentUser?.id !== sess.host_id) {
        const { data: existing } = await supabase
          .from("group_session_participants")
          .select("id")
          .eq("group_session_id", sessionId)
          .eq("user_id", currentUser?.id ?? "")
          .single();

        if (!existing && inviteCode !== sess.invite_code) {
          setError("This is a private session. You need an invite link to join.");
          setLoading(false);
          return;
        }
      }

      setSession(sess);

      // Fetch participants
      const { data: parts } = await supabase
        .from("group_session_participants")
        .select("*")
        .eq("group_session_id", sessionId)
        .order("joined_at");
      setParticipants(parts ?? []);

      if (currentUser) {
        setIsParticipant((parts ?? []).some((p) => p.user_id === currentUser.id));
      }

      // If session is already active and has an audio track, fetch the URL
      if (sess.status === "active" && sess.session_id) {
        fetchAudioUrl(sess.session_id);
      }

      // Initialise timer state from current server time
      if (sess.status === "scheduled") {
        setSecondsToStart(Math.max(0, secondsUntil(sess.scheduled_at)));
      } else if (sess.status === "active") {
        const elapsed = Math.floor((Date.now() - new Date(sess.scheduled_at).getTime()) / 1000);
        setSecondsRemaining(Math.max(0, sess.duration_minutes * 60 - elapsed));
      }

      setLoading(false);
    }
    load();
  }, [sessionId]);

  // Fetch the audio URL for the session's track
  async function fetchAudioUrl(libSessionId: string) {
    const { data } = await supabase
      .from("sessions")
      .select("audio_url")
      .eq("id", libSessionId)
      .single();
    if (data?.audio_url) setAudioUrl(data.audio_url);
  }

  // ── REALTIME SUBSCRIPTIONS ──────────────────────────────────────────────────

  useEffect(() => {
    if (!sessionId) return;

    // Watch for session status changes (scheduled → active → completed)
    const sessionChannel = supabase
      .channel(`group_session:${sessionId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "group_sessions", filter: `id=eq.${sessionId}` },
        async (payload) => {
          const updated = payload.new as GroupSession;
          setSession((prev) => (prev ? { ...prev, ...updated } : prev));

          if (updated.status === "active") {
            // Calculate how far into the session we already are (handles late joiners)
            const elapsed = Math.floor((Date.now() - new Date(updated.scheduled_at).getTime()) / 1000);
            setSecondsRemaining(Math.max(0, updated.duration_minutes * 60 - elapsed));

            // Fetch audio if there's a track
            if (updated.session_id) fetchAudioUrl(updated.session_id);
          }

          if (updated.status === "completed") {
            playBell();
          }
        }
      )
      .subscribe();

    // Watch for participants joining or leaving — refresh the list on any change
    const participantsChannel = supabase
      .channel(`participants:${sessionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "group_session_participants", filter: `group_session_id=eq.${sessionId}` },
        () => {
          supabase
            .from("group_session_participants")
            .select("*")
            .eq("group_session_id", sessionId)
            .order("joined_at")
            .then(({ data }) => setParticipants(data ?? []));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [sessionId]);

  // ── CHAT MESSAGES ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!sessionId) return;

    // Load existing messages
    supabase
      .from("group_session_messages")
      .select("*")
      .eq("group_session_id", sessionId)
      .order("created_at")
      .then(({ data }) => setMessages(data ?? []));

    // Subscribe to new messages and like updates in real time
    const msgChannel = supabase
      .channel(`messages:${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "group_session_messages", filter: `group_session_id=eq.${sessionId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "group_session_messages", filter: `group_session_id=eq.${sessionId}` },
        (payload) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === (payload.new as ChatMessage).id ? { ...m, ...(payload.new as ChatMessage) } : m))
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(msgChannel); };
  }, [sessionId]);

  // ── COUNTDOWN + AUTO-START ──────────────────────────────────────────────────

  useEffect(() => {
    if (!session) return;

    const tick = setInterval(async () => {
      if (session.status === "scheduled") {
        const secs = secondsUntil(session.scheduled_at);
        setSecondsToStart(Math.max(0, secs));

        // When countdown reaches 0, attempt to flip status to "active".
        // The .eq("status","scheduled") guard means only the first client wins;
        // the others pick up the change via the realtime subscription.
        if (secs <= 0) {
          await supabase
            .from("group_sessions")
            .update({ status: "active" })
            .eq("id", sessionId)
            .eq("status", "scheduled");

          // Also update local state immediately so the UI doesn't wait for
          // realtime to bounce back (realtime can be slow or miss the event).
          setSession((prev) => {
            if (!prev || prev.status !== "scheduled") return prev;
            return { ...prev, status: "active" };
          });
          const elapsed = Math.floor((Date.now() - new Date(session.scheduled_at).getTime()) / 1000);
          setSecondsRemaining(Math.max(0, session.duration_minutes * 60 - elapsed));
        }
      } else if (session.status === "active") {
        const elapsed = Math.floor((Date.now() - new Date(session.scheduled_at).getTime()) / 1000);
        const remaining = session.duration_minutes * 60 - elapsed;
        setSecondsRemaining(Math.max(0, remaining));

        // When the session timer runs out, mark complete
        if (remaining <= 0) {
          clearInterval(tick);

          // Mark this user as having completed the session
          if (user) {
            await supabase
              .from("group_session_participants")
              .update({ completed: true })
              .eq("group_session_id", sessionId)
              .eq("user_id", user.id);
            // Update local state immediately so the completed count is correct
            setParticipants((prev) =>
              prev.map((p) => (p.user_id === user.id ? { ...p, completed: true } : p))
            );
          }

          // Flip session to completed — same first-writer-wins pattern
          await supabase
            .from("group_sessions")
            .update({ status: "completed" })
            .eq("id", sessionId)
            .eq("status", "active");

          // Update local state immediately
          setSession((prev) => {
            if (!prev || prev.status !== "active") return prev;
            return { ...prev, status: "completed" };
          });
          playBell();
        }
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [session?.status, session?.scheduled_at, session?.duration_minutes, sessionId, user]);

  // Like a chat message — increments the like count by 1
  async function handleLike(messageId: string, currentLikes: number) {
    await supabase
      .from("group_session_messages")
      .update({ likes: currentLikes + 1 })
      .eq("id", messageId);
    // Update local state immediately
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, likes: currentLikes + 1 } : m))
    );
  }

  // Scroll chat to bottom whenever a new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a chat message
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    const content = messageInput.trim();
    if (!content || !user) return;
    setSendingMessage(true);
    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Anonymous";
    const { error: msgErr } = await supabase.from("group_session_messages").insert({
      group_session_id: sessionId,
      user_id: user.id,
      display_name: displayName,
      content,
    });
    if (msgErr) {
      alert("Could not send message: " + msgErr.message);
      setSendingMessage(false);
      return;
    }
    setMessageInput("");
    setSendingMessage(false);
    // Fallback: re-fetch all messages in case realtime didn't fire
    const { data } = await supabase
      .from("group_session_messages")
      .select("*")
      .eq("group_session_id", sessionId)
      .order("created_at");
    if (data) setMessages(data);
  }

  // Auto-play audio when URL is ready and session is active
  useEffect(() => {
    if (audioUrl && session?.status === "active" && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Browser blocked autoplay — show a manual play button instead
        setAudioReady(true);
      });
    }
  }, [audioUrl, session?.status]);

  // ── ACTIONS ─────────────────────────────────────────────────────────────────

  async function handleJoin() {
    if (!user || !session) return;
    setJoining(true);
    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Anonymous";

    const { error: joinErr } = await supabase
      .from("group_session_participants")
      .upsert(
        {
          group_session_id: sessionId,
          user_id: user.id,
          display_name: displayName,
          avatar_url: user.user_metadata?.avatar_url ?? null,
        },
        { onConflict: "group_session_id,user_id" }
      );

    if (!joinErr) setIsParticipant(true);
    setJoining(false);
  }

  async function handleLeave() {
    if (!user) return;
    await supabase
      .from("group_session_participants")
      .delete()
      .eq("group_session_id", sessionId)
      .eq("user_id", user.id);
    setIsParticipant(false);
  }

  function copyInviteLink() {
    const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const url = `${base}/rooms/${sessionId}?invite=${session?.invite_code}`;
    navigator.clipboard.writeText(url).then(() => {
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
    });
  }

  function fireEmoji(emoji: string) {
    const id = ++emojiIdRef.current;
    const x = 10 + Math.random() * 80;
    setFloatingEmojis((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => setFloatingEmojis((prev) => prev.filter((e) => e.id !== id)), 2500);
  }

  // ── DERIVED VALUES ───────────────────────────────────────────────────────────

  const gradient = session?.gradient ?? FALLBACK_GRADIENT;
  const completedCount = participants.filter((p) => p.completed).length;
  const totalGroupMinutes = completedCount * (session?.duration_minutes ?? 0);
  const progressPercent = session
    ? Math.min(100, Math.max(0, 100 - (secondsRemaining / (session.duration_minutes * 60)) * 100))
    : 0;

  // ── LOADING ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center" style={{ backgroundColor: "#131313" }}>
        <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-pink-400 animate-spin" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-4" style={{ backgroundColor: "#131313" }}>
        <p className="text-white/40 text-sm mb-4 text-center">{error || "Session not found."}</p>
        <Link href="/rooms" className="text-sm text-[#ff41b3] hover:opacity-80 transition-opacity">
          ← Back to rooms
        </Link>
      </div>
    );
  }

  // ── TOP BAR (shared across all phases) ──────────────────────────────────────

  const TopBar = () => (
    <div
      className="shrink-0 px-4 sm:px-6 py-3 flex items-center justify-between"
      style={{ backgroundColor: "#1F1F1F", borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}
    >
      <Link
        href="/rooms"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Leave
      </Link>
      <p className="text-sm text-white/60 truncate mx-4" style={{ fontWeight: 500 }}>{session.title}</p>
      <div className="w-12" />
    </div>
  );

  // ── COMPLETED SCREEN ─────────────────────────────────────────────────────────

  if (session.status === "completed") {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#131313" }}>
        <TopBar />
        <div className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-sm text-center">
            {/* Lotus icon */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: gradient }}
            >
              <span className="text-3xl">🙏</span>
            </div>

            <h2 className="text-2xl text-white mb-2" style={{ fontWeight: 500 }}>Session complete</h2>
            <p className="text-sm text-white/40 mb-8">
              {session.session_title ?? `${session.duration_minutes} min timer`}
            </p>

            {/* Shared stats */}
            <div className="flex gap-4 justify-center mb-8">
              <div
                className="flex flex-col items-center px-6 py-4 rounded-[10px]"
                style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)" }}
              >
                <span className="text-3xl text-white mb-1" style={{ fontWeight: 500 }}>{completedCount}</span>
                <span className="text-xs text-white/35">people completed</span>
              </div>
              <div
                className="flex flex-col items-center px-6 py-4 rounded-[10px]"
                style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)" }}
              >
                <span className="text-3xl text-white mb-1" style={{ fontWeight: 500 }}>{totalGroupMinutes}</span>
                <span className="text-xs text-white/35">group minutes</span>
              </div>
            </div>

            <ParticipantAvatars participants={participants} gradient={gradient} />

            <Link
              href="/rooms"
              className="mt-8 inline-block px-6 py-3 rounded-[10px] text-sm text-white transition-opacity hover:opacity-80"
              style={{ background: gradient, fontWeight: 500 }}
            >
              Back to rooms
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── ACTIVE SESSION SCREEN ────────────────────────────────────────────────────

  if (session.status === "active") {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#131313" }}>
        <TopBar />

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 py-8 max-w-xl mx-auto w-full">

            {/* Progress bar */}
            <div className="w-full h-0.5 rounded-full mb-8" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%`, background: gradient }}
              />
            </div>

            {/* Timer */}
            <div className="text-center mb-8">
              <p className="text-xs text-white/30 mb-3">Meditating together</p>
              <p
                className="text-6xl tabular-nums"
                style={{
                  fontWeight: 300,
                  background: gradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "-0.02em",
                }}
              >
                {formatCountdown(secondsRemaining)}
              </p>
              <p className="text-xs text-white/25 mt-2">
                {session.session_title ?? `${session.duration_minutes} min session`}
              </p>
            </div>

            {/* Audio player — only shown when the session has a track */}
            {audioUrl && (
              <div
                className="rounded-[10px] p-4 mb-6 flex items-center gap-3"
                style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)" }}
              >
                <div
                  className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center"
                  style={{ background: gradient }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white/70" style={{ fontWeight: 500 }}>{session.session_title}</p>
                  <p className="text-xs text-white/30">Playing for all participants</p>
                </div>
                {/* Shown when browser blocks autoplay — user taps to start */}
                {audioReady && (
                  <button
                    onClick={() => { audioRef.current?.play(); setAudioReady(false); }}
                    className="px-3 py-1.5 rounded-lg text-xs text-white transition-opacity hover:opacity-80"
                    style={{ background: gradient, fontWeight: 500 }}
                  >
                    Tap to play
                  </button>
                )}
                <audio ref={audioRef} src={audioUrl} autoPlay />
              </div>
            )}

            {/* Participants */}
            <div className="mb-8">
              <p className="text-xs text-white/40 mb-3">
                {participants.length} meditating now
              </p>
              <ParticipantAvatars participants={participants} gradient={gradient} />
            </div>

            {/* Emoji reactions */}
            <div className="relative">
              {/* Floating emojis layer */}
              <div className="absolute bottom-full left-0 right-0 h-32 pointer-events-none overflow-hidden">
                {floatingEmojis.map((e) => (
                  <span
                    key={e.id}
                    className="absolute text-2xl"
                    style={{ left: `${e.x}%`, bottom: 0, animation: "floatUp 2.5s ease-out forwards" }}
                  >
                    {e.emoji}
                  </span>
                ))}
              </div>

              {/* Main emoji bar */}
              <div className="flex items-center justify-center gap-2 flex-wrap py-2">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => fireEmoji(emoji)}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-transform hover:scale-125 active:scale-95"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  >
                    {emoji}
                  </button>
                ))}
                {/* Flag picker toggle */}
                <button
                  onClick={() => setFlagPickerOpen((o) => !o)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-transform hover:scale-125 active:scale-95"
                  style={{ backgroundColor: flagPickerOpen ? "rgba(255,65,179,0.25)" : "rgba(255,255,255,0.05)" }}
                  title="Country flags"
                >
                  🌍
                </button>
              </div>

              {/* Country flag picker dropdown */}
              {flagPickerOpen && (
                <div
                  className="rounded-[10px] p-3 mt-1 flex flex-wrap gap-1 justify-center"
                  style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.1)" }}
                >
                  {[
                    "🇬🇧","🇺🇸","🇦🇺","🇨🇦","🇮🇪","🇳🇿","🇿🇦",
                    "🇪🇸","🇲🇽","🇦🇷","🇧🇷","🇨🇴","🇵🇪","🇵🇹",
                    "🇫🇷","🇧🇪","🇨🇭","🇩🇪","🇦🇹","🇮🇹","🇳🇱",
                    "🇸🇪","🇳🇴","🇩🇰","🇫🇮","🇵🇱","🇺🇦","🇷🇺",
                    "🇯🇵","🇰🇷","🇨🇳","🇮🇳","🇹🇭","🇻🇳","🇵🇭",
                    "🇸🇬","🇲🇾","🇮🇩","🇹🇷","🇸🇦","🇦🇪","🇪🇬",
                    "🇳🇬","🇬🇭","🇰🇪","🇪🇹","🇯🇲","🇧🇧","🇹🇹",
                    "🇮🇱","🇬🇷","🇨🇿","🇭🇺","🇷🇴","🇸🇰","🇭🇷",
                  ].map((flag) => (
                    <button
                      key={flag}
                      onClick={() => { fireEmoji(flag); setFlagPickerOpen(false); }}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-transform hover:scale-125 active:scale-95"
                      style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                    >
                      {flag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chat during the session */}
            <div className="mt-6">
              <p className="text-xs text-white/40 mb-3">Group chat</p>
              <div
                className="rounded-[10px] overflow-hidden"
                style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)" }}
              >
                <div className="h-44 overflow-y-auto px-4 py-3 flex flex-col gap-2">
                  {messages.length === 0 ? (
                    <p className="text-xs text-white/20 text-center mt-6">No messages yet</p>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className="flex gap-2 items-start">
                        <div
                          className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] text-white mt-0.5"
                          style={{ background: gradient, fontWeight: 500 }}
                        >
                          {msg.display_name[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <span className="text-[11px] text-white/40 mr-1.5">{msg.display_name}</span>
                          <span className="text-xs text-white/80">{msg.content}</span>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                {user ? (
                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-2 px-3 py-2"
                    style={{ borderTop: "0.5px solid rgba(255,255,255,0.07)" }}
                  >
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Say something..."
                      maxLength={200}
                      className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={sendingMessage || !messageInput.trim()}
                      className="text-xs px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-80 disabled:opacity-30"
                      style={{ background: gradient, fontWeight: 500 }}
                    >
                      Send
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-white/25 text-center py-3">
                    <Link href="/login" className="underline">Sign in</Link> to chat
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>

        <style>{`
          @keyframes floatUp {
            0%   { transform: translateY(0) scale(1); opacity: 1; }
            80%  { opacity: 1; }
            100% { transform: translateY(-120px) scale(1.3); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  // ── SCHEDULED: WAITING ROOM ──────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#131313" }}>
      <TopBar />

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 py-8 max-w-xl mx-auto w-full">

          {/* Session info + countdown card */}
          <div
            className="rounded-[10px] p-6 mb-6 text-center"
            style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: gradient }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="white" opacity={0.9}>
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>

            <h2 className="text-white text-xl mb-1" style={{ fontWeight: 500 }}>{session.title}</h2>
            <p className="text-sm text-white/40 mb-1">Hosted by {session.host_name}</p>
            <p className="text-xs text-white/30 mb-6">
              {session.session_title ?? `${session.duration_minutes} min timer`}
              {" · "}
              {formatSessionTime(session.scheduled_at)}
            </p>

            {/* Countdown to start */}
            <div className="mb-6">
              <p className="text-xs text-white/30 mb-2">Starting in</p>
              <p
                className="text-5xl tabular-nums"
                style={{
                  fontWeight: 300,
                  background: gradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "-0.02em",
                }}
              >
                {secondsToStart <= 0 ? "Starting…" : formatCountdown(secondsToStart)}
              </p>
            </div>

            {/* Join / Leave / Sign in */}
            {!isParticipant ? (
              user ? (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="w-full py-3 rounded-[10px] text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ background: gradient, fontWeight: 500 }}
                >
                  {joining ? "Joining…" : "Join Session"}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="block w-full py-3 rounded-[10px] text-sm text-white text-center transition-opacity hover:opacity-80"
                  style={{ background: gradient, fontWeight: 500 }}
                >
                  Sign in to join
                </Link>
              )
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-[#adf225] mb-1">You&apos;re in ✓</p>
                <button
                  onClick={handleLeave}
                  className="w-full py-2 rounded-[10px] text-sm text-white/40 transition-colors hover:text-white/70"
                  style={{ border: "0.5px solid rgba(255,255,255,0.12)" }}
                >
                  Leave session
                </button>
              </div>
            )}
          </div>

          {/* Share invite link — only shown for private sessions to participants */}
          {!session.is_public && isParticipant && (
            <div
              className="rounded-[10px] p-4 mb-6 flex items-center justify-between"
              style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)" }}
            >
              <div>
                <p className="text-xs text-white/40 mb-0.5">Invite code</p>
                <p className="text-white tracking-[0.2em] text-base" style={{ fontWeight: 500 }}>
                  {session.invite_code}
                </p>
              </div>
              <button
                onClick={copyInviteLink}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors"
                style={{
                  border: "0.5px solid rgba(255,255,255,0.15)",
                  color: inviteCopied ? "#adf225" : "rgba(255,255,255,0.6)",
                }}
              >
                {inviteCopied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                    Share link
                  </>
                )}
              </button>
            </div>
          )}

          {/* Participant list */}
          {participants.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-white/40 mb-3">
                {participants.length} participant{participants.length !== 1 ? "s" : ""}
                {session.max_participants < 999 && ` · ${session.max_participants} max`}
              </p>
              <div
                className="rounded-[10px] p-4"
                style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)" }}
              >
                <ParticipantAvatars participants={participants} gradient={gradient} showNames />
              </div>
            </div>
          )}

          {/* Waiting room chat — opens 5 minutes before the session starts */}
          {secondsToStart <= 300 && (
            <div>
              <p className="text-xs text-white/40 mb-3">Waiting room chat</p>
              <div
                className="rounded-[10px] overflow-hidden"
                style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)" }}
              >
                {/* Message list */}
                <div className="h-52 overflow-y-auto px-4 py-3 flex flex-col gap-2">
                  {messages.length === 0 ? (
                    <p className="text-xs text-white/20 text-center mt-8">
                      No messages yet — say hello!
                    </p>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className="flex gap-2 items-start group">
                        <div
                          className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] text-white mt-0.5"
                          style={{ background: gradient, fontWeight: 500 }}
                        >
                          {msg.display_name[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] text-white/40 mr-1.5">{msg.display_name}</span>
                          <span className="text-xs text-white/80">{msg.content}</span>
                        </div>
                        {/* Like button */}
                        <button
                          onClick={() => handleLike(msg.id, msg.likes ?? 0)}
                          className="shrink-0 flex items-center gap-1 text-[11px] text-white/30 hover:text-pink-400 transition-colors"
                        >
                          <span>❤️</span>
                          {(msg.likes ?? 0) > 0 && <span>{msg.likes}</span>}
                        </button>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                {user ? (
                  <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.07)" }}>
                    {/* Emoji picker for chat */}
                    {chatEmojiOpen && (
                      <div className="px-3 pt-2 pb-1 flex flex-wrap gap-1">
                        {["❤️","🧡","💛","💚","💙","💜","🤍","🔥","⭐","🌟","✨","💫","😊","😂","🥺","😍","🙏","👍","💪","😌","🫶","🥰","😭","🤩"].map((em) => (
                          <button
                            key={em}
                            type="button"
                            onClick={() => { setMessageInput((v) => v + em); setChatEmojiOpen(false); }}
                            className="text-lg hover:scale-125 transition-transform"
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    )}
                    <form
                      onSubmit={handleSendMessage}
                      className="flex items-center gap-2 px-3 py-2"
                    >
                      <button
                        type="button"
                        onClick={() => setChatEmojiOpen((o) => !o)}
                        className="text-lg text-white/30 hover:text-white/60 transition-colors"
                      >
                        🙂
                      </button>
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Say hello..."
                        maxLength={200}
                        className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
                      />
                      <button
                        type="submit"
                        disabled={sendingMessage || !messageInput.trim()}
                        className="text-xs px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-80 disabled:opacity-30"
                        style={{ background: gradient, fontWeight: 500 }}
                      >
                        Send
                      </button>
                    </form>
                  </div>
                ) : (
                  <p className="text-xs text-white/25 text-center py-3">
                    <Link href="/login" className="underline">Sign in</Link> to chat
                  </p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── PARTICIPANT AVATARS ───────────────────────────────────────────────────────
// Shows a grid of avatar circles with initials (or photo if available)

function ParticipantAvatars({
  participants,
  gradient,
  showNames = false,
}: {
  participants: GroupParticipant[];
  gradient: string;
  showNames?: boolean;
}) {
  if (participants.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-3 ${showNames ? "" : "justify-center"}`}>
      {participants.map((p) => (
        <div key={p.id} className="flex flex-col items-center gap-1">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm text-white overflow-hidden"
            style={{ background: p.avatar_url ? "transparent" : gradient, fontWeight: 500 }}
          >
            {p.avatar_url ? (
              <Image src={p.avatar_url} alt={p.display_name} width={40} height={40} className="w-full h-full object-cover" unoptimized />
            ) : (
              p.display_name[0]?.toUpperCase() ?? "?"
            )}
          </div>
          {showNames && (
            <span className="text-[10px] text-white/35 max-w-[48px] truncate text-center">
              {p.display_name}
            </span>
          )}
          {p.completed && (
            <span className="text-[10px]">🙏</span>
          )}
        </div>
      ))}
    </div>
  );
}
