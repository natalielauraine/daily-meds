#!/usr/bin/env node

/**
 * Daily Meds — Stripe Product & Price Setup Script
 * 
 * Creates all required Stripe products and prices for the Daily Meds platform.
 * IDEMPOTENT: safe to run multiple times — uses metadata lookup to skip existing items.
 * Works for both test mode (sk_test_) and live mode (sk_live_) keys.
 *
 * Usage:
 *   1. Set STRIPE_SECRET_KEY in your .env file (test or live key)
 *   2. Run: node scripts/setup-stripe.mjs
 *   3. Copy the output env vars into your .env
 *
 * Plans created:
 *   ┌─────────────┬───────────────┬────────────┬───────────────────┬──────────────┐
 *   │ Plan        │ Name          │ Price      │ Type              │ access_level │
 *   ├─────────────┼───────────────┼────────────┼───────────────────┼──────────────┤
 *   │ Free        │ The Observer  │ £0         │ No Stripe product │ 0            │
 *   │ Audio-Only  │ The Listener  │ £9.99/mo   │ Recurring monthly │ 1            │
 *   │ Full Access │ The Seeker    │ £19.99/mo  │ Recurring monthly │ 2            │
 *   │ Annual      │ The Dedicated │ £199.00/yr │ Recurring yearly  │ 2            │
 *   │ Lifetime    │ The Master    │ £299.99    │ One-time payment  │ 2 (or 3)     │
 *   └─────────────┴───────────────┴────────────┴───────────────────┴──────────────┘
 *
 * Notes:
 *   - The Free plan (The Observer) needs no Stripe product. Users default to
 *     access_level=0 and subscription_status='free' in Supabase on signup.
 *   - The £1 trial is NOT a separate product — it's a £1 setup fee + 7-day
 *     trial on the Audio subscription, handled in the checkout API route.
 *   - Each product gets metadata `dailymeds_plan_id` for idempotent lookups.
 */

import Stripe from "stripe";
import { readFileSync } from "fs";
import { resolve } from "path";

// ── Load .env manually (no dotenv dependency needed) ─────────────────────────

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env");
    const content = readFileSync(envPath, "utf-8");
    const vars = {};
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      vars[key] = val;
    }
    return vars;
  } catch {
    return {};
  }
}

const env = loadEnv();
const STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error("\n  ERROR: No STRIPE_SECRET_KEY found in .env or environment.\n");
  console.error("  Set it to your test key (sk_test_...) or live key (sk_live_...) and try again.\n");
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

// Detect test vs live mode
const isTestMode = STRIPE_SECRET_KEY.startsWith("sk_test_");
const modeLabel = isTestMode ? "TEST MODE" : "LIVE MODE";

// ── Plan Definitions ─────────────────────────────────────────────────────────

const PLANS = [
  {
    planId: "audio",
    productName: "Daily Meds — The Listener (Audio Only)",
    productDescription: "Full audio library access. 200+ meditation sessions, new drops every week. Audio only — no live sessions.",
    priceAmount: 999,       // £9.99 in pence
    currency: "gbp",
    recurring: { interval: "month" },
    envVar: "NEXT_PUBLIC_STRIPE_AUDIO_PRICE_ID",
  },
  {
    planId: "monthly",
    productName: "Daily Meds — The Seeker (Full Access)",
    productDescription: "Full audio library plus live sessions with Natalie, group meditation rooms, and community access.",
    priceAmount: 1999,      // £19.99 in pence
    currency: "gbp",
    recurring: { interval: "month" },
    envVar: "NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID",
  },
  {
    planId: "annual",
    productName: "Daily Meds — The Dedicated (Annual)",
    productDescription: "Everything in Full Access, billed annually. Save vs monthly. Audio library, live sessions, group rooms, community.",
    priceAmount: 19900,     // £199.00 in pence
    currency: "gbp",
    recurring: { interval: "year" },
    envVar: "NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID",
  },
  {
    planId: "lifetime",
    productName: "Daily Meds — The Master (Founding Lifetime)",
    productDescription: "Pay once, access everything forever. Full library, all future content, live sessions, group rooms, offline downloads, personal welcome.",
    priceAmount: 29999,     // £299.99 in pence
    currency: "gbp",
    recurring: null,        // one-time payment
    envVar: "NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Find an existing Stripe product by our custom metadata tag.
 * Returns the product if found, null otherwise.
 */
async function findExistingProduct(planId) {
  // Search all products (active + inactive) for our metadata tag
  const products = await stripe.products.list({ limit: 100, active: true });
  for (const product of products.data) {
    if (product.metadata?.dailymeds_plan_id === planId) {
      return product;
    }
  }
  // Also check inactive products
  const inactiveProducts = await stripe.products.list({ limit: 100, active: false });
  for (const product of inactiveProducts.data) {
    if (product.metadata?.dailymeds_plan_id === planId) {
      return product;
    }
  }
  return null;
}

/**
 * Find an existing price on a product that matches our amount and interval.
 * Returns the price if found, null otherwise.
 */
async function findExistingPrice(productId, plan) {
  const prices = await stripe.prices.list({
    product: productId,
    limit: 100,
    active: true,
  });

  for (const price of prices.data) {
    if (price.unit_amount !== plan.priceAmount) continue;
    if (price.currency !== plan.currency) continue;

    if (plan.recurring) {
      // Must match interval
      if (price.recurring?.interval === plan.recurring.interval) {
        return price;
      }
    } else {
      // One-time: type must be 'one_time'
      if (price.type === "one_time") {
        return price;
      }
    }
  }
  return null;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n  ╔═══════════════════════════════════════════════════╗`);
  console.log(`  ║   Daily Meds — Stripe Setup                      ║`);
  console.log(`  ║   ${modeLabel.padEnd(47)}║`);
  console.log(`  ╚═══════════════════════════════════════════════════╝\n`);

  const results = {};

  for (const plan of PLANS) {
    const label = `[${plan.planId}]`.padEnd(12);

    // ── Step 1: Find or create product ────────────────────────────────────

    let product = await findExistingProduct(plan.planId);

    if (product) {
      console.log(`  ${label} Product exists: ${product.name} (${product.id})`);

      // Make sure it's active
      if (!product.active) {
        await stripe.products.update(product.id, { active: true });
        console.log(`  ${label}   -> Reactivated (was inactive)`);
      }
    } else {
      product = await stripe.products.create({
        name: plan.productName,
        description: plan.productDescription,
        metadata: {
          dailymeds_plan_id: plan.planId,
          access_level: plan.planId === "audio" ? "1" : "2",
        },
      });
      console.log(`  ${label} Product CREATED: ${product.name} (${product.id})`);
    }

    // ── Step 2: Find or create price ──────────────────────────────────────

    let price = await findExistingPrice(product.id, plan);

    if (price) {
      console.log(`  ${label} Price exists:   £${(price.unit_amount / 100).toFixed(2)} ${plan.recurring ? `/${plan.recurring.interval}` : "one-time"} (${price.id})`);
    } else {
      const priceParams = {
        product: product.id,
        unit_amount: plan.priceAmount,
        currency: plan.currency,
        metadata: {
          dailymeds_plan_id: plan.planId,
        },
      };

      if (plan.recurring) {
        priceParams.recurring = { interval: plan.recurring.interval };
      }

      price = await stripe.prices.create(priceParams);
      console.log(`  ${label} Price CREATED:  £${(price.unit_amount / 100).toFixed(2)} ${plan.recurring ? `/${plan.recurring.interval}` : "one-time"} (${price.id})`);
    }

    results[plan.envVar] = price.id;
    console.log();
  }

  // ── Step 3: Set up customer portal (for subscription management) ────────

  console.log(`  [portal]    Checking Stripe Customer Portal...`);
  try {
    const configs = await stripe.billingPortal.configurations.list({ limit: 1 });
    if (configs.data.length > 0) {
      console.log(`  [portal]    Portal config exists (${configs.data[0].id})\n`);
    } else {
      console.log(`  [portal]    No portal config found — create one in Stripe Dashboard:`);
      console.log(`              Settings → Billing → Customer Portal\n`);
    }
  } catch {
    console.log(`  [portal]    Could not check portal config (permissions may be limited)\n`);
  }

  // ── Step 4: Check webhook endpoint ──────────────────────────────────────

  console.log(`  [webhook]   Checking webhook endpoints...`);
  try {
    const endpoints = await stripe.webhookEndpoints.list({ limit: 20 });
    const ourEndpoint = endpoints.data.find(
      (ep) => ep.url.includes("/api/stripe/webhook")
    );
    if (ourEndpoint) {
      console.log(`  [webhook]   Found: ${ourEndpoint.url}`);
      console.log(`  [webhook]   Status: ${ourEndpoint.status}`);
      console.log(`  [webhook]   Events: ${ourEndpoint.enabled_events.join(", ")}`);

      // Check if all required events are registered
      const requiredEvents = [
        "checkout.session.completed",
        "customer.subscription.deleted",
        "invoice.payment_failed",
        "invoice.payment_succeeded",
        "customer.subscription.trial_will_end",
      ];
      const missing = requiredEvents.filter(
        (e) => !ourEndpoint.enabled_events.includes(e) && !ourEndpoint.enabled_events.includes("*")
      );
      if (missing.length > 0) {
        console.log(`  [webhook]   MISSING EVENTS: ${missing.join(", ")}`);
        console.log(`  [webhook]   Add these in Stripe Dashboard → Developers → Webhooks`);
      } else {
        console.log(`  [webhook]   All required events registered`);
      }
    } else {
      console.log(`  [webhook]   No webhook endpoint found for /api/stripe/webhook`);
      console.log(`  [webhook]   Create one in Stripe Dashboard → Developers → Webhooks:`);
      console.log(`              URL: https://thedailymeds.com/api/stripe/webhook`);
      console.log(`              Events: checkout.session.completed, customer.subscription.deleted,`);
      console.log(`                      invoice.payment_failed, invoice.payment_succeeded,`);
      console.log(`                      customer.subscription.trial_will_end`);
    }
  } catch {
    console.log(`  [webhook]   Could not list webhook endpoints (permissions may be limited)`);
  }

  // ── Output ──────────────────────────────────────────────────────────────

  console.log(`\n  ═══════════════════════════════════════════════════`);
  console.log(`  Copy these into your .env file:\n`);
  for (const [key, value] of Object.entries(results)) {
    console.log(`  ${key}=${value}`);
  }

  console.log(`\n  ═══════════════════════════════════════════════════`);
  console.log(`  FREE PLAN NOTE:`);
  console.log(`  The Observer (Free) has no Stripe product.`);
  console.log(`  Users default to access_level=0 on signup.`);
  console.log(`  Make sure the 'users' table in Supabase has:`);
  console.log(`    - access_level INTEGER NOT NULL DEFAULT 0`);
  console.log(`    - subscription_status TEXT NOT NULL DEFAULT 'free'`);
  console.log(`    - stripe_customer_id TEXT`);
  console.log(`    - trial_ends_at TIMESTAMPTZ`);
  console.log(`  ═══════════════════════════════════════════════════`);

  console.log(`\n  TRIAL NOTE:`);
  console.log(`  The £1 trial is NOT a separate product.`);
  console.log(`  It uses the Audio price (${results["NEXT_PUBLIC_STRIPE_AUDIO_PRICE_ID"]})`);
  console.log(`  with a £1 setup fee + 7-day trial period.`);
  console.log(`  This is handled in /api/stripe/create-checkout.\n`);
}

main().catch((err) => {
  console.error("\n  SETUP FAILED:", err.message);
  if (err.type === "StripeAuthenticationError") {
    console.error("  Your STRIPE_SECRET_KEY is invalid. Check it and try again.\n");
  }
  process.exit(1);
});
