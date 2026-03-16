-- Add profile_photo_url column to approved_students table
ALTER TABLE approved_students 
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Add comment
COMMENT ON COLUMN approved_students.profile_photo_url IS 'URL to student profile photo stored in Supabase Storage';
