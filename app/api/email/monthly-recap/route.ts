// Monthly Recap cron — runs daily at 9am UTC.
// Finds users who subscribed exactly 30 days ago and are on a monthly plan,
// pulls their personal 30-day stats, and sends the recap + lifetime upsell.
//
// This means each user receives their recap on their own 30-day anniversary
// rather than everyone getting it on the 1st of the month.
//
// vercel.json schedule: "0 9 * * *"
// Protected by CRON_SECRET.

import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/components";
import { createClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL, FROM_NAME } from "../../../../lib/resend";
import MonthlyRecapEmail from "../../../../emails/MonthlyRecapEmail";

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

  // Target users who joined 29–30 days ago (window handles cron drift)
  const windowStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const windowEnd   = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);

  // Their 30-day stats window is from their join date until now
  const thirtyDaysAgo = windowStart.toISOString();

  // Only Monthly subscribers get the upsell (annual/lifetime are already committed)
  const { data: members, error } = await supabase
    .from("users")
    .select("id, email, name, created_at")
    .eq("subscription_status", "monthly")
    .gte("created_at", windowStart.toISOString())
    .lt("created_at", windowEnd.toISOString())
    .not("email", "is", null);

  if (error || !members || members.length === 0) {
    return NextResponse.json({ sent: 0, reason: error?.message ?? "no users in window" });
  }

  let sent = 0;

  for (const member of members) {
    try {
      // Sessions completed in their first 30 days
      const { data: sessions } = await supabase
        .from("user_sessions")
        .select("duration_minutes")
        .eq("user_id", member.id)
        .gte("completed_at", thirtyDaysAgo);

      const sessionsCount = sessions?.length ?? 0;
      const totalMinutes  = sessions?.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0) ?? 0;

      // Live sessions attended in their first 30 days
      const { count: liveAttendances } = await supabase
        .from("live_attendances")
        .select("id", { count: "exact", head: true })
        .eq("user_id", member.id)
        .gte("attended_at", thirtyDaysAgo);

      const firstName = (member.name || member.email.split("@")[0]).split(" ")[0];

      const html = await render(
        MonthlyRecapEmail({
          firstName,
          totalMinutes,
          sessionsCount,
          liveAttendances: liveAttendances ?? 0,
        })
      );

      await resend.emails.send({
        from:    `${FROM_NAME} <${FROM_EMAIL}>`,
        to:      member.email,
        subject: "Your month at The Daily Meds (Plus a special invite).",
        html,
      });

      sent++;
    } catch (err) {
      console.error(`Monthly recap failed for ${member.email}:`, err);
    }
  }

  return NextResponse.json({ sent, total: members.length });
}

export const GET = POST;
