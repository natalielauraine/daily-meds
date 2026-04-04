"use client";

// Shared admin layout — wraps every admin page with a sidebar nav and top bar.
// Only Natalie's email (set in ADMIN_EMAIL env var) can reach these pages,
// enforced by middleware.ts. This component adds the visual chrome.

import Link from "next/link";
import { usePathname } from "next/navigation";

// All admin nav items — new sections get added here
const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
      </svg>
    ),
  },
  {
    href: "/admin/content",
    label: "Sessions",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
      </svg>
    ),
  },
  {
    href: "/admin/live",
    label: "Live",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="4"/>
        <path d="M6.34 6.34a8 8 0 0 0 0 11.32l1.41-1.41a6 6 0 0 1 0-8.49L6.34 6.34zm11.32 0l-1.41 1.41a6 6 0 0 1 0 8.49l1.41 1.41a8 8 0 0 0 0-11.31z"/>
      </svg>
    ),
  },
  {
    href: "/admin/podcasts",
    label: "Podcasts",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>
    ),
  },
  {
    href: "/admin/social",
    label: "Social Sharing",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
      </svg>
    ),
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if a nav item is the active page
  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#131313" }}>

      {/* ── SIDEBAR ────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-56 shrink-0 py-6 px-3"
        style={{
          backgroundColor: "#1F1F1F",
          borderRight: "0.5px solid rgba(255,255,255,0.08)",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        {/* Logo + brand */}
        <Link href="/" className="flex items-center gap-2.5 px-3 mb-8">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)" }}
          >
            <svg width="14" height="14" viewBox="0 0 48 48" fill="none">
              <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.95"/>
              <path d="M24 28L20 35" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M24 28L28 35" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-white text-xs leading-none" style={{ fontWeight: 500 }}>Daily Meds</p>
            <p className="text-white/30 text-[10px] mt-0.5">Admin</p>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={{
                color: isActive(item.href) ? "white" : "rgba(255,255,255,0.4)",
                backgroundColor: isActive(item.href) ? "rgba(255,65,179,0.15)" : "transparent",
                fontWeight: isActive(item.href) ? 500 : 400,
              }}
            >
              <span style={{ color: isActive(item.href) ? "#ff41b3" : "rgba(255,255,255,0.3)" }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom: view site link */}
        <div className="mt-auto px-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-white/25 hover:text-white/50 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
            </svg>
            View site
          </Link>
        </div>
      </aside>

      {/* ── MOBILE TOP BAR ─────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: "#1F1F1F", borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}
      >
        <Link href="/admin" className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)" }}
          >
            <svg width="12" height="12" viewBox="0 0 48 48" fill="none">
              <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.95"/>
            </svg>
          </div>
          <span className="text-white text-sm" style={{ fontWeight: 500 }}>Admin</span>
        </Link>
        {/* Mobile nav pills */}
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="p-2 rounded-lg transition-colors"
              style={{
                color: isActive(item.href) ? "#ff41b3" : "rgba(255,255,255,0.3)",
                backgroundColor: isActive(item.href) ? "rgba(255,65,179,0.15)" : "transparent",
              }}
              aria-label={item.label}
            >
              {item.icon}
            </Link>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ──────────────────────────────────── */}
      <main className="flex-1 md:overflow-y-auto pt-16 md:pt-0">
        {children}
      </main>

    </div>
  );
}
