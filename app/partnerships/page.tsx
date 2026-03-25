"use client";

// /partnerships — brand crew application form.
// Brands fill this in to apply for a verified brand crew on Daily Meds.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase-browser";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { generateBrandCode, BRAND_TYPES } from "../../lib/brand-crews";

const GRADIENT = "linear-gradient(135deg, #F43F5E 0%, #EC4899 20%, #D946EF 35%, #F97316 65%, #EAB308 85%, #FACC15 100%)";

export default function PartnershipsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    name: "",
    brand_type: "",
    contact_email: "",
    description: "",
    website_url: "",
    instagram: "",
    tiktok: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.contact_email.trim() || !form.brand_type) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();

    const socialLinks: Record<string, string> = {};
    if (form.instagram.trim()) socialLinks.instagram = form.instagram.trim();
    if (form.tiktok.trim()) socialLinks.tiktok = form.tiktok.trim();

    const { error: insertErr } = await supabase.from("brand_crews").insert({
      name: form.name.trim(),
      brand_type: form.brand_type,
      contact_email: form.contact_email.trim(),
      description: form.description.trim() || null,
      website_url: form.website_url.trim() || null,
      social_links: socialLinks,
      invite_code: generateBrandCode(),
      status: "pending",
      is_verified: false,
      applied_by: user?.id ?? null,
    });

    if (insertErr) {
      setError(insertErr.message);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: GRADIENT }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <h2 className="text-xl text-white mb-2" style={{ fontWeight: 500 }}>Application received!</h2>
            <p className="text-sm text-white/40 mb-6 leading-relaxed">
              We&apos;ll review your application and get back to you at {form.contact_email}. If approved, your brand crew will go live on Daily Meds.
            </p>
            <Link
              href="/brand-crews"
              className="inline-block px-6 py-2.5 rounded-lg text-sm text-white transition-opacity hover:opacity-80"
              style={{ background: GRADIENT, fontWeight: 500 }}
            >
              Browse brand crews
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
      <Navbar />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <Link href="/brand-crews" className="inline-flex items-center gap-1.5 text-sm text-white/35 hover:text-white/60 transition-colors mb-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Brand crews
          </Link>
          <h1 className="text-2xl text-white mb-2" style={{ fontWeight: 500 }}>Create a Brand Crew</h1>
          <p className="text-sm text-white/40 leading-relaxed">
            Partner with Daily Meds to give your audience a private meditation crew. Perfect for festivals, wellness brands, employers and communities.
          </p>
        </div>

        {/* What you get */}
        <div
          className="rounded-[10px] p-5 mb-8"
          style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-xs text-white/40 mb-3 uppercase tracking-wide">What you get</p>
          <div className="flex flex-col gap-2">
            {[
              "A verified branded crew page with your logo",
              "Unique invite link to share with your audience",
              "Member count and activity stats",
              "Group meditation sessions for your community",
              "Featured on the Daily Meds brand crews page",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center mt-0.5" style={{ background: GRADIENT }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <p className="text-sm text-white/60">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Application form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div>
            <label className="block text-xs text-white/40 mb-1.5">Brand / Organisation name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Glastonbury Festival"
              maxLength={100}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}
            />
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1.5">Brand type *</label>
            <select
              value={form.brand_type}
              onChange={(e) => update("brand_type", e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none"
              style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.1)", colorScheme: "dark" }}
            >
              <option value="">Select a type...</option>
              {BRAND_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1.5">Contact email *</label>
            <input
              type="email"
              value={form.contact_email}
              onChange={(e) => update("contact_email", e.target.value)}
              placeholder="hello@yourbrand.com"
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}
            />
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Tell us about your brand and why you want to create a crew..."
              rows={3}
              maxLength={500}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none resize-none"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}
            />
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1.5">Website</label>
            <input
              type="url"
              value={form.website_url}
              onChange={(e) => update("website_url", e.target.value)}
              placeholder="https://yourbrand.com"
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Instagram</label>
              <input
                type="url"
                value={form.instagram}
                onChange={(e) => update("instagram", e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none"
                style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">TikTok</label>
              <input
                type="url"
                value={form.tiktok}
                onChange={(e) => update("tiktok", e.target.value)}
                placeholder="https://tiktok.com/..."
                className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none"
                style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-50 mt-2"
            style={{ background: GRADIENT, fontWeight: 500 }}
          >
            {submitting ? "Submitting…" : "Submit application"}
          </button>

          <p className="text-xs text-white/20 text-center">
            We review all applications within 2–3 business days.
          </p>
        </form>

      </main>

      <Footer />
    </div>
  );
}
