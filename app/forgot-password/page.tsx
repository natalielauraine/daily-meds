"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase-browser";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#0e0e0e" }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)" }}
            >
              <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
                <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.95"/>
                <path d="M24 28L20 35" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M24 28L28 35" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-white font-bold text-lg">Daily Meds</span>
          </Link>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{
            backgroundColor: "#191919",
            border: "0.5px solid rgba(255,255,255,0.1)",
          }}
        >
          {sent ? (
            /* ── Success state ── */
            <div className="text-center space-y-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                style={{ background: "rgba(82,227,44,0.15)" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#52e32c">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <h2 className="text-white font-bold text-xl">Check your email</h2>
              <p style={{ color: "#ababab", fontSize: 14, lineHeight: 1.6 }}>
                We sent a password reset link to <strong className="text-white">{email}</strong>.
                Check your inbox — it may take a minute.
              </p>
              <p style={{ color: "#ababab", fontSize: 13 }}>
                Didn&apos;t get it?{" "}
                <button
                  onClick={() => setSent(false)}
                  className="underline"
                  style={{ color: "#ff6a9e", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}
                >
                  Try again
                </button>
              </p>
            </div>
          ) : (
            /* ── Form ── */
            <>
              <div className="mb-6">
                <h1 className="text-white font-bold text-xl mb-1">Reset your password</h1>
                <p style={{ color: "#ababab", fontSize: 14 }}>
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full px-3 py-2.5 rounded-md text-sm text-white placeholder-white/20 outline-none focus:ring-1 focus:ring-pink-500"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: "0.5px solid rgba(255,255,255,0.12)",
                    }}
                  />
                </div>

                {error && (
                  <p className="text-sm" style={{ color: "#ff6a9e" }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity"
                  style={{
                    background: "linear-gradient(135deg, #ff41b3, #ec723d)",
                    color: "white",
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                    border: "none",
                  }}
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-xs transition-colors"
              style={{ color: "rgba(255,255,255,0.35)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)")}
            >
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
