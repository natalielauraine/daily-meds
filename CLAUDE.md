# Daily Meds

Audio meditation/breathwork streaming platform. Next.js 14.2, TypeScript, Tailwind, Supabase, Stripe, Cloudflare R2, Vercel.

## Commands

```bash
npx next dev -p 3001          # Dev server (port 3001 — avoids Flow conflicts)
npx next build                # Build (skips lint + type errors in CI)
npm run lint                  # ESLint
```

No test suite exists yet. Verify changes visually via dev server or staging URL.

## Git Workflow

IMPORTANT: Never push to `main` without explicit instruction. Production auto-deploys from main via Vercel.

```
dev → staging → main
```

- All work happens on `dev`
- Merge dev → staging to test on https://staging.thedailymeds.com
- Only merge staging → main when explicitly told "push to main" or "push live"

## Environments

| Env | Supabase | Waitlist | URL |
|-----|----------|----------|-----|
| Local | staging project | disabled (.env.local) | localhost:3001 |
| Staging | staging project | disabled (env var) | staging.thedailymeds.com |
| Production | prod project | ENABLED | thedailymeds.com |

## Architecture

- **Auth**: Supabase Auth (magic link + Google OAuth). Session refresh in `middleware.ts`.
- **Payments**: Stripe Checkout → webhook writes `access_level` to profiles table.
- **Media**: Audio/video/thumbnails uploaded to Cloudflare R2 via presigned URLs. No Vimeo.
- **Email**: Resend (transactional + Supabase auth hook).
- **Live**: Daily.co rooms for group meditation.
- **PWA**: next-pwa with offline fallback, disabled in dev.
- **Crons**: Vercel cron jobs in `vercel.json` (streak reminders, trial emails, recaps).

## Key Patterns

- **Supabase clients**: `lib/supabase-server.ts` (server components/routes), `lib/supabase-browser.ts` (client components). Never mix them.
- **Admin gating**: middleware checks `ADMIN_EMAIL` env var (comma-separated list). No role column.
- **RLS**: All tables have Row Level Security. Service-role key bypasses RLS in API routes.
- **Design tokens**: `lib/design-tokens.ts` exports `C` (colors), `HEADLINE` (style), `MOOD_GRADIENTS`.
- **Fonts**: Epilogue (headlines), Manrope (body), Lexend (legacy/accent). CSS variables: `--font-epilogue`, `--font-manrope`, `--font-lexend`.
- **Dark-only**: No light mode. Site background is `#131313`. All surfaces use the dark palette in `tailwind.config.ts`.

## Subscription Model

| Plan | access_level | Stripe |
|------|-------------|--------|
| Free (limited sessions) | 0 | none |
| Monthly Listener / Annual Listener | 1 | audio price IDs |
| The Seeker / The Dedicated / The Master | 2 | full price IDs |

Premium gating happens inside page components (not middleware) — `/session` is public, locks content inline.

## Database

Supabase Postgres. Key tables: `profiles`, `sessions`, `user_session_progress`, `playlists`, `affiliates`, `early_access_signups`, `live_events`, `crews`.

Migration SQL lives in `scripts/sql/`. Always run against staging first.

## Gotchas

- `next.config.mjs` sets `ignoreDuringBuilds: true` for both ESLint and TypeScript — build will pass with type errors.
- Stripe webhook (`/api/stripe/webhook`) reads raw body — middleware excludes all `/api/` routes to avoid interference.
- R2 presigned upload requires CORS configured on the Cloudflare dashboard (not in code).
- `ADMIN_EMAIL` is comma-separated for multi-admin support.
- The waitlist gate rewrites `/` to `/early-access` — don't create a competing root page.

## People

- **Natalie ("Nat")**: CEO, content director. Controls Stripe, Daily.co, domain accounts.
- **Jason**: Tech partner. All dev work.
- **Avi (previous dev)**: Authored early code, no longer active.

## Style Preferences

- Dark, cinematic aesthetic. Neon accents: pink `#ff41b3`, green `#adf225`, yellow `#f4e71d`, orange `#ec723d`.
- Use Tailwind utility classes. Custom colors are defined in `tailwind.config.ts`.
- Framer Motion for animations. Lucide for icons.
- Components in `app/components/` (page-level) and `components/ui/` (primitives).
