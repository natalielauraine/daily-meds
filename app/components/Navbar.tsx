"use client";

// The main navigation bar — shown on every page.
// Detects whether the user is logged in and shows different buttons accordingly.
// Mobile first: collapses into a hamburger menu on small screens.

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "../../lib/language-context";

export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();

  // Controls whether the mobile menu is open or closed
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // The currently logged-in user (null = logged out)
  const [user, setUser] = useState<User | null>(null);

  // Controls whether the user dropdown menu is open
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // On mount, get the current session and then listen for login/logout events
  useEffect(() => {
    // Get the initial session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Listen for any changes to auth state (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Clean up the listener when the component unmounts
    return () => listener.subscription.unsubscribe();
  }, []);

  // Log the user out and redirect to homepage
  async function handleLogout() {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  // Get the user's display name from their profile metadata
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Account";

  // Get the first letter of the display name to use as the avatar initial
  const avatarInitial = displayName[0]?.toUpperCase() || "U";

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0D0D1A] border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo — THE DAILY MEDS wordmark with brand colours */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {/* Lotus icon — purple gradient */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6B21E8, #8B3CF7, #6366F1, #3B82F6, #22D3EE)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C12 2 8 6 8 10C8 12.2 9.8 14 12 14C14.2 14 16 12.2 16 10C16 6 12 2 12 2Z" fill="white" opacity="0.9"/>
                <path d="M6 8C6 8 2 10 2 13C2 15.2 3.8 17 6 17C7.5 17 8.8 16.2 9.5 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8"/>
                <path d="M18 8C18 8 22 10 22 13C22 15.2 20.2 17 18 17C16.5 17 15.2 16.2 14.5 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8"/>
                <path d="M12 14C12 14 12 18 12 20C12 21.1 11.1 22 10 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
                <path d="M12 14C12 14 12 18 12 20C12 21.1 12.9 22 14 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
              </svg>
            </div>

            {/* Wordmark */}
            <span className="text-sm tracking-wide hidden sm:block" style={{ fontWeight: 500 }}>
              <span style={{ color: "#F43F5E" }}>THE </span>
              <span style={{ color: "#F97316" }}>DAILY </span>
              <span style={{ color: "#22C55E" }}>MEDS</span>
            </span>
            <span className="text-sm tracking-wide sm:hidden" style={{ fontWeight: 500 }}>
              <span style={{ color: "#F97316" }}>DAILY </span>
              <span style={{ color: "#22C55E" }}>MEDS</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-white/70 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/library" className="text-sm text-white/70 hover:text-white transition-colors">
              {t("nav", "library")}
            </Link>
            <Link href="/live" className="text-sm text-white/70 hover:text-white transition-colors">
              {t("nav", "live")}
            </Link>
            <Link href="/breathe" className="text-sm text-white/70 hover:text-white transition-colors">
              {t("nav", "breathe")}
            </Link>
            <Link href="/pricing" className="text-sm text-white/70 hover:text-white transition-colors">
              {t("nav", "pricing")}
            </Link>
            <Link href="/rooms" className="text-sm text-white/70 hover:text-white transition-colors">
              Group Meds
            </Link>
            <Link href="/crew" className="text-sm text-white/70 hover:text-white transition-colors">
              Crew
            </Link>
            <Link href="/brand-crews" className="text-sm text-white/70 hover:text-white transition-colors">
              Brand Crews
            </Link>
            <Link href="/shop" className="text-sm text-white/70 hover:text-white transition-colors">
              Shop
            </Link>
          </div>

          {/* Desktop auth area — changes based on login state */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector />
            {user ? (
              // LOGGED IN — show avatar with dropdown menu
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  aria-label="User menu"
                >
                  {/* Avatar circle with initial */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white"
                    style={{
                      background: "linear-gradient(135deg, #8B5CF6, #6366F1)",
                      fontWeight: 500,
                    }}
                  >
                    {avatarInitial}
                  </div>
                  {/* Chevron down */}
                  <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" className="text-white/50"
                    style={{ transform: userMenuOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                  >
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-11 w-48 rounded-[10px] py-2 z-50"
                    style={{
                      backgroundColor: "#1A1A2E",
                      border: "0.5px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    {/* User name + email */}
                    <div className="px-4 py-2 border-b border-white/[0.06] mb-1">
                      <p className="text-xs text-white truncate" style={{ fontWeight: 500 }}>{displayName}</p>
                      <p className="text-xs text-white/40 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/library"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Library
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/stats"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Stats
                    </Link>
                    <Link
                      href="/watchlist"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Watchlist
                    </Link>
                    <Link
                      href="/rooms"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Group Meds
                    </Link>
                    <Link
                      href="/crew"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Crew
                    </Link>

                    {/* Logout */}
                    <div className="border-t border-white/[0.06] mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // LOGGED OUT — show login + signup buttons
              <>
                <Link
                  href="/login"
                  className="text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="text-sm text-white px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
                >
                  Start free
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button
            className="md:hidden text-white/70 hover:text-white p-3"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu — slides open when hamburger is clicked */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0D0D1A] border-t border-white/[0.08] px-4 py-4 flex flex-col gap-4">
          <Link href="/" className="text-sm text-white/70 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link href="/library" className="text-sm text-white/70 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Library</Link>
          <Link href="/live" className="text-sm text-white/70 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Live</Link>
          <Link href="/free" className="text-sm text-white/70 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Free Sessions</Link>
          <Link href="/pricing" className="text-sm text-white/70 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
          <Link href="/rooms" className="text-sm text-white/70 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Group Meds</Link>
          <Link href="/crew" className="text-sm text-white/70 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Crew</Link>
          <Link href="/brand-crews" className="text-sm text-white/70 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Brand Crews</Link>
          <Link href="/shop" className="text-sm text-white/70 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Shop</Link>

          <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.08]">
            {user ? (
              // LOGGED IN mobile view
              <>
                <div className="flex items-center gap-2 py-1">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white shrink-0"
                    style={{ background: "linear-gradient(135deg, #8B5CF6, #6366F1)", fontWeight: 500 }}
                  >
                    {avatarInitial}
                  </div>
                  <span className="text-sm text-white/70 truncate">{displayName}</span>
                </div>
                <Link href="/profile" className="text-sm text-white/70 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                <Link href="/stats" className="text-sm text-white/70 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>My Stats</Link>
                <Link href="/watchlist" className="text-sm text-white/70 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Watchlist</Link>
                <button onClick={handleLogout} className="text-left text-sm text-white/50 hover:text-white transition-colors">
                  Log out
                </button>
              </>
            ) : (
              // LOGGED OUT mobile view
              <>
                <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                <Link
                  href="/signup"
                  className="text-sm text-white text-center px-4 py-2 rounded-md"
                  style={{ backgroundColor: "#8B5CF6" }}
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
