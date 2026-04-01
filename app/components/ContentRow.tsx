import Link from "next/link";
import SessionCard, { type Session } from "./SessionCard";

type ContentRowProps = {
  title: string;          // Row heading — e.g. "Trending Right Now"
  seeAllHref: string;     // Where "See all" links to
  sessions: Session[];    // The session cards to show in this row
  badge?: string;         // Optional badge next to the title e.g. "HOT"
};

// A Netflix-style horizontal scrolling row of session cards.
// Uses the dark surface-low bg for subtle separation between rows.
export default function ContentRow({ title, seeAllHref, sessions, badge }: ContentRowProps) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-8" style={{ background: "#131313" }}>
      <div className="max-w-7xl mx-auto">

        {/* Row header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <h2
              className="uppercase"
              style={{
                fontFamily: "var(--font-plus-jakarta)",
                fontWeight: 800,
                fontSize: "15px",
                letterSpacing: "0.02em",
                color: "#E2E2E2",
              }}
            >
              {title}
            </h2>
            {/* Optional badge — e.g. "HOT" or "FREE" */}
            {badge && (
              <span
                className="text-[9px] px-2 py-0.5 rounded-full uppercase"
                style={{
                  fontFamily: "var(--font-space-grotesk)",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  background: "#ff41b3",
                  color: "white",
                }}
              >
                {badge}
              </span>
            )}
          </div>

          <Link
            href={seeAllHref}
            className="text-[10px] uppercase tracking-widest flex items-center gap-1 transition-colors duration-200 hover:text-white/70"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontWeight: 500,
              color: "rgba(255,255,255,0.35)",
            }}
          >
            See all
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
            </svg>
          </Link>
        </div>

        {/* Scrollable card row — edge fade hints more content to the right */}
        <div className="relative">
          <div
            className="flex gap-4 overflow-x-auto pb-4 no-scrollbar"
          >
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
          {/* Right-edge fade */}
          <div
            className="absolute top-0 right-0 bottom-4 w-20 pointer-events-none"
            style={{ background: "linear-gradient(to right, transparent 0%, #131313 100%)" }}
          />
        </div>
      </div>
    </section>
  );
}
