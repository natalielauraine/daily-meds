// User activity ping — called by the app on dashboard/library page load.
// Updates last_active_at so the inactivity nudge cron knows when the user was last seen.
// Fire-and-forget: the client doesn't need to await the response.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const updates: Record<string, string> = { last_active_at: new Date().toISOString() };

  const refCode = cookieStore.get("dm_ref")?.value;
  if (refCode) {
    const { data: currentUser } = await supabase.from("users").select("referred_by").eq("id", user.id).single();
    if (currentUser && !currentUser.referred_by) {
      const { data: affiliate } = await supabase
        .from("affiliates")
        .select("user_id")
        .eq("referral_code", refCode)
        .single();
      if (affiliate?.user_id) {
        updates.referred_by = affiliate.user_id;
      }
    }
  }

  await supabase.from("users").update(updates).eq("id", user.id);

  return NextResponse.json({ ok: true });
}
