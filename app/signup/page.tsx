"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "../../lib/supabase-browser";

export default function SignupPage() {
  const supabase = createClient();

  const [name, setName]                   = useState("");
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [loading, setLoading]             = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]                 = useState("");
  const [success, setSuccess]             = useState(false);

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const referralCode = localStorage.getItem("referral_code") ?? "";

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, referred_by: referralCode || null },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) { setError(error.message); setLoading(false); return; }

    if (signUpData.user && referralCode) {
      await supabase.from("users").update({ referred_by: referralCode }).eq("id", signUpData.user.id);
      localStorage.removeItem("referral_code");
    }

    setSuccess(true);
    setLoading(false);
  }

  async function handleGoogleSignup() {
    setError("");
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setGoogleLoading(false); }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#010101" }}>
        <div className="text-center max-w-sm">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)" }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white uppercase mb-2" style={{ fontFamily: "var(--font-lexend)" }}>Check your email</h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            We sent a confirmation link to <strong style={{ color: "rgba(255,255,255,0.7)" }}>{email}</strong>.
          </p>
          <Link href="/login" className="text-sm transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}>
            Back to log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: "#010101", color: "white" }}
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-12">

        {/* Headline */}
        <div className="text-center">
          <h1
            className="uppercase leading-tight"
            style={{
              fontFamily: "var(--font-lexend)",
              fontWeight: 800,
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              letterSpacing: "-0.02em",
              background: "linear-gradient(to right, #FE8A58, #ff418e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            We&apos;ve been waiting for you.<br />
            It&apos;s time we rise together.
          </h1>
        </div>

        {/* Form */}
        <div className="w-full flex flex-col gap-4">

          {/* Google */}
          <button
            onClick={handleGoogleSignup}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-sm font-bold transition-all hover:bg-white/10 active:scale-95"
            style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}
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
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.07)" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailSignup} className="flex flex-col gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your name"
              className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,65,142,0.5)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email address"
              className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,65,142,0.5)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Password (8+ characters)"
              className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,65,142,0.5)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />

            {error && <p className="text-xs text-red-400 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-4 rounded-xl text-white font-black text-sm uppercase tracking-widest transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 mt-1"
              style={{ background: "#ff41b3", boxShadow: "0 0 30px rgba(255,65,142,0.25)", fontFamily: "var(--font-lexend)" }}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          {/* Footer links */}
          <p className="text-center text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.2)" }}>
            By signing up you agree to our{" "}
            <Link href="/terms" className="hover:text-white/50 transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}>Terms</Link>
            {" "}&amp;{" "}
            <Link href="/privacy" className="hover:text-white/50 transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}>Privacy Policy</Link>.
          </p>
          <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-bold transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }}>
              Log in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
