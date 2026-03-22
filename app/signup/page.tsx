"use client";

// Signup page — create an account with email/password or Google.
// After email signup, Supabase sends a confirmation email before the account is active.

import Link from "next/link";
import { useState } from "react";
import { createClient } from "../../lib/supabase-browser";

export default function SignupPage() {
  const supabase = createClient();

  // Form field values
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Loading, error, and success states
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Handle email + password signup
  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Store the user's display name in their profile metadata
        data: { full_name: name },
        // Where Supabase sends the user after they click the confirmation email
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Show the "check your email" confirmation screen
    setSuccess(true);
    setLoading(false);
  }

  // Handle Google OAuth signup (same flow as login via Google)
  async function handleGoogleSignup() {
    setError("");
    setGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  // After email signup — show a "check your inbox" message instead of the form
  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-12"
        style={{ backgroundColor: "#0D0D1A" }}
      >
        <div className="w-full max-w-sm text-center">
          {/* Confirmation icon */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: "linear-gradient(135deg, #10B981, #22C55E, #84CC16, #D9F100)",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
          <h2 className="text-xl text-white mb-2" style={{ fontWeight: 500 }}>
            Check your email
          </h2>
          <p className="text-sm text-white/50 mb-6 leading-relaxed">
            We sent a confirmation link to <strong className="text-white/70">{email}</strong>.
            Click it to activate your account and start your Daily Meds journey.
          </p>
          <Link
            href="/login"
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Back to log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#0D0D1A" }}
    >
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #F43F5E, #EC4899, #D946EF, #F97316, #FACC15)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C12 2 8 6 8 10C8 12.2 9.8 14 12 14C14.2 14 16 12.2 16 10C16 6 12 2 12 2Z" fill="white" opacity="0.9"/>
                <path d="M6 8C6 8 2 10 2 13C2 15.2 3.8 17 6 17C7.5 17 8.8 16.2 9.5 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8"/>
                <path d="M18 8C18 8 22 10 22 13C22 15.2 20.2 17 18 17C16.5 17 15.2 16.2 14.5 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8"/>
                <path d="M12 14C12 14 12 18 12 20C12 21.1 11.1 22 10 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
                <path d="M12 14C12 14 12 18 12 20C12 21.1 12.9 22 14 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
              </svg>
            </div>
            <span className="text-sm tracking-wide" style={{ fontWeight: 500 }}>
              <span style={{ color: "#F43F5E" }}>THE </span>
              <span style={{ color: "#F97316" }}>DAILY </span>
              <span style={{ color: "#22C55E" }}>MEDS</span>
            </span>
          </Link>
          <h1 className="text-xl text-white" style={{ fontWeight: 500 }}>
            Start for free
          </h1>
          <p className="text-sm text-white/40 mt-1">Create your account</p>
        </div>

        {/* Card */}
        <div
          className="rounded-[10px] p-6"
          style={{
            backgroundColor: "#1A1A2E",
            border: "0.5px solid rgba(255,255,255,0.08)",
          }}
        >

          {/* Google signup button */}
          <button
            onClick={handleGoogleSignup}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-md text-sm text-white/80 hover:text-white transition-colors mb-5"
            style={{
              border: "0.5px solid rgba(255,255,255,0.2)",
              backgroundColor: "transparent",
              fontWeight: 500,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
            <span className="text-xs text-white/30">or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Signup form */}
          <form onSubmit={handleEmailSignup} className="flex flex-col gap-4">

            {/* Name field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Natalie"
                className="w-full px-3 py-2.5 rounded-md text-sm text-white placeholder-white/20 outline-none focus:ring-1 focus:ring-purple-500"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "0.5px solid rgba(255,255,255,0.12)",
                }}
              />
            </div>

            {/* Email field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-md text-sm text-white placeholder-white/20 outline-none focus:ring-1 focus:ring-purple-500"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "0.5px solid rgba(255,255,255,0.12)",
                }}
              />
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="w-full px-3 py-2.5 rounded-md text-sm text-white placeholder-white/20 outline-none focus:ring-1 focus:ring-purple-500"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "0.5px solid rgba(255,255,255,0.12)",
                }}
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-xs text-red-400 text-center">{error}</p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-2.5 rounded-md text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50 mt-1"
              style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          {/* Terms note */}
          <p className="text-center text-xs text-white/25 mt-4 leading-relaxed">
            By signing up you agree to our{" "}
            <Link href="/terms" className="text-white/40 hover:text-white/60 transition-colors">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-white/40 hover:text-white/60 transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-white/40 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-white/70 hover:text-white transition-colors">
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
}
