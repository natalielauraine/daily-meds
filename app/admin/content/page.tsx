"use client";

// Admin content management — add, edit and delete meditation sessions.
// Features: drag-drop audio upload, Vimeo/YouTube embed preview,
//           bulk upload, session preview modal, draft/published status.

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
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

const MOOD_GRADIENTS: Record<string, string> = {
  "Hungover":       "linear-gradient(135deg, #ff41b3, #ec723d)",
  "After The Sesh": "linear-gradient(135deg, #ff41b3, #f4e71d)",
  "On A Comedown":  "linear-gradient(135deg, #adf225, #f4e71d)",
  "Feeling Empty":  "linear-gradient(135deg, #ff41b3, #ec723d)",
  "Can't Sleep":    "linear-gradient(135deg, #ff41b3, #adf225)",
  "Anxious":        "linear-gradient(135deg, #ec723d, #f4e71d)",
  "Heartbroken":    "linear-gradient(135deg, #ff41b3, #ec723d)",
  "Overwhelmed":    "linear-gradient(135deg, #ec723d, #f4e71d)",
  "Low Energy":     "linear-gradient(135deg, #adf225, #f4e71d)",
  "Morning Reset":  "linear-gradient(135deg, #ff41b3, #f4e71d)",
  "Focus Mode":     "linear-gradient(135deg, #adf225, #ec723d)",
};

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
  youtube_url: string;
  is_free: boolean;
  gradient: string;
  status: "draft" | "published";
  created_at: string;
};

// One file in the bulk upload queue
type BulkFile = {
  id: string;
  file: File;
  title: string;
  mood_category: string;
  is_free: boolean;
  duration: string;
  status: "queued" | "uploading" | "done" | "error";
  progress: number;
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
  youtube_url: "",
  is_free: false,
  gradient: GRADIENTS[0].value,
  status: "draft" as "draft" | "published",
};

// Extract a YouTube video ID from a full URL or bare ID
function extractYouTubeId(input: string): string {
  const s = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  const watchMatch = s.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = s.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const embedMatch = s.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  return s;
}

// Format a byte count into a readable string like "3.2 MB"
function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Turn a raw filename into a nicely capitalised title
function filenameToTitle(name: string): string {
  return name
    .replace(/\.(mp3|m4a)$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Detect the duration of an audio file using the Web Audio API
async function detectAudioDuration(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    const buffer = await ctx.decodeAudioData(arrayBuffer);
    const mins = Math.max(1, Math.round(buffer.duration / 60));
    ctx.close();
    return `${mins} min`;
  } catch {
    return "10 min";
  }
}

export default function AdminContentPage() {
  const supabase = createClient();

  // ── Sessions list ──────────────────────────────────
  const [sessions, setSessions]         = useState<Session[]>([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");

  // ── Single-session form ────────────────────────────
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  // ── Audio file upload ──────────────────────────────
  const [audioUploading, setAudioUploading]       = useState(false);
  const [audioProgress, setAudioProgress]         = useState(0);
  const [uploadedFile, setUploadedFile]           = useState<{ name: string; size: number } | null>(null);
  const [audioDragOver, setAudioDragOver]         = useState(false);
  const audioInputRef                             = useRef<HTMLInputElement>(null);

  // ── Bulk upload ────────────────────────────────────
  const [bulkFiles, setBulkFiles]               = useState<BulkFile[]>([]);
  const [bulkUploading, setBulkUploading]       = useState(false);
  const [bulkDragOver, setBulkDragOver]         = useState(false);
  const [bulkOverallProgress, setBulkOverallProgress] = useState(0);
  const bulkInputRef                            = useRef<HTMLInputElement>(null);

  // ── Preview modal ──────────────────────────────────
  const [previewSession, setPreviewSession] = useState<Session | null>(null);

  // ── Notifications + delete ─────────────────────────
  const [notifyingId, setNotifyingId]   = useState<string | null>(null);
  const [notifySuccess, setNotifySuccess] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Load all sessions from Supabase
  async function loadSessions() {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("sessions")
      .select("*")
      .order("created_at", { ascending: false });
    if (!err && data) setSessions(data as Session[]);
    setLoading(false);
  }

  useEffect(() => { loadSessions(); }, []);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
    setSuccess("");
    setUploadedFile(null);
    setAudioProgress(0);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openEdit(session: Session) {
    setForm({
      title:         session.title,
      description:   session.description,
      duration:      session.duration,
      type:          session.type,
      mood_category: session.mood_category,
      media_type:    session.media_type,
      audio_url:     session.audio_url || "",
      vimeo_id:      session.vimeo_id || "",
      youtube_url:   session.youtube_url || "",
      is_free:       session.is_free,
      gradient:      session.gradient || GRADIENTS[0].value,
      status:        session.status || "draft",
    });
    setEditingId(session.id);
    setError("");
    setSuccess("");
    setUploadedFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Upload a single audio file to the Supabase audio-files bucket
  async function uploadAudioFile(file: File) {
    setAudioUploading(true);
    setAudioProgress(0);
    setError("");

    const filePath = `audio/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    // Animate progress while upload runs (Supabase client doesn't expose real progress)
    const interval = setInterval(() => {
      setAudioProgress((prev) => Math.min(prev + 8, 85));
    }, 200);

    const { error: uploadErr } = await supabase.storage
      .from("audio-files")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    clearInterval(interval);

    if (uploadErr) {
      setAudioUploading(false);
      setAudioProgress(0);
      setError("Upload failed: " + uploadErr.message);
      return;
    }

    setAudioProgress(100);

    // Get the public URL and store it in the form
    const { data: urlData } = supabase.storage.from("audio-files").getPublicUrl(filePath);
    setForm((prev) => ({ ...prev, audio_url: urlData.publicUrl }));
    setUploadedFile({ name: file.name, size: file.size });
    setAudioUploading(false);
  }

  // Validate and kick off audio upload
  async function handleAudioFile(file: File) {
    if (!file.name.match(/\.(mp3|m4a)$/i)) {
      setError("Only mp3 and m4a files are accepted.");
      return;
    }
    await uploadAudioFile(file);
  }

  // Add files to the bulk queue and auto-detect their durations
  async function addBulkFiles(files: File[]) {
    const audioOnly = files.filter((f) => f.name.match(/\.(mp3|m4a)$/i)).slice(0, 20);
    const newItems: BulkFile[] = await Promise.all(
      audioOnly.map(async (file) => ({
        id:            `${Date.now()}-${Math.random()}`,
        file,
        title:         filenameToTitle(file.name),
        mood_category: "Anxious",
        is_free:       false,
        duration:      await detectAudioDuration(file),
        status:        "queued" as const,
        progress:      0,
      }))
    );
    setBulkFiles((prev) => [...prev, ...newItems].slice(0, 20));
  }

  // Upload every queued file and create a session for each one
  async function handleBulkPublishAll() {
    const queued = bulkFiles.filter((f) => f.status === "queued");
    if (!queued.length) return;
    setBulkUploading(true);
    setBulkOverallProgress(0);

    for (let i = 0; i < queued.length; i++) {
      const item = queued[i];

      setBulkFiles((prev) => prev.map((f) =>
        f.id === item.id ? { ...f, status: "uploading" } : f
      ));

      const filePath = `audio/${Date.now()}-${item.file.name.replace(/\s+/g, "-")}`;

      const interval = setInterval(() => {
        setBulkFiles((prev) => prev.map((f) =>
          f.id === item.id ? { ...f, progress: Math.min(f.progress + 15, 85) } : f
        ));
      }, 200);

      const { error: uploadErr } = await supabase.storage
        .from("audio-files")
        .upload(filePath, item.file, { cacheControl: "3600", upsert: false });

      clearInterval(interval);

      if (uploadErr) {
        setBulkFiles((prev) => prev.map((f) =>
          f.id === item.id ? { ...f, status: "error", progress: 0 } : f
        ));
        continue;
      }

      setBulkFiles((prev) => prev.map((f) =>
        f.id === item.id ? { ...f, progress: 100 } : f
      ));

      const { data: urlData } = supabase.storage.from("audio-files").getPublicUrl(filePath);

      await supabase.from("sessions").insert({
        title:         item.title,
        description:   "",
        duration:      item.duration,
        type:          "Guided Meditation",
        mood_category: item.mood_category,
        media_type:    "audio",
        audio_url:     urlData.publicUrl,
        is_free:       item.is_free,
        gradient:      MOOD_GRADIENTS[item.mood_category] || GRADIENTS[0].value,
        status:        "published",
      });

      setBulkFiles((prev) => prev.map((f) =>
        f.id === item.id ? { ...f, status: "done" } : f
      ));
      setBulkOverallProgress(Math.round(((i + 1) / queued.length) * 100));
    }

    setBulkUploading(false);
    loadSessions();
  }

  // Save a single session (new or edited)
  async function handleSave() {
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError("");

    const youtubeId = form.youtube_url ? extractYouTubeId(form.youtube_url) : "";

    const payload = {
      title:         form.title.trim(),
      description:   form.description.trim(),
      duration:      form.duration,
      type:          form.type,
      mood_category: form.mood_category,
      media_type:    form.media_type,
      audio_url:     form.audio_url.trim() || null,
      vimeo_id:      form.vimeo_id.trim() || null,
      youtube_url:   youtubeId || null,
      is_free:       form.is_free,
      gradient:      form.gradient,
      status:        form.status,
    };

    const { error: saveErr } = editingId
      ? await supabase.from("sessions").update(payload).eq("id", editingId)
      : await supabase.from("sessions").insert(payload);

    setSaving(false);
    if (saveErr) { setError("Could not save: " + saveErr.message); return; }

    setSuccess(editingId ? "Session updated." : "Session saved.");
    setShowForm(false);
    setEditingId(null);
    setUploadedFile(null);
    loadSessions();
  }

  // Publish a draft directly from the session list
  async function handlePublish(id: string) {
    await supabase.from("sessions").update({ status: "published" }).eq("id", id);
    setSessions((prev) => prev.map((s) => s.id === id ? { ...s, status: "published" } : s));
  }

  async function handleNotify(session: Session) {
    setNotifyingId(session.id);
    setNotifySuccess("");
    const { data: { session: authSession } } = await supabase.auth.getSession();
    const token = authSession?.access_token;
    if (!token) { setNotifyingId(null); return; }

    const res = await fetch("/api/email/new-session", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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
      setNotifySuccess(`Email sent to ${data.sent} users.`);
      setTimeout(() => setNotifySuccess(""), 4000);
    }
  }

  async function handleDelete(id: string) {
    await supabase.from("sessions").delete().eq("id", id);
    setConfirmDeleteId(null);
    loadSessions();
  }

  const filteredSessions = sessions.filter((s) => {
    if (statusFilter === "all") return true;
    return (s.status || "draft") === statusFilter;
  });

  const draftCount     = sessions.filter((s) => (s.status || "draft") === "draft").length;
  const publishedCount = sessions.filter((s) => s.status === "published").length;

  return (
    <AdminShell>
      <div className="px-6 py-8 max-w-4xl mx-auto">

        {/* ── HEADER ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl text-white mb-1" style={{ fontWeight: 500 }}>Sessions</h1>
            <p className="text-sm text-white/40">Add and manage your meditation library</p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white transition-opacity hover:opacity-80 shrink-0"
            style={{ backgroundColor: "#ff41b3", fontWeight: 500 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Add session
          </button>
        </div>

        {notifySuccess && <Banner type="success" message={notifySuccess} />}
        {success       && <Banner type="success" message={success} />}

        {/* ── SINGLE SESSION FORM ── */}
        {showForm && (
          <div
            className="rounded-[10px] p-5 mb-6"
            style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.1)" }}
          >
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
                  className={fieldClass} style={fieldStyle}
                >
                  {MOOD_CATEGORIES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </FormField>

              <FormField label="Session type">
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className={fieldClass} style={fieldStyle}
                >
                  {SESSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </FormField>

              <FormField label="Duration">
                <select
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className={fieldClass} style={fieldStyle}
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
                  className={fieldClass} style={fieldStyle}
                >
                  <option value="audio">Audio (Supabase Storage)</option>
                  <option value="video">Video (Vimeo / YouTube)</option>
                </select>
              </FormField>

              {/* ── AUDIO UPLOAD ── */}
              {form.media_type === "audio" && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-white/40 mb-2">Audio file <span className="text-white/20">(mp3 or m4a)</span></p>

                  {uploadedFile ? (
                    // Uploaded file row
                    <div
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ backgroundColor: "rgba(255,65,179,0.08)", border: "0.5px solid rgba(255,65,179,0.25)" }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff41b3">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate" style={{ fontWeight: 500 }}>{uploadedFile.name}</p>
                        <p className="text-[10px] text-white/35">{formatBytes(uploadedFile.size)} · Uploaded ✓</p>
                      </div>
                      <button
                        onClick={() => { setUploadedFile(null); setForm((prev) => ({ ...prev, audio_url: "" })); }}
                        className="text-white/25 hover:text-white/60 transition-colors"
                        aria-label="Remove file"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                      </button>
                    </div>

                  ) : audioUploading ? (
                    // Progress bar
                    <div
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)" }}
                    >
                      <p className="text-xs text-white/40 mb-2">Uploading…</p>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${audioProgress}%`, backgroundColor: "#ff41b3" }}
                        />
                      </div>
                      <p className="text-[10px] text-white/25 mt-1">{audioProgress}%</p>
                    </div>

                  ) : (
                    // Drag & drop zone
                    <div
                      onDragOver={(e) => { e.preventDefault(); setAudioDragOver(true); }}
                      onDragLeave={() => setAudioDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setAudioDragOver(false);
                        const file = e.dataTransfer.files[0];
                        if (file) handleAudioFile(file);
                      }}
                      onClick={() => audioInputRef.current?.click()}
                      className="flex flex-col items-center gap-2 py-8 rounded-lg cursor-pointer transition-colors"
                      style={{
                        border: `1px dashed ${audioDragOver ? "rgba(255,65,179,0.6)" : "rgba(255,255,255,0.12)"}`,
                        backgroundColor: audioDragOver ? "rgba(255,65,179,0.06)" : "rgba(255,255,255,0.02)",
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)">
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                      </svg>
                      <p className="text-xs text-white/35">
                        Drop an mp3 or m4a here, or{" "}
                        <span style={{ color: "#ff41b3" }}>browse files</span>
                      </p>
                      <input
                        ref={audioInputRef}
                        type="file"
                        accept=".mp3,.m4a"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAudioFile(f); }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ── VIMEO + YOUTUBE ── */}
              {form.media_type === "video" && (
                <>
                  <FormField label="Vimeo ID">
                    <input
                      type="text"
                      value={form.vimeo_id}
                      onChange={(e) => setForm({ ...form, vimeo_id: e.target.value })}
                      placeholder="e.g. 123456789"
                      className={fieldClass} style={fieldStyle}
                    />
                  </FormField>

                  <FormField label="YouTube URL or ID">
                    <input
                      type="text"
                      value={form.youtube_url}
                      onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
                      placeholder="youtube.com/watch?v=... or just the ID"
                      className={fieldClass} style={fieldStyle}
                    />
                  </FormField>

                  {/* Video previews — shown once an ID is entered */}
                  {(form.vimeo_id || form.youtube_url) && (
                    <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4">
                      {form.vimeo_id && (
                        <div>
                          <p className="text-[10px] text-white/30 mb-2 uppercase tracking-widest">Vimeo preview</p>
                          <div className="rounded-lg overflow-hidden aspect-video" style={{ backgroundColor: "#000" }}>
                            <iframe
                              src={`https://player.vimeo.com/video/${form.vimeo_id}?badge=0&autopause=0`}
                              allow="autoplay; fullscreen; picture-in-picture"
                              className="w-full h-full"
                              style={{ border: 0 }}
                            />
                          </div>
                        </div>
                      )}
                      {form.youtube_url && (() => {
                        const ytId = extractYouTubeId(form.youtube_url);
                        if (!ytId || ytId.length < 6) return null;
                        return (
                          <div>
                            <p className="text-[10px] text-white/30 mb-2 uppercase tracking-widest">YouTube preview</p>
                            <Image
                              src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                              alt="YouTube thumbnail"
                              width={320}
                              height={180}
                              className="w-full rounded-lg"
                            />
                            <p className="text-[10px] text-white/25 mt-1">ID: {ytId}</p>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </>
              )}

              {/* Gradient picker */}
              <div className="sm:col-span-2">
                <GradientPicker value={form.gradient} onChange={(g) => setForm({ ...form, gradient: g })} />
              </div>

              {/* Free toggle + status toggle */}
              <div className="sm:col-span-2 flex items-center flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setForm({ ...form, is_free: !form.is_free })}
                    className="w-10 h-6 rounded-full transition-colors relative"
                    style={{ backgroundColor: form.is_free ? "#ff41b3" : "rgba(255,255,255,0.12)" }}
                    role="switch"
                    aria-checked={form.is_free}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                      style={{ left: form.is_free ? "calc(100% - 22px)" : "2px" }}
                    />
                  </button>
                  <span className="text-sm text-white/55">Free session</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/35">Status</span>
                  <button
                    onClick={() => setForm({ ...form, status: form.status === "draft" ? "published" : "draft" })}
                    className="px-3 py-1 rounded-full text-xs transition-colors"
                    style={{
                      backgroundColor: form.status === "published" ? "rgba(173,242,37,0.12)" : "rgba(251,191,36,0.1)",
                      border: `0.5px solid ${form.status === "published" ? "rgba(173,242,37,0.35)" : "rgba(251,191,36,0.3)"}`,
                      color: form.status === "published" ? "#adf225" : "#FBB924",
                      fontWeight: 500,
                    }}
                  >
                    {form.status === "published" ? "Published" : "Draft"}
                  </button>
                </div>
              </div>

            </div>

            {/* Form actions */}
            <div className="flex gap-2 mt-5">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-lg text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: "#ff41b3", fontWeight: 500 }}
              >
                {saving
                  ? "Saving…"
                  : editingId
                  ? "Update session"
                  : form.status === "published" ? "Publish session" : "Save as draft"}
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

        {/* ── BULK UPLOAD ── */}
        <div
          className="rounded-[10px] p-5 mb-6"
          style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-white text-base mb-1" style={{ fontWeight: 500 }}>Bulk Upload</h2>
          <p className="text-xs text-white/35 mb-4">
            Drop up to 20 mp3 or m4a files at once — titles and durations are auto-detected from each file
          </p>

          {/* Bulk drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setBulkDragOver(true); }}
            onDragLeave={() => setBulkDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setBulkDragOver(false);
              addBulkFiles(Array.from(e.dataTransfer.files));
            }}
            onClick={() => bulkInputRef.current?.click()}
            className="flex flex-col items-center gap-2 py-8 rounded-lg cursor-pointer transition-colors mb-4"
            style={{
              border: `1px dashed ${bulkDragOver ? "rgba(255,65,179,0.55)" : "rgba(255,255,255,0.1)"}`,
              backgroundColor: bulkDragOver ? "rgba(255,65,179,0.05)" : "rgba(255,255,255,0.015)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)">
              <path d="M20 6h-2.18c.07-.44.18-.86.18-1 0-2.21-1.79-4-4-4s-4 1.79-4 4c0 .14.11.56.18 1H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-1 11v3h-2v-3H8l4-4 4 4h-3z"/>
            </svg>
            <p className="text-sm text-white/30">
              Drop multiple files here, or{" "}
              <span style={{ color: "#ff41b3" }}>browse</span>
            </p>
            <p className="text-xs text-white/20">mp3 · m4a · up to 20 files at once</p>
            <input
              ref={bulkInputRef}
              type="file"
              accept=".mp3,.m4a"
              multiple
              className="hidden"
              onChange={(e) => { if (e.target.files) addBulkFiles(Array.from(e.target.files)); }}
            />
          </div>

          {/* Queued files table */}
          {bulkFiles.length > 0 && (
            <>
              <div className="flex flex-col gap-2 mb-4">
                {bulkFiles.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg p-3"
                    style={{ backgroundColor: "rgba(255,255,255,0.025)", border: "0.5px solid rgba(255,255,255,0.07)" }}
                  >
                    <div className="grid items-center gap-2" style={{ gridTemplateColumns: "1fr auto auto auto auto" }}>

                      {/* Editable title */}
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => setBulkFiles((prev) => prev.map((f) =>
                          f.id === item.id ? { ...f, title: e.target.value } : f
                        ))}
                        className="text-xs text-white bg-transparent border-b outline-none py-0.5 truncate"
                        style={{ borderColor: "rgba(255,255,255,0.12)", fontWeight: 500 }}
                        disabled={item.status !== "queued"}
                      />

                      {/* Mood dropdown */}
                      <select
                        value={item.mood_category}
                        onChange={(e) => setBulkFiles((prev) => prev.map((f) =>
                          f.id === item.id ? { ...f, mood_category: e.target.value } : f
                        ))}
                        className="text-[11px] bg-transparent text-white/45 outline-none"
                        disabled={item.status !== "queued"}
                      >
                        {MOOD_CATEGORIES.map((m) => (
                          <option key={m} value={m} style={{ backgroundColor: "#1F1F1F" }}>{m}</option>
                        ))}
                      </select>

                      {/* Auto-detected duration */}
                      <span className="text-[11px] text-white/30 shrink-0">{item.duration}</span>

                      {/* Free / Paid toggle */}
                      <button
                        onClick={() => setBulkFiles((prev) => prev.map((f) =>
                          f.id === item.id ? { ...f, is_free: !f.is_free } : f
                        ))}
                        className="text-[10px] px-2 py-0.5 rounded-full transition-colors shrink-0"
                        style={{
                          backgroundColor: item.is_free ? "rgba(255,65,179,0.15)" : "rgba(255,255,255,0.06)",
                          border: `0.5px solid ${item.is_free ? "rgba(255,65,179,0.3)" : "rgba(255,255,255,0.1)"}`,
                          color: item.is_free ? "#ff41b3" : "rgba(255,255,255,0.3)",
                        }}
                        disabled={item.status !== "queued"}
                      >
                        {item.is_free ? "Free" : "Paid"}
                      </button>

                      {/* Status icon */}
                      {item.status === "queued" && (
                        <button
                          onClick={() => setBulkFiles((prev) => prev.filter((f) => f.id !== item.id))}
                          className="text-white/20 hover:text-white/50 transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                          </svg>
                        </button>
                      )}
                      {item.status === "uploading" && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff41b3" className="animate-spin shrink-0">
                          <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/>
                        </svg>
                      )}
                      {item.status === "done" && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#adf225" className="shrink-0">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                      )}
                      {item.status === "error" && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff41b3" className="shrink-0">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                      )}
                    </div>

                    {/* Per-file progress bar */}
                    {item.status === "uploading" && (
                      <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${item.progress}%`, backgroundColor: "#ff41b3" }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Overall progress bar */}
              {bulkUploading && (
                <div className="mb-4">
                  <div className="flex justify-between text-[11px] text-white/30 mb-1">
                    <span>Overall progress</span>
                    <span>{bulkOverallProgress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${bulkOverallProgress}%`, background: "linear-gradient(90deg, #ff41b3, #adf225)" }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleBulkPublishAll}
                  disabled={bulkUploading || bulkFiles.every((f) => f.status !== "queued")}
                  className="flex-1 py-2.5 rounded-lg text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                  style={{ backgroundColor: "#ff41b3", fontWeight: 500 }}
                >
                  {bulkUploading
                    ? "Uploading…"
                    : `Publish All (${bulkFiles.filter((f) => f.status === "queued").length} files)`}
                </button>
                <button
                  onClick={() => { setBulkFiles([]); setBulkOverallProgress(0); }}
                  disabled={bulkUploading}
                  className="px-4 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/70 transition-colors disabled:opacity-40"
                >
                  Clear
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── SESSION LIST ── */}

        {/* Status filter pills */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {(["all", "draft", "published"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className="px-3 py-1.5 rounded-full text-xs transition-colors capitalize"
              style={{
                backgroundColor: statusFilter === f ? "rgba(255,65,179,0.15)" : "rgba(255,255,255,0.05)",
                border: `0.5px solid ${statusFilter === f ? "rgba(255,65,179,0.4)" : "rgba(255,255,255,0.1)"}`,
                color: statusFilter === f ? "#ff41b3" : "rgba(255,255,255,0.35)",
                fontWeight: statusFilter === f ? 500 : 400,
              }}
            >
              {f === "all"       ? `All (${sessions.length})`       : null}
              {f === "draft"     ? `Drafts (${draftCount})`         : null}
              {f === "published" ? `Published (${publishedCount})`  : null}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSkeleton height={64} count={4} className="mb-2" />
        ) : filteredSessions.length === 0 ? (
          <EmptyState message="No sessions here yet" action="+ Add session" onClick={openNew} />
        ) : (
          <div className="flex flex-col gap-2">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-4 p-4 rounded-[10px]"
                style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)" }}
              >
                {/* Gradient dot */}
                <div className="w-10 h-10 rounded-full shrink-0" style={{ background: session.gradient }} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm text-white truncate" style={{ fontWeight: 500 }}>{session.title}</p>
                    {session.is_free && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded text-white shrink-0"
                        style={{ backgroundColor: "rgba(173,242,37,0.8)", fontWeight: 500 }}>FREE</span>
                    )}
                    {(session.status || "draft") === "draft" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                        style={{ backgroundColor: "rgba(251,191,36,0.12)", color: "#FBB924", border: "0.5px solid rgba(251,191,36,0.25)", fontWeight: 500 }}>
                        DRAFT
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/35">{session.type} · {session.mood_category} · {session.duration}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">

                  {/* Preview */}
                  <button
                    onClick={() => setPreviewSession(session)}
                    className="p-2 text-white/25 hover:text-pink-400 transition-colors"
                    aria-label="Preview"
                    title="Preview this session"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  </button>

                  {/* Publish — only shown on drafts */}
                  {(session.status || "draft") === "draft" && (
                    <button
                      onClick={() => handlePublish(session.id)}
                      className="p-2 text-white/25 hover:text-green-400 transition-colors"
                      aria-label="Publish"
                      title="Publish this session"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                    </button>
                  )}

                  {/* Notify subscribers */}
                  <button
                    onClick={() => handleNotify(session)}
                    disabled={notifyingId === session.id}
                    className="p-2 text-white/25 hover:text-pink-400 transition-colors disabled:opacity-40"
                    aria-label="Notify members"
                    title="Email all users about this session"
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

                  {/* Edit */}
                  <button
                    onClick={() => openEdit(session)}
                    className="p-2 text-white/25 hover:text-white/70 transition-colors"
                    aria-label="Edit"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setConfirmDeleteId(session.id)}
                    className="p-2 text-white/25 hover:text-pink-400 transition-colors"
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

        {/* ── PREVIEW MODAL ── */}
        {previewSession && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.88)" }}
            onClick={() => setPreviewSession(null)}
          >
            <div
              className="w-full max-w-sm rounded-[12px] overflow-hidden"
              style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.12)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-sm text-white" style={{ fontWeight: 500 }}>Session preview</p>
                <button
                  onClick={() => setPreviewSession(null)}
                  className="text-white/30 hover:text-white/60 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>

              <div className="p-5 flex flex-col gap-5">

                {/* Homepage card view */}
                <div>
                  <p className="text-[10px] text-white/25 uppercase tracking-widest mb-2">Homepage card</p>
                  <div
                    className="flex items-center gap-3 p-3 rounded-[10px]"
                    style={{ backgroundColor: "#131313", border: "0.5px solid rgba(255,255,255,0.07)" }}
                  >
                    <div
                      className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center"
                      style={{ background: previewSession.gradient }}
                    >
                      <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                        <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.9"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate" style={{ fontWeight: 500 }}>{previewSession.title}</p>
                      <p className="text-xs text-white/40">{previewSession.mood_category} · {previewSession.duration}</p>
                    </div>
                    {previewSession.is_free && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded text-white shrink-0"
                        style={{ backgroundColor: "rgba(173,242,37,0.8)", fontWeight: 500 }}>FREE</span>
                    )}
                  </div>
                </div>

                {/* Player page view */}
                <div>
                  <p className="text-[10px] text-white/25 uppercase tracking-widest mb-2">Session player</p>
                  <div
                    className="flex flex-col items-center text-center py-6 px-4 rounded-[10px]"
                    style={{ backgroundColor: "#131313", border: "0.5px solid rgba(255,255,255,0.06)" }}
                  >
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
                      style={{
                        background: previewSession.gradient,
                        boxShadow: `0 0 40px 10px ${previewSession.gradient.match(/#[0-9A-Fa-f]{6}/)?.[0] ?? "#ff41b3"}35`,
                      }}
                    >
                      <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                        <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.95"/>
                      </svg>
                    </div>
                    <p className="text-xs text-white/35 mb-1">{previewSession.type} · {previewSession.duration}</p>
                    <p className="text-base text-white mb-3" style={{ fontWeight: 500 }}>{previewSession.title}</p>
                    <span
                      className="text-[10px] px-3 py-1 rounded-full text-white"
                      style={{ background: previewSession.gradient, fontWeight: 500 }}
                    >
                      {previewSession.mood_category}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation */}
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
