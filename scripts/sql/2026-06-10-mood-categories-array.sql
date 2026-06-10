-- Add mood_categories array column to sessions table
-- Keeps existing mood_category column intact during transition

-- Step 1: Add the array column
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS mood_categories text[] DEFAULT '{}';

-- Step 2: Backfill — copy existing single mood into a one-element array
UPDATE sessions
SET mood_categories = ARRAY[mood_category]
WHERE mood_category IS NOT NULL AND mood_category != ''
  AND (mood_categories IS NULL OR mood_categories = '{}');

-- Step 3: Apply known multi-category mappings for the 5 free sessions
-- Titles matched against actual DB values (staging verified 2026-06-10)
UPDATE sessions SET mood_categories = ARRAY['Heavy Emotions', 'Crisis Emergencies', 'Life Moments', 'Addiction', 'Party Recovery']
WHERE title = 'High as F**k';

UPDATE sessions SET mood_categories = ARRAY['Crisis Emergencies', 'Life Moments', 'Addiction', 'Party Recovery', 'Morning Meds']
WHERE title = 'On a Come Down';

UPDATE sessions SET mood_categories = ARRAY['Heavy Emotions', 'Life Moments', 'Everyday Moods', 'Crisis Emergencies', 'Vulnerable Stuff', 'On The Road', 'Founder Stress']
WHERE title = 'Feeling Anxious';

UPDATE sessions SET mood_categories = ARRAY['Evening Meds', 'Sleep', 'Daily Practice', 'On The Road']
WHERE title = 'Snuggle Down';

UPDATE sessions SET mood_categories = ARRAY['Heavy Emotions', 'Own Your Shadow', 'Crisis Emergencies', 'Vulnerable Stuff', 'Career & Work', 'Life Moments', 'Founder Stress']
WHERE title = 'Money Stress';
