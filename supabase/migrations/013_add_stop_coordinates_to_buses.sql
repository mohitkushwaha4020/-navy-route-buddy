-- Add stop_coordinates column to buses table for lat/lng based stops
ALTER TABLE buses 
ADD COLUMN IF NOT EXISTS stop_coordinates JSONB DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN buses.stop_coordinates IS 'Array of stop objects with name, latitude, and longitude';
