-- Add driver email and password columns to buses table
ALTER TABLE buses ADD COLUMN IF NOT EXISTS driver_email TEXT;
ALTER TABLE buses ADD COLUMN IF NOT EXISTS driver_password TEXT;

-- Create unique index on driver_email to ensure one driver per bus
CREATE UNIQUE INDEX IF NOT EXISTS idx_buses_driver_email ON buses(driver_email) WHERE driver_email IS NOT NULL;
