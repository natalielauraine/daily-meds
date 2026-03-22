// Supabase auth webhook — called by Supabase when a new user signs up.
// Sends the welcome email via Resend.
//
// HOW TO SET THIS UP IN SUPABASE:
// 1. Go to your Supabase dashboard → Database → Webhooks
// 2. Create a new webhook:
//    - Name: "on_user_signup"
//    - Table: auth.users
//    - Events: INSERT
//    - URL: https://thedailymeds.com/api/webhooks/supabase-auth
//    - HTTP method: POST
//    - Add header: Authorization: Bearer <your SUPABASE_WEBHOOK_SECRET>

import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/components";
import { resend, FROM_EMAIL, FROM_NAME } from "../../../../lib/resend";
import WelcomeEmail from "../../../../emails/WelcomeEmail";

export async function POST(req: NextRequest) {
  // Verify the request is from Supabase using a shared secret
  const authHeader = req.headers.get("authorization");
  const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;

  if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { record?: { email?: string; raw_user_meta_data?: { full_name?: string; name?: string } } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const user = body.record;
  if (!user?.email) {
    return NextResponse.json({ error: "No user email in payload" }, { status: 400 });
  }

  const email = user.email;
  const name =
    user.raw_user_meta_data?.full_name ||
    user.raw_user_meta_data?.name ||
    email.split("@")[0] ||
    "there";

  try {
    const html = await render(WelcomeEmail({ name, email }));

    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Welcome to Daily Meds, ${name.split(" ")[0]} 🎧`,
      html,
    });

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("Welcome email failed:", err);
    return NextResponse.json({ error: "Email send failed" }, { status: 500 });
  }
}
