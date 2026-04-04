// Admin users API — returns all users for the admin users page.
// Uses service role key so it can bypass Supabase RLS and read all rows.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "../../../../lib/require-admin";

export async function GET(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "100")));
  const from  = (page - 1) * limit;
  const to    = from + limit - 1;

  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: users, count, error } = await supabase
    .from("users")
    .select("id, email, name, subscription_status, stripe_customer_id, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }

  return NextResponse.json({
    users: users ?? [],
    total: count ?? 0,
    page,
    limit,
    pages: Math.ceil((count ?? 0) / limit),
  });
}
