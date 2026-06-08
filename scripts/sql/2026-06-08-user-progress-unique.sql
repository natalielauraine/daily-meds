-- user_progress.upsert({ onConflict: "user_id,session_id" }) requires a unique
-- constraint on those two columns. Without it every write silently fails and
-- stats/continue-watching show nothing.
ALTER TABLE user_progress
  ADD CONSTRAINT user_progress_user_session_unique UNIQUE (user_id, session_id);
