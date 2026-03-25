// Types and helpers for the Group Meds feature.
// Group Meds = scheduled group meditation sessions where all participants
// start the same meditation at the same time, synced via Supabase realtime.
//
// ─────────────────────────────────────────────────────────────────────────────
// SUPABASE SETUP — run this SQL in your Supabase SQL Editor before using this feature:
// ─────────────────────────────────────────────────────────────────────────────
//
// create table if not exists group_sessions (
//   id               uuid default gen_random_uuid() primary key,
//   title            text not null,
//   host_id          uuid references users(id) on delete cascade,
//   host_name        text not null,
//   session_id       uuid references sessions(id) on delete set null,
//   session_title    text,
//   scheduled_at     timestamptz not null,
//   duration_minutes integer not null default 10,
//   max_participants integer not null default 50,
//   is_public        boolean not null default true,
//   invite_code      text unique,
//   status           text not null default 'scheduled',
//   gradient         text,
//   created_at       timestamptz default now()
// );
//
// create table if not exists group_session_participants (
//   id               uuid default gen_random_uuid() primary key,
//   group_session_id uuid references group_sessions(id) on delete cascade,
//   user_id          uuid references users(id) on delete cascade,
//   display_name     text not null,
//   avatar_url       text,
//   joined_at        timestamptz default now(),
//   completed        boolean default false,
//   unique(group_session_id, user_id)
// );
//
// -- Row Level Security
// alter table group_sessions enable row level security;
// alter table group_session_participants enable row level security;
//
// create policy "Public sessions readable by all" on group_sessions
//   for select using (is_public = true or auth.uid() = host_id or
//     exists (select 1 from group_session_participants where group_session_id = id and user_id = auth.uid()));
//
// create policy "Logged in users can create sessions" on group_sessions
//   for insert with check (auth.uid() = host_id);
//
// create policy "Participants and hosts can update sessions" on group_sessions
//   for update using (auth.uid() = host_id or
//     exists (select 1 from group_session_participants where group_session_id = id and user_id = auth.uid()));
//
// create policy "Participants readable by all" on group_session_participants
//   for select using (true);
//
// create policy "Users can join sessions" on group_session_participants
//   for insert with check (auth.uid() = user_id);
//
// create policy "Users can update own participation" on group_session_participants
//   for update using (auth.uid() = user_id);
//
// create policy "Users can leave sessions" on group_session_participants
//   for delete using (auth.uid() = user_id);
//
// -- Enable realtime on both tables (required for live participant list)
// alter publication supabase_realtime add table group_sessions;
// alter publication supabase_realtime add table group_session_participants;
// ─────────────────────────────────────────────────────────────────────────────

export type GroupSession = {
  id: string;
  title: string;
  host_id: string;
  host_name: string;
  session_id: string | null;       // null = timer-only, no audio track
  session_title: string | null;    // denormalized for display without extra query
  scheduled_at: string;            // ISO datetime string
  duration_minutes: number;
  max_participants: number;
  is_public: boolean;
  invite_code: string | null;      // 6-char code shown on private sessions
  status: "scheduled" | "active" | "completed";
  gradient: string | null;         // CSS gradient string for the card colour
  created_at: string;
};

export type GroupParticipant = {
  id: string;
  group_session_id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  joined_at: string;
  completed: boolean;
};

// Generates a random 6-character invite code for private sessions (e.g. "A3K9X2")
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// Formats an ISO datetime as "Thursday 3 April at 7:30pm"
export function formatSessionTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Returns whole seconds until a scheduled time (negative if already passed)
export function secondsUntil(iso: string): number {
  return Math.floor((new Date(iso).getTime() - Date.now()) / 1000);
}

// Formats a seconds count as "2h 30m" (before start) or "9:42" (during session)
export function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
