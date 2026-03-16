-- Add pickup_address column to approved_students table
ALTER TABLE approved_students 
ADD COLUMN IF NOT EXISTS pickup_address TEXT;

-- Add bus_id to link student with specific bus
ALTER TABLE approved_students 
ADD COLUMN IF NOT EXISTS bus_id UUID REFERENCES buses(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_approved_students_bus_id ON approved_students(bus_id);
CREATE INDEX IF NOT EXISTS idx_approved_students_pickup_address ON approved_students(pickup_address);

-- Add comment
COMMENT ON COLUMN approved_students.pickup_address IS 'The bus stop where student will board the bus';
COMMENT ON COLUMN approved_students.bus_id IS 'The bus assigned to this student based on pickup address';
