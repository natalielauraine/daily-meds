"use client";

// Friends activity feed — shows what your friends have been listening to recently.
// This is opt-in sharing (users can turn it off in profile settings).
// Currently uses mock data — will connect to Supabase user_activity table later.

import Link from "next/link";

type ActivityItem = {
  id: string;
  friendName: string;
  friendInitial: string;
  gradientColor: string;
  action: string;         // e.g. "completed", "started"
  sessionTitle: string;
  sessionId: string;
  sessionGradient: string;
  minutesAgo: number;
};

// Mock friend activity — replace with Supabase realtime query later
const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: "1",
    friendName: "Sarah",
    friendInitial: "S",
    gradientColor: "#ff41b3",
    action: "completed",
    sessionTitle: "Anxiety First Aid",
    sessionId: "4",
    sessionGradient: "linear-gradient(135deg, #ec723d, #f4e71d)",
    minutesAgo: 4,
  },
  {
    id: "2",
    friendName: "Jess",
    friendInitial: "J",
    gradientColor: "#adf225",
    action: "started",
    sessionTitle: "3am Brain",
    sessionId: "3",
    sessionGradient: "linear-gradient(135deg, #ff41b3, #adf225)",
    minutesAgo: 12,
  },
  {
    id: "3",
    friendName: "Rach",
    friendInitial: "R",
    gradientColor: "#ff41b3",
    action: "completed",
    sessionTitle: "Come Down Slowly",
    sessionId: "2",
    sessionGradient: "linear-gradient(135deg, #adf225, #f4e71d)",
    minutesAgo: 31,
  },
  {
    id: "4",
    friendName: "Mia",
    friendInitial: "M",
    gradientColor: "#ec723d",
    action: "completed",
    sessionTitle: "Hungover & Overwhelmed",
    sessionId: "1",
    sessionGradient: "linear-gradient(135deg, #ff41b3, #ec723d)",
    minutesAgo: 58,
  },
];

function timeAgo(minutes: number): string {
  if (minutes < 60) return `${minutes}m ago`;
  const h = Math.floor(minutes / 60);
  return `${h}h ago`;
}

type Props = {
  // How many items to show — default shows all
  limit?: number;
};

export default function FriendsActivityFeed({ limit = 4 }: Props) {
  const items = MOCK_ACTIVITY.slice(0, limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm text-white/50" style={{ fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "11px" }}>
          Friends
        </h2>
        <Link href="/rooms" className="text-xs text-white/30 hover:text-white/60 transition-colors">
          Group rooms →
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/session/${item.sessionId}`}
            className="flex items-center gap-3 px-3 py-3 rounded-[10px] hover:bg-white/[0.03] transition-colors"
            style={{ border: "0.5px solid rgba(255,255,255,0.05)" }}
          >
            {/* Friend avatar */}
            <div
              className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs text-white"
              style={{ background: item.gradientColor, fontWeight: 500 }}
            >
              {item.friendInitial}
            </div>

            {/* Activity text */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/60 leading-snug">
                <span style={{ fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>{item.friendName}</span>
                {" "}{item.action}{" "}
                <span style={{ color: "rgba(255,255,255,0.7)" }}>{item.sessionTitle}</span>
              </p>
              <p className="text-[11px] text-white/25 mt-0.5">{timeAgo(item.minutesAgo)}</p>
            </div>

            {/* Session gradient dot */}
            <div
              className="w-7 h-7 rounded-full shrink-0"
              style={{ background: item.sessionGradient }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
