-- Add missing screening columns to list_members table

ALTER TABLE list_members 
ADD COLUMN IF NOT EXISTS screening_score INTEGER,
ADD COLUMN IF NOT EXISTS screening_details JSONB;

SELECT 'Screening columns added to list_members table!' as result;