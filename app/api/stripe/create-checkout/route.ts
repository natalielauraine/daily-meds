// API route — creates a Stripe Checkout session for a chosen plan.
// The user is redirected to Stripe's hosted checkout page.
// On success, Stripe redirects back to /pricing/success.
// On cancel, Stripe redirects back to /pricing.
//
// Plan IDs and what they create:
//   audio    → subscription at £9.99/mo  (access_level: 1)
//   monthly  → subscription at £19.99/mo (access_level: 2)
//   annual   → subscription at £199.99/yr (access_level: 2)
//   lifetime → one-time payment at £299.99 (access_level: 2)
//   trial    → £1 setup fee + 7-day trial → £19.99/mo Premium (access_level: 2)

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Maps plan ID → access_level integer (used as Stripe metadata so the webhook can sync it)
const ACCESS_LEVELS: Record<string, string> = {
  audio:    "1",
  monthly:  "2",
  annual:   "2",
  lifetime: "2",
  trial:    "2",
};

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!secretKey) {
    return NextResponse.json(
      { error: "Stripe not configured. Add STRIPE_SECRET_KEY to .env.local" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2026-02-25.clover" });

  try {
    const body = await req.json();
    const { priceId, planId } = body as { priceId?: string; planId?: string };

    if (!planId) {
      return NextResponse.json({ error: "planId is required" }, { status: 400 });
    }

    // Get the logged-in user so we can pre-fill their email in Stripe
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

    const accessLevel = ACCESS_LEVELS[planId] ?? "2";
    const isLifetime  = planId === "lifetime";
    const isTrial     = planId === "trial";

    // Shared checkout options
    const sharedOptions = {
      ...(user?.email ? { customer_email: user.email } : {}),
      ...(user?.id    ? { client_reference_id: user.id } : {}),
      success_url:             `${appUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
      cancel_url:              `${appUrl}/pricing`,
      allow_promotion_codes:   true,
      billing_address_collection: "auto" as const,
      metadata:                { access_level: accessLevel },
    };

    // ── £1 TRIAL → £19.99/mo PREMIUM ──────────────────────────────────────────
    // Charges £1 upfront as a setup fee, starts a 7-day trial on the Premium monthly
    // price. After 7 days Stripe automatically charges £19.99/mo.
    if (isTrial) {
      const premiumMonthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;
      if (!premiumMonthlyPriceId) {
        return NextResponse.json({ error: "Premium monthly price ID not configured" }, { status: 500 });
      }

      const session = await stripe.checkout.sessions.create({
        ...sharedOptions,
        mode: "subscription",
        line_items: [{ price: premiumMonthlyPriceId, quantity: 1 }],
        // The £1 is billed immediately as a one-off setup fee
        add_invoice_items: [
          {
            price_data: {
              currency:     "gbp",
              unit_amount:  100, // £1 in pence
              product_data: { name: "7-Day All-Access Trial" },
            },
          },
        ],
        subscription_data: {
          trial_period_days: 7,
          // Cancel if no payment method when trial ends, rather than creating an unpaid invoice
          trial_settings: {
            end_behavior: { missing_payment_method: "cancel" },
          },
          metadata: { access_level: accessLevel },
        },
      });

      return NextResponse.json({ url: session.url });
    }

    // ── LIFETIME (one-time payment) ────────────────────────────────────────────
    if (isLifetime) {
      const resolvedPriceId = priceId || process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID;
      if (!resolvedPriceId) {
        return NextResponse.json({ error: "Lifetime price ID not configured" }, { status: 500 });
      }

      const session = await stripe.checkout.sessions.create({
        ...sharedOptions,
        mode:       "payment",
        line_items: [{ price: resolvedPriceId, quantity: 1 }],
        // Store access_level in payment intent metadata too for one-time payments
        payment_intent_data: { metadata: { access_level: accessLevel } },
      });

      return NextResponse.json({ url: session.url });
    }

    // ── STANDARD SUBSCRIPTIONS (audio, monthly, annual) ───────────────────────
    if (!priceId) {
      return NextResponse.json({ error: "priceId is required for subscription plans" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      ...sharedOptions,
      mode:       "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: { access_level: accessLevel },
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (err) {
    console.error("Stripe checkout error:", err);
    const message = err instanceof Error ? err.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
