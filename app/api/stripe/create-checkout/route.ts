// API route — creates a Stripe Checkout session for a chosen plan.
// The user is redirected to Stripe's hosted checkout page.
// On success, Stripe redirects back to /pricing/success.
// On cancel, Stripe redirects back to /pricing.

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!secretKey) {
    return NextResponse.json(
      { error: "Stripe not configured. Add STRIPE_SECRET_KEY to .env.local" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2025-02-24.acacia" });

  try {
    const body = await req.json();
    const { priceId, planId } = body;

    if (!priceId) {
      return NextResponse.json({ error: "priceId is required" }, { status: 400 });
    }

    // Get the logged-in user from Supabase so we can pre-fill their email in Stripe
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

    // Lifetime plan is a one-time payment — all others are subscriptions
    const isLifetime = planId === "lifetime";

    const session = await stripe.checkout.sessions.create({
      mode: isLifetime ? "payment" : "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      // Pre-fill email if the user is logged in
      ...(user?.email ? { customer_email: user.email } : {}),
      // Pass the user ID so the webhook can update Supabase
      ...(user?.id ? { client_reference_id: user.id } : {}),
      // Where to send the user after checkout
      success_url: `${appUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
      cancel_url: `${appUrl}/pricing`,
      // Allow promo codes
      allow_promotion_codes: true,
      // Billing address collection
      billing_address_collection: "auto",
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    const message = err instanceof Error ? err.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
