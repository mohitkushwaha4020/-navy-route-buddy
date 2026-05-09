-- Drop ALL existing policies on buses
DROP POLICY IF EXISTS "Anyone can view buses" ON buses;
DROP POLICY IF EXISTS "Anyone can insert buses" ON buses;
DROP POLICY IF EXISTS "Anyone can update buses" ON buses;
DROP POLICY IF EXISTS "Anyone can delete buses" ON buses;
DROP POLICY IF EXISTS "Everyone can view buses" ON buses;
DROP POLICY IF EXISTS "Admins can insert buses" ON buses;
DROP POLICY IF EXISTS "Admins can update buses" ON buses;
DROP POLICY IF EXISTS "Admins can delete buses" ON buses;

-- Create fresh open policies for buses
CREATE POLICY "Anyone can view buses" ON buses FOR SELECT USING (true);
CREATE POLICY "Anyone can insert buses" ON buses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update buses" ON buses FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete buses" ON buses FOR DELETE USING (true);

-- Drop ALL existing policies on approved_students
DROP POLICY IF EXISTS "Anyone can view approved students" ON approved_students;
DROP POLICY IF EXISTS "Anyone can insert approved students" ON approved_students;
DROP POLICY IF EXISTS "Anyone can update approved students" ON approved_students;
DROP POLICY IF EXISTS "Anyone can delete approved students" ON approved_students;
DROP POLICY IF EXISTS "Everyone can view approved students" ON approved_students;
DROP POLICY IF EXISTS "Admins can manage approved students" ON approved_students;

-- Create fresh open policies for approved_students
CREATE POLICY "Anyone can view approved students" ON approved_students FOR SELECT USING (true);
CREATE POLICY "Anyone can insert approved students" ON approved_students FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update approved students" ON approved_students FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete approved students" ON approved_students FOR DELETE USING (true);
