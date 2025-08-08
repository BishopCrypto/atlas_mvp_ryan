-- Fix missing columns in lists table
-- Add all the columns that the app expects but are missing from the current schema

ALTER TABLE lists ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE lists ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE lists ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE lists ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE lists ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;
ALTER TABLE lists ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;

-- Update any existing records to have is_active = true if they don't already
UPDATE lists SET is_active = true WHERE is_active IS NULL;

SELECT 'Lists table columns updated successfully!' as result;