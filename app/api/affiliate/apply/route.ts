// Affiliate application API — saves a new affiliate application to Supabase.
// Called from the /affiliate page when someone submits the application form.
// Creates a record in the affiliates table with status "pending".
// The referral_code is the first 8 characters of the user's Supabase ID.

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

  // Get the logged-in user — they must be signed in to apply
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "You must be logged in to apply." }, { status: 401 });
  }

  // Parse form fields from the request body
  const body = await req.json();
  const { name, email, platform, audienceSize, whyJoin } = body;

  if (!name || !email || !platform || !whyJoin) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // Check if they've already applied — don't create a duplicate
  const { data: existing } = await supabase
    .from("affiliates")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "You have already applied." }, { status: 409 });
  }

  // Create the affiliate record with a short referral code based on their user ID
  const referralCode = user.id.replace(/-/g, "").substring(0, 8);

  const { error } = await supabase.from("affiliates").insert({
    user_id: user.id,
    referral_code: referralCode,
    status: "pending",
    clicks: 0,
    signups: 0,
    earnings: 0,
    paid_out: 0,
    // Store application details as extra metadata
    application_name: name,
    application_email: email,
    application_platform: platform,
    application_audience_size: audienceSize,
    application_why: whyJoin,
  });

  if (error) {
    console.error("Affiliate apply error:", error);
    return NextResponse.json({ error: "Failed to save application. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
