// Stripe webhook handler — listens for payment events from Stripe.
// Stripe calls this endpoint automatically when payments happen.
// We use it to update the user's subscription_status and access_level in Supabase.
//
// access_level values:
//   0 = Free
//   1 = Audio-Only (£9.99/mo) — full library, no live sessions
//   2 = Premium (£19.99/mo, annual, lifetime, or trial) — full access including live sessions
//
// IMPORTANT: Run this in Supabase SQL editor before deploying:
//   alter table users add column if not exists access_level integer not null default 0;
//
// Events we handle:
//   checkout.session.completed          → payment/trial started, activate subscription
//   invoice.payment_succeeded           → trial → paid conversion and renewals
//   customer.subscription.trial_will_end → trial ending in 3 days, send reminder
//   customer.subscription.deleted       → subscription cancelled, downgrade to free
//   invoice.payment_failed              → payment failed, flag the account

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { render } from "@react-email/components";
import { resend, FROM_EMAIL, FROM_NAME } from "../../../../lib/resend";
import PaymentConfirmationEmail from "../../../../emails/PaymentConfirmationEmail";
import SubscriptionCancelledEmail from "../../../../emails/SubscriptionCancelledEmail";
import TrialEndingEmail from "../../../../emails/TrialEndingEmail";
import TrialWelcomeEmail from "../../../../emails/TrialWelcomeEmail";
import AudioWelcomeEmail from "../../../../emails/AudioWelcomeEmail";
import PaymentFailedEmail from "../../../../emails/PaymentFailedEmail";

export const dynamic = "force-dynamic";

// ── HELPERS ───────────────────────────────────────────────────────────────────

// Maps a Stripe price ID to a human-readable tier name stored in Supabase
function getTierFromPriceId(priceId: string): string {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_AUDIO_PRICE_ID)   return "audio";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID) return "monthly";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID)  return "annual";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID) return "lifetime";
  return "monthly";
}

// Maps a Stripe price ID to an access level integer (1 = audio, 2 = premium)
function getAccessLevelFromPriceId(priceId: string): number {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_AUDIO_PRICE_ID) return 1;
  return 2; // monthly, annual, lifetime, trial — all premium
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

  const rawBody  = await req.text();
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

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    switch (event.type) {

      // ── CHECKOUT COMPLETED ────────────────────────────────────────────────────
      // Fires when a user completes the Stripe Checkout flow.
      // For trial checkouts: subscription is 'trialing', we set status to 'trial'.
      // For direct purchases: we set the actual tier immediately.
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId  = session.client_reference_id;
        if (!userId) break;

        // access_level is passed as metadata from create-checkout
        const accessLevelMeta = session.metadata?.access_level;
        let tier        = "monthly";
        let accessLevel = 2;

        if (session.mode === "payment") {
          const upgradeType = session.metadata?.upgrade_type;

          if (upgradeType === "lifetime_founding_member") {
            // Founding Member upgrade — cancel any active subscription so they
            // aren't double-charged, then grant lifetime access at level 3
            tier        = "lifetime";
            accessLevel = 3;

            const customerId = session.customer as string;
            if (customerId) {
              try {
                const subscriptions = await stripe.subscriptions.list({
                  customer: customerId,
                  status:   "active",
                  limit:    5,
                });
                for (const sub of subscriptions.data) {
                  // Cancel at period end — they keep access until their billing date
                  await stripe.subscriptions.update(sub.id, {
                    cancel_at_period_end: true,
                  });
                }
                // Also cancel any trialing subscriptions immediately
                const trialing = await stripe.subscriptions.list({
                  customer: customerId,
                  status:   "trialing",
                  limit:    5,
                });
                for (const sub of trialing.data) {
                  await stripe.subscriptions.cancel(sub.id);
                }
              } catch (cancelErr) {
                console.error("Failed to cancel old subscription after lifetime upgrade:", cancelErr);
              }
            }
          } else {
            // Regular one-time payment = lifetime
            tier        = "lifetime";
            accessLevel = accessLevelMeta ? parseInt(accessLevelMeta, 10) : 2;
          }
        } else if (session.subscription) {
          const sub     = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = sub.items.data[0]?.price.id ?? "";

          if (sub.status === "trialing") {
            // Trial started — give premium access immediately
            tier        = "trial";
            accessLevel = 2;
          } else {
            tier        = getTierFromPriceId(priceId);
            accessLevel = accessLevelMeta ? parseInt(accessLevelMeta, 10) : getAccessLevelFromPriceId(priceId);
          }
        }

        // For trials, store when the trial ends so the day-5 cron can target them
        const trialEndsAt = tier === "trial"
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : null;

        await supabase
          .from("users")
          .update({
            subscription_status: tier,
            access_level:        accessLevel,
            stripe_customer_id:  session.customer as string,
            ...(trialEndsAt ? { trial_ends_at: trialEndsAt } : {}),
          })
          .eq("id", userId);

        // ── TRIAL WELCOME EMAIL ───────────────────────────────────────────────
        if (tier === "trial") {
          try {
            const { data: userData } = await supabase
              .from("users")
              .select("email, name")
              .eq("id", userId)
              .single();

            if (userData?.email) {
              // Fetch the next upcoming live session to include in the welcome email
              const { data: nextSession } = await supabase
                .from("live_sessions")
                .select("title, scheduled_at")
                .eq("is_live", false)
                .gt("scheduled_at", new Date().toISOString())
                .order("scheduled_at", { ascending: true })
                .limit(1)
                .single();

              const nextLiveTime = nextSession?.scheduled_at
                ? new Date(nextSession.scheduled_at).toLocaleString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZoneName: "short",
                  })
                : "soon — check the app for the latest schedule";

              // trial ends 7 days from now
              const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                .toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

              const firstName = (userData.name || userData.email.split("@")[0]).split(" ")[0];

              const html = await render(
                TrialWelcomeEmail({ firstName, nextLiveTime, trialEndDate })
              );

              await resend.emails.send({
                from:    `${FROM_NAME} <${FROM_EMAIL}>`,
                to:      userData.email,
                subject: "Let the journey begin: This will be the best £1 you've ever spent.",
                html,
              });
            }
          } catch (emailErr) {
            console.error("Trial welcome email failed:", emailErr);
          }
        }

        // ── AUDIO WELCOME EMAIL ───────────────────────────────────────────────
        if (tier === "audio") {
          try {
            const { data: userData } = await supabase
              .from("users")
              .select("email, name")
              .eq("id", userId)
              .single();

            if (userData?.email) {
              const firstName = (userData.name || userData.email.split("@")[0]).split(" ")[0];
              const html = await render(AudioWelcomeEmail({ firstName }));

              await resend.emails.send({
                from:    `${FROM_NAME} <${FROM_EMAIL}>`,
                to:      userData.email,
                subject: "Whatever you're feeling, we have a med for that.",
                html,
              });
            }
          } catch (emailErr) {
            console.error("Audio welcome email failed:", emailErr);
          }
        }

        // Send payment confirmation email (skip for trial and audio — handled above)
        if (tier !== "trial" && tier !== "audio") {
          try {
            const { data: userData } = await supabase
              .from("users")
              .select("email, name")
              .eq("id", userId)
              .single();

            if (userData?.email) {
              const planName  = tier.charAt(0).toUpperCase() + tier.slice(1);
              const amountPaid = session.amount_total ? `£${(session.amount_total / 100).toFixed(2)}` : "";
              const period     = tier === "lifetime" ? " one-time" : tier === "annual" ? "/year" : "/month";

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
                from:    `${FROM_NAME} <${FROM_EMAIL}>`,
                to:      userData.email,
                subject: `You're in. Daily Meds ${planName} confirmed.`,
                html,
              });
            }
          } catch (emailErr) {
            console.error("Payment confirmation email failed:", emailErr);
          }
        }

        // ── AFFILIATE CREDIT ──────────────────────────────────────────────────
        // Standard affiliates earn 10%, Artist Partners earn 20%.
        const { data: referredUser } = await supabase
          .from("users")
          .select("referred_by")
          .eq("id", userId)
          .single();

        if (referredUser?.referred_by) {
          const { data: affiliate } = await supabase
            .from("affiliates")
            .select("id, signups, earnings, affiliate_type")
            .eq("referral_code", referredUser.referred_by)
            .single();

          if (affiliate) {
            const amountPaid      = (session.amount_total ?? 0) / 100;
            const commissionRate  = affiliate.affiliate_type === "artist" ? 0.2 : 0.1;
            const commission      = parseFloat((amountPaid * commissionRate).toFixed(2));
            await supabase
              .from("affiliates")
              .update({
                signups:  affiliate.signups + 1,
                earnings: parseFloat((affiliate.earnings + commission).toFixed(2)),
              })
              .eq("id", affiliate.id);
          }
        }

        break;
      }

      // ── INVOICE PAID (renewals + trial → paid conversion) ────────────────────
      // Fires for every successful invoice, including when a trial converts to a
      // paid subscription. We use this to promote 'trial' → actual tier in the DB.
      case "invoice.payment_succeeded": {
        const invoice        = event.data.object as Stripe.Invoice;
        const customerId     = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;

        // Ignore one-time payments (lifetime) — they have no subscription
        if (!subscriptionId) break;

        const sub     = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = sub.items.data[0]?.price.id ?? "";

        // If the subscription is still trialing, the £1 invoice just fired — leave status as 'trial'
        if (sub.status === "trialing") break;

        // Trial just ended and converted to paid — promote to the real tier
        const tier        = getTierFromPriceId(priceId);
        const accessLevel = getAccessLevelFromPriceId(priceId);

        await supabase
          .from("users")
          .update({ subscription_status: tier, access_level: accessLevel })
          .eq("stripe_customer_id", customerId);

        break;
      }

      // ── TRIAL ENDING SOON ─────────────────────────────────────────────────────
      // Stripe fires this 3 days before a trial ends (configurable in Stripe dashboard:
      // Billing → Subscriptions → Manage trial settings).
      // We use it to send the trial reminder email.
      case "customer.subscription.trial_will_end": {
        const sub        = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        try {
          const { data: userData } = await supabase
            .from("users")
            .select("email, name")
            .eq("stripe_customer_id", customerId)
            .single();

          if (userData?.email) {
            // trial_end is a Unix timestamp
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const trialEnd = (sub as any).trial_end as number | null;
            const trialEndDate = trialEnd
              ? new Date(trialEnd * 1000).toLocaleDateString("en-GB", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })
              : "soon";

            const html = await render(
              TrialEndingEmail({
                name:         userData.name || userData.email.split("@")[0],
                trialEndDate,
                amount:       "£19.99",
              })
            );

            await resend.emails.send({
              from:    `${FROM_NAME} <${FROM_EMAIL}>`,
              to:      userData.email,
              subject: "Your Daily Meds trial ends in 3 days.",
              html,
            });
          }
        } catch (emailErr) {
          console.error("Trial ending email failed:", emailErr);
        }

        break;
      }

      // ── SUBSCRIPTION CANCELLED ───────────────────────────────────────────────
      case "customer.subscription.deleted": {
        const sub        = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await supabase
          .from("users")
          .update({ subscription_status: "free", access_level: 0 })
          .eq("stripe_customer_id", customerId);

        try {
          const { data: userData } = await supabase
            .from("users")
            .select("email, name")
            .eq("stripe_customer_id", customerId)
            .single();

          if (userData?.email) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const periodEnd    = (sub as any).current_period_end as number | undefined;
            const accessUntil  = periodEnd
              ? new Date(periodEnd * 1000).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric",
                })
              : "the end of your billing period";

            const firstName = (userData.name || userData.email.split("@")[0]).split(" ")[0];
            const html = await render(
              SubscriptionCancelledEmail({
                firstName,
                periodEndDate: accessUntil,
              })
            );

            await resend.emails.send({
              from:    `${FROM_NAME} <${FROM_EMAIL}>`,
              to:      userData.email,
              subject: "No hard feelings. We're still here if you need us.",
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

        // Flag the account — access_level stays as-is; Stripe will retry
        await supabase
          .from("users")
          .update({ subscription_status: "payment_failed" })
          .eq("stripe_customer_id", customerId);

        // Send payment failed email
        try {
          const { data: userData } = await supabase
            .from("users")
            .select("email, name")
            .eq("stripe_customer_id", customerId)
            .single();

          if (userData?.email) {
            const firstName = (userData.name || userData.email.split("@")[0]).split(" ")[0];
            const html = await render(PaymentFailedEmail({ firstName }));

            await resend.emails.send({
              from:    `${FROM_NAME} <${FROM_EMAIL}>`,
              to:      userData.email,
              subject: "Your card said 'no'. (We've been there.)",
              html,
            });
          }
        } catch (emailErr) {
          console.error("Payment failed email error:", emailErr);
        }

        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
