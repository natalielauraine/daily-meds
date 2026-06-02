-- DailyMeds Staging Schema
-- Run this in the staging Supabase project SQL Editor
-- Tables ordered by dependency (no FK errors)

CREATE EXTENSION IF NOT EXISTS citext;

-- Tier 0: No foreign keys (or only auth.users refs)

CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  page_slug text NOT NULL UNIQUE,
  og_title text,
  og_description text,
  og_image_url text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT site_settings_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.live_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  scheduled_at timestamp with time zone NOT NULL,
  is_live boolean DEFAULT false,
  daily_room_name text DEFAULT ''::text,
  daily_room_url text DEFAULT ''::text,
  vimeo_live_url text DEFAULT ''::text,
  type text DEFAULT 'audio'::text,
  duration text DEFAULT '30 min'::text,
  gradient text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT live_sessions_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  duration integer,
  mood_category text,
  media_type text DEFAULT 'audio'::text,
  vimeo_id text,
  audio_url text,
  is_free boolean DEFAULT false,
  thumbnail text,
  created_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'draft'::text,
  youtube_url text,
  gradient text,
  type text,
  CONSTRAINT sessions_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.early_access_signups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  source text,
  user_agent text,
  ip_country text,
  resend_synced boolean DEFAULT false,
  invited_at timestamp with time zone,
  converted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT early_access_signups_pkey PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS early_access_signups_email_idx ON public.early_access_signups (email);

CREATE TABLE IF NOT EXISTS public.affiliates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  referral_code text NOT NULL UNIQUE,
  status text DEFAULT 'pending'::text,
  clicks integer DEFAULT 0,
  signups integer DEFAULT 0,
  earnings numeric DEFAULT 0,
  paid_out numeric DEFAULT 0,
  application_name text,
  application_email text,
  application_platform text,
  application_audience_size text,
  application_why text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT affiliates_pkey PRIMARY KEY (id),
  CONSTRAINT affiliates_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.user_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id text NOT NULL,
  position_seconds numeric NOT NULL DEFAULT 0,
  duration_seconds numeric NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_progress_pkey PRIMARY KEY (id),
  CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.playlists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  session_ids text[] NOT NULL DEFAULT '{}'::text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT playlists_pkey PRIMARY KEY (id),
  CONSTRAINT playlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  session_tag text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text])),
  reviewer_name text NOT NULL DEFAULT 'Anonymous'::text,
  reviewer_initials text NOT NULL DEFAULT '?'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.community_settings (
  user_id uuid NOT NULL,
  show_in_feed boolean NOT NULL DEFAULT false,
  show_in_leaderboard boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_settings_pkey PRIMARY KEY (user_id),
  CONSTRAINT community_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.emoji_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  emoji text NOT NULL,
  seen boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT emoji_reactions_pkey PRIMARY KEY (id),
  CONSTRAINT emoji_reactions_from_user_id_fkey FOREIGN KEY (from_user_id) REFERENCES auth.users(id),
  CONSTRAINT emoji_reactions_to_user_id_fkey FOREIGN KEY (to_user_id) REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.brand_partnerships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  brand_name text NOT NULL,
  meditators_reached integer DEFAULT 0,
  meditators_delta integer DEFAULT 0,
  engagement_rate integer DEFAULT 0,
  affiliate_signups integer DEFAULT 0,
  total_earned numeric DEFAULT 0,
  currency text DEFAULT 'GBP'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT brand_partnerships_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.podcasts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  episode_number integer NOT NULL DEFAULT 1,
  season integer,
  guest_name text,
  guest_role text,
  guest_bio text,
  guest_photo_url text,
  cover_image_url text,
  audio_url text,
  duration text,
  description text,
  pull_quote text,
  highlights jsonb DEFAULT '[]'::jsonb,
  resources jsonb DEFAULT '[]'::jsonb,
  transcript text,
  tags text[] DEFAULT '{}'::text[],
  stat1_value text,
  stat1_label text,
  stat2_value text,
  stat2_label text,
  published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT podcasts_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.crew_activity_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  crew_activity_id uuid NOT NULL,
  from_user_id uuid NOT NULL,
  from_display_name text,
  emoji text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT crew_activity_reactions_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  from_user_id uuid,
  from_display_name text,
  type text NOT NULL DEFAULT 'reaction'::text,
  message text NOT NULL,
  post_id uuid,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

-- Tier 1: Depends on auth.users (public.users self-references)

CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL,
  email text NOT NULL,
  name text,
  avatar text,
  subscription_status text DEFAULT 'free'::text,
  subscription_tier text DEFAULT 'free'::text,
  stripe_customer_id text,
  referred_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  access_level integer NOT NULL DEFAULT 0,
  trial_ends_at timestamp with time zone,
  last_active_at timestamp with time zone,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT users_referred_by_fkey FOREIGN KEY (referred_by) REFERENCES public.users(id)
);

CREATE TABLE IF NOT EXISTS public.crews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid,
  invite_code text DEFAULT substring(md5((random())::text), 1, 8) UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT crews_pkey PRIMARY KEY (id)
);

-- Tier 2: Depends on public.users / public.sessions / public.crews

CREATE TABLE IF NOT EXISTS public.watchlist (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT watchlist_pkey PRIMARY KEY (id),
  CONSTRAINT watchlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT watchlist_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id)
);

CREATE TABLE IF NOT EXISTS public.downloads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id uuid,
  downloaded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT downloads_pkey PRIMARY KEY (id),
  CONSTRAINT downloads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT downloads_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id)
);

CREATE TABLE IF NOT EXISTS public.group_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  host_user_id uuid,
  session_id uuid,
  scheduled_at timestamp with time zone NOT NULL,
  max_participants integer DEFAULT 50,
  is_private boolean DEFAULT false,
  invite_code text UNIQUE,
  status text DEFAULT 'scheduled'::text,
  created_at timestamp with time zone DEFAULT now(),
  duration_minutes integer NOT NULL DEFAULT 10,
  is_public boolean NOT NULL DEFAULT true,
  gradient text,
  session_title text,
  host_name text,
  host_id uuid,
  CONSTRAINT group_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT group_sessions_host_user_id_fkey FOREIGN KEY (host_user_id) REFERENCES public.users(id),
  CONSTRAINT group_sessions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id)
);

CREATE TABLE IF NOT EXISTS public.challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  challenge_type text DEFAULT 'personal'::text,
  target_sessions integer,
  target_days integer,
  target_minutes integer,
  mood_category text,
  duration_days integer DEFAULT 30,
  is_official boolean DEFAULT false,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT challenges_pkey PRIMARY KEY (id),
  CONSTRAINT challenges_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  content text NOT NULL,
  post_type text DEFAULT 'general'::text,
  session_id uuid,
  likes integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_posts_pkey PRIMARY KEY (id),
  CONSTRAINT community_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT community_posts_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id)
);

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text,
  duration_minutes integer DEFAULT 0,
  completed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE TABLE IF NOT EXISTS public.live_attendances (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id uuid,
  attended_at timestamp with time zone DEFAULT now(),
  CONSTRAINT live_attendances_pkey PRIMARY KEY (id),
  CONSTRAINT live_attendances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT live_attendances_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.live_sessions(id)
);

CREATE TABLE IF NOT EXISTS public.crew_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  crew_id uuid,
  user_id uuid,
  role text DEFAULT 'member'::text,
  joined_at timestamp with time zone DEFAULT now(),
  avatar_url text,
  display_name text,
  CONSTRAINT crew_members_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.crew_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  crew_id uuid,
  user_id uuid,
  display_name text NOT NULL,
  activity_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT crew_activity_pkey PRIMARY KEY (id),
  CONSTRAINT crew_activity_crew_id_fkey FOREIGN KEY (crew_id) REFERENCES public.crews(id),
  CONSTRAINT crew_activity_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.brand_crews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  brand_name text NOT NULL,
  brand_logo_url text,
  brand_description text,
  crew_id uuid,
  contact_email text,
  is_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT brand_crews_pkey PRIMARY KEY (id),
  CONSTRAINT brand_crews_crew_id_fkey FOREIGN KEY (crew_id) REFERENCES public.crews(id)
);

CREATE TABLE IF NOT EXISTS public.brand_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  brand_partnership_id uuid,
  title text NOT NULL,
  scheduled_at timestamp with time zone NOT NULL,
  sponsor_segment text,
  is_live boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT brand_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT brand_sessions_brand_partnership_id_fkey FOREIGN KEY (brand_partnership_id) REFERENCES public.brand_partnerships(id)
);

-- Tier 3: Depends on Tier 2

CREATE TABLE IF NOT EXISTS public.group_session_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_session_id uuid,
  user_id uuid,
  joined_at timestamp with time zone DEFAULT now(),
  completed boolean DEFAULT false,
  CONSTRAINT group_session_participants_pkey PRIMARY KEY (id),
  CONSTRAINT group_session_participants_group_session_id_fkey FOREIGN KEY (group_session_id) REFERENCES public.group_sessions(id)
);

CREATE TABLE IF NOT EXISTS public.group_session_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_session_id uuid,
  user_id uuid NOT NULL,
  display_name text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT group_session_messages_pkey PRIMARY KEY (id),
  CONSTRAINT group_session_messages_group_session_id_fkey FOREIGN KEY (group_session_id) REFERENCES public.group_sessions(id)
);

CREATE TABLE IF NOT EXISTS public.user_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  challenge_id uuid,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  progress integer DEFAULT 0,
  status text DEFAULT 'active'::text,
  CONSTRAINT user_challenges_pkey PRIMARY KEY (id),
  CONSTRAINT user_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_challenges_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id)
);

CREATE TABLE IF NOT EXISTS public.community_post_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_post_likes_pkey PRIMARY KEY (id),
  CONSTRAINT community_post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.community_posts(id),
  CONSTRAINT community_post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE TABLE IF NOT EXISTS public.community_post_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid,
  user_id uuid,
  emoji text NOT NULL DEFAULT '❤️'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_post_reactions_pkey PRIMARY KEY (id),
  CONSTRAINT community_post_reactions_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.community_posts(id),
  CONSTRAINT community_post_reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.brand_crew_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  brand_crew_id uuid,
  user_id uuid,
  display_name text NOT NULL,
  avatar_url text,
  joined_at timestamp with time zone DEFAULT now(),
  CONSTRAINT brand_crew_members_pkey PRIMARY KEY (id),
  CONSTRAINT brand_crew_members_brand_crew_id_fkey FOREIGN KEY (brand_crew_id) REFERENCES public.brand_crews(id),
  CONSTRAINT brand_crew_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- RLS + Functions

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_sessions" ON sessions FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION increment_affiliate_clicks(code text)
RETURNS void AS $$
  UPDATE affiliates SET clicks = clicks + 1 WHERE referral_code = code;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION add_affiliate_earnings(aff_id uuid, pennies integer)
RETURNS void AS $$
  UPDATE affiliates SET earnings = earnings + pennies WHERE id = aff_id;
$$ LANGUAGE sql;
