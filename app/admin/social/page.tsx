"use client";

// Admin Social Sharing — edit OpenGraph title, description, and image for each page.
// Saves to the site_settings table via /api/admin/og-settings.

import { useState, useEffect } from "react";
import AdminShell from "../AdminShell";
import Image from "next/image";

const PAGES = [
  { slug: "/",           label: "Homepage" },
  { slug: "/free",       label: "Free Content" },
  { slug: "/pricing",    label: "Pricing" },
  { slug: "/about",      label: "About Natalie" },
  { slug: "/affiliate",  label: "Affiliate" },
  { slug: "/partnerships", label: "Partnerships" },
  { slug: "/podcasts",   label: "Podcasts" },
  { slug: "/community",  label: "Community" },
  { slug: "/library",    label: "Library" },
];

type OGSetting = {
  page_slug: string;
  og_title: string;
  og_description: string;
  og_image_url: string;
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
  green: "#52e32c",
  red: "#ff4b4b",
};

const fieldStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  background: C.surfaceHighest, border: `1px solid ${C.border}`,
  color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block", color: C.muted, fontSize: 11, fontWeight: 600,
  marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em",
};

export default function AdminSocialPage() {
  const [settings, setSettings] = useState<Record<string, OGSetting>>({});
  const [loading, setLoading] = useState(true);
  const [activeSlug, setActiveSlug] = useState(PAGES[0].slug);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/og-settings");
      const { settings: data } = await res.json();
      const map: Record<string, OGSetting> = {};
      for (const s of data ?? []) map[s.page_slug] = s;
      setSettings(map);
      setLoading(false);
    }
    load();
  }, []);

  const current = settings[activeSlug] ?? { page_slug: activeSlug, og_title: "", og_description: "", og_image_url: "" };

  function update(key: keyof OGSetting, value: string) {
    setSettings((prev) => ({
      ...prev,
      [activeSlug]: { ...current, [key]: value },
    }));
  }

  function showBanner(msg: string, ok = true) {
    setBanner({ msg, ok });
    setTimeout(() => setBanner(null), 3000);
  }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/og-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(current),
    });
    setSaving(false);
    if (res.ok) {
      showBanner("Saved!");
    } else {
      showBanner("Save failed", false);
    }
  }

  const pageLabel = PAGES.find((p) => p.slug === activeSlug)?.label ?? activeSlug;

  return (
    <AdminShell>
      <div style={{ padding: "32px 32px 64px", maxWidth: 900, margin: "0 auto" }}>

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

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ color: "white", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Social Sharing</h1>
          <p style={{ color: C.muted, fontSize: 14 }}>Edit how each page appears when shared on social media.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 24 }}>

          {/* Page list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {PAGES.map((page) => {
              const hasSetting = !!settings[page.slug]?.og_title;
              return (
                <button
                  key={page.slug}
                  onClick={() => setActiveSlug(page.slug)}
                  style={{
                    textAlign: "left", padding: "10px 14px", borderRadius: 8,
                    background: activeSlug === page.slug ? "rgba(255,106,158,0.12)" : "none",
                    border: activeSlug === page.slug ? `1px solid rgba(255,106,158,0.25)` : "1px solid transparent",
                    color: activeSlug === page.slug ? "white" : C.muted,
                    fontSize: 13, fontWeight: activeSlug === page.slug ? 600 : 400,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}
                >
                  {page.label}
                  {hasSetting && (
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Edit panel */}
          <div style={{ background: C.surfaceHigh, borderRadius: 16, padding: 28, border: `1px solid ${C.border}` }}>
            {loading ? (
              <p style={{ color: C.muted, fontSize: 14 }}>Loading…</p>
            ) : (
              <>
                <div style={{ marginBottom: 24 }}>
                  <p style={{ color: C.primary, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                    Editing: {pageLabel}
                  </p>
                  <p style={{ color: C.muted, fontSize: 12 }}>
                    URL: <span style={{ color: C.text }}>thedailymeds.com{activeSlug}</span>
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <label style={labelStyle}>OG Title</label>
                    <input
                      value={current.og_title ?? ""}
                      onChange={(e) => update("og_title", e.target.value)}
                      style={fieldStyle}
                      placeholder="Daily Meds — Audio for Emotional Emergencies"
                      maxLength={60}
                    />
                    <p style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>
                      {(current.og_title ?? "").length}/60 chars — keep under 60 for full display
                    </p>
                  </div>

                  <div>
                    <label style={labelStyle}>OG Description</label>
                    <textarea
                      value={current.og_description ?? ""}
                      onChange={(e) => update("og_description", e.target.value)}
                      style={{ ...fieldStyle, resize: "vertical" }}
                      rows={3}
                      placeholder="Guided meditation and breathwork for life's most awkward moments."
                      maxLength={160}
                    />
                    <p style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>
                      {(current.og_description ?? "").length}/160 chars — keep under 160
                    </p>
                  </div>

                  <div>
                    <label style={labelStyle}>OG Image URL</label>
                    <input
                      value={current.og_image_url ?? ""}
                      onChange={(e) => update("og_image_url", e.target.value)}
                      style={fieldStyle}
                      placeholder="https://thedailymeds.com/og/homepage.jpg"
                    />
                    <p style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>Recommended: 1200×630px</p>
                  </div>

                  {/* Preview card */}
                  {(current.og_title || current.og_description) && (
                    <div style={{ marginTop: 8 }}>
                      <label style={labelStyle}>Preview</label>
                      <div style={{
                        borderRadius: 10, overflow: "hidden",
                        border: `1px solid ${C.border}`, background: C.surfaceHighest,
                        maxWidth: 460,
                      }}>
                        {current.og_image_url && (
                          <div style={{ height: 200, background: "#131313", overflow: "hidden" }}>
                            <Image src={current.og_image_url} alt="" fill sizes="400px" style={{ objectFit: "cover" }} unoptimized />
                          </div>
                        )}
                        <div style={{ padding: "12px 16px" }}>
                          <p style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>THEDAILYMEDS.COM</p>
                          <p style={{ color: "white", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{current.og_title || "No title set"}</p>
                          <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.5 }}>{current.og_description || "No description set"}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={save}
                    disabled={saving}
                    style={{
                      padding: "12px 28px", borderRadius: 8,
                      background: `linear-gradient(135deg, ${C.primary}, ${C.primaryCont})`,
                      color: "white", border: "none", cursor: saving ? "not-allowed" : "pointer",
                      fontWeight: 700, fontSize: 14, opacity: saving ? 0.6 : 1,
                      alignSelf: "flex-start",
                    }}
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
