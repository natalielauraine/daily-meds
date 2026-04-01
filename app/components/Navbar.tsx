"use client";

// The main navigation bar — shown on every page.
// Glassmorphism style: blurred dark background + neon pink wordmark.
// Mobile first: collapses into a hamburger menu on small screens.

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import LanguageSelector from "./LanguageSelector";
import NotificationBell from "./NotificationBell";
import { useLanguage } from "../../lib/language-context";
import Logo from "./Logo";

export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  // Controls whether the navbar has scrolled and should show the solid bg
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
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
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Logo href="/" size="sm" />

          {/* ── Desktop nav links ── */}
          <div className="hidden md:flex items-center gap-5">
            {[
              { href: "/", label: "Home" },
              { href: "/library", label: t("nav", "library") || "Library" },
              { href: "/live", label: t("nav", "live") || "Live" },
              { href: "/timer", label: "Breathe" },
              { href: "/pricing", label: "Pricing" },
              { href: "/rooms", label: "Group Meds" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-xs uppercase tracking-widest transition-colors duration-200"
                style={{
                  fontFamily: "var(--font-space-grotesk)",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.55)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#E2E2E2")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* ── Desktop auth area ── */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector />
            {user && <NotificationBell user={user} />}

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
                    stroke="currentColor" strokeWidth="2" className="text-white/40"
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
                      <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{user.email}</p>
                    </div>
                    {[
                      { href: "/library", label: "Library" },
                      { href: "/profile", label: "Profile" },
                      { href: "/stats", label: "My Stats" },
                      { href: "/watchlist", label: "Watchlist" },
                      { href: "/rooms", label: "Group Meds" },
                    ].map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        className="flex items-center px-4 py-2 text-sm transition-colors hover:bg-white/[0.04]"
                        style={{ color: "rgba(255,255,255,0.6)" }}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        {label}
                      </Link>
                    ))}
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} className="mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/[0.04]"
                        style={{ color: "rgba(255,255,255,0.4)" }}
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
                  className="text-xs uppercase tracking-widest transition-colors duration-200"
                  style={{
                    fontFamily: "var(--font-space-grotesk)",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="text-xs uppercase tracking-widest text-white px-5 py-2 rounded-full transition-all duration-200 hover:opacity-90"
                  style={{
                    fontFamily: "var(--font-space-grotesk)",
                    fontWeight: 700,
                    background: "#ff41b3",
                    boxShadow: "0 0 16px rgba(255,65,179,0.35)",
                  }}
                >
                  Start free
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="md:hidden p-3 transition-colors"
            style={{ color: "rgba(255,255,255,0.6)" }}
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
            { href: "/library", label: "Library" },
            { href: "/live", label: "Live" },
            { href: "/free", label: "Free Sessions" },
            { href: "/pricing", label: "Pricing" },
            { href: "/timer", label: "Breathe" },
            { href: "/rooms", label: "Group Meds" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm uppercase tracking-widest transition-colors"
              style={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 500, color: "rgba(255,255,255,0.6)" }}
              onClick={() => setMobileMenuOpen(false)}
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
                  <span className="text-sm truncate" style={{ color: "rgba(255,255,255,0.6)" }}>{displayName}</span>
                </div>
                <Link href="/profile" className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }} onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                <Link href="/stats" className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }} onClick={() => setMobileMenuOpen(false)}>My Stats</Link>
                <Link href="/watchlist" className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }} onClick={() => setMobileMenuOpen(false)}>Watchlist</Link>
                <button onClick={handleLogout} className="text-left text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Log out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }} onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                <Link
                  href="/signup"
                  className="text-sm text-white text-center py-2.5 rounded-full"
                  style={{ background: "#ff41b3", fontFamily: "var(--font-space-grotesk)", fontWeight: 700 }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
