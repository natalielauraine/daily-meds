// Live session reminder cron job — runs every hour, finds live sessions
// starting in the next 60 minutes, and sends reminders to all active members.
//
// Set up as a Vercel cron job in vercel.json:
//   { "path": "/api/email/live-reminder", "schedule": "0 * * * *" }
// (runs at the top of every hour)
//
// Protected by CRON_SECRET header.

import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/components";
import { createClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL, FROM_NAME } from "../../../../lib/resend";
import LiveSessionReminderEmail from "../../../../emails/LiveSessionReminderEmail";

// Tell Vercel this route must run at request time, never at build time
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Accept secret from x-cron-secret (manual calls) or Authorization: Bearer (Vercel cron)
  const authHeader = req.headers.get("authorization");
  const secret = req.headers.get("x-cron-secret") || authHeader?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";

  // Find live sessions scheduled to start in the next 55–65 minutes
  // (window avoids duplicate sends if cron runs slightly early/late)
  const now = new Date();
  const windowStart = new Date(now.getTime() + 55 * 60 * 1000);
  const windowEnd   = new Date(now.getTime() + 65 * 60 * 1000);

  const { data: liveSessions, error: sessionsError } = await supabase
    .from("live_sessions")
    .select("id, title, scheduled_at, daily_room_url, daily_room_name")
    .eq("is_live", false)                               // not yet started
    .gte("scheduled_at", windowStart.toISOString())
    .lte("scheduled_at", windowEnd.toISOString());

  if (sessionsError || !liveSessions || liveSessions.length === 0) {
    return NextResponse.json({ sent: 0, sessions: 0 });
  }

  // Fetch only Premium members (access_level 2) — live sessions are not included in Audio or Free plans
  const { data: members } = await supabase
    .from("users")
    .select("email, name")
    .eq("access_level", 2)
    .not("email", "is", null);

  if (!members || members.length === 0) {
    return NextResponse.json({ sent: 0, sessions: liveSessions.length });
  }

  let sent = 0;

  for (const session of liveSessions) {
    const scheduledAt = new Date(session.scheduled_at);

    // Format times for the email
    const startTime = scheduledAt.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
    const startDate = scheduledAt.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const joinUrl = session.daily_room_url || `${appUrl}/live`;

    // Send to each member
    for (const member of members) {
      const html = await render(
        LiveSessionReminderEmail({
          name: member.name || member.email.split("@")[0],
          sessionTitle: session.title,
          startTime,
          startDate,
          joinUrl,
          sessionDescription: "A live session with Natalie. Join from anywhere — audio or video.",
        })
      );

      try {
        await resend.emails.send({
          from: `${FROM_NAME} <${FROM_EMAIL}>`,
          to: member.email,
          subject: `🔴 Live in 1 hour: ${session.title}`,
          html,
        });
        sent++;
      } catch (err) {
        console.error(`Live reminder failed for ${member.email}:`, err);
      }
    }
  }

  return NextResponse.json({ sent, sessions: liveSessions.length, members: members.length });
}

// Vercel cron sends GET requests — reuse the same handler
export const GET = POST;
