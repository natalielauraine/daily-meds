"use client";

import { useState, useEffect } from "react";
import AdminShell from "../AdminShell";
import Image from "next/image";
import { createClient } from "../../../lib/supabase-browser";

type Episode = {
  id: string;
  slug: string;
  title: string;
  episode_number: number;
  guest_name: string;
  guest_role: string;
  guest_bio: string;
  guest_photo_url: string;
  cover_image_url: string;
  audio_url: string;
  duration: string;
  description: string;
  pull_quote: string;
  highlights: string; // JSON string
  resources: string;  // JSON string
  transcript: string;
  tags: string;       // comma-separated
  stat1_value: string;
  stat1_label: string;
  stat2_value: string;
  stat2_label: string;
  published: boolean;
  created_at: string;
};

const EMPTY: Omit<Episode, "id" | "created_at"> = {
  slug: "",
  title: "",
  episode_number: 1,
  guest_name: "",
  guest_role: "",
  guest_bio: "",
  guest_photo_url: "",
  cover_image_url: "",
  audio_url: "",
  duration: "",
  description: "",
  pull_quote: "",
  highlights: "[]",
  resources: "[]",
  transcript: "",
  tags: "",
  stat1_value: "",
  stat1_label: "",
  stat2_value: "",
  stat2_label: "",
  published: false,
};

const C = {
  surface: "#191919",
  surfaceHigh: "#1f1f1f",
  surfaceHighest: "#262626",
  border: "rgba(255,255,255,0.08)",
  text: "#e5e5e5",
  muted: "#ababab",
  primary: "#ff6a9e",
  primaryCont: "#ff418e",
  red: "#ff4b4b",
  green: "#52e32c",
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  background: C.surfaceHighest,
  border: `1px solid ${C.border}`,
  color: C.text,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: C.muted,
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminPodcastsPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null); // id or "new"
  const [form, setForm] = useState<Omit<Episode, "id" | "created_at">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ msg: string; ok: boolean } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const supabase = createClient();

  async function load() {
    const { data, error } = await supabase
      .from("podcasts")
      .select("*")
      .order("episode_number", { ascending: false });
    if (error) {
      console.error("Podcasts table error:", error.message);
      showBanner("Database error: " + error.message, false);
    }
    setEpisodes(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function showBanner(msg: string, ok = true) {
    setBanner({ msg, ok });
    setTimeout(() => setBanner(null), 3500);
  }

  function openNew() {
    setForm({ ...EMPTY, episode_number: (episodes[0]?.episode_number ?? 0) + 1 });
    setEditing("new");
  }

  function openEdit(ep: Episode) {
    setForm({
      slug: ep.slug ?? "",
      title: ep.title ?? "",
      episode_number: ep.episode_number ?? 1,
      guest_name: ep.guest_name ?? "",
      guest_role: ep.guest_role ?? "",
      guest_bio: ep.guest_bio ?? "",
      guest_photo_url: ep.guest_photo_url ?? "",
      cover_image_url: ep.cover_image_url ?? "",
      audio_url: ep.audio_url ?? "",
      duration: ep.duration ?? "",
      description: ep.description ?? "",
      pull_quote: ep.pull_quote ?? "",
      highlights: typeof ep.highlights === "string" ? ep.highlights : JSON.stringify(ep.highlights ?? []),
      resources: typeof ep.resources === "string" ? ep.resources : JSON.stringify(ep.resources ?? []),
      transcript: ep.transcript ?? "",
      tags: Array.isArray(ep.tags) ? ep.tags.join(", ") : ep.tags ?? "",
      stat1_value: ep.stat1_value ?? "",
      stat1_label: ep.stat1_label ?? "",
      stat2_value: ep.stat2_value ?? "",
      stat2_label: ep.stat2_label ?? "",
      published: ep.published ?? false,
    });
    setEditing(ep.id);
  }

  function set(key: keyof typeof form, value: unknown) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-slug from title if new episode
      if (key === "title" && editing === "new") {
        next.slug = slugify(value as string);
      }
      return next;
    });
  }

  async function save() {
    if (!form.title.trim()) { showBanner("Title is required", false); return; }
    if (!form.slug.trim()) { showBanner("Slug is required", false); return; }
    setSaving(true);

    // Parse JSON fields
    let highlights = [];
    let resources = [];
    let tags: string[] = [];
    try { highlights = JSON.parse(form.highlights || "[]"); } catch { highlights = []; }
    try { resources = JSON.parse(form.resources || "[]"); } catch { resources = []; }
    tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);

    const payload = {
      ...form,
      highlights,
      resources,
      tags,
    };

    let error;
    if (editing === "new") {
      ({ error } = await supabase.from("podcasts").insert([payload]));
    } else {
      ({ error } = await supabase.from("podcasts").update(payload).eq("id", editing));
    }

    setSaving(false);
    if (error) {
      showBanner("Error: " + error.message, false);
    } else {
      showBanner(editing === "new" ? "Episode created!" : "Episode updated!");
      setEditing(null);
      load();
    }
  }

  async function deleteEp(id: string) {
    const { error } = await supabase.from("podcasts").delete().eq("id", id);
    if (error) {
      showBanner("Delete failed: " + error.message, false);
    } else {
      showBanner("Episode deleted");
      setDeleteConfirm(null);
      load();
    }
  }

  async function togglePublish(ep: Episode) {
    await supabase.from("podcasts").update({ published: !ep.published }).eq("id", ep.id);
    load();
  }

  return (
    <AdminShell>
      <div style={{ padding: "32px 32px 64px", maxWidth: 960, margin: "0 auto" }}>

        {/* Banner */}
        {banner && (
          <div style={{
            position: "fixed", top: 20, right: 20, zIndex: 999,
            padding: "12px 20px", borderRadius: 10,
            background: banner.ok ? "rgba(82,227,44,0.15)" : "rgba(255,75,75,0.15)",
            border: `1px solid ${banner.ok ? C.green : C.red}`,
            color: banner.ok ? C.green : C.red,
            fontSize: 14, fontWeight: 500,
          }}>
            {banner.msg}
          </div>
        )}

        {/* Delete confirm */}
        {deleteConfirm && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ background: C.surfaceHigh, borderRadius: 16, padding: 32, maxWidth: 400, width: "90%", border: `1px solid ${C.border}` }}>
              <h3 style={{ color: "white", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Delete episode?</h3>
              <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>This cannot be undone.</p>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => deleteEp(deleteConfirm)} style={{ flex: 1, padding: "10px", borderRadius: 8, background: C.red, color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>Delete</button>
                <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "10px", borderRadius: 8, background: C.surfaceHighest, color: C.text, border: `1px solid ${C.border}`, cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ color: "white", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Podcast Episodes</h1>
            <p style={{ color: C.muted, fontSize: 14 }}>{episodes.length} episode{episodes.length !== 1 ? "s" : ""} total</p>
          </div>
          {editing === null && (
            <button
              onClick={openNew}
              style={{
                padding: "10px 20px", borderRadius: 8,
                background: `linear-gradient(135deg, ${C.primary}, ${C.primaryCont})`,
                color: "white", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
              }}
            >
              + New Episode
            </button>
          )}
        </div>

        {/* ── FORM ── */}
        {editing !== null && (
          <div style={{
            background: C.surfaceHigh, borderRadius: 16, padding: 32,
            border: `1px solid ${C.border}`, marginBottom: 40,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
              <h2 style={{ color: "white", fontSize: 18, fontWeight: 700 }}>
                {editing === "new" ? "New Episode" : "Edit Episode"}
              </h2>
              <button
                onClick={() => setEditing(null)}
                style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 20, lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

              {/* Title */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Title *</label>
                <input value={form.title} onChange={(e) => set("title", e.target.value)} style={fieldStyle} placeholder="Episode title" />
              </div>

              {/* Slug */}
              <div>
                <label style={labelStyle}>Slug *</label>
                <input value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} style={fieldStyle} placeholder="url-friendly-slug" />
              </div>

              {/* Episode Number */}
              <div>
                <label style={labelStyle}>Episode Number</label>
                <input type="number" value={form.episode_number} onChange={(e) => set("episode_number", parseInt(e.target.value) || 1)} style={fieldStyle} />
              </div>

              {/* Description */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Description</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} style={{ ...fieldStyle, resize: "vertical" }} placeholder="Short episode description shown on listing page" />
              </div>

              {/* Pull Quote */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Pull Quote</label>
                <textarea value={form.pull_quote} onChange={(e) => set("pull_quote", e.target.value)} rows={2} style={{ ...fieldStyle, resize: "vertical" }} placeholder="The one quote that captures the episode — shown on the hero" />
              </div>

              {/* Guest Name */}
              <div>
                <label style={labelStyle}>Guest Name</label>
                <input value={form.guest_name} onChange={(e) => set("guest_name", e.target.value)} style={fieldStyle} placeholder="Jane Smith" />
              </div>

              {/* Guest Role */}
              <div>
                <label style={labelStyle}>Guest Role / Title</label>
                <input value={form.guest_role} onChange={(e) => set("guest_role", e.target.value)} style={fieldStyle} placeholder="Therapist & Author" />
              </div>

              {/* Guest Bio */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Guest Bio</label>
                <textarea value={form.guest_bio} onChange={(e) => set("guest_bio", e.target.value)} rows={3} style={{ ...fieldStyle, resize: "vertical" }} placeholder="Short bio paragraph" />
              </div>

              {/* Guest Photo */}
              <div>
                <label style={labelStyle}>Guest Photo URL</label>
                <input value={form.guest_photo_url} onChange={(e) => set("guest_photo_url", e.target.value)} style={fieldStyle} placeholder="https://..." />
              </div>

              {/* Cover Image */}
              <div>
                <label style={labelStyle}>Cover Image URL</label>
                <input value={form.cover_image_url} onChange={(e) => set("cover_image_url", e.target.value)} style={fieldStyle} placeholder="https://..." />
              </div>

              {/* Audio URL */}
              <div>
                <label style={labelStyle}>Audio File URL</label>
                <input value={form.audio_url} onChange={(e) => set("audio_url", e.target.value)} style={fieldStyle} placeholder="https://... (.mp3)" />
              </div>

              {/* Duration */}
              <div>
                <label style={labelStyle}>Duration</label>
                <input value={form.duration} onChange={(e) => set("duration", e.target.value)} style={fieldStyle} placeholder="1h 12m" />
              </div>

              {/* Stats */}
              <div>
                <label style={labelStyle}>Stat 1 Value</label>
                <input value={form.stat1_value} onChange={(e) => set("stat1_value", e.target.value)} style={fieldStyle} placeholder="5M+" />
              </div>
              <div>
                <label style={labelStyle}>Stat 1 Label</label>
                <input value={form.stat1_label} onChange={(e) => set("stat1_label", e.target.value)} style={fieldStyle} placeholder="Podcast listeners" />
              </div>
              <div>
                <label style={labelStyle}>Stat 2 Value</label>
                <input value={form.stat2_value} onChange={(e) => set("stat2_value", e.target.value)} style={fieldStyle} placeholder="12 years" />
              </div>
              <div>
                <label style={labelStyle}>Stat 2 Label</label>
                <input value={form.stat2_label} onChange={(e) => set("stat2_label", e.target.value)} style={fieldStyle} placeholder="In practice" />
              </div>

              {/* Tags */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Tags (comma-separated)</label>
                <input value={form.tags} onChange={(e) => set("tags", e.target.value)} style={fieldStyle} placeholder="Mental Health, Recovery, Sleep" />
              </div>

              {/* Highlights JSON */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Key Takeaways (JSON)</label>
                <textarea
                  value={form.highlights}
                  onChange={(e) => set("highlights", e.target.value)}
                  rows={4}
                  style={{ ...fieldStyle, fontFamily: "monospace", fontSize: 12, resize: "vertical" }}
                  placeholder={`[\n  { "title": "The moment I hit rock bottom", "image_url": "https://..." },\n  { "title": "Why therapy didn't work at first" }\n]`}
                />
                <p style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>Each item: {"{ title, image_url? }"}</p>
              </div>

              {/* Resources JSON */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Resources (JSON)</label>
                <textarea
                  value={form.resources}
                  onChange={(e) => set("resources", e.target.value)}
                  rows={4}
                  style={{ ...fieldStyle, fontFamily: "monospace", fontSize: 12, resize: "vertical" }}
                  placeholder={`[\n  { "label": "The Body Keeps the Score", "url": "https://...", "category": "buy" },\n  { "label": "EMDR Research Study", "url": "https://...", "category": "research" }\n]`}
                />
                <p style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>Category must be "buy" or "research"</p>
              </div>

              {/* Transcript */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Transcript</label>
                <textarea
                  value={form.transcript}
                  onChange={(e) => set("transcript", e.target.value)}
                  rows={8}
                  style={{ ...fieldStyle, resize: "vertical" }}
                  placeholder="Paste full transcript here..."
                />
              </div>

              {/* Published toggle */}
              <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  onClick={() => set("published", !form.published)}
                  style={{
                    width: 44, height: 24, borderRadius: 999, border: "none", cursor: "pointer",
                    background: form.published ? C.green : C.surfaceHighest,
                    position: "relative", transition: "background 0.2s", flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: "absolute", top: 2, left: form.published ? 22 : 2,
                    width: 20, height: 20, borderRadius: "50%", background: "white",
                    transition: "left 0.2s",
                  }} />
                </button>
                <span style={{ color: C.text, fontSize: 14 }}>
                  {form.published ? "Published — visible on /podcasts" : "Draft — hidden from public"}
                </span>
              </div>
            </div>

            {/* Save button */}
            <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
              <button
                onClick={save}
                disabled={saving}
                style={{
                  padding: "12px 28px", borderRadius: 8,
                  background: `linear-gradient(135deg, ${C.primary}, ${C.primaryCont})`,
                  color: "white", border: "none", cursor: saving ? "not-allowed" : "pointer",
                  fontWeight: 700, fontSize: 14, opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Saving…" : editing === "new" ? "Create Episode" : "Save Changes"}
              </button>
              <button
                onClick={() => setEditing(null)}
                style={{
                  padding: "12px 20px", borderRadius: 8,
                  background: C.surfaceHighest, border: `1px solid ${C.border}`,
                  color: C.muted, cursor: "pointer", fontSize: 14,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── EPISODE LIST ── */}
        {loading ? (
          <p style={{ color: C.muted, fontSize: 14, textAlign: "center", padding: "40px 0" }}>Loading…</p>
        ) : episodes.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "64px 24px",
            background: C.surfaceHigh, borderRadius: 16, border: `1px solid ${C.border}`,
          }}>
            <p style={{ color: C.muted, fontSize: 16, marginBottom: 20 }}>No episodes yet.</p>
            <button
              onClick={openNew}
              style={{
                padding: "10px 24px", borderRadius: 8,
                background: `linear-gradient(135deg, ${C.primary}, ${C.primaryCont})`,
                color: "white", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
              }}
            >
              Add Your First Episode
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {episodes.map((ep) => (
              <div
                key={ep.id}
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  background: C.surfaceHigh, borderRadius: 12, padding: "16px 20px",
                  border: `1px solid ${C.border}`,
                }}
              >
                {/* Cover thumbnail */}
                <div style={{ width: 56, height: 56, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: C.surface }}>
                  {ep.cover_image_url ? (
                    <Image src={ep.cover_image_url} alt="" fill sizes="80px" style={{ objectFit: "cover" }} unoptimized />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={C.muted} opacity={0.4}>
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3 }}>
                    <span style={{ color: C.primary, fontSize: 11, fontWeight: 700 }}>EP {ep.episode_number}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                      background: ep.published ? "rgba(82,227,44,0.1)" : "rgba(255,255,255,0.06)",
                      color: ep.published ? C.green : C.muted,
                    }}>
                      {ep.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p style={{ color: "white", fontSize: 14, fontWeight: 600, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ep.title}
                  </p>
                  <p style={{ color: C.muted, fontSize: 12 }}>
                    {ep.guest_name ? `with ${ep.guest_name}` : "No guest"}{ep.duration ? ` · ${ep.duration}` : ""}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => togglePublish(ep)}
                    title={ep.published ? "Unpublish" : "Publish"}
                    style={{
                      padding: "7px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                      border: `1px solid ${ep.published ? "rgba(255,75,75,0.3)" : "rgba(82,227,44,0.3)"}`,
                      background: "none", cursor: "pointer",
                      color: ep.published ? C.red : C.green,
                    }}
                  >
                    {ep.published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => openEdit(ep)}
                    style={{ padding: "7px 14px", borderRadius: 7, fontSize: 12, border: `1px solid ${C.border}`, background: "none", cursor: "pointer", color: C.muted }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(ep.id)}
                    style={{ padding: "7px 10px", borderRadius: 7, fontSize: 12, border: `1px solid rgba(255,75,75,0.2)`, background: "none", cursor: "pointer", color: C.red }}
                    title="Delete"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
