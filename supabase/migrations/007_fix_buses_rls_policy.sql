-- Fix Row Level Security policies for buses table

-- Drop existing policies
DROP POLICY IF EXISTS "Everyone can view buses" ON buses;
DROP POLICY IF EXISTS "Admins can manage buses" ON buses;

-- Create new policies
-- Allow everyone to view buses
CREATE POLICY "Everyone can view buses" 
ON buses FOR SELECT 
USING (true);

-- Allow admins to insert buses
CREATE POLICY "Admins can insert buses" 
ON buses FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Allow admins to update buses
CREATE POLICY "Admins can update buses" 
ON buses FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Allow admins to delete buses
CREATE POLICY "Admins can delete buses" 
ON buses FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
