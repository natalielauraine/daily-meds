"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase-browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase sends the user here with a session already established via the
  // auth callback. We just need to confirm a valid session exists before
  // allowing the form to be shown.
  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (data.user && !error) {
        setSessionReady(true);
      } else {
        setError("This link has expired or has already been used. Please request a new one.");
      }
    });
  }, []);

  function validate() {
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => router.push("/home"), 3000);
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

          {/* ── Success state ── */}
          {done ? (
            <div className="text-center space-y-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                style={{ background: "rgba(82,227,44,0.15)" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#52e32c">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <h2 className="text-white font-bold text-xl">Password updated</h2>
              <p style={{ color: "#ababab", fontSize: 14, lineHeight: 1.6 }}>
                You&apos;re all set. Taking you to the app in a moment…
              </p>
            </div>

          /* ── Expired / no session state ── */
          ) : !sessionReady ? (
            <div className="text-center space-y-4">
              {error ? (
                <>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                    style={{ background: "rgba(255,75,75,0.12)" }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#ff4b4b">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                  </div>
                  <h2 className="text-white font-bold text-xl">Link expired</h2>
                  <p style={{ color: "#ababab", fontSize: 14, lineHeight: 1.6 }}>{error}</p>
                  <Link
                    href="/forgot-password"
                    className="inline-block mt-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-80"
                    style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)" }}
                  >
                    Request a new link
                  </Link>
                </>
              ) : (
                <p style={{ color: "#ababab", fontSize: 14 }}>Verifying your link…</p>
              )}
            </div>

          /* ── Form ── */
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-white font-bold text-xl mb-1">Set a new password</h1>
                <p style={{ color: "#ababab", fontSize: 14 }}>
                  Choose something strong — at least 8 characters.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                    New password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    className="w-full px-3 py-2.5 rounded-md text-sm text-white placeholder-white/20 outline-none focus:ring-1 focus:ring-pink-500"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: "0.5px solid rgba(255,255,255,0.12)",
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                    required
                    minLength={8}
                    placeholder="Same password again"
                    className="w-full px-3 py-2.5 rounded-md text-sm text-white placeholder-white/20 outline-none focus:ring-1 focus:ring-pink-500"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: password && confirm && password !== confirm
                        ? "0.5px solid rgba(255,75,75,0.5)"
                        : password && confirm && password === confirm
                        ? "0.5px solid rgba(82,227,44,0.4)"
                        : "0.5px solid rgba(255,255,255,0.12)",
                    }}
                  />
                  {/* Inline match indicator */}
                  {confirm.length > 0 && (
                    <p style={{ fontSize: 11, color: password === confirm ? "#52e32c" : "#ff4b4b" }}>
                      {password === confirm ? "✓ Passwords match" : "✗ Passwords don't match"}
                    </p>
                  )}
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
                    marginTop: 4,
                  }}
                >
                  {loading ? "Updating…" : "Update Password"}
                </button>
              </form>
            </>
          )}

          {!done && (
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-xs transition-colors"
                style={{ color: "rgba(255,255,255,0.3)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)")}
              >
                ← Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
