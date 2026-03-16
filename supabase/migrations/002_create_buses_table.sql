-- Create buses table
CREATE TABLE IF NOT EXISTS buses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bus_number TEXT NOT NULL UNIQUE,
  route_number TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  stops TEXT[] NOT NULL DEFAULT '{}',
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('available', 'in_use', 'maintenance')) DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;

-- Buses policies
CREATE POLICY "Everyone can view buses" ON buses FOR SELECT USING (true);
CREATE POLICY "Admins can manage buses" ON buses FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create index for better performance
CREATE INDEX idx_buses_driver_id ON buses(driver_id);
CREATE INDEX idx_buses_status ON buses(status);

-- Trigger for updated_at
CREATE TRIGGER update_buses_updated_at BEFORE UPDATE ON buses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add bus_id to routes table
ALTER TABLE routes ADD COLUMN IF NOT EXISTS bus_id UUID REFERENCES buses(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_routes_bus_id ON routes(bus_id);
