// Inactivity nudge cron job — runs daily at 9am.
// Finds users whose last_active_at was exactly 4 days ago (±30 min window)
// and sends them a nudge email to come back for a 5-minute reset.
//
// last_active_at is updated in two places:
//   1. lib/player-context.tsx — whenever a user plays an audio session
//   2. app/api/user/ping/route.ts  — called by the app on dashboard load (login signal)
//
// Vercel cron config in vercel.json:
//   { "path": "/api/email/inactivity-nudge", "schedule": "0 9 * * *" }

import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/components";
import { createClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL, FROM_NAME } from "../../../../lib/resend";
import InactivityNudgeEmail from "../../../../emails/InactivityNudgeEmail";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const secret = req.headers.get("x-cron-secret") || authHeader?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 4 days ago ± 30 minutes — window avoids double-sends if cron runs slightly off-schedule
  const now = new Date();
  const windowEnd   = new Date(now.getTime() - (4 * 24 * 60 - 30) * 60 * 1000); // 3d 23h 30m ago
  const windowStart = new Date(now.getTime() - (4 * 24 * 60 + 30) * 60 * 1000); // 4d 0h 30m ago

  const { data: users, error } = await supabase
    .from("users")
    .select("email, name, subscription_status")
    .gte("last_active_at", windowStart.toISOString())
    .lte("last_active_at", windowEnd.toISOString())
    .not("email", "is", null);

  if (error || !users || users.length === 0) {
    return NextResponse.json({ sent: 0, users: 0 });
  }

  let sent = 0;

  for (const user of users) {
    const firstName = (user.name || user.email.split("@")[0]).split(" ")[0];

    try {
      const html = await render(InactivityNudgeEmail({ firstName }));

      await resend.emails.send({
        from:    `${FROM_NAME} <${FROM_EMAIL}>`,
        to:      user.email,
        subject: "A 5-minute reset?",
        html,
      });

      sent++;
    } catch (err) {
      console.error(`Inactivity nudge failed for ${user.email}:`, err);
    }
  }

  return NextResponse.json({ sent, users: users.length });
}

// Vercel cron sends GET — reuse the same handler
export const GET = POST;
