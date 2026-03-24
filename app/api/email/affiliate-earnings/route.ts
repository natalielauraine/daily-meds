// Affiliate earnings update cron job — runs on the 1st of each month.
// Sends each affiliate a summary of their clicks, signups and earnings.
//
// Set up as a Vercel cron job in vercel.json:
//   { "path": "/api/email/affiliate-earnings", "schedule": "0 9 1 * *" }
// (runs at 9am UTC on the 1st of every month)
//
// Protected by CRON_SECRET header.

import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/components";
import { createClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL, FROM_NAME } from "../../../../lib/resend";
import AffiliateEarningsEmail from "../../../../emails/AffiliateEarningsEmail";

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

  // Get the previous month's name for the email subject
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthLabel = lastMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  // Fetch all affiliates with their linked user info
  const { data: affiliates, error } = await supabase
    .from("affiliates")
    .select("id, user_id, referral_code, clicks, signups, earnings")
    .gt("clicks", 0); // Only send to affiliates who have at least some activity

  if (error || !affiliates || affiliates.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  let sent = 0;

  for (const affiliate of affiliates) {
    // Get the user's email and name
    const { data: user } = await supabase
      .from("users")
      .select("email, name")
      .eq("id", affiliate.user_id)
      .single();

    if (!user?.email) continue;

    const referralUrl = `${appUrl}?ref=${affiliate.referral_code}`;

    const html = await render(
      AffiliateEarningsEmail({
        name: user.name || user.email.split("@")[0],
        month: monthLabel,
        clicks: affiliate.clicks,
        signups: affiliate.signups,
        earningsThisMonth: affiliate.earnings,  // In production, track monthly vs total separately
        totalEarnings: affiliate.earnings,
        referralCode: affiliate.referral_code,
        referralUrl,
        payoutPending: affiliate.earnings,      // In production, subtract already-paid amounts
      })
    );

    try {
      await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: user.email,
        subject: `Your Daily Meds affiliate earnings — ${monthLabel}`,
        html,
      });
      sent++;
    } catch (err) {
      console.error(`Affiliate earnings email failed for ${user.email}:`, err);
    }
  }

  return NextResponse.json({ sent, total: affiliates.length });
}

// Vercel cron sends GET requests — reuse the same handler
export const GET = POST;
