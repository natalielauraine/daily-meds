// Affiliate click tracking API — called when someone visits the site with a ?ref= code in the URL.
// Increments the click count for the matching affiliate in Supabase.
// Uses the Supabase service role key so it can write without the visitor being logged in.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const { referralCode } = await req.json();
  if (!referralCode) {
    return NextResponse.json({ error: "No referral code" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  await supabase.rpc("increment_affiliate_clicks", { code: referralCode });

  return NextResponse.json({ ok: true });
}
