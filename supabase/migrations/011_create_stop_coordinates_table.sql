-- Create stop_coordinates table to cache geocoded addresses
-- This avoids repeated API calls to geocoding service

CREATE TABLE IF NOT EXISTS stop_coordinates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT UNIQUE NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stop_coordinates_address ON stop_coordinates(address);

-- Enable RLS
ALTER TABLE stop_coordinates ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read
CREATE POLICY "Allow authenticated users to read stop coordinates"
  ON stop_coordinates
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins to insert/update
CREATE POLICY "Allow admins to manage stop coordinates"
  ON stop_coordinates
  FOR ALL
  TO authenticated
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_stop_coordinates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_stop_coordinates_timestamp
  BEFORE UPDATE ON stop_coordinates
  FOR EACH ROW
  EXECUTE FUNCTION update_stop_coordinates_updated_at();
