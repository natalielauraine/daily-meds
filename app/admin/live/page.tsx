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
import Banner from "../../components/ui/Banner";
import EmptyState from "../../components/ui/EmptyState";
import GradientPicker, { GRADIENTS } from "../components/GradientPicker";
import FormField, { fieldStyle, fieldClass } from "../components/FormField";

export default function AdminLivePage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [goingLiveId, setGoingLiveId] = useState<string | null>(null);
  const [notifying, setNotifying] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState("");
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
    getLiveSessions().then(setSessions);
  }, []);

  async function refresh() {
    const updated = await getLiveSessions();
    setSessions(updated);
  }

  // Create a new scheduled session (no Daily room yet — that happens when going live)
  async function handleCreate() {
    if (!form.title || !form.scheduledAt) {
      setError("Title and date are required.");
      return;
    }
    setError("");
    await createLiveSession(
      form.title,
      form.description,
      form.scheduledAt,
      form.type,
      form.duration,
      form.gradient
    );
    setForm({ title: "", description: "", scheduledAt: "", type: "audio", duration: "30 min", gradient: GRADIENTS[0].value });
    setShowForm(false);
    await refresh();
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

      // Mark the session as live in Supabase
      await setSessionLive(sessionId, data.name, data.url);
      await refresh();
    } catch {
      setError("Network error — could not reach the Daily.co API.");
    } finally {
      setGoingLiveId(null);
    }
  }

  // Notify members — sends the "Going Live" email blast to all Premium members
  async function handleNotify(liveUrl: string) {
    setNotifying(true);
    setError("");
    setNotifySuccess("");
    try {
      const res = await fetch("/api/admin/send-going-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liveUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to send notifications.");
      } else {
        setNotifySuccess(`Notified ${data.sent} member${data.sent === 1 ? "" : "s"}.`);
        setTimeout(() => setNotifySuccess(""), 4000);
      }
    } catch {
      setError("Network error — could not send notifications.");
    } finally {
      setNotifying(false);
    }
  }

  // End live — marks session as no longer live
  async function handleEnd(sessionId: string) {
    await endLiveSession(sessionId);
    await refresh();
  }

  async function handleDelete(sessionId: string) {
    await deleteLiveSession(sessionId);
    await refresh();
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
            style={{ backgroundColor: "#ff41b3", fontWeight: 500 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Schedule
          </button>
        </div>

        {/* Banners */}
        {error && <Banner type="error" message={error} />}
        {notifySuccess && <Banner type="success" message={notifySuccess} />}

        {/* Daily.co config warning if keys not set */}
        {!process.env.NEXT_PUBLIC_DAILY_DOMAIN && (
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-[10px] mb-6"
            style={{ backgroundColor: "rgba(234,179,8,0.08)", border: "0.5px solid rgba(234,179,8,0.25)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#f4e71d" className="shrink-0 mt-0.5">
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
            style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.1)" }}
          >
            <h2 className="text-white text-base mb-5" style={{ fontWeight: 500 }}>Schedule a new session</h2>

            <div className="flex flex-col gap-4">
              <FormField label="Title">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Sunday Morning Reset"
                  className={fieldClass}
                  style={fieldStyle}
                />
              </FormField>

              <FormField label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this session about?"
                  rows={3}
                  className={`${fieldClass} resize-none`}
                  style={fieldStyle}
                />
              </FormField>

              <FormField label="Date & Time">
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  className={fieldClass}
                  style={{ ...fieldStyle, colorScheme: "dark" } as React.CSSProperties}
                />
              </FormField>

              {/* Type + Duration row */}
              <div className="flex gap-3">
                <FormField label="Format" className="flex-1">
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as "audio" | "video" })}
                    className={fieldClass}
                    style={fieldStyle}
                  >
                    <option value="audio">Audio only</option>
                    <option value="video">Audio + Video</option>
                  </select>
                </FormField>
                <FormField label="Duration" className="flex-1">
                  <select
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className={fieldClass}
                    style={fieldStyle}
                  >
                    {["15 min", "20 min", "30 min", "45 min", "60 min"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              <GradientPicker
                value={form.gradient}
                onChange={(g) => setForm({ ...form, gradient: g })}
              />
            </div>

            {/* Form actions */}
            <div className="flex gap-2 mt-5">
              <button
                onClick={handleCreate}
                className="flex-1 py-2.5 rounded-lg text-sm text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#ff41b3", fontWeight: 500 }}
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
                  onNotify={() => handleNotify(session.dailyRoomUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/live`)}
                  goingLive={false}
                  notifying={notifying}
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
            <EmptyState
              message="No sessions scheduled"
              action="+ Schedule one"
              onClick={() => setShowForm(true)}
            />
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
                  onNotify={() => {}}
                  goingLive={goingLiveId === session.id}
                  notifying={false}
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

import React from "react";

type AdminCardProps = {
  session: LiveSession;
  isLive: boolean;
  goingLive: boolean;
  notifying: boolean;
  onGoLive: () => void;
  onEnd: () => void;
  onDelete: () => void;
  onNotify: () => void;
};

function AdminSessionCard({ session, isLive, goingLive, notifying, onGoLive, onEnd, onDelete, onNotify }: AdminCardProps) {
  return (
    <div
      className="p-4 rounded-[10px]"
      style={{
        backgroundColor: "#1F1F1F",
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
              <span className="text-[10px] px-1.5 py-0.5 rounded text-white shrink-0" style={{ backgroundColor: "#ff41b3", fontWeight: 500 }}>
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
              className="text-xs text-pink-400 hover:text-pink-300 transition-colors"
            >
              Join as host →
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {isLive ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onNotify}
                disabled={notifying}
                title="Send 'Going Live' email to all Premium members"
                className="px-3 py-1.5 rounded-lg text-xs text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ background: "linear-gradient(90deg, #ff41b3, #ec723d)", fontWeight: 500 }}
              >
                {notifying ? "Sending…" : "Notify Members"}
              </button>
              <button
                onClick={onEnd}
                className="px-3 py-1.5 rounded-lg text-xs text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: "rgba(244,63,94,0.8)", fontWeight: 500 }}
              >
                End
              </button>
            </div>
          ) : (
            <button
              onClick={onGoLive}
              disabled={goingLive}
              className="px-3 py-1.5 rounded-lg text-xs text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #ec723d, #f4e71d)", fontWeight: 500 }}
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
