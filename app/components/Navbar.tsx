"use client";

import Link from "next/link";
import { useState } from "react";

// The main navigation bar — shown on every page.
// Mobile first: collapses into a hamburger menu on small screens.
export default function Navbar() {
  // Controls whether the mobile menu is open or closed
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0D0D1A] border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo — THE DAILY MEDS wordmark with brand colours */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {/* Lotus icon — purple gradient */}
            <div className="w-8 h-8 rounded-full gradient-purple flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C12 2 8 6 8 10C8 12.2 9.8 14 12 14C14.2 14 16 12.2 16 10C16 6 12 2 12 2Z" fill="white" opacity="0.9"/>
                <path d="M6 8C6 8 2 10 2 13C2 15.2 3.8 17 6 17C7.5 17 8.8 16.2 9.5 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8"/>
                <path d="M18 8C18 8 22 10 22 13C22 15.2 20.2 17 18 17C16.5 17 15.2 16.2 14.5 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8"/>
                <path d="M12 14C12 14 12 18 12 20C12 21.1 11.1 22 10 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
                <path d="M12 14C12 14 12 18 12 20C12 21.1 12.9 22 14 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
              </svg>
            </div>

            {/* Wordmark */}
            <span className="text-sm font-500 tracking-wide hidden sm:block">
              <span style={{ color: "#F43F5E" }}>THE </span>
              <span style={{ color: "#F97316" }}>DAILY </span>
              <span style={{ color: "#22C55E" }}>MEDS</span>
            </span>
            <span className="text-sm font-500 tracking-wide sm:hidden">
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
              Library
            </Link>
            <Link href="/live" className="text-sm text-white/70 hover:text-white transition-colors">
              Live
            </Link>
            <Link href="/free" className="text-sm text-white/70 hover:text-white transition-colors">
              Free Sessions
            </Link>
            <Link href="/pricing" className="text-sm text-white/70 hover:text-white transition-colors">
              Pricing
            </Link>
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-purple-accent text-white px-4 py-1.5 rounded-md hover:bg-purple-mid transition-colors"
              style={{ backgroundColor: "#8B5CF6" }}
            >
              Start free
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <button
            className="md:hidden text-white/70 hover:text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              // X icon when menu is open
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            ) : (
              // Hamburger icon when menu is closed
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
          <Link
            href="/"
            className="text-sm text-white/70 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/library"
            className="text-sm text-white/70 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Library
          </Link>
          <Link
            href="/live"
            className="text-sm text-white/70 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Live
          </Link>
          <Link
            href="/free"
            className="text-sm text-white/70 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Free Sessions
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-white/70 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Pricing
          </Link>
          <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.08]">
            <Link
              href="/login"
              className="text-sm text-white/70 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm text-white text-center px-4 py-2 rounded-md"
              style={{ backgroundColor: "#8B5CF6" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Start free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
