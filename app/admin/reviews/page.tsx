"use client";

// Admin reviews page — Natalie can approve or reject pending reviews here.
// Approved reviews surface on /testimonials. Rejected ones are hidden.

import { useState, useEffect } from "react";
import AdminShell from "../AdminShell";

type Review = {
  id: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
  session_tag: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

function Stars({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24"
          fill={i <= n ? "#f4e71d" : "rgba(255,255,255,0.12)"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </span>
  );
}

function StatusBadge({ status }: { status: Review["status"] }) {
  const styles: Record<Review["status"], { bg: string; color: string; label: string }> = {
    pending:  { bg: "rgba(244,231,29,0.12)",  color: "#f4e71d",  label: "Pending"  },
    approved: { bg: "rgba(173,242,37,0.12)",  color: "#adf225",  label: "Approved" },
    rejected: { bg: "rgba(255,65,179,0.12)",  color: "#ff41b3",  label: "Rejected" },
  };
  const s = styles[status] ?? styles.pending;
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
      style={{ backgroundColor: s.bg, color: s.color, fontWeight: 500 }}
    >
      {s.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function AdminReviewsPage() {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [updating, setUpdating] = useState<string | null>(null); // id currently being updated

  useEffect(() => {
    fetch("/api/admin/reviews")
      .then((r) => r.json())
      .then((data) => { setReviews(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: "approved" | "rejected") {
    setUpdating(id);
    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      // Optimistically update local state so the UI reflects the change immediately
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    }
    setUpdating(null);
  }

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  const counts = {
    all:      reviews.length,
    pending:  reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
  };

  return (
    <AdminShell>
      <div className="px-6 py-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl text-white mb-1" style={{ fontWeight: 500 }}>Reviews</h1>
          <p className="text-sm text-white/40">
            Approve reviews to show them on the testimonials page. Reject to hide them.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-5">
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs transition-colors capitalize"
              style={{
                backgroundColor: filter === f ? "#ff41b3" : "rgba(255,255,255,0.06)",
                color: filter === f ? "white" : "rgba(255,255,255,0.4)",
                fontWeight: filter === f ? 500 : 400,
              }}
            >
              {f} ({counts[f]})
            </button>
          ))}
        </div>

        {/* Review list */}
        <div className="rounded-[10px] overflow-hidden" style={{ border: "0.5px solid rgba(255,255,255,0.08)" }}>

          {/* Table header */}
          <div
            className="grid grid-cols-[1fr_auto] px-4 py-3 text-[10px] text-white/30 uppercase tracking-widest"
            style={{ backgroundColor: "#1F1F1F", borderBottom: "0.5px solid rgba(255,255,255,0.06)", fontWeight: 500 }}
          >
            <span>Review</span>
            <span className="text-right">Actions</span>
          </div>

          {loading ? (
            <div className="flex flex-col" style={{ backgroundColor: "#1A1A1A" }}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse border-b"
                  style={{ borderColor: "rgba(255,255,255,0.04)" }}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center" style={{ backgroundColor: "#1A1A1A" }}>
              <p className="text-sm text-white/25">No {filter === "all" ? "" : filter} reviews</p>
            </div>
          ) : (
            <div className="flex flex-col" style={{ backgroundColor: "#1A1A1A" }}>
              {filtered.map((review, i) => (
                <div
                  key={review.id}
                  className="px-4 py-4 grid grid-cols-[1fr_auto] gap-4 items-start"
                  style={{
                    borderBottom: i < filtered.length - 1 ? "0.5px solid rgba(255,255,255,0.05)" : "none",
                    opacity: updating === review.id ? 0.5 : 1,
                    transition: "opacity 0.15s",
                  }}
                >
                  {/* Review content */}
                  <div className="flex flex-col gap-2 min-w-0">

                    {/* Name + rating + status */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm text-white" style={{ fontWeight: 500 }}>
                        {review.reviewer_name}
                      </span>
                      <Stars n={review.rating} />
                      <StatusBadge status={review.status} />
                      {review.session_tag && (
                        <span className="text-[10px] text-white/35 truncate">
                          {review.session_tag}
                        </span>
                      )}
                      <span className="text-[10px] text-white/25 ml-auto">
                        {formatDate(review.created_at)}
                      </span>
                    </div>

                    {/* Review text */}
                    <p className="text-sm leading-relaxed text-white/60">
                      &ldquo;{review.review_text}&rdquo;
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => updateStatus(review.id, "approved")}
                      disabled={updating === review.id || review.status === "approved"}
                      className="px-3 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: review.status === "approved" ? "rgba(173,242,37,0.15)" : "rgba(173,242,37,0.08)",
                        color: "#adf225",
                        border: "0.5px solid rgba(173,242,37,0.2)",
                        fontWeight: 500,
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(review.id, "rejected")}
                      disabled={updating === review.id || review.status === "rejected"}
                      className="px-3 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: review.status === "rejected" ? "rgba(255,65,179,0.15)" : "rgba(255,65,179,0.08)",
                        color: "#ff41b3",
                        border: "0.5px solid rgba(255,65,179,0.2)",
                        fontWeight: 500,
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <p className="text-xs text-white/20 text-right mt-3">
            {filtered.length} review{filtered.length !== 1 ? "s" : ""}
          </p>
        )}

      </div>
    </AdminShell>
  );
}
