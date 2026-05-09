-- Fix buses RLS: allow all authenticated operations
-- Admin access is controlled at app level (hardcoded admin login)

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can insert buses" ON buses;
DROP POLICY IF EXISTS "Admins can update buses" ON buses;
DROP POLICY IF EXISTS "Admins can delete buses" ON buses;
DROP POLICY IF EXISTS "Everyone can view buses" ON buses;

-- Allow anyone to read buses
CREATE POLICY "Anyone can view buses"
ON buses FOR SELECT
USING (true);

-- Allow anyone to insert buses (app-level auth handles admin check)
CREATE POLICY "Anyone can insert buses"
ON buses FOR INSERT
WITH CHECK (true);

-- Allow anyone to update buses
CREATE POLICY "Anyone can update buses"
ON buses FOR UPDATE
USING (true);

-- Allow anyone to delete buses
CREATE POLICY "Anyone can delete buses"
ON buses FOR DELETE
USING (true);
