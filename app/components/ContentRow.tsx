import Link from "next/link";
import SessionCard, { type Session } from "./SessionCard";

type ContentRowProps = {
  title: string;          // Row heading — e.g. "Featured", "Free Sessions"
  seeAllHref: string;     // Where "See all" links to
  sessions: Session[];    // The session cards to show in this row
};

// A Netflix-style horizontal scrolling row of session cards.
// Reusable — pass in any title and list of sessions.
export default function ContentRow({ title, seeAllHref, sessions }: ContentRowProps) {
  return (
    <section className="bg-[#0D0D1A] px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">

        {/* Row header: title on left, "See all" on right */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base text-white" style={{ fontWeight: 500 }}>{title}</h2>
          <Link
            href={seeAllHref}
            className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
          >
            See all
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
            </svg>
          </Link>
        </div>

        {/* Scrollable card row — right fade hints that more cards exist off-screen */}
        <div className="relative">
          <div
            className="flex gap-4 overflow-x-auto pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
          {/* Right-edge fade — suggests more content to scroll to */}
          <div
            className="absolute top-0 right-0 bottom-4 w-16 pointer-events-none"
            style={{ background: "linear-gradient(to right, transparent 0%, #0D0D1A 100%)" }}
          />
        </div>
      </div>
    </section>
  );
}
