"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase-browser";

const C = {
  primary: "#ff6a9e",
  primaryCont: "#ff418e",
  secondary: "#52e32c",
  tertiary: "#ef7f4e",
  surfaceDim: "#0e0e0e",
  surfaceLow: "#131313",
  surface: "#191919",
  surfaceHigh: "#1f1f1f",
  surfaceHighest: "#262626",
  onSurfaceVar: "#ababab",
  onSurface: "#e5e5e5",
};

const HEADLINE: React.CSSProperties = {
  fontFamily: "var(--font-lexend)",
  fontWeight: 900,
  letterSpacing: "-0.05em",
  textTransform: "uppercase",
};

type Episode = {
  id: string;
  slug: string;
  title: string;
  episode_number: number;
  guest_name: string;
  guest_role: string;
  cover_image_url: string;
  duration: string;
  published: boolean;
  created_at: string;
  description: string;
  tags: string[];
};

const CATEGORIES = ["All", "Mental Health", "Recovery", "Sleep", "Relationships", "Creativity", "Spirituality"];

export default function PodcastsPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("podcasts")
        .select("*")
        .eq("published", true)
        .order("episode_number", { ascending: false });
      setEpisodes(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = episodes.filter((ep) => {
    const matchSearch =
      ep.title.toLowerCase().includes(search.toLowerCase()) ||
      ep.guest_name?.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      activeCategory === "All" ||
      ep.tags?.includes(activeCategory);
    return matchSearch && matchCat;
  });

  const latest = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div style={{ backgroundColor: C.surfaceDim, minHeight: "100vh", color: C.onSurface }}>

      {/* ── NAV ── */}
      <nav style={{ borderBottom: `1px solid rgba(255,255,255,0.06)`, backgroundColor: C.surfaceLow }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" style={{ ...HEADLINE, fontSize: 18, color: "white", textDecoration: "none" }}>
            Daily Meds
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/community" style={{ color: C.onSurfaceVar, fontSize: 14, textDecoration: "none" }}>Community</Link>
            <Link href="/library" style={{ color: C.onSurfaceVar, fontSize: 14, textDecoration: "none" }}>Library</Link>
            <Link
              href="/signup"
              style={{
                background: `linear-gradient(135deg, ${C.primary}, ${C.primaryCont})`,
                color: "white",
                padding: "8px 20px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: "64px 24px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 600, height: 300, borderRadius: "50%",
          background: `radial-gradient(ellipse, rgba(255,106,158,0.12) 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
        <p style={{ color: C.primary, fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>
          The Daily Meds Podcast
        </p>
        <h1 style={{ ...HEADLINE, fontSize: "clamp(40px, 6vw, 80px)", color: "white", marginBottom: 20 }}>
          Real Conversations.<br />Raw Healing.
        </h1>
        <p style={{ color: C.onSurfaceVar, fontSize: 17, maxWidth: 540, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Honest talks about mental health, recovery, and finding your footing — with the people who've been there.
        </p>

        {/* Search */}
        <div style={{ position: "relative", maxWidth: 420, margin: "0 auto" }}>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.onSurfaceVar} strokeWidth="2"
            style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }}
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search episodes or guests..."
            style={{
              width: "100%", padding: "14px 16px 14px 44px", borderRadius: 12,
              background: C.surfaceHigh, border: `1px solid rgba(255,255,255,0.08)`,
              color: C.onSurface, fontSize: 14, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
      </section>

      {/* ── CATEGORY PILLS ── */}
      <div style={{ padding: "0 24px 40px" }}>
        <div className="max-w-6xl mx-auto flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "8px 20px", borderRadius: 999, fontSize: 13, fontWeight: 500,
                border: activeCategory === cat ? "none" : `1px solid rgba(255,255,255,0.1)`,
                background: activeCategory === cat
                  ? `linear-gradient(135deg, ${C.primary}, ${C.primaryCont})`
                  : C.surfaceHigh,
                color: activeCategory === cat ? "white" : C.onSurfaceVar,
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-24">

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: C.onSurfaceVar }}>Loading episodes...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: C.onSurfaceVar }}>No episodes found.</div>
        ) : (
          <>
            {/* ── FEATURED LATEST EPISODE ── */}
            {latest && (
              <Link href={`/podcasts/${latest.slug}`} style={{ textDecoration: "none", display: "block", marginBottom: 48 }}>
                <div
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 0,
                    background: C.surfaceHigh,
                    border: `1px solid rgba(255,255,255,0.08)`,
                    borderRadius: 20, overflow: "hidden",
                    transition: "transform 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,106,158,0.3)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  {/* Cover */}
                  <div style={{ position: "relative", aspectRatio: "1", minHeight: 320, overflow: "hidden" }}>
                    {latest.cover_image_url ? (
                      <img src={latest.cover_image_url} alt={latest.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, #1a0a14, #0d1a0a)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill={C.primary} opacity={0.4}>
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                      </div>
                    )}
                    <div style={{
                      position: "absolute", top: 16, left: 16,
                      background: `linear-gradient(135deg, ${C.primary}, ${C.primaryCont})`,
                      color: "white", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                      textTransform: "uppercase", padding: "4px 12px", borderRadius: 999,
                    }}>
                      Latest
                    </div>
                  </div>
                  {/* Info */}
                  <div style={{ padding: "40px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <p style={{ color: C.primary, fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
                      Episode {latest.episode_number}
                    </p>
                    <h2 style={{ ...HEADLINE, fontSize: "clamp(22px, 3vw, 36px)", color: "white", marginBottom: 16 }}>
                      {latest.title}
                    </h2>
                    {latest.guest_name && (
                      <p style={{ color: C.onSurfaceVar, fontSize: 14, marginBottom: 8 }}>
                        with <span style={{ color: C.onSurface, fontWeight: 600 }}>{latest.guest_name}</span>
                        {latest.guest_role ? ` — ${latest.guest_role}` : ""}
                      </p>
                    )}
                    {latest.description && (
                      <p style={{ color: C.onSurfaceVar, fontSize: 15, lineHeight: 1.7, marginBottom: 28, opacity: 0.8 }}>
                        {latest.description.slice(0, 160)}{latest.description.length > 160 ? "…" : ""}
                      </p>
                    )}
                    <div className="flex items-center gap-4">
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 10,
                        background: `linear-gradient(135deg, ${C.primary}, ${C.primaryCont})`,
                        color: "white", padding: "12px 24px", borderRadius: 10, fontWeight: 700, fontSize: 14,
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                        Play Episode
                      </div>
                      {latest.duration && (
                        <span style={{ color: C.onSurfaceVar, fontSize: 13 }}>{latest.duration}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* ── EPISODE GRID ── */}
            {rest.length > 0 && (
              <>
                <h2 style={{ ...HEADLINE, fontSize: 20, color: "white", marginBottom: 24 }}>All Episodes</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                  {rest.map((ep) => (
                    <Link key={ep.id} href={`/podcasts/${ep.slug}`} style={{ textDecoration: "none" }}>
                      <div
                        style={{
                          background: C.surfaceHigh, border: `1px solid rgba(255,255,255,0.07)`,
                          borderRadius: 16, overflow: "hidden", transition: "transform 0.2s, border-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,106,158,0.25)";
                          (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                        }}
                      >
                        {/* Cover */}
                        <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
                          {ep.cover_image_url ? (
                            <img src={ep.cover_image_url} alt={ep.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, #1a0a14, #0d1a0a)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg width="32" height="32" viewBox="0 0 24 24" fill={C.primary} opacity={0.4}>
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                              </svg>
                            </div>
                          )}
                          {/* Play overlay */}
                          <div style={{
                            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                            background: "rgba(0,0,0,0.3)", opacity: 0, transition: "opacity 0.2s",
                          }}
                            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.opacity = "1"}
                            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.opacity = "0"}
                          >
                            <div style={{
                              width: 44, height: 44, borderRadius: "50%",
                              background: `linear-gradient(135deg, ${C.primary}, ${C.primaryCont})`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                          </div>
                        </div>
                        {/* Meta */}
                        <div style={{ padding: "20px" }}>
                          <p style={{ color: C.primary, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                            EP {ep.episode_number}
                          </p>
                          <h3 style={{ ...HEADLINE, fontSize: 16, color: "white", marginBottom: 8 }}>{ep.title}</h3>
                          {ep.guest_name && (
                            <p style={{ color: C.onSurfaceVar, fontSize: 13, marginBottom: 12 }}>with {ep.guest_name}</p>
                          )}
                          <div className="flex items-center justify-between">
                            {ep.duration && <span style={{ color: C.onSurfaceVar, fontSize: 12 }}>{ep.duration}</span>}
                            <span style={{ color: C.primary, fontSize: 12, fontWeight: 600 }}>Listen →</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid rgba(255,255,255,0.06)`, padding: "40px 24px", textAlign: "center" }}>
        <p style={{ color: C.onSurfaceVar, fontSize: 13 }}>
          Made with love in Ibiza by{" "}
          <span style={{ color: C.onSurface, fontWeight: 600 }}>Natalie Lauraine</span>
        </p>
      </footer>
    </div>
  );
}
