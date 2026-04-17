// Going Live blast — sends the 15-minute heads-up to all Premium/Annual/Lifetime
// members. Called from the admin panel when Natalie is about to go live.
//
// POST /api/email/going-live
// Headers: x-cron-secret: <CRON_SECRET>
// Body: { liveUrl?: string }  — optional override, defaults to /live

import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/components";
import { createClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL, FROM_NAME } from "../../../../lib/resend";
import GoingLiveEmail from "../../../../emails/GoingLiveEmail";

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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";

  let liveUrl = `${appUrl}/live`;
  try {
    const body = await req.json();
    if (body?.liveUrl) liveUrl = body.liveUrl;
  } catch {
    // no body — use default
  }

  // Send only to access_level 2 (Premium / Annual / Lifetime / Trial)
  const { data: members, error } = await supabase
    .from("users")
    .select("email, name")
    .eq("access_level", 2)
    .not("email", "is", null);

  if (error || !members || members.length === 0) {
    return NextResponse.json({ sent: 0, members: 0 });
  }

  let sent = 0;

  for (const member of members) {
    const firstName = (member.name || member.email.split("@")[0]).split(" ")[0];

    try {
      const html = await render(GoingLiveEmail({ firstName, liveUrl }));

      await resend.emails.send({
        from:    `${FROM_NAME} <${FROM_EMAIL}>`,
        to:      member.email,
        subject: "We're going live in 15 minutes. Join us?",
        html,
      });

      sent++;
    } catch (err) {
      console.error(`Going live email failed for ${member.email}:`, err);
    }
  }

  return NextResponse.json({ sent, members: members.length });
}
