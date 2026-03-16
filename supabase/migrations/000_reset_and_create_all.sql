-- Complete database setup script
-- Run this in Supabase SQL Editor to ensure all tables are created properly

-- First, check if buses table exists and has correct columns
DO $$ 
BEGIN
    -- Drop and recreate buses table to ensure clean state
    DROP TABLE IF EXISTS buses CASCADE;
    
    -- Create buses table with all columns
    CREATE TABLE buses (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      bus_number TEXT NOT NULL UNIQUE,
      route_number TEXT NOT NULL,
      stops TEXT[] NOT NULL DEFAULT '{}',
      driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
      driver_full_name TEXT,
      driver_mobile TEXT,
      driver_email TEXT,
      driver_password TEXT,
      driver_photo_url TEXT,
      status TEXT CHECK (status IN ('available', 'in_use', 'maintenance')) DEFAULT 'available',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Enable Row Level Security
    ALTER TABLE buses ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Everyone can view buses" ON buses;
    DROP POLICY IF EXISTS "Admins can manage buses" ON buses;

    -- Buses policies
    CREATE POLICY "Everyone can view buses" ON buses FOR SELECT USING (true);
    CREATE POLICY "Admins can manage buses" ON buses FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_buses_driver_id ON buses(driver_id);
    CREATE INDEX IF NOT EXISTS idx_buses_status ON buses(status);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_buses_driver_email ON buses(driver_email) WHERE driver_email IS NOT NULL;

    -- Trigger for updated_at
    DROP TRIGGER IF EXISTS update_buses_updated_at ON buses;
    CREATE TRIGGER update_buses_updated_at BEFORE UPDATE ON buses
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- Add bus_id to routes table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'routes' AND column_name = 'bus_id'
    ) THEN
        ALTER TABLE routes ADD COLUMN bus_id UUID REFERENCES buses(id) ON DELETE SET NULL;
        CREATE INDEX idx_routes_bus_id ON routes(bus_id);
    END IF;

END $$;
