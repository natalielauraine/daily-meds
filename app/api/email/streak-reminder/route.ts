// Streak reminder cron job — runs daily, finds users inactive for 3+ days,
// and sends them a gentle nudge email.
//
// Set up as a Vercel cron job in vercel.json:
//   { "path": "/api/email/streak-reminder", "schedule": "0 9 * * *" }
// (runs at 9am UTC every day)
//
// Protected by CRON_SECRET header — Vercel sends this automatically.

import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/components";
import { createClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL, FROM_NAME } from "../../../../lib/resend";
import StreakReminderEmail from "../../../../emails/StreakReminderEmail";

// Fallback suggested session — used when we can't find a personalised suggestion
const DEFAULT_SESSION = {
  title: "Anxiety First Aid",
  id: "4",
  mood: "Anxious",
};

export async function POST(req: NextRequest) {
  // Verify this is being called by Vercel cron (or our own test call)
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";

  // Find users whose last session was 3–7 days ago (don't spam people who've been
  // away for weeks — they've made their choice)
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Get the last session for each user from user_progress
  const { data: inactiveUsers, error } = await supabase
    .from("user_progress")
    .select("user_id, updated_at")
    .lt("updated_at", threeDaysAgo.toISOString())
    .gt("updated_at", sevenDaysAgo.toISOString())
    .order("updated_at", { ascending: false });

  if (error || !inactiveUsers) {
    return NextResponse.json({ error: "Could not fetch users" }, { status: 500 });
  }

  // Deduplicate — keep only the most recent record per user
  const uniqueUsers = new Map<string, typeof inactiveUsers[0]>();
  for (const row of inactiveUsers) {
    if (!uniqueUsers.has(row.user_id)) {
      uniqueUsers.set(row.user_id, row);
    }
  }

  let sent = 0;

  for (const [userId, progress] of Array.from(uniqueUsers)) {
    // Fetch user's email and name
    const { data: user } = await supabase
      .from("users")
      .select("email, name")
      .eq("id", userId)
      .single();

    if (!user?.email) continue;

    const lastDate = new Date(progress.updated_at);
    const now = new Date();
    const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    const html = await render(
      StreakReminderEmail({
        name: user.name || user.email.split("@")[0],
        daysSinceLastSession: daysSince,
        currentStreak: 0, // Streak calculation would need additional logic
        suggestedSessionTitle: DEFAULT_SESSION.title,
        suggestedSessionUrl: `${appUrl}/session/${DEFAULT_SESSION.id}`,
        suggestedMood: DEFAULT_SESSION.mood,
      })
    );

    try {
      await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: user.email,
        subject: daysSince === 3 ? "It's been a few days…" : "We've been thinking about you.",
        html,
      });
      sent++;
    } catch (err) {
      console.error(`Streak reminder failed for ${user.email}:`, err);
    }
  }

  return NextResponse.json({ sent, found: uniqueUsers.size });
}
