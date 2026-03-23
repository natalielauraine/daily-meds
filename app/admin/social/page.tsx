"use client";

// Admin social sharing editor — lets Natalie edit the OG title, description
// and preview image for every page on the site.
//
// When someone shares a link on WhatsApp, Instagram, Twitter etc, the platform
// shows the OG image + title + description from that page. This page controls
// what those look like for each section of the site.
//
// Settings are saved to the Supabase "site_settings" table via the API.
// The page layouts then pull from this table on each request.

import { useState, useEffect } from "react";
import Image from "next/image";
import AdminShell from "../AdminShell";
import { PAGE_DEFAULTS, type PageSlug } from "../../../lib/site-settings";

// The pages Natalie can edit
const PAGES: { slug: PageSlug; label: string; url: string; hint: string }[] = [
  { slug: "home",         label: "Homepage",          url: "/",             hint: "Shown when anyone shares the main site link" },
  { slug: "pricing",      label: "Pricing page",      url: "/pricing",      hint: "Shown when the pricing page is shared" },
  { slug: "live",         label: "Live sessions",      url: "/live",         hint: "Shown when the live page is shared" },
  { slug: "breathe",      label: "Breathing timer",   url: "/breathe",      hint: "Shown when the breathe page is shared" },
  { slug: "testimonials", label: "Testimonials",       url: "/testimonials", hint: "Shown when the testimonials page is shared" },
  { slug: "affiliate",    label: "Affiliate programme", url: "/affiliate",  hint: "Shown when the affiliate page is shared" },
  { slug: "free",         label: "Free sessions",      url: "/free",         hint: "Shown when the free content page is shared" },
  { slug: "about",        label: "About",              url: "/about",        hint: "Shown when the about page is shared" },
];

type Setting = {
  page_slug: PageSlug;
  og_title: string;
  og_description: string;
  og_image_url: string;
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";

export default function AdminSocialPage() {
  // Settings fetched from Supabase (or defaults if none set yet)
  const [settings, setSettings] = useState<Record<PageSlug, Setting>>({} as Record<PageSlug, Setting>);
  const [loading, setLoading] = useState(true);
  // Which page is being edited (expanded)
  const [activeSlug, setActiveSlug] = useState<PageSlug | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSlug, setSavedSlug] = useState<PageSlug | null>(null);
  const [error, setError] = useState("");

  // Load all settings from the API on mount
  useEffect(() => {
    fetch("/api/admin/og-settings")
      .then((r) => r.json())
      .then(({ settings: rows }) => {
        // Build a map of slug → setting, filling in defaults where no row exists
        const map = {} as Record<PageSlug, Setting>;
        PAGES.forEach(({ slug }) => {
          const row = (rows ?? []).find((r: Setting) => r.page_slug === slug);
          map[slug] = {
            page_slug:      slug,
            og_title:       row?.og_title       ?? PAGE_DEFAULTS[slug].title,
            og_description: row?.og_description ?? PAGE_DEFAULTS[slug].description,
            og_image_url:   row?.og_image_url   ?? "",
          };
        });
        setSettings(map);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function update(slug: PageSlug, field: keyof Setting, value: string) {
    setSettings((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], [field]: value },
    }));
  }

  async function savePage(slug: PageSlug) {
    setSaving(true);
    setError("");
    const setting = settings[slug];

    const res = await fetch("/api/admin/og-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page_slug:      setting.page_slug,
        og_title:       setting.og_title       || null,
        og_description: setting.og_description || null,
        og_image_url:   setting.og_image_url   || null,
      }),
    });

    setSaving(false);
    if (!res.ok) {
      setError("Could not save. Check your Supabase connection.");
      return;
    }
    setSavedSlug(slug);
    setTimeout(() => setSavedSlug(null), 2500);
  }

  // Preview URL for the auto-generated OG image (using our /api/og generator)
  function autoOgUrl(slug: PageSlug) {
    const mood = slug === "home" ? "Anxious" : slug === "breathe" ? "Overwhelmed" : "Anxious";
    return `${APP_URL}/api/og?title=${encodeURIComponent(settings[slug]?.og_title || "Daily Meds")}&mood=${encodeURIComponent(mood)}`;
  }

  return (
    <AdminShell>
      <div className="px-6 py-8 max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl text-white mb-1" style={{ fontWeight: 500 }}>Social Sharing</h1>
          <p className="text-sm text-white/40">
            Control what people see when they share your site on WhatsApp, Instagram, Twitter and iMessage.
            Each page has its own preview title, description and image.
          </p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-[10px] mb-5 text-sm text-red-300"
            style={{ backgroundColor: "rgba(244,63,94,0.1)", border: "0.5px solid rgba(244,63,94,0.3)" }}>
            {error}
          </div>
        )}

        {/* Page list */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {PAGES.map((p) => (
              <div key={p.slug} className="h-16 rounded-[10px] animate-pulse" style={{ backgroundColor: "#1A1A2E" }} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {PAGES.map(({ slug, label, url, hint }) => {
              const setting = settings[slug];
              const isOpen  = activeSlug === slug;
              const isSaved = savedSlug === slug;

              return (
                <div
                  key={slug}
                  className="rounded-[10px] overflow-hidden"
                  style={{
                    backgroundColor: "#1A1A2E",
                    border: isOpen ? "0.5px solid rgba(139,92,246,0.4)" : "0.5px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {/* Row header — click to expand/collapse */}
                  <button
                    onClick={() => setActiveSlug(isOpen ? null : slug)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <div>
                      <p className="text-sm text-white" style={{ fontWeight: 500 }}>{label}</p>
                      <p className="text-xs text-white/35 mt-0.5">{url} — {hint}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      {isSaved && (
                        <span className="text-[10px] text-green-400" style={{ fontWeight: 500 }}>Saved</span>
                      )}
                      <svg
                        width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)"
                        style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                      >
                        <path d="M7 10l5 5 5-5z"/>
                      </svg>
                    </div>
                  </button>

                  {/* Expanded editor */}
                  {isOpen && setting && (
                    <div className="px-5 pb-5 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <div className="flex flex-col lg:flex-row gap-6 pt-5">

                        {/* Left: form fields */}
                        <div className="flex-1 flex flex-col gap-4">

                          {/* OG Title */}
                          <div>
                            <label className="block text-xs text-white/40 mb-1.5">
                              Title <span className="text-white/20">(shown as the link preview headline)</span>
                            </label>
                            <input
                              type="text"
                              value={setting.og_title}
                              onChange={(e) => update(slug, "og_title", e.target.value)}
                              maxLength={70}
                              className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                              style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)" }}
                            />
                            <p className="text-[10px] text-white/20 mt-1 text-right">{setting.og_title.length}/70</p>
                          </div>

                          {/* OG Description */}
                          <div>
                            <label className="block text-xs text-white/40 mb-1.5">
                              Description <span className="text-white/20">(shown as the link preview subtext)</span>
                            </label>
                            <textarea
                              value={setting.og_description}
                              onChange={(e) => update(slug, "og_description", e.target.value)}
                              maxLength={160}
                              rows={3}
                              className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none resize-none"
                              style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)" }}
                            />
                            <p className="text-[10px] text-white/20 mt-1 text-right">{setting.og_description.length}/160</p>
                          </div>

                          {/* Custom image URL (optional) */}
                          <div>
                            <label className="block text-xs text-white/40 mb-1.5">
                              Custom image URL <span className="text-white/20">(optional — leave blank to use the auto-generated image)</span>
                            </label>
                            <input
                              type="url"
                              value={setting.og_image_url}
                              onChange={(e) => update(slug, "og_image_url", e.target.value)}
                              placeholder="https://… (1200×630 recommended)"
                              className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none placeholder:text-white/20"
                              style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)" }}
                            />
                          </div>

                          <button
                            onClick={() => savePage(slug)}
                            disabled={saving}
                            className="self-start px-5 py-2.5 rounded-lg text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                            style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
                          >
                            {saving ? "Saving…" : "Save changes"}
                          </button>
                        </div>

                        {/* Right: preview card */}
                        <div className="lg:w-64 shrink-0">
                          <p className="text-xs text-white/30 mb-2">Preview (auto-generated image)</p>
                          <div
                            className="rounded-[10px] overflow-hidden"
                            style={{ border: "0.5px solid rgba(255,255,255,0.08)" }}
                          >
                            {/* OG image preview */}
                            <div className="relative w-full" style={{ paddingBottom: "52.5%" /* 630/1200 */ }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={setting.og_image_url || autoOgUrl(slug)}
                                alt="OG image preview"
                                className="absolute inset-0 w-full h-full object-cover"
                                key={setting.og_image_url || autoOgUrl(slug)}
                              />
                            </div>
                            {/* Mock link card info */}
                            <div className="p-3" style={{ backgroundColor: "#111122" }}>
                              <p className="text-[10px] text-white/30 uppercase tracking-wide mb-0.5">thedailymeds.com</p>
                              <p className="text-xs text-white/80 leading-snug line-clamp-2" style={{ fontWeight: 500 }}>
                                {setting.og_title || PAGE_DEFAULTS[slug].title}
                              </p>
                              <p className="text-[10px] text-white/35 mt-0.5 line-clamp-2 leading-snug">
                                {setting.og_description || PAGE_DEFAULTS[slug].description}
                              </p>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Note about session pages */}
        <div
          className="mt-6 px-4 py-3 rounded-[10px] text-xs text-white/40 leading-relaxed"
          style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.06)" }}
        >
          <span style={{ fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>Session pages</span> automatically generate
          a unique preview image for each session using the session title, mood and duration — no editing needed.
          Those are managed from the Sessions page.
        </div>

      </div>
    </AdminShell>
  );
}
