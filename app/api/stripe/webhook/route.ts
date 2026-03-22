// Stripe webhook handler — listens for payment events from Stripe.
// Stripe calls this endpoint automatically when payments happen.
// We use it to update the user's subscription_status in Supabase.
//
// Events we handle:
//   checkout.session.completed      → payment succeeded, activate subscription
//   customer.subscription.deleted   → subscription cancelled, downgrade to free
//   invoice.payment_failed          → payment failed, flag the account

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Tell Next.js not to parse the body — Stripe needs the raw bytes to verify the signature
export const config = { api: { bodyParser: false } };

// Map Stripe price IDs to subscription tier names
function getTierFromPriceId(priceId: string): string {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID)  return "monthly";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID)   return "annual";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID) return "lifetime";
  return "monthly";
}

export async function POST(req: NextRequest) {
  const stripeSecret  = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl   = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey    = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!stripeSecret || !webhookSecret || !supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: "2025-02-24.acacia" });

  // Read the raw body for signature verification
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Use the service role key so we can write to Supabase from a server context
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    switch (event.type) {

      // ── PAYMENT SUCCEEDED ────────────────────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.CheckoutSession;
        const userId  = session.client_reference_id;
        if (!userId) break;

        // Work out which plan was purchased
        let tier = "monthly";
        if (session.mode === "payment") {
          // One-time payment = lifetime
          tier = "lifetime";
        } else if (session.subscription) {
          // Subscription — fetch the subscription to get the price ID
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = sub.items.data[0]?.price.id;
          if (priceId) tier = getTierFromPriceId(priceId);
        }

        // Update the user's subscription status in Supabase
        await supabase
          .from("users")
          .update({
            subscription_status: tier,
            stripe_customer_id: session.customer as string,
          })
          .eq("id", userId);

        break;
      }

      // ── SUBSCRIPTION CANCELLED ───────────────────────────────────────────────
      case "customer.subscription.deleted": {
        const sub        = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        // Find the user by their Stripe customer ID and downgrade to free
        await supabase
          .from("users")
          .update({ subscription_status: "free" })
          .eq("stripe_customer_id", customerId);

        break;
      }

      // ── PAYMENT FAILED ───────────────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice    = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Flag the account — keep access for now but mark as payment_failed
        await supabase
          .from("users")
          .update({ subscription_status: "payment_failed" })
          .eq("stripe_customer_id", customerId);

        break;
      }

      default:
        // Ignore all other event types
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
