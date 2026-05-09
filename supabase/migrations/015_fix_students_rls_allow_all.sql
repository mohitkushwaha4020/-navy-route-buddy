-- Fix approved_students RLS: allow all operations (app-level auth handles admin check)

DROP POLICY IF EXISTS "Everyone can view approved students" ON approved_students;
DROP POLICY IF EXISTS "Admins can manage approved students" ON approved_students;

CREATE POLICY "Anyone can view approved students"
ON approved_students FOR SELECT USING (true);

CREATE POLICY "Anyone can insert approved students"
ON approved_students FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update approved students"
ON approved_students FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete approved students"
ON approved_students FOR DELETE USING (true);
