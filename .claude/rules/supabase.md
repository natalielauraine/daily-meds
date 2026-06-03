---
paths:
  - "lib/supabase-*.ts"
  - "app/**/*.tsx"
  - "app/**/*.ts"
---

# Supabase Patterns

- Server components/routes: `import { createClient } from "@/lib/supabase-server"`
- Client components: `import { createClient } from "@/lib/supabase-browser"`
- Never use `supabase-js` directly — always go through these two wrappers.
- The server client cannot `setAll` cookies in server components (only middleware can). That's intentional.
- Auth flow: magic link or Google OAuth → `/auth/callback` route handler exchanges code → redirects.
- User data lives in `profiles` table (linked to `auth.users` by ID).
- `access_level` in profiles determines subscription tier (0=free, 1=listener, 2=seeker+).
- All new tables MUST have RLS enabled. Write policies in `scripts/sql/` and test on staging first.
