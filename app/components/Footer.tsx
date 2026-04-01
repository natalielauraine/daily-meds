import Link from "next/link";
import Logo from "./Logo";

// Site footer — shown on every page at the bottom.
// Dark surface with neon pink → orange wordmark gradient.
export default function Footer() {
  return (
    <footer
      className="mt-auto"
      style={{ background: "#0e0e0e", borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Top section — brand column + nav columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand column */}
          <div className="flex flex-col gap-4">
            <Logo href="/" size="sm" />

            <p
              className="text-xs leading-relaxed max-w-[200px]"
              style={{ fontFamily: "var(--font-inter)", color: "rgba(255,255,255,0.35)" }}
            >
              Audio for emotional emergencies. Meditation for life&apos;s most awkward moments.
            </p>
            <p
              className="text-xs"
              style={{ fontFamily: "var(--font-space-grotesk)", color: "rgba(255,255,255,0.25)" }}
            >
              By Natalie Lauraine
            </p>
          </div>

          {/* Explore column */}
          <div className="flex flex-col gap-3">
            <h4
              className="text-[10px] uppercase tracking-widest mb-1"
              style={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 700, color: "rgba(255,255,255,0.35)" }}
            >
              Explore
            </h4>
            {[
              { href: "/library", label: "Library" },
              { href: "/live", label: "Live Sessions" },
              { href: "/free", label: "Free Sessions" },
              { href: "/timer", label: "Breathing Timer" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm transition-colors hover:text-white/80"
                style={{ fontFamily: "var(--font-inter)", color: "rgba(255,255,255,0.5)" }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Account column */}
          <div className="flex flex-col gap-3">
            <h4
              className="text-[10px] uppercase tracking-widest mb-1"
              style={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 700, color: "rgba(255,255,255,0.35)" }}
            >
              Account
            </h4>
            {[
              { href: "/pricing", label: "Pricing" },
              { href: "/signup", label: "Sign Up" },
              { href: "/login", label: "Log In" },
              { href: "/affiliate", label: "Affiliates" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm transition-colors hover:text-white/80"
                style={{ fontFamily: "var(--font-inter)", color: "rgba(255,255,255,0.5)" }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* About column */}
          <div className="flex flex-col gap-3">
            <h4
              className="text-[10px] uppercase tracking-widest mb-1"
              style={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 700, color: "rgba(255,255,255,0.35)" }}
            >
              About
            </h4>
            {[
              { href: "/about", label: "About Natalie" },
              { href: "/testimonials", label: "Testimonials" },
              { href: "/review", label: "Leave a review" },
              { href: "/shop", label: "Shop" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm transition-colors hover:text-white/80"
                style={{ fontFamily: "var(--font-inter)", color: "rgba(255,255,255,0.5)" }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar — copyright + legal */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p
            className="text-xs"
            style={{ fontFamily: "var(--font-space-grotesk)", color: "rgba(255,255,255,0.25)" }}
          >
            &copy; {new Date().getFullYear()} The Daily Meds. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="text-xs transition-colors hover:text-white/50"
              style={{ fontFamily: "var(--font-space-grotesk)", color: "rgba(255,255,255,0.25)" }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs transition-colors hover:text-white/50"
              style={{ fontFamily: "var(--font-space-grotesk)", color: "rgba(255,255,255,0.25)" }}
            >
              Terms of Use
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
