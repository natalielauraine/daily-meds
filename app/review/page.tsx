"use client";

// /review — lets logged-in users leave a review of Daily Meds or a specific session.
// Submitted reviews are saved to Supabase with status "pending".
// Natalie approves them from the admin dashboard before they appear on /testimonials.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { createClient } from "../../lib/supabase-browser";
import { MOCK_SESSIONS } from "../../lib/sessions-data";

// Star rating picker — clicking a star sets the rating
function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill={star <= (hovered || value) ? "#f4e71d" : "rgba(255,255,255,0.15)"}
            style={{ transition: "fill 0.1s" }}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>
      ))}
      {value > 0 && (
        <span className="text-sm text-white/50 ml-1">
          {["", "Poor", "Fair", "Good", "Great", "Excellent"][value]}
        </span>
      )}
    </div>
  );
}

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

export default function ReviewPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);     // checking auth
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [sessionTag, setSessionTag] = useState("");  // "" = general platform feedback
  const [reviewerName, setReviewerName] = useState(""); // pre-filled from profile

  useEffect(() => {
    // Redirect to login if not logged in
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login?redirect=/review");
        return;
      }

      // Pre-fill name from their profile so they don't have to type it
      const name =
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        data.user.email?.split("@")[0] ||
        "";
      setReviewerName(name);
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (rating === 0) { setError("Please choose a star rating."); return; }
    if (reviewText.trim().length < 20) { setError("Please write at least 20 characters."); return; }

    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const initials = reviewerName.trim()[0]?.toUpperCase() || "?";

    const { error: insertError } = await supabase.from("reviews").insert({
      user_id: user.id,
      rating,
      review_text: reviewText.trim(),
      session_tag: sessionTag || null,
      status: "pending",          // Natalie approves before it goes public
      reviewer_name: reviewerName.trim() || "Anonymous",
      reviewer_initials: initials,
    });

    if (insertError) {
      setError("Something went wrong saving your review. Please try again.");
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  }

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#131313" }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-pink-400 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  // ── SUCCESS STATE ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#131313" }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            {/* Big star */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "linear-gradient(135deg, #f4e71d, #ec723d)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h2 className="text-xl text-white mb-2" style={{ fontWeight: 500 }}>Thanks for your review!</h2>
            <p className="text-sm text-white/45 leading-relaxed mb-8">
              Your review has been submitted and is waiting for approval. Once Natalie approves it, it'll appear on the testimonials page.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/testimonials"
                className="text-sm text-white px-5 py-2.5 rounded-full transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#ff41b3", fontWeight: 500 }}
              >
                See all reviews
              </Link>
              <Link href="/" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                Back to home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── FORM ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#131313" }}>
      <Navbar />

      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 py-10 pb-24">

        {/* Back link */}
        <Link href="/testimonials" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-8">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          All reviews
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl text-white mb-2" style={{ fontWeight: 500 }}>Leave a review</h1>
          <p className="text-sm text-white/45 leading-relaxed">
            Your review helps other people find Daily Meds when they need it most. Be honest — good or bad.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* ── YOUR NAME ── */}
          <div>
            <label className="block text-xs text-white/50 mb-2" style={{ fontWeight: 500 }}>
              YOUR NAME
            </label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="How should we credit you?"
              className="w-full rounded-[10px] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
              style={{
                backgroundColor: "#1F1F1F",
                border: "0.5px solid rgba(255,255,255,0.1)",
              }}
            />
            <p className="text-xs text-white/25 mt-1.5">Only your first name will appear publicly</p>
          </div>

          {/* ── STAR RATING ── */}
          <div>
            <label className="block text-xs text-white/50 mb-3" style={{ fontWeight: 500 }}>
              RATING <span className="text-red-400">*</span>
            </label>
            <StarPicker value={rating} onChange={setRating} />
            {rating > 0 && (
              <p className="text-xs text-white/30 mt-2">
                {RATING_LABELS[rating]} — {rating} out of 5 stars
              </p>
            )}
          </div>

          {/* ── REVIEW TEXT ── */}
          <div>
            <label className="block text-xs text-white/50 mb-2" style={{ fontWeight: 500 }}>
              YOUR REVIEW <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell us about your experience. What were you going through? Did it help?"
              rows={5}
              className="w-full rounded-[10px] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 resize-none leading-relaxed"
              style={{
                backgroundColor: "#1F1F1F",
                border: "0.5px solid rgba(255,255,255,0.1)",
              }}
            />
            <p className="text-xs text-white/25 mt-1.5">
              {reviewText.length} characters · minimum 20
            </p>
          </div>

          {/* ── SESSION TAG ── */}
          <div>
            <label className="block text-xs text-white/50 mb-2" style={{ fontWeight: 500 }}>
              WHAT ARE YOU REVIEWING?
            </label>
            <select
              value={sessionTag}
              onChange={(e) => setSessionTag(e.target.value)}
              className="w-full rounded-[10px] px-4 py-3 text-sm text-white outline-none appearance-none"
              style={{
                backgroundColor: "#1F1F1F",
                border: "0.5px solid rgba(255,255,255,0.1)",
                color: sessionTag ? "white" : "rgba(255,255,255,0.4)",
              }}
            >
              <option value="">Daily Meds generally</option>
              <optgroup label="Sessions">
                {MOCK_SESSIONS.map((s) => (
                  <option key={s.id} value={s.title}>{s.title}</option>
                ))}
              </optgroup>
              <optgroup label="Features">
                <option value="Breathing Timer">Breathing Timer</option>
                <option value="Live Sessions">Live Sessions</option>
                <option value="Sleep Audio">Sleep Audio</option>
              </optgroup>
            </select>
            <p className="text-xs text-white/25 mt-1.5">
              Optional — helps others find relevant sessions
            </p>
          </div>

          {/* ── ERROR ── */}
          {error && (
            <div
              className="px-4 py-3 rounded-[10px] text-sm text-red-300"
              style={{ backgroundColor: "rgba(248,113,113,0.08)", border: "0.5px solid rgba(248,113,113,0.2)" }}
            >
              {error}
            </div>
          )}

          {/* ── SUBMIT ── */}
          <button
            type="submit"
            disabled={submitting || rating === 0 || reviewText.trim().length < 20}
            className="w-full py-3.5 rounded-[10px] text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#ff41b3", fontWeight: 500 }}
          >
            {submitting ? "Submitting…" : "Submit review"}
          </button>

          <p className="text-xs text-white/25 text-center leading-relaxed">
            Reviews are checked before going live. No spam, no fake reviews — just real experiences.
          </p>

        </form>
      </main>

      <Footer />
    </div>
  );
}
