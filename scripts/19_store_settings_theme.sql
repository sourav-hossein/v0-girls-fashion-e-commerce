-- Store theme preset selection

ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'rose';

UPDATE store_settings
SET theme = 'rose'
WHERE theme IS NULL;

ALTER TABLE store_settings
  DROP CONSTRAINT IF EXISTS store_settings_theme_check;

ALTER TABLE store_settings
  ADD CONSTRAINT store_settings_theme_check
  CHECK (theme IN ('rose', 'lavender', 'ocean'));
