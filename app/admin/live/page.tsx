"use client";

// Admin live page — only Natalie uses this.
// She can: schedule upcoming sessions, create a Daily.co room and go live,
// and end a live session when she's done.
// Calls the /api/daily/create-room API route to create the Daily.co room.

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminShell from "../AdminShell";
import {
  getLiveSessions,
  createLiveSession,
  setSessionLive,
  endLiveSession,
  deleteLiveSession,
  formatSessionDate,
  type LiveSession,
} from "../../../lib/live-sessions";

const GRADIENTS = [
  { label: "Purple / Blue", value: "linear-gradient(135deg, #6B21E8 0%, #8B3CF7 25%, #6366F1 60%, #3B82F6 80%, #22D3EE 100%)" },
  { label: "Pink / Yellow", value: "linear-gradient(135deg, #F43F5E 0%, #EC4899 20%, #D946EF 35%, #F97316 65%, #EAB308 85%, #FACC15 100%)" },
  { label: "Green / Lime", value: "linear-gradient(135deg, #10B981 0%, #22C55E 35%, #84CC16 70%, #D9F100 100%)" },
  { label: "Pink / Orange", value: "linear-gradient(135deg, #F43F5E 0%, #F97316 100%)" },
];

export default function AdminLivePage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [goingLiveId, setGoingLiveId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // New session form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    type: "audio" as "audio" | "video",
    duration: "30 min",
    gradient: GRADIENTS[0].value,
  });

  // Load sessions on mount
  useEffect(() => {
    setSessions(getLiveSessions());
  }, []);

  function refresh() {
    setSessions(getLiveSessions());
  }

  // Create a new scheduled session (no Daily room yet — that happens when going live)
  function handleCreate() {
    if (!form.title || !form.scheduledAt) {
      setError("Title and date are required.");
      return;
    }
    setError("");
    createLiveSession(
      form.title,
      form.description,
      form.scheduledAt,
      form.type,
      form.duration,
      form.gradient
    );
    setForm({ title: "", description: "", scheduledAt: "", type: "audio", duration: "30 min", gradient: GRADIENTS[0].value });
    setShowForm(false);
    refresh();
  }

  // Go live — creates a Daily.co room via the API then marks the session as live
  async function handleGoLive(sessionId: string, title: string) {
    setGoingLiveId(sessionId);
    setError("");
    try {
      const res = await fetch("/api/daily/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();

      if (!res.ok) {
        // data.error may be an object from the Daily.co API — convert to string
        const msg = typeof data.error === "string"
          ? data.error
          : JSON.stringify(data.error) ?? "Failed to create Daily.co room.";
        setError(msg);
        setGoingLiveId(null);
        return;
      }

      // Mark the session as live in localStorage
      setSessionLive(sessionId, data.name, data.url);
      refresh();
    } catch {
      setError("Network error — could not reach the Daily.co API.");
    } finally {
      setGoingLiveId(null);
    }
  }

  // End live — marks session as no longer live
  function handleEnd(sessionId: string) {
    endLiveSession(sessionId);
    refresh();
  }

  function handleDelete(sessionId: string) {
    deleteLiveSession(sessionId);
    refresh();
  }

  const liveSessions = sessions.filter((s) => s.isLive);
  const upcomingSessions = sessions.filter((s) => !s.isLive);

  return (
    <AdminShell>
      <div className="px-6 py-8 max-w-2xl mx-auto">

        {/* Page title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl text-white mb-1" style={{ fontWeight: 500 }}>Live Sessions</h1>
            <p className="text-sm text-white/40">Schedule and manage your live sessions</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Schedule
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-[10px] mb-5"
            style={{ backgroundColor: "rgba(244,63,94,0.1)", border: "0.5px solid rgba(244,63,94,0.3)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#F43F5E" className="shrink-0 mt-0.5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Daily.co config warning if keys not set */}
        {!process.env.NEXT_PUBLIC_DAILY_DOMAIN && (
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-[10px] mb-6"
            style={{ backgroundColor: "rgba(234,179,8,0.08)", border: "0.5px solid rgba(234,179,8,0.25)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#EAB308" className="shrink-0 mt-0.5">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <div>
              <p className="text-sm text-yellow-300 mb-1" style={{ fontWeight: 500 }}>Daily.co not configured</p>
              <p className="text-xs text-yellow-400/60 leading-relaxed">
                Add <code className="bg-white/[0.06] px-1 rounded">DAILY_API_KEY</code> and{" "}
                <code className="bg-white/[0.06] px-1 rounded">NEXT_PUBLIC_DAILY_DOMAIN</code> to{" "}
                <code className="bg-white/[0.06] px-1 rounded">.env.local</code> to enable going live.
                You can still schedule sessions now.
              </p>
            </div>
          </div>
        )}

        {/* ── NEW SESSION FORM ──────────────────────────────────── */}
        {showForm && (
          <div
            className="p-5 rounded-[10px] mb-6"
            style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.1)" }}
          >
            <h2 className="text-white text-base mb-5" style={{ fontWeight: 500 }}>Schedule a new session</h2>

            <div className="flex flex-col gap-4">
              {/* Title */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Sunday Morning Reset"
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none placeholder:text-white/20"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)" }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this session about?"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none placeholder:text-white/20 resize-none"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)" }}
                />
              </div>

              {/* Date + Time */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Date & Time</label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)", colorScheme: "dark" }}
                />
              </div>

              {/* Type + Duration row */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-white/40 mb-1.5">Format</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as "audio" | "video" })}
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)" }}
                  >
                    <option value="audio">Audio only</option>
                    <option value="video">Audio + Video</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-white/40 mb-1.5">Duration</label>
                  <select
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)" }}
                  >
                    {["15 min", "20 min", "30 min", "45 min", "60 min"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gradient picker */}
              <div>
                <label className="block text-xs text-white/40 mb-2">Colour</label>
                <div className="flex gap-2">
                  {GRADIENTS.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => setForm({ ...form, gradient: g.value })}
                      className="w-10 h-10 rounded-full transition-transform hover:scale-110"
                      style={{
                        background: g.value,
                        outline: form.gradient === g.value ? "2.5px solid white" : "none",
                        outlineOffset: "2px",
                      }}
                      aria-label={g.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Form actions */}
            <div className="flex gap-2 mt-5">
              <button
                onClick={handleCreate}
                className="flex-1 py-2.5 rounded-lg text-sm text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
              >
                Schedule Session
              </button>
              <button
                onClick={() => { setShowForm(false); setError(""); }}
                className="px-4 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── CURRENTLY LIVE ────────────────────────────────────── */}
        {liveSessions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs text-white/40 mb-3" style={{ fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Live now
            </h2>
            <div className="flex flex-col gap-3">
              {liveSessions.map((session) => (
                <AdminSessionCard
                  key={session.id}
                  session={session}
                  isLive
                  onEnd={() => handleEnd(session.id)}
                  onDelete={() => handleDelete(session.id)}
                  onGoLive={() => {}}
                  goingLive={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── UPCOMING ──────────────────────────────────────────── */}
        <div>
          <h2 className="text-xs text-white/40 mb-3" style={{ fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Scheduled
          </h2>

          {upcomingSessions.length === 0 && !showForm ? (
            <div
              className="flex flex-col items-center justify-center py-12 rounded-[10px] text-center"
              style={{ border: "0.5px dashed rgba(255,255,255,0.08)" }}
            >
              <p className="text-sm text-white/25 mb-1">No sessions scheduled</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-xs text-white/40 hover:text-white/70 transition-colors mt-2"
              >
                + Schedule one
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingSessions.map((session) => (
                <AdminSessionCard
                  key={session.id}
                  session={session}
                  isLive={false}
                  onGoLive={() => handleGoLive(session.id, session.title)}
                  onEnd={() => {}}
                  onDelete={() => handleDelete(session.id)}
                  goingLive={goingLiveId === session.id}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </AdminShell>
  );
}

// ── ADMIN SESSION CARD ────────────────────────────────────────────────────────

type AdminCardProps = {
  session: LiveSession;
  isLive: boolean;
  goingLive: boolean;
  onGoLive: () => void;
  onEnd: () => void;
  onDelete: () => void;
};

function AdminSessionCard({ session, isLive, goingLive, onGoLive, onEnd, onDelete }: AdminCardProps) {
  return (
    <div
      className="p-4 rounded-[10px]"
      style={{
        backgroundColor: "#1A1A2E",
        border: isLive
          ? "0.5px solid rgba(244,63,94,0.4)"
          : "0.5px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-start gap-3">
        {/* Gradient dot */}
        <div
          className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center mt-0.5"
          style={{ background: session.gradient }}
        >
          {session.type === "video" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" opacity={0.9}>
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" opacity={0.9}>
              <path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm text-white truncate" style={{ fontWeight: 500 }}>{session.title}</p>
            {isLive && (
              <span className="text-[10px] px-1.5 py-0.5 rounded text-white shrink-0" style={{ backgroundColor: "#F43F5E", fontWeight: 500 }}>
                LIVE
              </span>
            )}
          </div>
          <p className="text-xs text-white/35 mb-1">{session.type === "video" ? "Video" : "Audio"} · {session.duration}</p>
          {!isLive && (
            <p className="text-xs text-white/25">{formatSessionDate(session.scheduledAt)}</p>
          )}
          {isLive && session.dailyRoomUrl && (
            <Link
              href={`/live/${session.dailyRoomName}`}
              target="_blank"
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Join as host →
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {isLive ? (
            <button
              onClick={onEnd}
              className="px-3 py-1.5 rounded-lg text-xs text-white transition-opacity hover:opacity-80"
              style={{ backgroundColor: "rgba(244,63,94,0.8)", fontWeight: 500 }}
            >
              End
            </button>
          ) : (
            <button
              onClick={onGoLive}
              disabled={goingLive}
              className="px-3 py-1.5 rounded-lg text-xs text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #F43F5E, #F97316)", fontWeight: 500 }}
            >
              {goingLive ? "Starting…" : "Go Live"}
            </button>
          )}
          <button
            onClick={onDelete}
            className="text-white/20 hover:text-red-400 transition-colors p-1.5"
            aria-label="Delete session"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
