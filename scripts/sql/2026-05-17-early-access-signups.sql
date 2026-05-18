-- early_access_signups
-- Captures email + name from the /early-access waitlist page.
-- Inserts happen via /api/email/early-access-signup using the service-role key.
-- Run this in Supabase > SQL Editor.

-- Enable CITEXT extension — must come before CREATE TABLE since the email column uses it
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS public.early_access_signups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         CITEXT NOT NULL,
  name          TEXT,
  source        TEXT,                                  -- e.g. 'email-blast-2026-05', 'organic', UTM source
  user_agent    TEXT,
  ip_country    TEXT,                                  -- optional, set from request headers if available
  resend_synced BOOLEAN DEFAULT FALSE,                 -- flips to TRUE after the row is added to the Resend audience
  invited_at    TIMESTAMPTZ,                           -- set when the early-access invite is sent
  converted_at  TIMESTAMPTZ,                           -- set when the signup converts into a user account
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique on email so the same person hitting Submit twice doesn't duplicate
CREATE UNIQUE INDEX IF NOT EXISTS early_access_signups_email_unique
  ON public.early_access_signups (email);

-- Fast lookup by source for campaign analytics
CREATE INDEX IF NOT EXISTS early_access_signups_source_idx
  ON public.early_access_signups (source);

-- Fast lookup by created_at for time-series charts
CREATE INDEX IF NOT EXISTS early_access_signups_created_at_idx
  ON public.early_access_signups (created_at DESC);

-- RLS: only service-role can read/write. No public anon access.
ALTER TABLE public.early_access_signups ENABLE ROW LEVEL SECURITY;

-- No policies defined = no anon access. Service-role bypasses RLS.
-- Admin pages should query through a server route using the service-role key,
-- not directly from the client.
