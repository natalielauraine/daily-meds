// Admin users API — returns all users for the admin users page.
// Uses service role key so it can bypass Supabase RLS and read all rows.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: users, count, error } = await supabase
    .from("users")
    .select("id, email, name, subscription_status, stripe_customer_id, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(500); // Fetch up to 500 users — add pagination later when needed

  if (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }

  return NextResponse.json({ users: users ?? [], total: count ?? 0 });
}
