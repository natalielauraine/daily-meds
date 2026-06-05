-- Short shareable IDs for sessions (and future content types).
-- 6-char lowercase alphanumeric = 36^6 = ~2.2 billion unique values.

ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS short_id text;
CREATE UNIQUE INDEX IF NOT EXISTS sessions_short_id_idx ON public.sessions (short_id);
