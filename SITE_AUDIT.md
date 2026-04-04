# The Daily Meds — Full Site Audit
**Date:** 2026-04-03 | **Auditor:** Claude Code | **Framework:** Next.js 14 App Router

---

## READINESS ESTIMATE: ~72% to production-ready

**What's working well:** Core auth, session player, Stripe checkout, admin content CRUD, community, affiliate system, email pipeline, podcast system structure.

**What's blocking launch:** 3 broken routes linked from live pages, 2 unauthenticated API endpoints, wrong cron schedules, missing OG image API.

---

## 🔴 CRITICAL — Fix Before Launch

| # | Issue | File | Fix |
|---|---|---|---|
| 1 | `/forgot-password` 404 — linked from login page | `app/login/page.tsx:179` | Create `app/forgot-password/page.tsx` |
| 2 | `/admin/social` 404 — in admin sidebar on every admin page | `app/admin/AdminShell.tsx:58` | Create `app/admin/social/page.tsx` or remove nav link |
| 3 | `/api/og` 404 — breaks OG image for ALL pages on social media | `app/layout.tsx:77,88` | Create `app/api/og/route.ts` |
| 4 | `/blog` 404 — linked from community page and progress tracker | `app/community/page.tsx:636` | Create blog or remove links |
| 5 | `/api/daily/create-room` has NO auth — anyone can create rooms | `app/api/daily/create-room/route.ts` | Add admin Bearer token check |
| 6 | `/api/daily/get-token` has NO auth — anyone can get meeting tokens | `app/api/daily/get-token/route.ts` | Add Supabase auth check |
| 7 | `/api/email/brand-crew-approved` has NO auth — anyone can trigger emails | `app/api/email/brand-crew-approved/route.ts` | Add auth check |
| 8 | Wrong cron schedules in `vercel.json` — live-reminder should be hourly, affiliate-earnings monthly | `vercel.json` | Fix cron expressions |
| 9 | Cookie API mismatch in challenges — auth will fail | `app/api/challenges/update-progress/route.ts:20` | Change `.get()` to `getAll()` pattern |
| 10 | Accidental file in project root: `git config --global user.name "Natalie L` | `/` project root | Delete this file |

---

## 🟡 HIGH — Fix Before Launch

| # | Issue | File |
|---|---|---|
| 11 | Admin dashboard uses `MOCK_SESSIONS` for session count — stuck at 5 | `app/admin/page.tsx` |
| 12 | `app/admin/brand-crews/page.tsx` not wrapped in AdminShell — no sidebar nav | `app/admin/brand-crews/page.tsx` |
| 13 | MOOD_GRADIENTS object copied in 5 separate files | Multiple |
| 14 | C design tokens + HEADLINE object copied in 4 separate files | Multiple |
| 15 | Copyright year hardcoded as "2024" | `app/page.tsx:365`, `app/home/page.tsx:376` |
| 16 | `Logo.tsx` references `var(--font-nyata)` which is never loaded | `app/components/Logo.tsx:28` |
| 17 | Two duplicate privacy routes: `/privacy` and `/privacy-policy` | Both exist |
| 18 | `/api/admin/users` returns max 500 rows with no pagination | `app/api/admin/users/route.ts` |
| 19 | Service-role Supabase client created at module level — will crash on missing env | `app/api/admin/brand-crews/route.ts:11` |
| 20 | `app/home/page.tsx` "Always Free" cards have `minWidth: 380px` — clips on iPhone SE | `app/home/page.tsx:304` |

---

## 🟢 OPTIONAL ENHANCEMENTS (5 per section)

### Auth
1. Add magic link / passwordless login option on login page
2. Add Google OAuth with a one-tap sign-in prompt
3. Email verification reminder banner for unverified accounts
4. Session timeout warning with auto-logout after inactivity
5. "Remember this device" checkbox that extends session duration

### Community
1. @mention system — tag other users in posts
2. Post pinning by admin (sticky announcements at top of feed)
3. Reaction emoji picker (not just fixed set)
4. "Save post" bookmarking for personal reference
5. Weekly digest email of top posts

### Podcasts
1. Episode chapters / timestamp markers (click to jump)
2. Playback speed control (0.75x, 1x, 1.25x, 1.5x, 2x)
3. Related episodes carousel at bottom of episode page
4. Clip sharing — share a timestamped link to a moment
5. Apple Podcasts / Spotify RSS feed generation from Supabase data

### Affiliate
1. Affiliate leaderboard (with opt-in/opt-out toggle)
2. Automated payout via Stripe Connect instead of manual
3. Custom affiliate landing page builder (personalised /ref/[code] pages)
4. Performance tier upgrades (e.g. 20% → 25% after 10 referrals)
5. Affiliate newsletter with tips, promo periods, and earnings summaries

### Admin
1. Bulk session upload via CSV
2. Draft/schedule sessions for future publish date
3. Email preview before sending blast
4. Activity log (audit trail of admin actions)
5. Revenue dashboard with Stripe dashboard embed

---

## ♿ ACCESSIBILITY ISSUES

| Severity | Issue | Location |
|---|---|---|
| High | No skip-to-content link | All pages |
| High | Landing page has no mobile navigation | `app/page.tsx` |
| High | Form inputs rely only on placeholder text — no visible labels | Login, signup, community |
| Medium | Inline SVG icons without `aria-label` | Navbar, admin, cards |
| Medium | Footer link opacity `rgba(255,255,255,0.25)` = ~1.8:1 contrast ratio (fails WCAG AA) | `app/page.tsx:365` |
| Medium | Mobile hamburger menu has no focus trap or Esc key handler | `app/components/Navbar.tsx` |
| Low | `<img>` tags with empty `alt=""` on content images (should have descriptive alt) | Admin podcasts, crew pages |

---

## ⚡ PERFORMANCE BOTTLENECKS

| Issue | Impact | Fix |
|---|---|---|
| 12+ raw `<img>` tags instead of `next/image` | No WebP, no lazy load, no responsive srcset | Replace with `<Image>` from `next/image` |
| Heavy inline `style={{}}` objects on every component | Inflated HTML, no caching | Migrate to Tailwind classes |
| Unsplash images on landing page with no optimization | Slow LCP on landing | Route through `next/image` or use `unoptimized` prop with explicit dimensions |
| Google Fonts loading 5 font families (4 rarely used) | Extra network requests | Keep only Lexend + Manrope; remove Inter, Plus Jakarta Sans, Space Grotesk |
| No `React.memo` on `SessionCard` | Re-renders on every parent update | Wrap SessionCard in `memo()` |
| PlayerProvider re-checks Supabase auth on every mount | Extra round-trip per page | Cache user ID in context, only refresh on auth state change |

---

## 🎨 DESIGN CONSISTENCY ISSUES

| Issue | Pages Affected |
|---|---|
| Font system split: Lexend+Manrope (new) vs Plus Jakarta+Space Grotesk (old) | Navbar, Footer, Login, Signup vs Community, Partnerships, Affiliate |
| `tailwind.config.ts` `font-headline` = Plus Jakarta, but design docs say Lexend | Site-wide |
| Landing page uses lime `#aaee20` as primary accent; logged-in app uses pink `#ff41b3` | Landing vs everything else |
| C design tokens not shared — defined independently in 4 files | Community, Partnerships, Affiliate, Podcasts |
| Copyright year "2024" hardcoded | Landing, Home footer |
| Admin podcasts uses only inline styles; all other admin pages use Tailwind | Admin |

---

## 🧪 RECOMMENDED AUTOMATED TESTS

### Critical (write these first)
1. **Stripe webhook handler** — unit test all 3 event types with fixture payloads
2. **Auth middleware** — test that protected routes redirect unauthenticated users; admin routes reject non-admin emails
3. **Affiliate click tracking** — test that valid codes increment click count, invalid codes are silently ignored
4. **Session player** — test that `user_progress` is written after 10 seconds of playback
5. **Community post creation** — test insert, realtime broadcast, and reaction update

### E2E (Playwright recommended)
1. Full signup → email confirm → onboarding → library flow
2. Session play → completion → progress recorded
3. Stripe checkout → webhook → tier update → access granted
4. Affiliate link → signup → referral attributed
5. Admin: create session → publish → visible in library

---

## 🔁 REUSABLE COMPONENTS TO EXTRACT

| What | From | Suggested path |
|---|---|---|
| `MOOD_GRADIENTS` constant | 5 files | `lib/constants.ts` |
| `C` design tokens + `HEADLINE` style | 4 files | `lib/design-tokens.ts` |
| `tierColour()` + `tierLabel()` | 2 admin files | `lib/utils.ts` |
| `timeAgo()` function | 3 files | `lib/utils.ts` |
| Gradient avatar circle with initial | 6+ pages | `app/components/Avatar.tsx` |
| Page section header (label + title + subtitle pattern) | 8+ pages | `app/components/SectionHeader.tsx` |
| Glass card container | 10+ pages | Extend existing `app/components/ui/Card.tsx` |

---

## 🗑️ UNUSED / DEAD CODE

| Item | Location | Action |
|---|---|---|
| Accidental text file `git config --global...` | Project root | Delete |
| `screenshot-*.mjs` Puppeteer scripts | Project root | Move to `scripts/` and add to `.gitignore` |
| `Inter` font | `app/layout.tsx:44` | Remove if migrating fully to Manrope |
| Unused `createClient` import + `supabaseUrl` var | `app/admin/users/page.tsx:8,50` | Remove |
| `/app/progress/page.tsx` (dev build tracker) | — | Gate behind admin auth or remove for production |
| Duplicate `/privacy-policy` route | `app/privacy-policy/page.tsx` | Redirect to `/privacy` and delete |

---

## 📋 PAGE-BY-PAGE STRUCTURE NOTES

### Public Pages
- **`/`** — Landing. Has own hero, circular gallery, trending, FAQ, inline footer. Does NOT use shared `<Footer>`. Copyright "2024".
- **`/free`** — Free sessions grid + StoriesSection. Clean.
- **`/live`** — Live schedule with Daily.co integration. Env var check at build time.
- **`/pricing`** — 3 tiers. Stripe checkout. Monthly/annual toggle. Clean.
- **`/affiliate`** — Full rebrand with C tokens. Supabase apply form. Clean.
- **`/partnerships`** — Full rebrand with C tokens. brand_crews insert. Clean.
- **`/podcasts`** — Episode listing. Filters by tags. Needs Supabase `podcasts` table.
- **`/podcasts/[slug]`** — Episode detail. Video modal. Audio player. Clean.

### Member Pages
- **`/home`** — Logged-in home. "Always Free" card width issue (380px min).
- **`/library`** — Main session browser. Well-structured.
- **`/community`** — Full redesign. Supabase realtime. Inline composer. Well-structured.
- **`/affiliate/dashboard/overview`** — Admin-style KPI dashboard for affiliates. Clean.

### Admin Pages
- **`/admin`** — Dashboard with mock session count. KPIs from `/api/admin/stats`.
- **`/admin/content`** — Full CRUD sessions. Best-structured admin page.
- **`/admin/users`** — User management. Has unused import.
- **`/admin/podcasts`** — Full CRUD podcasts. Inline styles only (inconsistent).
- **`/admin/brand-crews`** — Missing AdminShell wrapper. Functional otherwise.
- **`/admin/live`** — Daily.co room management. Clean.
- **`/admin/social`** — ❌ MISSING (directory exists, no page.tsx)

---

## ✅ REMAINING TASKS TO GO LIVE

### Must-do (blocking)
- [ ] Create `/forgot-password` page
- [ ] Create `/admin/social` page (or remove from sidebar)
- [ ] Create `/api/og` route for social sharing images
- [ ] Add auth to Daily.co API routes
- [ ] Add auth to brand-crew-approved email route
- [ ] Fix vercel.json cron schedules
- [ ] Fix challenges cookie API
- [ ] Delete accidental root-level file
- [ ] Remove mock session count from admin dashboard
- [ ] Wrap brand-crews admin in AdminShell

### Should-do (quality)
- [ ] Create `lib/design-tokens.ts` and consolidate C tokens
- [ ] Create `lib/constants.ts` and consolidate MOOD_GRADIENTS
- [ ] Fix copyright years to use `new Date().getFullYear()`
- [ ] Replace `<img>` tags with `next/image` across the site
- [ ] Add mobile navigation to landing page
- [ ] Add visible form labels to login/signup
- [ ] Create `podcasts` Supabase table and add first episode
- [ ] Write Playwright E2E tests for critical user flows

### Nice-to-have
- [ ] Migrate fonts to Lexend + Manrope only
- [ ] Update `tailwind.config.ts` font families to match actual usage
- [ ] Add skip-to-content link for accessibility
- [ ] Paginate `/api/admin/users` beyond 500 rows
- [ ] Move `screenshot-*.mjs` scripts to `scripts/` dir

---

*Generated by automated audit — 2026-04-03*
