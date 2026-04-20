// Artist Partner Programme application API.
// Called when someone submits the artist affiliate application form at /affiliate.
// Creates or updates their affiliate record to affiliate_type='artist' with status='pending'.
// Artist affiliates earn 20% commission once approved (standard is 10%, auto-approved).
//
// Requires this SQL migration in Supabase before deploying:
//   alter table affiliates add column if not exists affiliate_type text not null default 'standard';

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "You must be logged in to apply." }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, platform, audienceSize, whyJoin } = body;

  if (!name || !email || !platform) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // Check if they already have an affiliate record
  const { data: existing } = await supabase
    .from("affiliates")
    .select("id, affiliate_type, status")
    .eq("user_id", user.id)
    .single();

  const applicationFields = {
    affiliate_type:            "artist",
    status:                    "pending",
    application_name:          name,
    application_email:         email,
    application_platform:      platform,
    application_audience_size: audienceSize,
    application_why:           whyJoin ?? "",
  };

  if (existing) {
    // Block re-application if already an artist with a pending or approved application
    if (existing.affiliate_type === "artist" && existing.status !== "rejected") {
      return NextResponse.json({ error: "You have already applied for the Artist Partner Programme." }, { status: 409 });
    }

    // Upgrade their existing standard record to artist pending
    const { error } = await supabase
      .from("affiliates")
      .update(applicationFields)
      .eq("id", existing.id);

    if (error) {
      console.error("Artist application update error:", error);
      return NextResponse.json({ error: "Failed to save application. Please try again." }, { status: 500 });
    }
  } else {
    // No affiliate record yet — create a new artist one
    const referralCode = user.id.replace(/-/g, "").substring(0, 8);

    const { error } = await supabase.from("affiliates").insert({
      user_id:      user.id,
      referral_code: referralCode,
      clicks:       0,
      signups:      0,
      earnings:     0,
      paid_out:     0,
      ...applicationFields,
    });

    if (error) {
      console.error("Artist application insert error:", error);
      return NextResponse.json({ error: "Failed to save application. Please try again." }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
