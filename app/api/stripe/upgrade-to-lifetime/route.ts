// Frictionless Lifetime Founding Member upgrade route.
// For existing subscribers (monthly or audio) who want to pay £297 once
// and own their access forever.
//
// Frictionless: we pass the user's existing Stripe customer ID so their
// saved card is pre-loaded — no need to re-enter payment details.
//
// On success: webhook cancels their active subscription and sets
// subscription_status = 'lifetime' + access_level = 3.
//
// Add NEXT_PUBLIC_STRIPE_FOUNDING_PRICE_ID to your .env.local and Vercel.

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL || "https://www.thedailymeds.com";

  if (!secretKey) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  // Verify the user is logged in
  const cookieStore = cookies();
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Look up the user's Stripe customer ID from the database
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: profile } = await supabase
    .from("users")
    .select("stripe_customer_id, subscription_status")
    .eq("id", user.id)
    .single();

  // Block if they're already on lifetime
  if (profile?.subscription_status === "lifetime") {
    return NextResponse.json({ error: "Already a Lifetime member" }, { status: 400 });
  }

  const foundingPriceId = process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID;
  if (!foundingPriceId) {
    return NextResponse.json({ error: "Lifetime price ID not configured" }, { status: 500 });
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2026-02-25.clover" });

  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode:       "payment",
      line_items: [{ price: foundingPriceId, quantity: 1 }],

      // Pass existing customer so their saved card is pre-loaded (frictionless)
      ...(profile?.stripe_customer_id
        ? { customer: profile.stripe_customer_id }
        : { customer_email: user.email ?? undefined }),

      // Pass user ID so the webhook can update Supabase
      client_reference_id: user.id,

      // Metadata tells the webhook this is a founding member upgrade
      metadata: {
        access_level:  "3",
        upgrade_type:  "lifetime_founding_member",
      },

      payment_intent_data: {
        metadata: {
          access_level: "3",
          upgrade_type: "lifetime_founding_member",
          user_id:      user.id,
        },
      },

      success_url: `${appUrl}/founding-member-confirmed`,
      cancel_url:  `${appUrl}/dashboard`,

      allow_promotion_codes: false, // Founding rate is already discounted
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });

  } catch (err) {
    console.error("Lifetime upgrade checkout error:", err);
    const message = err instanceof Error ? err.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
