-- Add "coming soon" flag to sessions table.
-- Orthogonal to status (draft/published) — a session can be coming soon in either state.
-- Only published + coming_soon sessions appear in the "Dropping Soon" section and library teasers.

ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS is_coming_soon boolean DEFAULT false;
