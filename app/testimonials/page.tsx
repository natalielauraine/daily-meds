"use client";

// /testimonials — public page showing approved user reviews.
// Fetches all reviews with status "approved" from Supabase.
// Hero section shows the overall average rating and total review count.
// Reviews are shown in a responsive grid with star ratings, avatars and session tags.

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { createClient } from "../../lib/supabase-browser";

type Review = {
  id: string;
  rating: number;
  review_text: string;
  session_tag: string | null;   // e.g. "Hungover & Overwhelmed" or null for general
  created_at: string;
  reviewer_name: string;        // stored at submission time from user profile
  reviewer_initials: string;    // first letter of name, pre-computed for avatar
};

// Render a row of star icons — filled yellow, half-dim, or empty
function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={star <= rating ? "#FACC15" : "rgba(255,255,255,0.15)"}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

// Pick a gradient for the avatar based on the first letter of the name
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #6B21E8, #8B3CF7)",
  "linear-gradient(135deg, #F43F5E, #F97316)",
  "linear-gradient(135deg, #10B981, #22C55E)",
  "linear-gradient(135deg, #EC4899, #D946EF)",
  "linear-gradient(135deg, #F97316, #FACC15)",
  "linear-gradient(135deg, #8B3CF7, #6366F1)",
];

function avatarGradient(initial: string): string {
  const idx = (initial.toUpperCase().charCodeAt(0) - 65) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[Math.max(0, idx)];
}

// Format a date like "March 2025"
function formatMonth(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TestimonialsPage() {
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [displayed, setDisplayed] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      const supabase = createClient();
      const { data } = await supabase
        .from("reviews")
        .select("id, rating, review_text, session_tag, created_at, reviewer_name, reviewer_initials")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      const all = (data as Review[]) ?? [];
      setAllReviews(all);
      setDisplayed(shuffle(all).slice(0, 12));
      setLoading(false);
    }
    fetchReviews();
  }, []);

  function reshuffleReviews() {
    setDisplayed(shuffle(allReviews).slice(0, 12));
  }

  const totalReviews = allReviews.length;
  const averageRating = totalReviews > 0
    ? Math.round((allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: allReviews.filter((r) => r.rating === star).length,
    percent: totalReviews > 0 ? (allReviews.filter((r) => r.rating === star).length / totalReviews) * 100 : 0,
  }));

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#131313" }}>
      <Navbar />

      <main className="flex-1">

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
          <p className="text-xs text-cream/65 uppercase tracking-widest mb-4" style={{ fontWeight: 500 }}>
            What members say
          </p>
          <h1 className="text-3xl sm:text-4xl text-white mb-3" style={{ fontWeight: 500 }}>
            Real people. Real results.
          </h1>
          <p className="text-base text-cream/60 max-w-md mx-auto mb-4">
            No wellness fluff. Just honest feedback from people who actually used Daily Meds when they needed it most.
          </p>
          <p className="text-sm text-cream/65 max-w-2xl mx-auto mb-10 leading-relaxed">
            Our founder Natalie Lauraine has received over 9,000 five-star reviews on Insight Timer since 2019. She created The Daily Meds to expand her reach and bring reality-based wellness to a wider audience. We would love to hear your feedback here. Tell us what you love or how we can serve you better.
          </p>

          {/* Overall rating + bar chart */}
          {!loading && totalReviews > 0 && (
            <div
              className="inline-flex flex-col sm:flex-row items-center gap-8 px-8 py-6 rounded-[14px]"
              style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)" }}
            >
              {/* Big number */}
              <div className="text-center">
                <p className="text-5xl text-white mb-1" style={{ fontWeight: 500 }}>{averageRating}</p>
                <Stars rating={Math.round(averageRating)} size={20} />
                <p className="text-xs text-cream/65 mt-2">{totalReviews} review{totalReviews !== 1 ? "s" : ""}</p>
              </div>

              {/* Rating breakdown bars */}
              <div className="flex flex-col gap-2 min-w-[180px]">
                {ratingCounts.map(({ star, count, percent }) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-cream/65 w-4 text-right">{star}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#FACC15">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${percent}%`, backgroundColor: "#FACC15" }}
                      />
                    </div>
                    <span className="text-xs text-cream/60 w-4">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leave a review CTA */}
          <div className="mt-8">
            <Link
              href="/review"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm text-white transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Leave a review
            </Link>
          </div>
        </section>

        {/* ── REVIEWS GRID ───────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

          {/* Loading spinner */}
          {loading && (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-purple-400 animate-spin" />
            </div>
          )}

          {/* Empty state — shown before any reviews are approved */}
          {!loading && allReviews.length === 0 && (
            <div className="flex flex-col items-center py-20 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                style={{ background: "rgba(139,92,246,0.1)", border: "0.5px solid rgba(139,92,246,0.2)" }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="rgba(139,92,246,0.7)">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <p className="text-cream/65 text-sm mb-1">No reviews yet</p>
              <p className="text-cream/60 text-xs mb-6">Be the first to share your experience</p>
              <Link
                href="/review"
                className="text-sm text-white px-5 py-2 rounded-full transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
              >
                Write a review
              </Link>
            </div>
          )}

          {/* Review cards — 12 randomly selected, masonry layout */}
          {!loading && displayed.length > 0 && (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {displayed.map((review) => (
                <div
                  key={review.id}
                  className="break-inside-avoid mb-4 rounded-[12px] p-5"
                  style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)" }}
                >
                  {/* Stars */}
                  <div className="mb-3">
                    <Stars rating={review.rating} />
                  </div>

                  {/* Review text */}
                  <p className="text-sm text-cream/85 leading-relaxed mb-4">
                    &ldquo;{review.review_text}&rdquo;
                  </p>

                  {/* Session tag — shown if the review is about a specific session */}
                  {review.session_tag && (
                    <div className="mb-4">
                      <span
                        className="text-[10px] px-2.5 py-1 rounded-full text-cream/70"
                        style={{ backgroundColor: "rgba(139,92,246,0.12)", border: "0.5px solid rgba(139,92,246,0.2)" }}
                      >
                        {review.session_tag}
                      </span>
                    </div>
                  )}

                  {/* Reviewer info */}
                  <div className="flex items-center gap-3 pt-3" style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
                    {/* Avatar circle with initial */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white shrink-0"
                      style={{ background: avatarGradient(review.reviewer_initials || "A"), fontWeight: 500 }}
                    >
                      {review.reviewer_initials || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-cream/80 truncate" style={{ fontWeight: 500 }}>
                        {review.reviewer_name}
                      </p>
                      <p className="text-[10px] text-cream/60">{formatMonth(review.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Shuffle button — only when there are more than 12 reviews */}
          {!loading && allReviews.length > 12 && (
            <div className="flex justify-center mt-10">
              <button
                onClick={reshuffleReviews}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm transition-all hover:scale-105"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "var(--font-space-grotesk)",
                  fontWeight: 600,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                </svg>
                Show different reviews
              </button>
            </div>
          )}

          {/* Count */}
          {!loading && allReviews.length > 0 && (
            <p className="text-xs text-center mt-6" style={{ color: "rgba(255,255,255,0.25)" }}>
              Showing {displayed.length} of {allReviews.length} reviews
            </p>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}
