# Daily Meds — Claude Code Project Instructions

## What We Are Building

Daily Meds is a Netflix-style OTT (Over The Top) streaming platform for guided meditation and breathwork audio sessions. The tagline is **"Audio for emotional emergencies"** and **"Meditation for life's most awkward moments"**. It is practical, grounded, non-spiritual and raw — not a typical wellness app. Think Netflix meets Spotify but for emotional regulation.

The founder is **Natalie Lauraine**. All content is created by her. Her cloned ElevenLabs AI voice is used for some audio content.

---

## Workflow — Follow This Every Time

When building any page, section or feature:

1. **Build** the component or page as instructed
2. **Screenshot** the rendered result using Puppeteer
3. **Compare** against the design reference (see Design System below)
4. **Fix** every mismatch — spacing, colours, fonts, layout
5. **Re-screenshot** and compare again
6. **Repeat** until it matches the design reference exactly
7. Only move on when the current step is complete and working

Never skip the screenshot comparison step. Always do at least 2 rounds of comparison before moving on.

---

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase
- **Payments & Subscriptions**: Stripe (subscription billing) + Supabase (subscription state management)
- **Social Sharing**: Built-in Web Share API + auto-generated Open Graph share cards
- **Video Hosting**: Vimeo (for all pre-recorded video meditation content only)
- **Live Streaming**: Daily.co (for all live sessions — audio and video)
- **Audio Hosting**: Supabase Storage (for all audio-only meditation files)
- **Deployment**: Vercel
- **Affiliates**: Custom referral tracking via Supabase + Stripe webhooks

---

## Design System

### Brand Colours

#### Backgrounds & UI Chrome
```
⬛ #000000  — Pure Black        (logo background)
⬛ #0D0D1A  — Site Background   (main dark bg)
⬛ #1A1A2E  — Card Background   (all cards and panels)
⬛ rgba(255,255,255,0.08) — Card Border (subtle white border)
```

#### Text
```
⬜ #F0F0F0              — Text Primary    (all main text)
🩶 rgba(255,255,255,0.5) — Text Muted     (secondary/label text)
```

#### Purple / Blue Family — Logo Variant 1 (Calm, Sleep, Focus)
```
🟣 #6B21E8  — Deep Purple      (darkest, base of gradient)
🟣 #8B3CF7  — Mid Purple       (core brand purple)
🟣 #8B5CF6  — Accent Purple    (buttons, highlights)
🔵 #6366F1  — Indigo Blue      (mid gradient transition)
🔵 #3B82F6  — Bright Blue      (gradient midpoint)
🩵 #22D3EE  — Cyan Blue        (lightest, legs/base of logo)
```

**Purple → Blue Gradient (use for calm/sleep/focus mood cards and icons):**
```css
background: linear-gradient(135deg, #6B21E8 0%, #8B3CF7 25%, #6366F1 60%, #3B82F6 80%, #22D3EE 100%);
```

#### Pink / Orange / Yellow Family — Logo Variant 2 (Energy, Morning, After The Sesh)
```
🩷 #F43F5E  — Hot Pink/Coral   (top left of gradient, "THE" in title)
🩷 #EC4899  — Deep Pink        (upper petals)
🟣 #D946EF  — Magenta          (mid petals)
🟠 #F97316  — Orange           (body gradient, "DAILY" in title)
🟡 #EAB308  — Golden Yellow    (lower body)
🟡 #FACC15  — Bright Yellow    (legs/base of logo)
```

**Pink → Yellow Gradient (use for energy/morning/sesh mood cards and icons):**
```css
background: linear-gradient(135deg, #F43F5E 0%, #EC4899 20%, #D946EF 35%, #F97316 65%, #EAB308 85%, #FACC15 100%);
```

#### Green / Lime Family — Logo Variant 3 (Nature, Grounding, Comedown)
```
🟢 #10B981  — Teal Green       (darkest, top petals)
🟢 #22C55E  — Mid Green        (body of figure)
🟢 #84CC16  — Lime Green       (lower body/arms)
🟡 #D9F100  — Yellow Lime      (legs/base of logo, brightest)
```

**Green → Lime Gradient (use for nature/grounding/comedown mood cards and icons):**
```css
background: linear-gradient(135deg, #10B981 0%, #22C55E 35%, #84CC16 70%, #D9F100 100%);
```

#### Title Wordmark Colours (from "THE DAILY MEDS" brand asset)
```
🩷 #F43F5E  — "THE"    (hot pink/coral)
🟠 #F97316  — "DAILY"  (orange)
🟡 #EAB308  — "A"      (golden yellow transition)
🟢 #22C55E  — "MEDS"   (green)
```

---

### CRITICAL — Gradient Rules For Logo & Icons

The Daily Meds logo is ALWAYS rendered as a gradient — never flat colour. The gradient flows from **top to bottom** on the lotus petals and from **top to bottom** on the figure, going from dark/saturated at the top to bright/light at the base.

**Logo gradient direction:** `135deg` (diagonal top-left to bottom-right)
**Lotus petals:** always the darkest/richest colour at top
**Body of figure:** mid-range colour
**Legs/base:** always the brightest/lightest colour in the family

When rendering the logo icon in any size:
```css
/* Purple variant */
.logo-purple { background: linear-gradient(135deg, #6B21E8, #8B3CF7, #6366F1, #3B82F6, #22D3EE); }

/* Pink/Yellow variant */
.logo-warm   { background: linear-gradient(135deg, #F43F5E, #D946EF, #F97316, #FACC15); }

/* Green variant */
.logo-green  { background: linear-gradient(135deg, #10B981, #22C55E, #84CC16, #D9F100); }
```

Apply gradient to SVG using `fill="url(#gradientId)"` — never use flat fill colours on the logo.

---

### Mood Category Colour Assignments

Each mood category on Daily Meds has its own gradient pulled from the three logo families:

```
Hungover          → Purple/Blue gradient  (#6B21E8 → #22D3EE)
After The Sesh    → Pink/Yellow gradient  (#F43F5E → #FACC15)
On A Comedown     → Green/Lime gradient   (#10B981 → #D9F100)
Feeling Empty     → Purple/Blue gradient  (#6B21E8 → #22D3EE)
Can't Sleep       → Purple/Blue gradient  (#8B3CF7 → #6366F1)
Anxious           → Pink/Orange gradient  (#F43F5E → #F97316)
Heartbroken       → Pink/Magenta gradient (#EC4899 → #D946EF)
Overwhelmed       → Orange/Yellow gradient(#F97316 → #FACC15)
Low Energy        → Green/Teal gradient   (#10B981 → #22C55E)
Morning Reset     → Pink/Yellow gradient  (#F43F5E → #FACC15)
Focus Mode        → Purple/Indigo gradient(#6B21E8 → #6366F1)
```

### Typography
- Font: **Inter** (Google Fonts)
- Headings: font-weight 500, never 700 (too heavy)
- Body: 16px, line-height 1.7

### Design Reference
The visual style reference is: https://streamit.iqonic.design/products/wordpress-theme-for-video-streaming-website/

Additional UI reference from Natalie's Canva mockup:
- Dark cinematic background with blurred lifestyle photo
- Gradient lotus/meditation icons in pink, orange, yellow, green, purple
- Music/audio player in the centre with progress bar
- Mood-based playlist cards at the bottom
- Personalised greeting top left ("Good Morning, [Name]!")
- Categories: Hungover, On A Comedown, After The Sesh, Feeling Empty

### Component Style Rules
- All backgrounds: dark (#0D0D1A or #1A1A2E)
- Cards: dark bg + 0.5px border rgba(255,255,255,0.08) + border-radius 10px
- Buttons primary: bg #8B5CF6, white text, rounded-md
- Buttons secondary: transparent, border rgba(255,255,255,0.2), white text
- Hover effects: subtle scale(1.02) on cards
- No gradients on UI chrome — only on decorative elements
- Mobile first — every component must work on mobile

---

## Site Structure & Pages

### Public Pages (no login required)
- `/` — Homepage with hero, mood categories, content rows
- `/free` — Free content section (sample meditations)
- `/live` — Live session schedule and stream page
- `/pricing` — Pricing plans (Free, Monthly £19.99, Annual £199.99, Lifetime £299.99)
- `/affiliate` — Affiliate programme signup page
- `/shop` — Merchandise page (Shopify Buy Button embed — added later)
- `/testimonials` — Testimonial and review page
- `/about` — About Natalie Lauraine

### Authenticated Pages (login required)
- `/library` — Full meditation library with mood filtering
- `/session/[id]` — Individual session player page
- `/profile` — User profile and settings
- `/stats` — Personal usage stats dashboard
- `/watchlist` — User's saved sessions
- `/downloads` — Offline downloaded content
- `/breathe` — Breathing timer tool
- `/rooms` — Group meditation rooms
- `/affiliate/dashboard` — Affiliate stats dashboard

### Admin Pages (Natalie only)
- `/admin` — Admin dashboard
- `/admin/content` — Add/edit/delete sessions
- `/admin/users` — User management
- `/admin/live` — Schedule live sessions

---

## Core Features — Build These In Order

### Phase 1 — Foundation
- Next.js setup with TypeScript and Tailwind
- Global design system and brand colours
- Responsive navigation bar
- Footer

### Phase 2 — Homepage
- Cinematic hero section with featured session
- Mood category pill filters (Anxious, Can't Sleep, Hungover, After The Sesh, Feeling Empty, On A Comedown, Heartbroken, Overwhelmed, Low Energy)
- Netflix-style horizontal scrolling content rows
- Continue watching row (for logged in users)

### Phase 3 — Auth & Profiles
- Supabase email/password auth + Google login
- User profile page with avatar, membership status, session history
- Personal stats dashboard (streaks, minutes, mood breakdown, heatmap calendar)

### Phase 4 — Media Player
- Audio and video player with: play/pause, seek, volume, speed control (0.75x 1x 1.25x 1.5x)
- Picture-in-picture mode
- Mini player bar pinned to bottom while browsing
- Continue watching (save and resume position)
- Watchlist (save sessions with heart icon)
- Custom playlists
- Offline download with progress indicator

### Phase 5 — Live & Group Features
- Live streaming via **Daily.co** (Natalie goes live with audio or video, users join in real time)
- Group meditation rooms powered by **Daily.co** (friends meditate together with shared timer)
- Emoji reactions on friends activity (opt-in sharing)
- Friends activity feed

### Phase 6 — Breathing Timer
- Guided breathing patterns: box breathing, 4-7-8, custom
- Animated expanding/contracting circle
- Session length selector: 5, 10, 15, 20, 30 mins
- Ambient sound options: silence, rain, bowls, nature
- Gentle bell at end of session

### Phase 7 — Payments & Subscriptions (Stripe + Supabase)
- Pricing page with three tiers (Free, Monthly £19.99, Annual £199.99, Lifetime £299.99)
- Stripe Checkout for subscription billing
- Stripe webhook to update `subscription_status` in Supabase on payment, cancellation or renewal
- Premium content gating with upgrade prompt for free users
- Customer portal via Stripe for users to manage/cancel their own subscription

### Phase 7b — Social Sharing
- **Web Share API** on every session and product — one tap to share to WhatsApp, Instagram, TikTok, iMessage etc (uses native iOS/Android share sheet, no extra tools needed)
- **Auto-generated Open Graph share cards** — every session link shows a beautiful branded preview image when shared on any platform. Includes session title, mood category, Daily Meds logo and brand colours
- **Spotify-style session share cards** — users can generate a branded image of their completed session to post to their stories (shows session name, duration, their streak)
- **Personal referral link sharing** — every user gets a unique share link that auto-tags them as the referrer for affiliate commission tracking
- **Pre-written social captions** — one click to copy a pre-written caption with the share link for Instagram, TikTok and Twitter/X

### Phase 8 — Affiliates
- Affiliate landing page explaining 20% commission
- Application form
- Personal affiliate dashboard: unique link, clicks, signups, earnings, payouts

### Phase 9 — SEO & Localisation
- Next.js metadata for all pages
- Open Graph tags
- Auto sitemap.xml
- Geolocation for local currency and timezone
- Multi-language: English (default), Arabic (RTL), Spanish, French
- Language selector in nav

### Phase 10 — Admin & Editor
- Password protected admin dashboard
- Content management (add/edit/delete sessions)
- Drag and drop homepage editor using dnd-kit
- User and subscription management
- Live session scheduler

### Phase 11 — Deploy
- Vercel deployment
- Environment variables setup
- Custom domain: thedailymeds.com

---

## Mood Categories

These are the core navigation categories for Daily Meds. They must always appear exactly as written:

- Hungover
- After The Sesh
- On A Comedown
- Feeling Empty
- Can't Sleep
- Anxious
- Heartbroken
- Overwhelmed
- Low Energy
- Morning Reset
- Focus Mode

---

## Content Details

- All meditation sessions created by **Natalie Lauraine**
- **Video sessions** hosted on **Vimeo** (private, no ads, pre-recorded only)
- **Audio-only sessions** stored in **Supabase Storage** (mp3/m4a files)
- **Live sessions** streamed via **Daily.co**
- Session types: guided meditation (audio), breathwork (audio), sleep audio, focus sessions (audio), video meditations
- Duration range: 5 minutes to 45 minutes
- Some content free, premium content behind paywall

---

## Business Rules

- Free users: access to free content section only
- Monthly members (£19.99/mo): full library access — billed via Stripe
- Annual members (£199.99/yr): full library + offline downloads + group rooms — billed via Stripe
- Lifetime members (£299.99 one-time): everything included, never billed again — Stripe one-time payment
- Affiliates earn 20% on every referred subscription — tracked via Supabase + Stripe webhooks
- Natalie is the only admin user
- All subscription state stored in Supabase `users` table and kept in sync via Stripe webhooks

---

## Integration Details

### Supabase Tables Needed
- `users` — id, email, name, avatar, subscription_status, created_at
- `sessions` — id, title, description, duration, mood_category, media_type (audio/video), vimeo_id (if video), audio_url (if audio), is_free, thumbnail
- `user_progress` — user_id, session_id, position_seconds, completed, last_watched
- `watchlist` — user_id, session_id, created_at
- `playlists` — id, user_id, name, sessions[]
- `downloads` — user_id, session_id, downloaded_at
- `affiliates` — id, user_id, referral_code, clicks, signups, earnings
- `live_sessions` — id, title, scheduled_at, is_live, daily_room_url, daily_room_name

### Supabase Storage Buckets
- `audio-files` — all audio-only meditation mp3/m4a files (private, signed URLs)
- `share-cards` — auto-generated OG share card images for sessions

### Vimeo
- Used for: all pre-recorded video meditation sessions only
- Embed privately — no Vimeo branding shown to users

### Daily.co
- Used for: all live streaming sessions AND group meditation rooms
- Natalie uses Daily.co to go live (audio only or audio + video)
- Users join via embedded Daily.co room inside the Daily Meds app
- Group meditation rooms: each room is a Daily.co session with shared timer overlay
- Daily.co API handles room creation, access tokens and participant management

### Stripe
- Used for all subscription billing
- Products to set up in Stripe dashboard:
  - `monthly_plan`  — £19.99/month recurring
  - `annual_plan`   — £199.99/year recurring
  - `lifetime_plan` — £299.99 one-time payment (no recurring billing)
- Stripe Checkout handles payment UI (no custom payment form needed)
- Stripe Customer Portal for users to manage their own subscription
- Webhooks to listen for: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`
- On successful payment → update `subscription_status` in Supabase `users` table

### Social Sharing Implementation
- Use **Next.js og image generation** (`next/og`) to auto-generate branded share card images for every session
- Use **Web Share API** (`navigator.share()`) for native one-tap sharing on mobile
- Fallback to copy-link button on desktop
- Every shared URL includes UTM parameters for tracking where traffic comes from
- Referral links format: `thedailymeds.com?ref=[affiliate_code]`

---

## Environment Variables

All environment variables must use these exact names across every file and phase.
Never invent alternative names for these keys.
Create a `.env.local` file in the project root with the following:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=
NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID=
NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID=

# Daily.co
DAILY_API_KEY=
NEXT_PUBLIC_DAILY_DOMAIN=

# Vimeo
VIMEO_ACCESS_TOKEN=
NEXT_PUBLIC_VIMEO_ACCOUNT_ID=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=Daily Meds

# Admin
ADMIN_EMAIL=
```

### Rules
- Variables prefixed `NEXT_PUBLIC_` are exposed to the browser — never put secret keys here
- `SUPABASE_SERVICE_ROLE_KEY` and `STRIPE_SECRET_KEY` are server-side only — never prefix with `NEXT_PUBLIC_`
- `STRIPE_WEBHOOK_SECRET` comes from the Stripe dashboard webhook section — not the API keys section
- Never commit `.env.local` to GitHub — confirm `.gitignore` includes it before first commit

---

## Code Style — Non-Developer Builder

Natalie is a non-developer building this with Claude Code assistance.
This must influence every code decision.

### Always do this:
- Write the simplest code that works — no clever solutions
- Use the most common, well-documented pattern for every problem
- One thing per file where possible — no over-abstraction
- Name variables and functions in plain English that describe exactly what they do
- Add a plain English comment above every function explaining what it does and why
- When there are two ways to do something, always pick the more readable one
- Keep components small and focused — one job per component
- Inline logic is fine — do not abstract into hooks or utilities unless absolutely necessary

### Never do this:
- No complex design patterns (no factories, no observers, no dependency injection)
- No over-engineered folder structures
- No clever one-liners — split into readable steps
- No abstracting things "for future scalability" unless explicitly asked
- No TypeScript generics unless unavoidable
- Never refactor working code into something more elegant without being asked

### When flagging issues:
- Explain the problem in plain English first
- Give one recommended solution, not multiple options
- Say exactly what file to open and what to change
- Never assume Natalie understands terminal commands — always write them out in full

---

## Rules For Building

- Always use TypeScript — no plain JavaScript files
- Always use Tailwind classes — no custom CSS files unless absolutely necessary
- Always mobile first — test every component at 375px width first
- Never use white backgrounds — the whole app is dark themed
- Never use font-weight 700 — use 500 for bold
- Always add loading states to any data fetching
- Always add error handling — never leave empty catch blocks
- Use Next.js Image component for all images
- Use Next.js Link component for all internal navigation
- Comment all major functions and components clearly

---

## Reference Sites

- Netflix — for content row and hero layout inspiration
- Insight Timer — for breathing timer and stats inspiration
- Streamit demo — https://streamit.iqonic.design for overall OTT layout
- Daily Meds Lovable MVP — existing site Natalie built as design reference

---

## Important Notes

- This is being built by Natalie (non-developer) with help from her friend Sarah
- Keep explanations clear when asking for input or flagging issues
- When something could go multiple ways, suggest the simplest option first
- After each phase is complete, remind Natalie to save and commit to GitHub
- The app must scale to thousands of users — use Supabase and Vercel which handle this automatically
