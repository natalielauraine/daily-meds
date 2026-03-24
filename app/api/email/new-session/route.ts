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
  // Allow either x-cron-secret (cron/manual) or a valid Supabase admin Bearer token (admin UI)
  const cronSecret = req.headers.get("x-cron-secret");
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.replace("Bearer ", "");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (cronSecret && cronSecret === process.env.CRON_SECRET) {
    // Authorized via cron secret — allow through
  } else if (bearerToken) {
    // Check the Bearer token is a valid Supabase session from the admin
    const { data: { user } } = await supabase.auth.getUser(bearerToken);
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
