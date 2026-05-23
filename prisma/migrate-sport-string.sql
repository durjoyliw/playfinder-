ALTER TABLE user_sports ALTER COLUMN sport TYPE TEXT USING (lower(replace(sport::text, '_', '-')));
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "isHighlight" BOOLEAN NOT NULL DEFAULT false;
