// API route — creates a Stripe Customer Portal session.
// The user is redirected to Stripe's hosted portal where they can
// change plan, update payment method, or cancel their subscription.
// Called from the profile page "Manage subscription" button.

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

// Helper — creates the Supabase server client using request cookies
function makeSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );
}

// GET — returns the user's current subscription renewal date and plan name.
// Called by the profile page to show billing info next to the Manage button.
export async function GET() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });

  const stripe = new Stripe(secretKey, { apiVersion: "2026-02-25.clover" });
  const supabase = makeSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("stripe_customer_id, subscription_status")
    .eq("id", user.id)
    .single();

  // No Stripe customer or lifetime plan — no renewal date to show
  if (!profile?.stripe_customer_id || profile.subscription_status === "lifetime") {
    return NextResponse.json({ renewalDate: null, planName: profile?.subscription_status ?? "free" });
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: "active",
      limit: 1,
    });

    const sub = subscriptions.data[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodEnd = sub ? (sub as any).current_period_end as number : null;
    const renewalDate = periodEnd
      ? new Date(periodEnd * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
      : null;

    return NextResponse.json({ renewalDate, planName: profile.subscription_status });
  } catch {
    return NextResponse.json({ renewalDate: null, planName: profile.subscription_status });
  }
}

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!secretKey) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2026-02-25.clover" });

  // Get the logged-in user and their Stripe customer ID from Supabase
  const supabase = makeSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  // Look up the user's Stripe customer ID stored in our users table
  const { data: profile } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No Stripe customer found. Have you made a purchase yet?" },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/profile`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Customer portal error:", err);
    const message = err instanceof Error ? err.message : "Failed to open portal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
