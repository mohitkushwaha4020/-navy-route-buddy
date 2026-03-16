-- Add driver details columns to buses table
ALTER TABLE buses ADD COLUMN IF NOT EXISTS driver_full_name TEXT;
ALTER TABLE buses ADD COLUMN IF NOT EXISTS driver_mobile TEXT;
ALTER TABLE buses ADD COLUMN IF NOT EXISTS driver_photo_url TEXT;

-- Remove capacity column
ALTER TABLE buses DROP COLUMN IF EXISTS capacity;


