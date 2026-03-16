-- Create approved_students table
CREATE TABLE IF NOT EXISTS approved_students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE approved_students ENABLE ROW LEVEL SECURITY;

-- Approved students policies
CREATE POLICY "Everyone can view approved students" ON approved_students FOR SELECT USING (true);
CREATE POLICY "Admins can manage approved students" ON approved_students FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create index for better performance
CREATE INDEX idx_approved_students_student_id ON approved_students(student_id);
CREATE INDEX idx_approved_students_email ON approved_students(email);
CREATE INDEX idx_approved_students_is_approved ON approved_students(is_approved);

-- Trigger for updated_at
CREATE TRIGGER update_approved_students_updated_at BEFORE UPDATE ON approved_students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
