"use client";

// Admin content management — add, edit and delete meditation sessions.
// Sessions are saved to the Supabase "sessions" table.
// The session player page will pull from Supabase once you have real content.

import { useState, useEffect } from "react";
import AdminShell from "../AdminShell";
import { createClient } from "../../../lib/supabase-browser";
import Banner from "../../components/ui/Banner";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import ConfirmModal from "../../components/ui/ConfirmModal";
import GradientPicker, { GRADIENTS } from "../components/GradientPicker";
import FormField, { fieldStyle, fieldClass } from "../components/FormField";

const MOOD_CATEGORIES = [
  "Hungover", "After The Sesh", "On A Comedown", "Feeling Empty",
  "Can't Sleep", "Anxious", "Heartbroken", "Overwhelmed",
  "Low Energy", "Morning Reset", "Focus Mode",
];

const SESSION_TYPES = ["Guided Meditation", "Breathwork", "Sleep Audio", "Focus Session", "Movement"];

type Session = {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: string;
  mood_category: string;
  media_type: "audio" | "video";
  audio_url: string;
  vimeo_id: string;
  is_free: boolean;
  gradient: string;
  created_at: string;
};

const EMPTY_FORM = {
  title: "",
  description: "",
  duration: "10 min",
  type: "Guided Meditation",
  mood_category: "Anxious",
  media_type: "audio" as "audio" | "video",
  audio_url: "",
  vimeo_id: "",
  is_free: false,
  gradient: GRADIENTS[0].value,
};

export default function AdminContentPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [notifyingId, setNotifyingId] = useState<string | null>(null);
  const [notifySuccess, setNotifySuccess] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const supabase = createClient();

  // Load sessions from Supabase on mount
  async function loadSessions() {
    setLoading(true);
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setSessions(data);
    setLoading(false);
  }

  useEffect(() => { loadSessions(); }, []);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEdit(session: Session) {
    setForm({
      title:        session.title,
      description:  session.description,
      duration:     session.duration,
      type:         session.type,
      mood_category: session.mood_category,
      media_type:   session.media_type,
      audio_url:    session.audio_url || "",
      vimeo_id:     session.vimeo_id || "",
      is_free:      session.is_free,
      gradient:     session.gradient,
    });
    setEditingId(session.id);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  // Save a new session or update an existing one
  async function handleSave() {
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError("");

    const payload = {
      title:         form.title.trim(),
      description:   form.description.trim(),
      duration:      form.duration,
      type:          form.type,
      mood_category: form.mood_category,
      media_type:    form.media_type,
      audio_url:     form.audio_url.trim() || null,
      vimeo_id:      form.vimeo_id.trim() || null,
      is_free:       form.is_free,
      gradient:      form.gradient,
    };

    const { error: saveError } = editingId
      ? await supabase.from("sessions").update(payload).eq("id", editingId)
      : await supabase.from("sessions").insert(payload);

    setSaving(false);
    if (saveError) {
      setError("Could not save session. Check your Supabase connection.");
      return;
    }
    setSuccess(editingId ? "Session updated." : "Session added.");
    setShowForm(false);
    setEditingId(null);
    loadSessions();
  }

  // Send a new-session notification email to all users for this session
  async function handleNotify(session: Session) {
    setNotifyingId(session.id);
    setNotifySuccess("");

    // Get the current user's Supabase access token to authorize the API call
    const { data: { session: authSession } } = await supabase.auth.getSession();
    const token = authSession?.access_token;
    if (!token) {
      setNotifyingId(null);
      return;
    }

    const res = await fetch("/api/email/new-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        sessionId:    session.id,
        sessionTitle: session.title,
        moodCategory: session.mood_category,
        sessionType:  session.type,
        duration:     session.duration,
        description:  session.description,
        isFree:       session.is_free,
        sendTo:       "all",
      }),
    });

    const data = await res.json();
    setNotifyingId(null);
    if (res.ok) {
      setNotifySuccess(`Email sent — sent to ${data.sent} users.`);
      setTimeout(() => setNotifySuccess(""), 4000);
    }
  }

  async function handleDelete(id: string) {
    await supabase.from("sessions").delete().eq("id", id);
    setConfirmDeleteId(null);
    loadSessions();
  }

  return (
    <AdminShell>
      <div className="px-6 py-8 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl text-white mb-1" style={{ fontWeight: 500 }}>Sessions</h1>
            <p className="text-sm text-white/40">Add and manage your meditation library</p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white transition-opacity hover:opacity-80 shrink-0"
            style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Add session
          </button>
        </div>

        {/* Notify success banner */}
        {notifySuccess && <Banner type="success" message={notifySuccess} />}

        {/* Success banner */}
        {success && <Banner type="success" message={success} />}

        {/* ── ADD / EDIT FORM ──────────────────────────────────── */}
        {showForm && (
          <div className="rounded-[10px] p-5 mb-6" style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.1)" }}>
            <h2 className="text-white text-base mb-5" style={{ fontWeight: 500 }}>
              {editingId ? "Edit session" : "Add new session"}
            </h2>

            {error && <Banner type="error" message={error} />}

            <div className="grid sm:grid-cols-2 gap-4">

              <FormField label="Title *" className="sm:col-span-2">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Hungover & Overwhelmed"
                  className={fieldClass}
                  style={fieldStyle}
                />
              </FormField>

              <FormField label="Description" className="sm:col-span-2">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="A short description shown under the title..."
                  rows={3}
                  className={`${fieldClass} resize-none`}
                  style={fieldStyle}
                />
              </FormField>

              <FormField label="Mood category">
                <select
                  value={form.mood_category}
                  onChange={(e) => setForm({ ...form, mood_category: e.target.value })}
                  className={fieldClass}
                  style={fieldStyle}
                >
                  {MOOD_CATEGORIES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </FormField>

              <FormField label="Session type">
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className={fieldClass}
                  style={fieldStyle}
                >
                  {SESSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </FormField>

              <FormField label="Duration">
                <select
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className={fieldClass}
                  style={fieldStyle}
                >
                  {["5 min","8 min","10 min","12 min","15 min","18 min","20 min","22 min","25 min","30 min","45 min"].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Media type">
                <select
                  value={form.media_type}
                  onChange={(e) => setForm({ ...form, media_type: e.target.value as "audio" | "video" })}
                  className={fieldClass}
                  style={fieldStyle}
                >
                  <option value="audio">Audio (Supabase Storage)</option>
                  <option value="video">Video (Vimeo)</option>
                </select>
              </FormField>

              {form.media_type === "audio" && (
                <FormField label="Audio URL" className="sm:col-span-2">
                  <input
                    type="text"
                    value={form.audio_url}
                    onChange={(e) => setForm({ ...form, audio_url: e.target.value })}
                    placeholder="https://... (from Supabase Storage)"
                    className={fieldClass}
                    style={fieldStyle}
                  />
                </FormField>
              )}

              {form.media_type === "video" && (
                <FormField label="Vimeo Video ID" className="sm:col-span-2">
                  <input
                    type="text"
                    value={form.vimeo_id}
                    onChange={(e) => setForm({ ...form, vimeo_id: e.target.value })}
                    placeholder="e.g. 123456789 (from Vimeo video URL)"
                    className={fieldClass}
                    style={fieldStyle}
                  />
                </FormField>
              )}

              {/* Gradient colour */}
              <div className="sm:col-span-2">
                <GradientPicker
                  value={form.gradient}
                  onChange={(g) => setForm({ ...form, gradient: g })}
                />
              </div>

              {/* Free toggle */}
              <div className="sm:col-span-2 flex items-center gap-3">
                <button
                  onClick={() => setForm({ ...form, is_free: !form.is_free })}
                  className="w-10 h-6 rounded-full transition-colors relative"
                  style={{ backgroundColor: form.is_free ? "#8B5CF6" : "rgba(255,255,255,0.12)" }}
                  role="switch"
                  aria-checked={form.is_free}
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                    style={{ left: form.is_free ? "calc(100% - 22px)" : "2px" }}
                  />
                </button>
                <span className="text-sm text-white/60">Free session (visible without subscription)</span>
              </div>

            </div>

            {/* Form actions */}
            <div className="flex gap-2 mt-5">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-lg text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
              >
                {saving ? "Saving…" : editingId ? "Update session" : "Add session"}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditingId(null); setError(""); }}
                className="px-4 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── SESSION LIST ─────────────────────────────────────── */}
        {loading ? (
          <LoadingSkeleton height={64} count={4} className="mb-2" />
        ) : sessions.length === 0 ? (
          <EmptyState
            message="No sessions yet"
            action="+ Add your first session"
            onClick={openNew}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-4 p-4 rounded-[10px]"
                style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
              >
                {/* Gradient dot */}
                <div className="w-10 h-10 rounded-full shrink-0" style={{ background: session.gradient }} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm text-white truncate" style={{ fontWeight: 500 }}>{session.title}</p>
                    {session.is_free && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded text-white shrink-0"
                        style={{ backgroundColor: "rgba(16,185,129,0.8)", fontWeight: 500 }}>FREE</span>
                    )}
                  </div>
                  <p className="text-xs text-white/35">{session.type} · {session.mood_category} · {session.duration}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Notify members about this session */}
                  <button
                    onClick={() => handleNotify(session)}
                    disabled={notifyingId === session.id}
                    className="p-2 text-white/30 hover:text-indigo-400 transition-colors disabled:opacity-40"
                    aria-label="Notify members"
                    title="Send new session email to all users"
                  >
                    {notifyingId === session.id ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="animate-spin opacity-60">
                        <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => openEdit(session)}
                    className="p-2 text-white/30 hover:text-white/70 transition-colors"
                    aria-label="Edit"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(session.id)}
                    className="p-2 text-white/30 hover:text-red-400 transition-colors"
                    aria-label="Delete"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete confirmation modal */}
        {confirmDeleteId && (
          <ConfirmModal
            message="Delete this session? This cannot be undone."
            confirmLabel="Delete"
            onConfirm={() => handleDelete(confirmDeleteId)}
            onCancel={() => setConfirmDeleteId(null)}
          />
        )}

      </div>
    </AdminShell>
  );
}
