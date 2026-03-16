-- Fix buses RLS policy to work with auth.users metadata instead of profiles table

-- Drop existing policies
DROP POLICY IF EXISTS "Everyone can view buses" ON buses;
DROP POLICY IF EXISTS "Admins can insert buses" ON buses;
DROP POLICY IF EXISTS "Admins can update buses" ON buses;
DROP POLICY IF EXISTS "Admins can delete buses" ON buses;

-- Create new policies using auth.users metadata
-- Allow everyone to view buses
CREATE POLICY "Everyone can view buses" 
ON buses FOR SELECT 
USING (true);

-- Allow admins to insert buses (check user_metadata.role)
CREATE POLICY "Admins can insert buses" 
ON buses FOR INSERT 
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Allow admins to update buses
CREATE POLICY "Admins can update buses" 
ON buses FOR UPDATE 
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Allow admins to delete buses
CREATE POLICY "Admins can delete buses" 
ON buses FOR DELETE 
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
