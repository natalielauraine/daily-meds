---
paths:
  - "app/api/**/*.ts"
---

# API Route Conventions

- Import `createClient` from `@/lib/supabase-server` — never the browser client.
- For admin routes: use `requireAdmin()` from `lib/require-admin.ts` at the top.
- Stripe webhook must access `request.text()` for raw body — no JSON parsing middleware.
- Cron-triggered routes check `Authorization: Bearer ${CRON_SECRET}` header.
- Service-role key is only used server-side for RLS bypass (never exposed to client).
- Email routes use `resend.emails.send()` from `lib/resend.ts`.
- Always return `NextResponse.json()` with appropriate status codes.
