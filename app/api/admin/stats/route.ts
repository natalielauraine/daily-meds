// Admin stats API — returns counts for the dashboard overview.
// Uses the Supabase service role key so it can query all users regardless of RLS.
// Only the admin can reach this via the ADMIN_EMAIL check in middleware.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "../../../../lib/require-admin";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // Run all queries in parallel for speed
  const [
    { count: totalUsers },
    { count: monthlyMembers },
    { count: annualMembers },
    { count: lifetimeMembers },
    { count: freeUsers },
    { count: totalSessions },
    { count: freeSessions },
    { count: premiumSessions },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("subscription_status", "monthly"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("subscription_status", "annual"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("subscription_status", "lifetime"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("subscription_status", "free"),
    supabase.from("sessions").select("*", { count: "exact", head: true }),
    supabase.from("sessions").select("*", { count: "exact", head: true }).eq("is_free", true),
    supabase.from("sessions").select("*", { count: "exact", head: true }).eq("is_free", false),
    supabase.from("users").select("email, name, subscription_status, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const paidMembers = (monthlyMembers ?? 0) + (annualMembers ?? 0) + (lifetimeMembers ?? 0);

  // Rough monthly revenue estimate
  const monthlyRevenue = (monthlyMembers ?? 0) * 19.99 + (annualMembers ?? 0) * (199.99 / 12);

  return NextResponse.json({
    totalUsers:      totalUsers ?? 0,
    paidMembers,
    freeUsers:       freeUsers ?? 0,
    monthlyMembers:  monthlyMembers ?? 0,
    annualMembers:   annualMembers ?? 0,
    lifetimeMembers: lifetimeMembers ?? 0,
    monthlyRevenue:  parseFloat(monthlyRevenue.toFixed(2)),
    totalSessions:   totalSessions ?? 0,
    freeSessions:    freeSessions ?? 0,
    premiumSessions: premiumSessions ?? 0,
    recentUsers:     recentUsers ?? [],
  });
}
