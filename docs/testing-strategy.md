# Daily Meds — Testing Strategy

## The Problem We're Solving

Nat wants to run large events — thousands to tens of thousands of new users hitting the site within hours. We need confidence that signups, payments, audio streaming, and live sessions all hold up under pressure. We also need a way for Nat to review changes before they go live.

## Three Layers

### 1. Local Dev (what we have now)

Jason runs `next dev` on the hive server, views via SSH tunnel. Good for building features and fixing bugs. No risk to production. No load testing capability — it's a single-user dev server.

### 2. Staging (next step)

A full duplicate of production: separate Supabase database, Stripe test mode, staging R2 bucket, deployed to `staging.thedailymeds.com`. Nat can review any change here before it goes live. Stripe test cards work, so we can test the full payment flow without real money.

This is also where we run load tests. Staging is expendable — if we break the database under load, we just reset it. Production is untouched.

### 3. Load Testing (the real question)

The stack has different breaking points at different scales:

**Won't break (auto-scales):**
- Vercel (serverless — scales horizontally by default)
- Cloudflare R2 (CDN-backed, designed for millions of requests)
- Static assets (cached at edge)

**Will break first:**
- **Supabase connection pool** — free tier = 500 concurrent connections. A 10K-user event with everyone loading sessions simultaneously will exhaust this. Fix: Supabase Pro ($25/mo) + PgBouncer connection pooling. This is the single biggest risk.
- **Supabase row-level security queries** — complex RLS policies add latency per query. Under load, this compounds. Fix: optimize policies, add query caching (Phase 2 plan covers this with KV store).

**Might break under extreme load:**
- **Stripe webhook processing** — if 5,000 people check out in the same hour, that's 5,000 webhook POSTs to a serverless function. Vercel's queue depth matters here. Fix: webhook retry is built into Stripe, so temporary failures self-heal.
- **Resend email throughput** — mass signups trigger notification emails. Resend has rate limits per plan. Fix: batch notifications or queue them.
- **Daily.co live rooms** — capacity depends on their plan. Need to confirm max participants per room and total concurrent rooms.

**How we test it:**
- k6 running on the hive server (94 cores, 1TB RAM — we can simulate serious load)
- Ramp from 100 → 1,000 → 5,000 → 10,000 virtual users over 30 minutes
- Target the hot paths: homepage load, waitlist signup, session page, audio stream start, Stripe checkout
- Monitor Supabase dashboard (active connections, query duration), Vercel analytics (function invocations, cold starts), R2 metrics (request rate, bandwidth)
- Document where it breaks and at what scale

**Expected outcome:** Supabase connection limits will be the first wall. After upgrading to Pro + pooling, the system should handle 10K concurrent users without issues. Audio streaming via R2/CDN is essentially unlimited. The bottleneck shifts to database writes (signups, session tracking, streak updates) which we can optimize with batching and caching.

## Timeline

- **Now:** Local dev works, production deploys via git push
- **Next Nat session:** Set up staging (30-45 min together)
- **Phase 2:** Connection pooling, query caching, HLS streaming
- **Before first big event:** Load test on staging, fix what breaks, document capacity limits
