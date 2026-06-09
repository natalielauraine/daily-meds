"use client";

import { useState, useEffect } from "react";
import AdminShell from "../AdminShell";

type Signup = {
  id: string;
  name: string | null;
  email: string;
  source: string | null;
  referrer: string | null;
  ip_country: string | null;
  resend_synced: boolean;
  invited_at: string | null;
  converted_at: string | null;
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) +
    " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminWaitlistPage() {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"latest" | "alpha">("latest");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch("/api/admin/waitlist");
      if (res.ok) {
        const data = await res.json();
        setSignups(data.signups ?? []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const sources = Array.from(new Set(signups.map((s) => s.source).filter(Boolean))).sort() as string[];

  const filtered = signups
    .filter((s) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !s.email.toLowerCase().includes(q) &&
          !(s.name || "").toLowerCase().includes(q) &&
          !(s.referrer || "").toLowerCase().includes(q)
        ) return false;
      }
      if (sourceFilter !== "All" && s.source !== sourceFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "alpha") return (a.name || a.email).localeCompare(b.name || b.email);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const convertedCount = signups.filter((s) => s.converted_at).length;
  const invitedCount = signups.filter((s) => s.invited_at).length;

  return (
    <AdminShell>
      <div className="px-6 py-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl text-white mb-1" style={{ fontWeight: 500 }}>Waitlist</h1>
            <p className="text-sm text-cream/65">
              {signups.length} signup{signups.length !== 1 ? "s" : ""}
              {invitedCount > 0 && <span> · {invitedCount} invited</span>}
              {convertedCount > 0 && <span> · {convertedCount} converted</span>}
            </p>
          </div>
          <button
            onClick={() => {
              const csv = [
                "Name,Email,Source,Referrer,Country,Signed Up,Invited,Converted",
                ...signups.map((s) =>
                  [
                    `"${(s.name || "").replace(/"/g, '""')}"`,
                    s.email,
                    s.source || "",
                    `"${(s.referrer || "").replace(/"/g, '""')}"`,
                    s.ip_country || "",
                    s.created_at,
                    s.invited_at || "",
                    s.converted_at || "",
                  ].join(",")
                ),
              ].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white transition-opacity hover:opacity-80 shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.15)", fontWeight: 500 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            Export CSV
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/60" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name, email or referrer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-lg text-sm text-white placeholder:text-cream/60 outline-none"
            style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cream/60 hover:text-cream/70"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          )}
        </div>

        {/* Source filter pills */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span className="text-[10px] text-cream/40 uppercase tracking-wider mr-1">Source</span>
          {["All", ...sources].map((src) => (
            <button
              key={src}
              onClick={() => setSourceFilter(src)}
              className="px-2.5 py-1 rounded-full text-[11px] transition-colors"
              style={{
                backgroundColor: sourceFilter === src ? "rgba(255,65,179,0.15)" : "rgba(255,255,255,0.03)",
                border: `0.5px solid ${sourceFilter === src ? "rgba(255,65,179,0.35)" : "rgba(255,255,255,0.06)"}`,
                color: sourceFilter === src ? "#ff41b3" : "rgba(255,255,255,0.3)",
                fontWeight: sourceFilter === src ? 500 : 400,
              }}
            >
              {src}
            </button>
          ))}
        </div>

        {/* Sort + count */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-cream/50">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
          <div className="flex rounded-lg overflow-hidden shrink-0" style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}>
            <button
              onClick={() => setSortBy("latest")}
              className="px-3 py-1.5 text-[11px] transition-colors"
              style={{
                backgroundColor: sortBy === "latest" ? "rgba(255,65,179,0.15)" : "rgba(255,255,255,0.03)",
                color: sortBy === "latest" ? "#ff41b3" : "rgba(255,255,255,0.4)",
                fontWeight: sortBy === "latest" ? 500 : 400,
              }}
            >
              Latest
            </button>
            <button
              onClick={() => setSortBy("alpha")}
              className="px-3 py-1.5 text-[11px] transition-colors"
              style={{
                backgroundColor: sortBy === "alpha" ? "rgba(255,65,179,0.15)" : "rgba(255,255,255,0.03)",
                color: sortBy === "alpha" ? "#ff41b3" : "rgba(255,255,255,0.4)",
                fontWeight: sortBy === "alpha" ? 500 : 400,
                borderLeft: "0.5px solid rgba(255,255,255,0.1)",
              }}
            >
              A–Z
            </button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-cream/40 text-sm">No signups found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filtered.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg"
                style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)" }}
              >
                {/* Avatar circle */}
                <div
                  className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs text-black"
                  style={{ backgroundColor: "#ff41b3", fontWeight: 700 }}
                >
                  {(s.name || s.email)[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white truncate" style={{ fontWeight: 500 }}>
                      {s.name || s.email.split("@")[0]}
                    </p>
                    {s.converted_at && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                        style={{ backgroundColor: "rgba(173,242,37,0.15)", color: "#adf225", fontWeight: 500 }}>
                        CONVERTED
                      </span>
                    )}
                    {!s.converted_at && s.invited_at && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                        style={{ backgroundColor: "rgba(255,65,179,0.12)", color: "#ff41b3", fontWeight: 500 }}>
                        INVITED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-cream/55 truncate">
                    {s.email}
                    {s.source && <span> · {s.source}</span>}
                    {s.referrer && <span> · via {s.referrer}</span>}
                    {s.ip_country && <span> · {s.ip_country}</span>}
                  </p>
                </div>

                {/* Date */}
                <p className="text-[11px] text-cream/40 shrink-0">{formatDateTime(s.created_at)}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </AdminShell>
  );
}
