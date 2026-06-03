---
paths:
  - "app/api/stripe/**/*.ts"
  - "app/pricing/**/*.tsx"
---

# Stripe Integration

- Checkout: `/api/stripe/create-checkout` creates a Checkout Session with the appropriate price ID.
- Webhook: `/api/stripe/webhook` handles `checkout.session.completed`, `customer.subscription.deleted`, etc.
- Webhook verification uses `stripe.webhooks.constructEvent()` with raw body from `request.text()`.
- Customer portal: `/api/stripe/customer-portal` creates a billing portal session.
- Price IDs are env vars (`NEXT_PUBLIC_STRIPE_*_PRICE_ID`) — never hardcode.
- Staging uses Stripe sandbox (Preview-scoped env vars in Vercel).
- Production uses live keys. No test mode access yet — cannot verify end-to-end in prod.
- After successful payment, webhook sets `access_level` and `subscription_status` on the `profiles` table.
