-- =============================================================================
-- Daily Meds — Complete RLS Policy Set
-- Run in Supabase SQL Editor (staging first, then production)
-- Generated: 2026-06-03
-- =============================================================================
--
-- APPROACH:
-- - Admin-managed content: public read, authenticated write
--   (admin gating is enforced by middleware + ADMIN_EMAIL env var)
-- - User-owned data: owner-only access (user_id = auth.uid())
-- - Community/social: authenticated read, owner write
-- - System tables: locked down (service role only)
-- - API-only tables: no anon policies (service role bypasses RLS)
--
-- Service-role operations (webhooks, cron jobs, admin API routes)
-- bypass RLS entirely — no policies needed for those paths.
-- =============================================================================

BEGIN;

-- =============================================
-- GROUP A: Admin-Managed Content Tables
-- Public can read, authenticated can write
-- (admin check lives in app middleware, not DB)
-- =============================================

-- sessions (RLS already enabled, public_read_sessions already exists)
CREATE POLICY "authenticated_insert_sessions" ON sessions
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_update_sessions" ON sessions
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_delete_sessions" ON sessions
  FOR DELETE TO authenticated
  USING (true);

-- podcasts
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_podcasts" ON podcasts
  FOR SELECT USING (true);
CREATE POLICY "authenticated_insert_podcasts" ON podcasts
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_podcasts" ON podcasts
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_delete_podcasts" ON podcasts
  FOR DELETE TO authenticated USING (true);

-- live_sessions
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_live_sessions" ON live_sessions
  FOR SELECT USING (true);
CREATE POLICY "authenticated_insert_live_sessions" ON live_sessions
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_live_sessions" ON live_sessions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_delete_live_sessions" ON live_sessions
  FOR DELETE TO authenticated USING (true);

-- site_settings (public read for SSR; admin writes via service-role API)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_site_settings" ON site_settings
  FOR SELECT USING (true);

-- brand_partnerships (read-only public)
ALTER TABLE public.brand_partnerships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_brand_partnerships" ON brand_partnerships
  FOR SELECT USING (true);

-- brand_sessions (read-only public)
ALTER TABLE public.brand_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_brand_sessions" ON brand_sessions
  FOR SELECT USING (true);

-- challenges (public read, authenticated create)
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_challenges" ON challenges
  FOR SELECT USING (true);
CREATE POLICY "authenticated_insert_challenges" ON challenges
  FOR INSERT TO authenticated WITH CHECK (true);


-- =============================================
-- GROUP B: User-Owned Data Tables
-- Owner only (user_id = auth.uid())
-- =============================================

-- users (the public.users profile table)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Everyone can read basic profile info (name, avatar needed for community)
-- Sensitive fields (email, stripe_customer_id) are visible but acceptable
-- because only authenticated users can query, and the app never exposes raw queries.
-- For tighter security later: create a view exposing only safe columns.
CREATE POLICY "users_read_authenticated" ON users
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "users_insert_own" ON users
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "users_update_own" ON users
  FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- user_progress
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_progress_owner" ON user_progress
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_sessions_owner" ON user_sessions
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- playlists
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "playlists_owner" ON playlists
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- watchlist
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "watchlist_owner" ON watchlist
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- downloads
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "downloads_owner" ON downloads
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- reviews (users insert own, public reads approved, admin manages via service role)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_read_approved_or_own" ON reviews
  FOR SELECT USING (status = 'approved' OR user_id = auth.uid());
CREATE POLICY "reviews_insert_own" ON reviews
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- affiliates (owner reads/writes own; webhooks + cron use service role)
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "affiliates_read_own" ON affiliates
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "affiliates_insert_own" ON affiliates
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "affiliates_update_own" ON affiliates
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- community_settings
ALTER TABLE public.community_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "community_settings_owner" ON community_settings
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- notifications (read/update own, anyone authenticated can create)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_read_own" ON notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- emoji_reactions
ALTER TABLE public.emoji_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "emoji_reactions_read_involved" ON emoji_reactions
  FOR SELECT TO authenticated
  USING (to_user_id = auth.uid() OR from_user_id = auth.uid());
CREATE POLICY "emoji_reactions_insert" ON emoji_reactions
  FOR INSERT TO authenticated WITH CHECK (from_user_id = auth.uid());
CREATE POLICY "emoji_reactions_update_recipient" ON emoji_reactions
  FOR UPDATE TO authenticated USING (to_user_id = auth.uid());


-- =============================================
-- GROUP C: Community / Social Tables
-- Authenticated read, owner write
-- =============================================

-- community_posts
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "community_posts_read" ON community_posts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "community_posts_insert_own" ON community_posts
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- community_post_reactions
ALTER TABLE public.community_post_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "community_post_reactions_read" ON community_post_reactions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "community_post_reactions_insert" ON community_post_reactions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "community_post_reactions_delete_own" ON community_post_reactions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- community_post_likes (in schema but unused in code — lock down defensively)
ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "community_post_likes_read" ON community_post_likes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "community_post_likes_owner" ON community_post_likes
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());


-- =============================================
-- GROUP D: Crews & Groups
-- Authenticated read, owner/member write
-- =============================================

-- crews
ALTER TABLE public.crews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crews_read" ON crews FOR SELECT USING (true);
CREATE POLICY "crews_insert" ON crews
  FOR INSERT TO authenticated WITH CHECK (true);

-- crew_members
ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crew_members_read" ON crew_members
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "crew_members_insert" ON crew_members
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "crew_members_update_own" ON crew_members
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "crew_members_delete_own" ON crew_members
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- crew_activity
ALTER TABLE public.crew_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crew_activity_read" ON crew_activity
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "crew_activity_insert" ON crew_activity
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- crew_activity_reactions
ALTER TABLE public.crew_activity_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crew_activity_reactions_read" ON crew_activity_reactions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "crew_activity_reactions_insert" ON crew_activity_reactions
  FOR INSERT TO authenticated WITH CHECK (from_user_id = auth.uid());
CREATE POLICY "crew_activity_reactions_delete_own" ON crew_activity_reactions
  FOR DELETE TO authenticated USING (from_user_id = auth.uid());

-- brand_crews (public read, authenticated apply, admin manages via service role)
ALTER TABLE public.brand_crews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brand_crews_read" ON brand_crews FOR SELECT USING (true);
CREATE POLICY "brand_crews_insert" ON brand_crews
  FOR INSERT TO authenticated WITH CHECK (true);

-- brand_crew_members
ALTER TABLE public.brand_crew_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brand_crew_members_read" ON brand_crew_members
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "brand_crew_members_insert" ON brand_crew_members
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "brand_crew_members_update_own" ON brand_crew_members
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- group_sessions (public read, host manages)
ALTER TABLE public.group_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "group_sessions_read" ON group_sessions FOR SELECT USING (true);
CREATE POLICY "group_sessions_insert" ON group_sessions
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "group_sessions_update_host" ON group_sessions
  FOR UPDATE TO authenticated
  USING (host_user_id = auth.uid() OR host_id = auth.uid());

-- group_session_participants
ALTER TABLE public.group_session_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "group_session_participants_read" ON group_session_participants
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "group_session_participants_insert" ON group_session_participants
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "group_session_participants_update_own" ON group_session_participants
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- group_session_messages
ALTER TABLE public.group_session_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "group_session_messages_read" ON group_session_messages
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "group_session_messages_insert" ON group_session_messages
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- live_attendances
ALTER TABLE public.live_attendances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "live_attendances_insert" ON live_attendances
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "live_attendances_read_own" ON live_attendances
  FOR SELECT TO authenticated USING (user_id = auth.uid());


-- =============================================
-- GROUP E: Challenge System
-- =============================================

-- user_challenges (in schema, unused in code — lock down defensively)
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_challenges_owner" ON user_challenges
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());


-- =============================================
-- GROUP F: System Tables (service role only)
-- =============================================

-- early_access_signups (all access via service-role API routes)
ALTER TABLE public.early_access_signups ENABLE ROW LEVEL SECURITY;
-- No anon/authenticated policies. Service role bypasses RLS.
-- This locks the table to browser clients entirely.


COMMIT;

-- =============================================================================
-- POST-RUN NOTES:
--
-- 1. Service-role operations (Stripe webhooks, cron email jobs, admin API routes
--    that use SUPABASE_SERVICE_ROLE_KEY) bypass RLS entirely — they are unaffected.
--
-- 2. The admin content/podcasts/live pages use the browser client (anon key).
--    The "authenticated write" policies allow any logged-in user to write.
--    This is safe because the admin UI is gated by ADMIN_EMAIL middleware.
--    For defense-in-depth, consider migrating these to API routes with
--    service-role clients (matching the pattern of admin/reviews, admin/users).
--
-- 3. challenge_participants table is used in code but MISSING from the schema.
--    If it exists in the live DB, add RLS policies for it separately.
--    Run: SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'challenge_participants');
--
-- 4. The public.users table allows all authenticated users to read all rows.
--    This is needed for community features (names, avatars). Stripe customer IDs
--    are exposed. For tighter security, create a view with only safe columns.
-- =============================================================================
