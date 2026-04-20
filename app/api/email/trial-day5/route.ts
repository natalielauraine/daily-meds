// Trial Day 5 reminder cron — runs daily, finds users whose trial ends in ~48 hours,
// and sends the "Your trial update" reminder email.
//
// Set up as a Vercel cron job in vercel.json:
//   { "path": "/api/email/trial-day5", "schedule": "0 9 * * *" }
// (runs at 9am UTC every day)
//
// Protected by CRON_SECRET header.

import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/components";
import { createClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL, FROM_NAME } from "../../../../lib/resend";
import TrialDay5Email from "../../../../emails/TrialDay5Email";

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

  // Find users whose trial ends between 44 and 52 hours from now.
  // The window prevents duplicate sends if cron runs slightly early/late.
  const now = new Date();
  const windowStart = new Date(now.getTime() + 44 * 60 * 60 * 1000);
  const windowEnd   = new Date(now.getTime() + 52 * 60 * 60 * 1000);

  // We store trial_ends_at on the users table when the trial starts.
  // If that column doesn't exist yet, run:
  //   alter table users add column if not exists trial_ends_at timestamptz;
  const { data: trialUsers, error } = await supabase
    .from("users")
    .select("email, name, trial_ends_at")
    .eq("subscription_status", "trial")
    .gte("trial_ends_at", windowStart.toISOString())
    .lte("trial_ends_at", windowEnd.toISOString());

  if (error || !trialUsers || trialUsers.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  let sent = 0;

  for (const user of trialUsers) {
    const firstName   = (user.name || user.email.split("@")[0]).split(" ")[0];
    const trialEndDate = new Date(user.trial_ends_at).toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

    try {
      const html = await render(TrialDay5Email({ firstName, trialEndDate }));

      await resend.emails.send({
        from:    `${FROM_NAME} <${FROM_EMAIL}>`,
        to:      user.email,
        subject: "Your trial update: Keeping your toolkit open.",
        html,
      });

      sent++;
    } catch (err) {
      console.error(`Trial day 5 email failed for ${user.email}:`, err);
    }
  }

  return NextResponse.json({ sent, total: trialUsers.length });
}

export const GET = POST;
