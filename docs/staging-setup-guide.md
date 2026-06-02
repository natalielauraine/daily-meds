# Daily Meds — Staging Environment Setup Guide

**For:** Jason + Nat working session
**Estimated time:** 30-45 minutes together

---

## Prerequisites

- [ ] Vercel Pro plan ($20/month) — needed for custom branch domains
- [ ] Nat present (owns Vercel, Supabase, Stripe, Cloudflare accounts)

---

## Step 1: Supabase Staging Project (Nat)

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
   - Name: `dailymeds-staging`
   - Region: same as production (check current project settings)
   - Generate a strong database password — save it
3. Once created, go to **Project Settings > API** and copy:
   - Project URL
   - anon public key
   - service_role secret key
4. Go to **SQL Editor** and run the production schema migration:
   - Copy schema from production: **Database > Schema** or export via `pg_dump`
   - Run `scripts/sql/2026-05-17-early-access-signups.sql`
   - Run any other migrations from the scripts/sql/ folder
5. Set up the same RLS policies as production

---

## Step 2: Stripe Test Mode (Nat)

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Toggle **Test mode** (top-right)
3. **Developers > API Keys** — copy:
   - `pk_test_...` (publishable)
   - `sk_test_...` (secret)
4. **Products** — recreate the 5 products in test mode:
   - Audio (monthly)
   - Monthly subscription
   - Annual subscription
   - Lifetime
   - Trial (£1 setup fee + subscription)
5. Copy all 5 `price_` IDs from test mode
6. **Developers > Webhooks** — add staging endpoint:
   - URL: `https://staging.thedailymeds.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
   - Copy the `whsec_...` signing secret

---

## Step 3: Cloudflare R2 Staging Bucket (Jason or Nat)

1. Go to Cloudflare dashboard > **R2 Object Storage**
2. Create bucket: `dailymeds-staging`
3. Copy a few test audio files from the `dailymeds` bucket (or use short placeholder MP3s)
4. Use existing R2 API token (same credentials work across buckets)

---

## Step 4: Cloudflare DNS (Jason or Nat)

1. Go to Cloudflare dashboard > DNS for `thedailymeds.com`
2. Add record:
   - Type: `CNAME`
   - Name: `staging`
   - Target: `cname.vercel-dns.com`
   - Proxy: OFF (grey cloud — Vercel handles SSL)

---

## Step 5: Vercel Configuration (Nat — requires Pro plan)

1. Upgrade to Vercel Pro ($20/month) if not already
2. **Settings > Domains** — add `staging.thedailymeds.com`
   - Set Git Branch: `staging`
3. **Settings > Environment Variables** — add all staging keys:
   - Scope each variable to **Preview** and/or the `staging` branch

| Variable | Value (staging) |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | staging project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | staging anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | staging service_role key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | staging `whsec_...` |
| `NEXT_PUBLIC_STRIPE_AUDIO_PRICE_ID` | test mode price ID |
| `NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID` | test mode price ID |
| `NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID` | test mode price ID |
| `NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID` | test mode price ID |
| `NEXT_PUBLIC_STRIPE_TRIAL_SETUP_PRICE_ID` | test mode price ID |
| `CLOUDFLARE_R2_BUCKET_NAME` | `dailymeds-staging` |
| `NEXT_PUBLIC_APP_URL` | `https://staging.thedailymeds.com` |
| `RESEND_API_KEY` | same as production (or staging key) |
| `DAILY_API_KEY` | same as production |
| `NEXT_PUBLIC_DAILY_DOMAIN` | same as production |

4. **Settings > Git** — confirm `staging` branch triggers Preview deployments

---

## Step 6: Invite Jason (Nat)

- **Vercel**: Settings > Team > Invite `jason@flow.gl` as Member
- **Stripe**: Settings > Team > Invite `jason@flow.gl` as Developer
- **Daily.co**: Settings > Team > Invite as Admin
- **Supabase**: Both projects > Settings > Team > Invite `jason@flow.gl`

---

## Step 7: Verify (Jason)

1. Push any change to `staging` branch
2. Confirm Vercel builds and deploys to `staging.thedailymeds.com`
3. Test: waitlist signup → check staging Supabase table
4. Test: Stripe checkout (test card `4242 4242 4242 4242`) → verify webhook fires

---

## Step 8: Load Testing Setup (Jason — after staging is live)

1. Install k6 on hive server: `snap install k6`
2. Write load test scripts targeting staging:
   - Homepage / waitlist page (GET)
   - Waitlist signup (POST)
   - Session page loads (GET, with auth)
   - Audio streaming (GET R2 URLs)
3. Ramp: 100 → 1,000 → 5,000 → 10,000 virtual users
4. Monitor: Vercel analytics, Supabase dashboard (connections, query times), R2 metrics
5. Document bottlenecks and fix before first large event
