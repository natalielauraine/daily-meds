import Link from "next/link";

// Site footer — shown on every page at the bottom.
// Contains nav links, legal links, and branding.
export default function Footer() {
  return (
    <footer className="bg-[#0D0D1A] border-t border-white/[0.08] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Top section — logo + nav columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand column */}
          <div className="flex flex-col gap-4">
            {/* Wordmark */}
            <div>
              <span className="text-sm font-500 tracking-widest">
                <span style={{ color: "#F43F5E" }}>THE </span>
                <span style={{ color: "#F97316" }}>DAILY </span>
                <span style={{ color: "#22C55E" }}>MEDS</span>
              </span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed max-w-[200px]">
              Audio for emotional emergencies. Meditation for life's most awkward moments.
            </p>
            <p className="text-xs text-white/30">
              By Natalie Lauraine
            </p>
          </div>

          {/* Explore column */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs text-white/50 uppercase tracking-widest mb-1">Explore</h4>
            <Link href="/library" className="text-sm text-white/60 hover:text-white transition-colors">Library</Link>
            <Link href="/live" className="text-sm text-white/60 hover:text-white transition-colors">Live Sessions</Link>
            <Link href="/free" className="text-sm text-white/60 hover:text-white transition-colors">Free Sessions</Link>
            <Link href="/breathe" className="text-sm text-white/60 hover:text-white transition-colors">Breathing Timer</Link>
          </div>

          {/* Account column */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs text-white/50 uppercase tracking-widest mb-1">Account</h4>
            <Link href="/pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link>
            <Link href="/signup" className="text-sm text-white/60 hover:text-white transition-colors">Sign Up</Link>
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">Log In</Link>
            <Link href="/affiliate" className="text-sm text-white/60 hover:text-white transition-colors">Affiliates</Link>
          </div>

          {/* About column */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs text-white/50 uppercase tracking-widest mb-1">About</h4>
            <Link href="/about" className="text-sm text-white/60 hover:text-white transition-colors">About Natalie</Link>
            <Link href="/testimonials" className="text-sm text-white/60 hover:text-white transition-colors">Testimonials</Link>
            <Link href="/shop" className="text-sm text-white/60 hover:text-white transition-colors">Shop</Link>
          </div>
        </div>

        {/* Bottom bar — copyright + legal */}
        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Daily Meds. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
