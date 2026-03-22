// New session notification — Natalie calls this from the admin dashboard
// after publishing a new session. Sends an email to all users (or members only).
//
// Protected by ADMIN_EMAIL check — only Natalie can trigger this.
//
// POST body:
// {
//   sessionId: string,
//   sessionTitle: string,
//   moodCategory: string,
//   sessionType: string,
//   duration: string,
//   description: string,
//   isFree: boolean,
//   sendTo: "all" | "members"  — who to notify
// }

import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/components";
import { createClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL, FROM_NAME } from "../../../../lib/resend";
import NewSessionEmail from "../../../../emails/NewSessionEmail";

export async function POST(req: NextRequest) {
  // Only Natalie (admin) can trigger this — verify via CRON_SECRET header
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let body: {
    sessionId: string;
    sessionTitle: string;
    moodCategory: string;
    sessionType: string;
    duration: string;
    description: string;
    isFree: boolean;
    sendTo: "all" | "members";
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";
  const sessionUrl = `${appUrl}/session/${body.sessionId}`;

  // Fetch users to notify — all users, or only paid members
  const query = supabase.from("users").select("email, name").not("email", "is", null);
  if (body.sendTo === "members") {
    query.in("subscription_status", ["monthly", "annual", "lifetime"]);
  }
  const { data: users, error } = await query;

  if (error || !users) {
    return NextResponse.json({ error: "Could not fetch users" }, { status: 500 });
  }

  // Send in batches of 50 to stay within Resend rate limits
  const BATCH_SIZE = 50;
  let sent = 0;

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);

    await Promise.allSettled(
      batch.map(async (user) => {
        const html = await render(
          NewSessionEmail({
            sessionTitle: body.sessionTitle,
            moodCategory: body.moodCategory,
            sessionType: body.sessionType,
            duration: body.duration,
            sessionUrl,
            isFree: body.isFree,
            description: body.description,
          })
        );

        await resend.emails.send({
          from: `${FROM_NAME} <${FROM_EMAIL}>`,
          to: user.email,
          subject: `New on Daily Meds: ${body.sessionTitle}`,
          html,
        });

        sent++;
      })
    );
  }

  return NextResponse.json({ sent, total: users.length });
}
