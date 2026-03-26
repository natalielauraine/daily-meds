# DAILY MEDS — Full Project Reference
Last updated: March 2026 (updated after downloads feature)

---

## SECTION 1 — WHAT IS DAILY MEDS

Daily Meds is a Netflix-style streaming platform for guided meditation and breathwork audio sessions.
Tagline: "Audio for emotional emergencies" and "Meditation for life's most awkward moments."
Founded by: Natalie Lauraine
Tech stack: Next.js 14, TypeScript, Tailwind CSS, Supabase, Stripe, Daily.co, Vimeo, Vercel

---

## SECTION 2 — ALL PAGES BUILT

### Public Pages (no login needed)
- /                   Homepage with hero, mood categories, content rows
- /free               Free sessions for non-subscribers
- /live               Live session schedule and stream page
- /pricing            Subscription plans (Free, Monthly, Annual, Lifetime)
- /pricing/success    Post-payment success page
- /about              About Natalie Lauraine
- /testimonials       Reviews and testimonials
- /shop               Merchandise (Shopify embed)
- /affiliate          Affiliate programme signup
- /partnerships       Brand partnership page
- /review             Review submission page
- /signup             Create an account
- /login              Log in

### Authenticated Pages (login required)
- /library            Full meditation library with mood filtering
- /session/[id]       Individual session player (audio + video)
- /profile            User profile and privacy settings
- /stats              Personal stats dashboard (streaks, minutes, heatmap, milestones)
- /watchlist          Saved sessions
- /downloads          Saved-for-later sessions (in-app only, not device downloads)
- /breathe            Guided breathing timer tool
- /playlists          Custom playlists
- /rooms              Group meditation rooms (Daily.co)
- /rooms/[roomName]   Individual group room
- /live/[roomName]    Individual live stream room
- /community          Social feed, leaderboard, challenges, crews
- /crew               List of all crews the user belongs to
- /crew/[id]          Individual crew page with activity feed and reactions
- /challenges         List of all active challenges
- /challenges/[id]    Individual challenge page
- /brand-crews        Brand partnership crews directory
- /brand-crews/[id]   Individual brand crew page
- /affiliate/dashboard Affiliate stats (clicks, signups, earnings)

### Admin Pages (Natalie only)
- /admin              Main admin dashboard
- /admin/content      Add, edit, delete sessions
- /admin/users        User management
- /admin/live         Schedule and manage live sessions
- /admin/brand-crews  Approve and manage brand crews
- /admin/social       Social/OG settings

---

## SECTION 3 — ALL COMPONENTS BUILT

### Main Components
- Navbar               Top navigation bar, mobile hamburger menu, auth state, user dropdown
- Footer               Site footer with links
- HeroSection          Homepage cinematic hero with featured session
- MoodCategorySection  Horizontal mood pill filters on homepage
- ContentRow           Netflix-style horizontal scrolling row of session cards
- SessionCard          Individual session card (thumbnail, mood badge, duration)
- ContinueWatchingRow  "Pick up where you left off" row for logged-in users
- AudioPlayer          Full audio player (play/pause, seek, volume, speed, watchlist)
- VideoPlayer          Vimeo video embed player
- MiniPlayer           Mini player bar pinned to bottom while browsing
- NotificationBell     Bell icon with unread badge and realtime notification dropdown
- WhoIsOnline          Shows who else is online (presence system)
- EmojiReactionToast   Toast popup when someone reacts to your activity
- FriendsActivityFeed  Friends' recent activity feed
- ShareButton          Web Share API button (native share sheet on mobile)
- ShareSessionModal    Branded share card generator for completed sessions
- AddToPlaylistModal   Add a session to a playlist
- LanguageSelector     Language switcher (EN, AR, ES, FR)
- ReferralTracker      Tracks affiliate referral clicks via URL params

### UI Primitives (app/components/ui/)
- Banner               Announcement banner
- Card                 Dark card with border
- ConfirmModal         Confirmation dialog
- CopyButton           Copy to clipboard button
- EmptyState           Empty state illustration + message
- LoadingSkeleton      Loading placeholder shimmer
- MoodBadge            Coloured mood category pill
- StatusBadge          Subscription status badge

---

## SECTION 4 — ALL API ROUTES BUILT

### Stripe
- POST /api/stripe/create-checkout    Creates a Stripe Checkout session
- POST /api/stripe/customer-portal    Opens Stripe billing portal
- POST /api/stripe/webhook            Handles Stripe payment events

### Daily.co
- POST /api/daily/create-room         Creates a Daily.co room
- POST /api/daily/get-token           Gets a Daily.co access token

### Email (triggered by cron jobs)
- GET  /api/email/streak-reminder     Sends streak reminder emails
- GET  /api/email/live-reminder       Sends live session reminder emails
- GET  /api/email/new-session         Sends new content emails to subscribers
- GET  /api/email/affiliate-earnings  Sends affiliate earnings updates
- GET  /api/email/brand-crew-approved Sends brand crew approval emails

### Admin
- GET/POST /api/admin/stats           Admin stats dashboard data
- GET/POST /api/admin/users           Admin user management
- GET/POST /api/admin/brand-crews     Admin brand crew management
- GET/POST /api/admin/og-settings     Open Graph settings

### Affiliate
- POST /api/affiliate/apply           Affiliate application form
- POST /api/affiliate/track-click     Tracks affiliate link clicks

### Challenges
- POST /api/challenges/update-progress  Updates a user's challenge progress

### Webhooks
- POST /api/webhooks/supabase-auth    Handles Supabase auth webhook events

---

## SECTION 5 — ALL SUPABASE TABLES (SQL TO CREATE)

Run all of these in your Supabase SQL Editor (Settings > SQL Editor).

---

### users
```sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  subscription_status TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### sessions
```sql
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  mood_category TEXT,
  media_type TEXT DEFAULT 'audio',
  vimeo_id TEXT,
  audio_url TEXT,
  is_free BOOLEAN DEFAULT FALSE,
  thumbnail TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### user_progress
```sql
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  position_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_watched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, session_id)
);
```

---

### watchlist
```sql
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, session_id)
);
```

---

### downloads
```sql
CREATE TABLE IF NOT EXISTS public.downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, session_id)
);
```

---

### playlists
```sql
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sessions UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### affiliates
```sql
CREATE TABLE IF NOT EXISTS public.affiliates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  clicks INTEGER DEFAULT 0,
  signups INTEGER DEFAULT 0,
  earnings NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### live_sessions
```sql
CREATE TABLE IF NOT EXISTS public.live_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  is_live BOOLEAN DEFAULT FALSE,
  daily_room_url TEXT,
  daily_room_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### crews
```sql
CREATE TABLE IF NOT EXISTS public.crews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT TRUE,
  invite_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### crew_members
```sql
CREATE TABLE IF NOT EXISTS public.crew_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  crew_id UUID NOT NULL REFERENCES public.crews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(crew_id, user_id)
);
```

---

### crew_activity
```sql
CREATE TABLE IF NOT EXISTS public.crew_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  crew_id UUID NOT NULL REFERENCES public.crews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  display_name TEXT,
  activity_type TEXT NOT NULL,
  mood_category TEXT,
  session_title TEXT,
  streak_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### crew_activity_reactions
```sql
CREATE TABLE IF NOT EXISTS public.crew_activity_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  crew_activity_id UUID NOT NULL,
  from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  from_display_name TEXT,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(crew_activity_id, from_user_id, emoji)
);
```

---

### challenges
```sql
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'streak',
  target_count INTEGER DEFAULT 7,
  is_official BOOLEAN DEFAULT FALSE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### challenge_participants
```sql
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);
```

---

### community_posts
```sql
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  post_type TEXT NOT NULL DEFAULT 'session',
  mood_category TEXT,
  streak_count INTEGER,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### community_post_reactions
```sql
CREATE TABLE IF NOT EXISTS public.community_post_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
```

---

### community_settings
```sql
CREATE TABLE IF NOT EXISTS public.community_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  show_in_feed BOOLEAN DEFAULT FALSE,
  show_in_leaderboard BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

---

### notifications
```sql
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  from_display_name TEXT,
  type TEXT NOT NULL DEFAULT 'reaction',
  message TEXT NOT NULL,
  post_id UUID,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### brand_crews
```sql
CREATE TABLE IF NOT EXISTS public.brand_crews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### brand_crew_members
```sql
CREATE TABLE IF NOT EXISTS public.brand_crew_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_crew_id UUID NOT NULL REFERENCES public.brand_crews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_crew_id, user_id)
);
```

---

## SECTION 6 — SUPABASE STORAGE BUCKETS

Create these in Supabase > Storage > New Bucket:

- audio-files     Private bucket — stores all audio meditation mp3/m4a files
- share-cards     Public bucket — stores auto-generated OG share card images

---

## SECTION 7 — ENVIRONMENT VARIABLES

These go in your .env.local file at the root of the project.
Never commit this file to GitHub.

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

---

## SECTION 8 — SUBSCRIPTION PLANS

Plan          Price         Billing       Includes
Free          £0            Never         Free sessions only
Monthly       £19.99/mo     Monthly       Full library
Annual        £199.99/yr    Yearly        Full library + offline saves + group rooms
Lifetime      £299.99       One-time      Everything, forever

Affiliate commission: 20% of every referred subscription

---

## SECTION 9 — MOOD CATEGORIES

These must always appear exactly as written:
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

## SECTION 10 — THIRD PARTY SERVICES USED

Service       Purpose
Supabase      Database, auth, file storage, realtime
Stripe        Subscription billing and payments
Daily.co      Live streaming and group meditation rooms
Vimeo         Pre-recorded video session hosting (private, no ads)
Vercel        Hosting and deployment
ElevenLabs    AI voice cloning for Natalie's audio content
Shopify       Merchandise store embed on /shop

---

## SECTION 11 — FEATURE DECISIONS & IMPORTANT NOTES

### Downloads / Saved Sessions (decided March 2026)
- The Save button on each session page saves that session to the user's Daily Meds account
- Saved sessions appear on the /downloads page
- Sessions are NOT downloaded to the user's device — they still stream normally (requires internet)
- True offline device downloads are deferred until a native mobile app is built
- Technically: tapping Save inserts a row into the Supabase "downloads" table (user_id, session_id)
- Tapping Save again removes the row (toggle behaviour)
- The bookmark icon on the session page shows filled (purple) when saved, outline when not saved
- Required Supabase constraint: ALTER TABLE public.downloads ADD CONSTRAINT downloads_user_session_unique UNIQUE (user_id, session_id);

### Notifications (built March 2026)
- Bell icon in the navbar (logged-in users only) shows unread count badge in pink (#EC4899)
- Notifications are stored in the Supabase "notifications" table
- Realtime: new notifications appear instantly without page refresh
- Currently triggered when: someone reacts to another user's community post, streak share, or milestone share
- Message format examples: "Sarah reacted 🔥 to your streak" / "Sarah reacted 💜 to your post"
- Dropdown shows last 20 notifications, auto-marks all as read when opened

### Emoji Reactions (built March 2026)
- Six reaction emojis used everywhere: 🔥 💜 🙏 ⭐ 💪 🧘
- Reactions work on: community feed posts, crew activity feed, stats page milestone shares
- Tapping the emoji reacts; tapping the count number shows who reacted (names popover)
- Reactions are live via Supabase Realtime — no page refresh needed
- Tables used: community_post_reactions, crew_activity_reactions

### No Red Colour Anywhere on the Site (decided March 2026)
- Red (#F43F5E) is used only as a brand gradient colour in logos and mood icons
- Never use red for UI elements like badges, buttons, or alerts
- Use pink (#EC4899) for any "alert" or attention-grabbing UI elements (e.g. notification badge)

### World Map Feature (cancelled March 2026)
- Was considered as a "who's meditating around the world" live map
- Cancelled — not needed for current product phase

---

End of document.
