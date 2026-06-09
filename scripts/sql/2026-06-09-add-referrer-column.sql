-- Add referrer column to early_access_signups
-- Stores the answer to "Who told you about The Daily Meds?"
-- Separate from `source` which captures the channel (Instagram, TikTok, etc.)

ALTER TABLE public.early_access_signups
  ADD COLUMN IF NOT EXISTS referrer TEXT;
