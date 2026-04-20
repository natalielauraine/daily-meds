// Auto-enroll every new user as a standard affiliate.
// Called after signup (email or Google OAuth) — no application required.
// Creates a record with status='approved' and affiliate_type='standard'.
// If the user already has a record, returns it immediately.
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
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  // Return existing record if they're already enrolled
  const { data: existing } = await supabase
    .from("affiliates")
    .select("id, referral_code, affiliate_type, status")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return NextResponse.json(existing);
  }

  // Generate a unique referral code from their user ID (first 8 hex chars)
  const referralCode = user.id.replace(/-/g, "").substring(0, 8);

  const { data, error } = await supabase
    .from("affiliates")
    .insert({
      user_id:        user.id,
      referral_code:  referralCode,
      status:         "approved",
      affiliate_type: "standard",
      clicks:         0,
      signups:        0,
      earnings:       0,
      paid_out:       0,
    })
    .select("id, referral_code, affiliate_type, status")
    .single();

  if (error) {
    console.error("Auto-enroll error:", error);
    return NextResponse.json({ error: "Failed to create affiliate record" }, { status: 500 });
  }

  return NextResponse.json(data);
}
