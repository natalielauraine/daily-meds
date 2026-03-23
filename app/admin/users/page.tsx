"use client";

// Admin users page — shows all registered users with their subscription status.
// Natalie can search by name/email and see when each person signed up.

import { useState, useEffect } from "react";
import AdminShell from "../AdminShell";
import { createClient } from "@supabase/supabase-js";

type User = {
  id: string;
  email: string;
  name: string | null;
  subscription_status: string;
  stripe_customer_id: string | null;
  created_at: string;
};

// Colour and label for each subscription tier
function tierColour(status: string) {
  if (status === "monthly")       return { bg: "rgba(139,92,246,0.15)", text: "#8B5CF6" };
  if (status === "annual")        return { bg: "rgba(59,130,246,0.15)",  text: "#3B82F6" };
  if (status === "lifetime")      return { bg: "rgba(16,185,129,0.15)", text: "#10B981" };
  if (status === "payment_failed") return { bg: "rgba(244,63,94,0.15)", text: "#F43F5E" };
  return { bg: "rgba(255,255,255,0.06)", text: "rgba(255,255,255,0.4)" };
}

function tierLabel(status: string) {
  const labels: Record<string, string> = {
    monthly: "Monthly", annual: "Annual", lifetime: "Lifetime",
    payment_failed: "Failed", free: "Free",
  };
  return labels[status] ?? status;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminUsersPage() {
  const [users, setUsers]       = useState<User[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all"); // all, paid, free
  const [total, setTotal]       = useState(0);

  // Uses service role via env var — only works in a trusted context
  useEffect(() => {
    async function load() {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      // For user listing we use the admin stats API which has service role access
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users ?? []);
        setTotal(data.total ?? 0);
      }
      setLoading(false);
    }
    load();
  }, []);

  // Filter locally by search term and subscription filter
  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "paid" && ["monthly", "annual", "lifetime"].includes(u.subscription_status)) ||
      (filter === "free" && u.subscription_status === "free");

    return matchesSearch && matchesFilter;
  });

  return (
    <AdminShell>
      <div className="px-6 py-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl text-white mb-1" style={{ fontWeight: 500 }}>Users</h1>
          <p className="text-sm text-white/40">{total} registered accounts</p>
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm text-white outline-none placeholder:text-white/20"
              style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)" }}
            />
          </div>
          <div className="flex gap-1">
            {[
              { value: "all",  label: "All" },
              { value: "paid", label: "Paid" },
              { value: "free", label: "Free" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className="px-3 py-2 rounded-lg text-xs transition-colors"
                style={{
                  backgroundColor: filter === f.value ? "#8B5CF6" : "rgba(255,255,255,0.06)",
                  color: filter === f.value ? "white" : "rgba(255,255,255,0.4)",
                  fontWeight: filter === f.value ? 500 : 400,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-[10px] overflow-hidden" style={{ border: "0.5px solid rgba(255,255,255,0.08)" }}>

          {/* Table header */}
          <div
            className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_140px_100px_100px] px-4 py-3 text-xs text-white/30"
            style={{ backgroundColor: "#1A1A2E", borderBottom: "0.5px solid rgba(255,255,255,0.06)", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}
          >
            <span>User</span>
            <span className="hidden sm:block">Joined</span>
            <span className="hidden sm:block text-center">Plan</span>
            <span className="text-right sm:text-center">Status</span>
          </div>

          {/* Rows */}
          {loading ? (
            <div className="flex flex-col">
              {[0,1,2,3,4,5].map((i) => (
                <div key={i} className="h-14 animate-pulse border-b" style={{ backgroundColor: "#1A1A2E", borderColor: "rgba(255,255,255,0.04)" }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center" style={{ backgroundColor: "#1A1A2E" }}>
              <p className="text-sm text-white/25">{search ? "No users match your search" : "No users yet"}</p>
            </div>
          ) : (
            <div className="flex flex-col" style={{ backgroundColor: "#111122" }}>
              {filtered.map((user, i) => {
                const colours = tierColour(user.subscription_status);
                return (
                  <div
                    key={user.id}
                    className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_140px_100px_100px] px-4 py-3 items-center"
                    style={{ borderBottom: i < filtered.length - 1 ? "0.5px solid rgba(255,255,255,0.04)" : "none" }}
                  >
                    {/* Name + email */}
                    <div className="min-w-0">
                      <p className="text-sm text-white/80 truncate" style={{ fontWeight: 500 }}>
                        {user.name || "—"}
                      </p>
                      <p className="text-xs text-white/35 truncate">{user.email}</p>
                    </div>

                    {/* Joined date */}
                    <span className="hidden sm:block text-xs text-white/35">
                      {formatDate(user.created_at)}
                    </span>

                    {/* Plan pill */}
                    <div className="hidden sm:flex justify-center">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: colours.bg, color: colours.text, fontWeight: 500 }}
                      >
                        {tierLabel(user.subscription_status)}
                      </span>
                    </div>

                    {/* Mobile: plan pill on right */}
                    <div className="sm:hidden flex justify-end">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: colours.bg, color: colours.text, fontWeight: 500 }}
                      >
                        {tierLabel(user.subscription_status)}
                      </span>
                    </div>

                    {/* Stripe link (desktop only) */}
                    <div className="hidden sm:flex justify-center">
                      {user.stripe_customer_id ? (
                        <span className="text-xs text-white/20 truncate" title={user.stripe_customer_id}>
                          {user.stripe_customer_id.slice(0, 12)}…
                        </span>
                      ) : (
                        <span className="text-xs text-white/15">—</span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <p className="text-xs text-white/25 mt-3 text-right">
            Showing {filtered.length} of {total} users
          </p>
        )}

      </div>
    </AdminShell>
  );
}
