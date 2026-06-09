"use client";

// The main navigation bar — shown on every page.
// Glassmorphism style: blurred dark background + neon pink wordmark.
// Mobile first: collapses into a hamburger menu on small screens.

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import Logo from "./Logo";

export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setAuthChecked(true); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Add a solid bg once the user scrolls past 10px
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Account";
  const avatarInitial = displayName[0]?.toUpperCase() || "U";

  return (
    <nav
      className="sticky top-0 z-50 w-full transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(19,19,19,0.92)"
          : "rgba(19,19,19,0.6)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-14">

          {/* ── Logo ── */}
          <Logo href="/" size="sm" />

          {/* ── Desktop nav links — absolutely centered ── */}
          <div className="hidden md:flex items-center gap-5 absolute left-1/2 -translate-x-1/2 h-full">
            {[
              { href: "/", label: "Home" },
              { href: "/free", label: "Free" },
              { href: "/live", label: "Live" },
              { href: "/timer", label: "Breathe", requiresAuth: true },
              { href: "/pricing", label: "Pricing" },
              { href: "/about", label: "About" },
            ].map(({ href, label, requiresAuth }) => (
              <Link
                key={label}
                href={requiresAuth && !user ? "#" : href}
                onClick={requiresAuth && !user ? (e) => { e.preventDefault(); setShowLoginPrompt(true); } : undefined}
                className="text-xs uppercase tracking-widest transition-colors duration-200 flex items-center"
                style={{
                  fontFamily: "var(--font-space-grotesk)",
                  fontWeight: 600,
                  color: "rgba(246,241,230,0.65)",
                  minHeight: 30,
                  minWidth: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f6f1e6")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* ── Desktop auth area — hidden until auth check completes to prevent flash ── */}
          <div className="hidden md:flex items-center gap-3" style={{ visibility: authChecked ? "visible" : "hidden" }}>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  aria-label="User menu"
                >
                  {/* Avatar — neon pink gradient */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white"
                    style={{
                      background: "linear-gradient(135deg, #ff41b3, #ec723d)",
                      fontFamily: "var(--font-space-grotesk)",
                      fontWeight: 700,
                    }}
                  >
                    {avatarInitial}
                  </div>
                  <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" className="text-cream/65"
                    style={{ transform: userMenuOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-11 w-48 rounded-xl py-2 z-50"
                    style={{
                      background: "rgba(31,31,31,0.96)",
                      backdropFilter: "blur(16px)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
                    }}
                  >
                    <div className="px-4 py-2 mb-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-xs text-white truncate" style={{ fontWeight: 500 }}>{displayName}</p>
                      <p className="text-xs truncate" style={{ color: "rgba(246,241,230,0.65)" }}>{user.email}</p>
                    </div>
                    {[
                      { href: "/library", label: "Library" },
                      { href: "/profile", label: "Profile" },
                    ].map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        className="flex items-center px-4 py-2 text-sm transition-colors hover:bg-white/[0.04]"
                        style={{ color: "rgba(246,241,230,0.7)" }}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        {label}
                      </Link>
                    ))}
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} className="mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/[0.04]"
                        style={{ color: "rgba(246,241,230,0.65)" }}
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs uppercase tracking-widest transition-colors duration-200 flex items-center"
                  style={{
                    fontFamily: "var(--font-space-grotesk)",
                    fontWeight: 600,
                    color: "rgba(246,241,230,0.65)",
                    minHeight: 30,
                    minWidth: 0,
                  }}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="text-[10px] uppercase tracking-widest text-white px-4 py-1 rounded-full transition-all duration-200 hover:opacity-90 flex items-center"
                  style={{
                    fontFamily: "var(--font-space-grotesk)",
                    fontWeight: 600,
                    minHeight: 30,
                    minWidth: 0,
                    background: "#ff41b3",
                    boxShadow: "0 0 16px rgba(255,65,179,0.35)",
                  }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="md:hidden p-3 transition-colors"
            style={{ color: "rgba(246,241,230,0.7)" }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileMenuOpen && (
        <div
          className="md:hidden px-4 py-5 flex flex-col gap-4"
          style={{
            background: "rgba(19,19,19,0.97)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {[
            { href: "/", label: "Home" },
            { href: "/free", label: "Free" },
            { href: "/live", label: "Live" },
            { href: "/timer", label: "Breathe", requiresAuth: true },
            { href: "/pricing", label: "Pricing" },
            { href: "/about", label: "About" },
          ].map(({ href, label, requiresAuth }) => (
            <Link
              key={label}
              href={requiresAuth && !user ? "#" : href}
              onClick={(e) => {
                if (requiresAuth && !user) { e.preventDefault(); setMobileMenuOpen(false); setShowLoginPrompt(true); }
                else setMobileMenuOpen(false);
              }}
              className="text-sm uppercase tracking-widest transition-colors"
              style={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 500, color: "rgba(246,241,230,0.7)" }}
            >
              {label}
            </Link>
          ))}

          <div className="flex flex-col gap-2 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {user ? (
              <>
                <div className="flex items-center gap-2 py-1">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white shrink-0"
                    style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)", fontWeight: 700 }}
                  >
                    {avatarInitial}
                  </div>
                  <span className="text-sm truncate" style={{ color: "rgba(246,241,230,0.7)" }}>{displayName}</span>
                </div>
                <Link href="/profile" className="text-sm" style={{ color: "rgba(246,241,230,0.6)" }} onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                <button onClick={handleLogout} className="text-left text-sm" style={{ color: "rgba(246,241,230,0.65)" }}>Log out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm" style={{ color: "rgba(246,241,230,0.7)" }} onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                <Link
                  href="/signup"
                  className="text-sm text-white text-center py-2.5 rounded-full"
                  style={{ background: "#ff41b3", fontFamily: "var(--font-space-grotesk)", fontWeight: 700 }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
      {/* ── Login prompt modal for Breathe ── */}
      {showLoginPrompt && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            className="rounded-2xl p-8 max-w-sm w-full text-center relative"
            style={{ background: "#1F1F1F", border: "1px solid rgba(255,255,255,0.1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="absolute top-4 right-4"
              style={{ color: "rgba(246,241,230,0.65)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "linear-gradient(135deg, #adf225, #059669)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z"/>
              </svg>
            </div>
            <h3
              className="text-xl text-white mb-2 uppercase"
              style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800 }}
            >
              Breathe with us
            </h3>
            <p className="text-sm mb-6" style={{ color: "rgba(246,241,230,0.7)" }}>
              Log in or create a free account to access the breathing timer.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                className="w-full py-3 rounded-full text-sm text-white text-center transition-all hover:opacity-90"
                style={{ background: "#ff41b3", fontFamily: "var(--font-space-grotesk)", fontWeight: 700 }}
                onClick={() => setShowLoginPrompt(false)}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="w-full py-3 rounded-full text-sm text-center transition-all hover:bg-white/[0.06]"
                style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(246,241,230,0.7)", fontFamily: "var(--font-space-grotesk)", fontWeight: 700 }}
                onClick={() => setShowLoginPrompt(false)}
              >
                Create free account
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
