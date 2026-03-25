"use client";

// /rooms — Group Meds list page.
// Shows upcoming group sessions the user has joined or created, plus open public
// sessions they can join. The "Create Group Med" button opens a modal form that
// saves a new row to the group_sessions Supabase table.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { createClient } from "../../lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import {
  generateInviteCode,
  formatSessionTime,
  secondsUntil,
  type GroupSession,
} from "../../lib/group-sessions";

// Available gradient colours for group session cards
const GRADIENTS = [
  "linear-gradient(135deg, #6B21E8 0%, #8B3CF7 25%, #6366F1 60%, #3B82F6 80%, #22D3EE 100%)",
  "linear-gradient(135deg, #F43F5E 0%, #EC4899 20%, #D946EF 35%, #F97316 65%, #FACC15 100%)",
  "linear-gradient(135deg, #10B981 0%, #22C55E 35%, #84CC16 70%, #D9F100 100%)",
  "linear-gradient(135deg, #8B3CF7 0%, #6366F1 100%)",
];

const TIMER_DURATIONS = [5, 10, 15, 20, 30];

// A session from the library dropdown
type LibrarySession = {
  id: string;
  title: string;
  duration: number; // raw value from Supabase sessions table
};

// Shape of the create form
type CreateForm = {
  title: string;
  sessionId: string;       // "" = timer only
  durationMinutes: number; // used when sessionId is ""
  date: string;
  time: string;
  maxParticipants: number;
  isPublic: boolean;
  gradient: string;
};

export default function RoomsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mySessions, setMySessions] = useState<GroupSession[]>([]);
  const [publicSessions, setPublicSessions] = useState<GroupSession[]>([]);
  const [librarySessions, setLibrarySessions] = useState<LibrarySession[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [pageError, setPageError] = useState("");

  // Tomorrow at 8pm as a sensible default start time
  function getDefaultDateTime() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(20, 0, 0, 0);
    return {
      date: d.toISOString().slice(0, 10),
      time: "20:00",
    };
  }

  const [form, setForm] = useState<CreateForm>({
    title: "",
    sessionId: "",
    durationMinutes: 10,
    ...getDefaultDateTime(),
    maxParticipants: 50,
    isPublic: true,
    gradient: GRADIENTS[0],
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      setUser(data.user);
      await Promise.all([loadSessions(data.user.id), loadLibrarySessions()]);
      setLoading(false);
    });
  }, []);

  // Fetch sessions the user is in (hosted or joined) plus open public sessions
  async function loadSessions(userId: string) {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    // Find which group sessions this user is a participant in
    const { data: participantRows } = await supabase
      .from("group_session_participants")
      .select("group_session_id")
      .eq("user_id", userId);

    const joinedIds = (participantRows ?? []).map((r) => r.group_session_id);

    // Fetch my sessions (including recently completed ones)
    if (joinedIds.length > 0) {
      const { data: mine } = await supabase
        .from("group_sessions")
        .select("*")
        .in("id", joinedIds)
        .gte("scheduled_at", twoHoursAgo)
        .order("scheduled_at", { ascending: true });
      setMySessions(mine ?? []);
    }

    // Fetch upcoming public sessions the user hasn't joined yet
    let query = supabase
      .from("group_sessions")
      .select("*")
      .eq("is_public", true)
      .eq("status", "scheduled")
      .gte("scheduled_at", now)
      .order("scheduled_at", { ascending: true })
      .limit(20);

    if (joinedIds.length > 0) {
      query = query.not("id", "in", `(${joinedIds.join(",")})`);
    }

    const { data: open } = await query;
    setPublicSessions(open ?? []);
  }

  // Fetch all sessions from the library for the dropdown
  async function loadLibrarySessions() {
    const { data } = await supabase
      .from("sessions")
      .select("id, title, duration")
      .order("title");
    setLibrarySessions(data ?? []);
  }

  // Create a new group session and navigate to it
  async function handleCreate() {
    if (!form.title.trim()) { setCreateError("Please add a title."); return; }
    if (!form.date || !form.time) { setCreateError("Please set a date and time."); return; }
    if (!user) return;

    const scheduledAt = new Date(`${form.date}T${form.time}`).toISOString();
    if (new Date(scheduledAt) <= new Date()) {
      setCreateError("Please pick a time in the future.");
      return;
    }

    setCreating(true);
    setCreateError("");

    // Look up the selected session's title + duration
    const selectedSession = librarySessions.find((s) => s.id === form.sessionId);

    // Duration: if a session is selected, derive minutes from its raw duration value.
    // Sessions table stores duration in seconds (e.g. 1080 = 18 min).
    const durationMinutes = selectedSession
      ? Math.max(1, Math.round(selectedSession.duration / 60))
      : form.durationMinutes;

    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Anonymous";

    const { data: newSession, error: insertError } = await supabase
      .from("group_sessions")
      .insert({
        title: form.title.trim(),
        host_id: user.id,
        host_name: displayName,
        session_id: form.sessionId || null,
        session_title: selectedSession?.title ?? null,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
        max_participants: form.maxParticipants,
        is_public: form.isPublic,
        invite_code: form.isPublic ? null : generateInviteCode(),
        status: "scheduled",
        gradient: form.gradient,
      })
      .select()
      .single();

    if (insertError || !newSession) {
      setCreateError("Could not create session — please try again.");
      setCreating(false);
      return;
    }

    // Auto-join the host as the first participant
    await supabase.from("group_session_participants").insert({
      group_session_id: newSession.id,
      user_id: user.id,
      display_name: displayName,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      completed: false,
    });

    router.push(`/rooms/${newSession.id}`);
  }

  // Join a session from the list and go straight to it
  async function handleJoin(sessionId: string) {
    if (!user) { router.push("/login"); return; }
    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Anonymous";

    await supabase.from("group_session_participants").upsert({
      group_session_id: sessionId,
      user_id: user.id,
      display_name: displayName,
      avatar_url: user.user_metadata?.avatar_url ?? null,
    }, { onConflict: "group_session_id,user_id" });

    router.push(`/rooms/${sessionId}`);
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-purple-400 animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-24">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl text-white" style={{ fontWeight: 500 }}>Group Meds</h1>
            <p className="text-sm text-white/40 mt-1">Meditate with others at the same time</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white transition-opacity hover:opacity-80 shrink-0"
            style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Create Group Med
          </button>
        </div>

        <p className="text-xs text-white/25 mb-8">
          Schedule a session, invite friends, and all start the same meditation at the exact same time.
        </p>

        {pageError && (
          <div className="px-4 py-3 rounded-[10px] mb-5" style={{ backgroundColor: "rgba(244,63,94,0.1)", border: "0.5px solid rgba(244,63,94,0.3)" }}>
            <p className="text-sm text-red-300">{pageError}</p>
          </div>
        )}

        {/* My Group Meds — sessions I've joined or created */}
        {mySessions.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs text-white/40 uppercase tracking-widest mb-4" style={{ fontWeight: 500 }}>My Group Meds</h2>
            <div className="flex flex-col gap-4">
              {mySessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  isJoined={true}
                  onOpen={() => router.push(`/rooms/${s.id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Open public sessions the user hasn't joined yet */}
        {publicSessions.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs text-white/40 uppercase tracking-widest mb-4" style={{ fontWeight: 500 }}>Open Sessions</h2>
            <div className="flex flex-col gap-4">
              {publicSessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  isJoined={false}
                  onOpen={() => handleJoin(s.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {mySessions.length === 0 && publicSessions.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16 rounded-[10px] text-center"
            style={{ border: "0.5px dashed rgba(255,255,255,0.1)" }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
              style={{ background: GRADIENTS[0] }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white" opacity={0.9}>
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
            <p className="text-sm text-white/30 mb-1">No group sessions yet</p>
            <p className="text-xs text-white/20 mb-6">Create one and invite friends to join</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2 rounded-full text-sm text-white hover:opacity-80 transition-opacity"
              style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
            >
              Create Group Med
            </button>
          </div>
        )}

      </main>

      <Footer />

      {/* Create Group Med modal */}
      {showModal && (
        <CreateModal
          form={form}
          setForm={setForm}
          librarySessions={librarySessions}
          creating={creating}
          createError={createError}
          onSubmit={handleCreate}
          onClose={() => { setShowModal(false); setCreateError(""); }}
        />
      )}
    </div>
  );
}

// ── SESSION CARD ──────────────────────────────────────────────────────────────

function SessionCard({
  session,
  isJoined,
  onOpen,
}: {
  session: GroupSession;
  isJoined: boolean;
  onOpen: () => void;
}) {
  const gradient = session.gradient ?? "linear-gradient(135deg, #6B21E8, #22D3EE)";
  const secsUntil = secondsUntil(session.scheduled_at);

  // Human-readable time until start
  const timeLabel =
    session.status === "active"
      ? "Live now"
      : session.status === "completed"
      ? "Completed"
      : secsUntil < 3600
      ? `Starting in ${Math.ceil(secsUntil / 60)} min`
      : formatSessionTime(session.scheduled_at);

  return (
    <div
      className="rounded-[10px] overflow-hidden"
      style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
    >
      {/* Gradient top stripe */}
      <div className="h-0.5 w-full" style={{ background: gradient }} />

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon circle */}
          <div
            className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center"
            style={{ background: gradient }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" opacity={0.9}>
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-base truncate" style={{ fontWeight: 500 }}>{session.title}</p>
            <p className="text-xs text-white/35 mt-0.5">
              Hosted by {session.host_name} · {session.session_title ?? `${session.duration_minutes} min timer`}
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: session.status === "active" ? "#22C55E" : "rgba(255,255,255,0.4)" }}
            >
              {timeLabel}
            </p>
          </div>

          {!session.is_public && (
            <span
              className="shrink-0 text-[10px] px-2 py-0.5 rounded-full text-white/40"
              style={{ border: "0.5px solid rgba(255,255,255,0.15)" }}
            >
              Private
            </span>
          )}
        </div>

        <button
          onClick={onOpen}
          className="mt-4 w-full py-3 rounded-[10px] text-sm text-white transition-opacity hover:opacity-80"
          style={{ background: gradient, fontWeight: 500 }}
        >
          {isJoined ? "Open Session" : "Join Session"}
        </button>
      </div>
    </div>
  );
}

// ── CREATE MODAL ──────────────────────────────────────────────────────────────

function CreateModal({
  form,
  setForm,
  librarySessions,
  creating,
  createError,
  onSubmit,
  onClose,
}: {
  form: CreateForm;
  setForm: (f: CreateForm) => void;
  librarySessions: LibrarySession[];
  creating: boolean;
  createError: string;
  onSubmit: () => void;
  onClose: () => void;
}) {
  // Shared style for all text inputs and selects
  const inputStyle: React.CSSProperties = {
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "0.5px solid rgba(255,255,255,0.12)",
    color: "white",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
    >
      <div
        className="w-full max-w-md rounded-[16px] overflow-hidden"
        style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.1)" }}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-5 pt-5 pb-4"
          style={{ borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-white text-base" style={{ fontWeight: 500 }}>Create a Group Med</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">

          {/* Title */}
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Session title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Sunday Reset with the girls"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none placeholder:text-white/20"
              style={inputStyle}
            />
          </div>

          {/* Meditation track picker */}
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Meditation track (optional)</label>
            <select
              value={form.sessionId}
              onChange={(e) => setForm({ ...form, sessionId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{
                ...inputStyle,
                appearance: "none" as const,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='rgba(255,255,255,0.3)'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
              }}
            >
              <option value="">No track — timer only</option>
              {librarySessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({Math.max(1, Math.round(s.duration / 60))} min)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-white/25 mt-1">
              All participants will play the same track when the session starts.
            </p>
          </div>

          {/* Duration — only when no track is selected */}
          {!form.sessionId && (
            <div>
              <label className="block text-xs text-white/40 mb-2">Timer duration</label>
              <div className="flex gap-2 flex-wrap">
                {TIMER_DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setForm({ ...form, durationMinutes: d })}
                    className="px-4 py-2 rounded-full text-sm transition-colors"
                    style={{
                      backgroundColor: form.durationMinutes === d ? "#8B5CF6" : "rgba(255,255,255,0.06)",
                      color: form.durationMinutes === d ? "white" : "rgba(255,255,255,0.45)",
                      border: form.durationMinutes === d ? "none" : "0.5px solid rgba(255,255,255,0.1)",
                      fontWeight: form.durationMinutes === d ? 500 : 400,
                    }}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date and time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ ...inputStyle, colorScheme: "dark" }}
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Time</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ ...inputStyle, colorScheme: "dark" }}
              />
            </div>
          </div>

          {/* Max participants */}
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Max participants</label>
            <input
              type="number"
              min={2}
              max={500}
              value={form.maxParticipants}
              onChange={(e) => setForm({ ...form, maxParticipants: parseInt(e.target.value) || 50 })}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={inputStyle}
            />
          </div>

          {/* Public / Private toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm text-white/70">Public session</p>
              <p className="text-xs text-white/30">Anyone can discover and join this session</p>
            </div>
            <button
              onClick={() => setForm({ ...form, isPublic: !form.isPublic })}
              className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ml-4"
              style={{ backgroundColor: form.isPublic ? "#8B5CF6" : "rgba(255,255,255,0.15)" }}
            >
              <span
                className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
                style={{ transform: form.isPublic ? "translateX(22px)" : "translateX(2px)" }}
              />
            </button>
          </div>

          {/* Colour picker */}
          <div>
            <label className="block text-xs text-white/40 mb-2">Colour</label>
            <div className="flex gap-2">
              {GRADIENTS.map((g) => (
                <button
                  key={g}
                  onClick={() => setForm({ ...form, gradient: g })}
                  className="w-9 h-9 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: g,
                    outline: form.gradient === g ? "2.5px solid white" : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>

          {createError && <p className="text-xs text-red-400">{createError}</p>}

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onSubmit}
              disabled={creating}
              className="flex-1 py-3 rounded-[10px] text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
            >
              {creating ? "Creating…" : "Create Group Med"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 rounded-[10px] text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
