// Supabase "Send Email" auth hook — intercepts all Supabase auth emails
// (signup confirmation, password reset, magic link, invite) and sends them
// through Resend instead of Supabase's built-in mailer.
//
// HOW TO CONFIGURE IN SUPABASE:
// 1. Authentication → Hooks → "Send Email" hook
// 2. Set URL to: https://thedailymeds.com/api/auth/send-email
// 3. Set the hook secret to the value of SUPABASE_WEBHOOK_SECRET in your env
// 4. Disable the default SMTP (Authentication → Settings → SMTP) — this hook replaces it

import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/components";
import { resend, FROM_EMAIL, FROM_NAME } from "../../../../lib/resend";
import ConfirmationEmail from "../../../../emails/ConfirmationEmail";

// Maps Supabase's email_action_type to the OTP type used in /auth/callback
const OTP_TYPE_MAP: Record<string, string> = {
  signup: "email",
  recovery: "recovery",
  magic_link: "magiclink",
  email_change: "email_change",
  invite: "invite",
};

const EMAIL_SUBJECTS: Record<string, string> = {
  signup: "Confirm your Daily Meds account",
  recovery: "Reset your Daily Meds password",
  magic_link: "Your Daily Meds sign-in link",
  email_change: "Confirm your new email address",
  invite: "You've been invited to Daily Meds",
};

type HookPayload = {
  user: {
    email: string;
  };
  email_data: {
    token_hash: string;
    redirect_to?: string;
    email_action_type: string;
    site_url: string;
    token_hash_new?: string;
  };
};

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const webhookSecret = process.env.SUPABASE_AUTH_HOOK_SECRET;

  if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: HookPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { user, email_data } = payload;
  if (!user?.email || !email_data?.token_hash) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const actionType = email_data.email_action_type;
  const otpType = OTP_TYPE_MAP[actionType] ?? "email";
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || email_data.site_url || "https://thedailymeds.com";

  const confirmUrl = `${siteUrl}/auth/callback?token_hash=${email_data.token_hash}&type=${otpType}`;

  const templateType = (["signup", "recovery", "magic_link", "invite"].includes(actionType)
    ? actionType
    : "signup") as "signup" | "recovery" | "magic_link" | "invite";

  try {
    const html = await render(
      ConfirmationEmail({ type: templateType, confirmUrl, email: user.email })
    );

    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: user.email,
      subject: EMAIL_SUBJECTS[actionType] ?? "Action required — Daily Meds",
      html,
    });

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("Auth email send failed:", err);
    return NextResponse.json({ error: "Email send failed" }, { status: 500 });
  }
}
