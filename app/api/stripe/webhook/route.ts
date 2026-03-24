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
import { render } from "@react-email/components";
import { resend, FROM_EMAIL, FROM_NAME } from "../../../../lib/resend";
import PaymentConfirmationEmail from "../../../../emails/PaymentConfirmationEmail";
import SubscriptionCancelledEmail from "../../../../emails/SubscriptionCancelledEmail";

// Tell Next.js not to cache this route — it must run fresh on every request
export const dynamic = "force-dynamic";

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

  const stripe = new Stripe(stripeSecret, { apiVersion: "2026-02-25.clover" });

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
        const session = event.data.object as Stripe.Checkout.Session;
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

        // Send payment confirmation email
        try {
          const { data: userData } = await supabase
            .from("users")
            .select("email, name")
            .eq("id", userId)
            .single();

          if (userData?.email) {
            const planName = tier.charAt(0).toUpperCase() + tier.slice(1); // "monthly" → "Monthly"
            const amountPaid = session.amount_total ? `£${(session.amount_total / 100).toFixed(2)}` : "";
            const period = tier === "lifetime" ? " one-time" : tier === "annual" ? "/year" : "/month";

            const html = await render(
              PaymentConfirmationEmail({
                name: userData.name || userData.email.split("@")[0],
                planName,
                amount: amountPaid,
                period,
                nextBillingDate: undefined,
              })
            );

            await resend.emails.send({
              from: `${FROM_NAME} <${FROM_EMAIL}>`,
              to: userData.email,
              subject: `You're in. Daily Meds ${planName} confirmed.`,
              html,
            });
          }
        } catch (emailErr) {
          // Log but don't fail the webhook — payment already processed
          console.error("Payment confirmation email failed:", emailErr);
        }

        // ── AFFILIATE EARNINGS ─────────────────────────────────────────────────
        // Check if this user was referred by an affiliate.
        // The referral_code is stored in the users table when they signed up via ?ref=.
        // If they were referred, credit the affiliate 20% of the payment amount.
        const { data: referredUser } = await supabase
          .from("users")
          .select("referred_by")
          .eq("id", userId)
          .single();

        if (referredUser?.referred_by) {
          const { data: affiliate } = await supabase
            .from("affiliates")
            .select("id, signups, earnings")
            .eq("referral_code", referredUser.referred_by)
            .single();

          if (affiliate) {
            // Work out 20% of the payment amount (Stripe amount is in pence)
            const amountPaid = (session.amount_total ?? 0) / 100;
            const commission = parseFloat((amountPaid * 0.2).toFixed(2));

            await supabase
              .from("affiliates")
              .update({
                signups: affiliate.signups + 1,
                earnings: parseFloat((affiliate.earnings + commission).toFixed(2)),
              })
              .eq("id", affiliate.id);
          }
        }

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

        // Send cancellation email
        try {
          const { data: userData } = await supabase
            .from("users")
            .select("email, name")
            .eq("stripe_customer_id", customerId)
            .single();

          if (userData?.email) {
            // Access ends at the subscription's current period end
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const periodEnd = (sub as any).current_period_end as number | undefined;
            const accessUntil = periodEnd
              ? new Date(periodEnd * 1000).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric",
                })
              : "the end of your billing period";

            const html = await render(
              SubscriptionCancelledEmail({
                name: userData.name || userData.email.split("@")[0],
                accessUntil,
              })
            );

            await resend.emails.send({
              from: `${FROM_NAME} <${FROM_EMAIL}>`,
              to: userData.email,
              subject: "Your Daily Meds subscription has ended.",
              html,
            });
          }
        } catch (emailErr) {
          console.error("Cancellation email failed:", emailErr);
        }

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
