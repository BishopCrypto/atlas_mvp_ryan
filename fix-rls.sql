-- Fix RLS policies for Atlas Intelligence (Generic version)

-- 1. Enable RLS on tenants table (assuming it already exists)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to active tenants" ON tenants;
DROP POLICY IF EXISTS "Allow authenticated read access to tenants" ON tenants;
DROP POLICY IF EXISTS "Allow service role full access to tenants" ON tenants;
DROP POLICY IF EXISTS "Enable read access for all users" ON tenants;

-- 3. Create simple read policy for everyone (public access)
CREATE POLICY "Enable read access for all users" ON tenants
    FOR SELECT USING (true);

-- 4. Create policy for authenticated users (if needed later)
CREATE POLICY "Allow authenticated full access to tenants" ON tenants
    FOR ALL USING (auth.role() = 'authenticated');

-- 5. Create service role policy (for admin operations)
CREATE POLICY "Allow service role full access to tenants" ON tenants
    FOR ALL USING (auth.role() = 'service_role');

-- 6. Verify the current table structure
SELECT 'Current tenants table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tenants' 
ORDER BY ordinal_position;

-- 7. Show current data
SELECT 'Current tenants data:' as info;
SELECT * FROM tenants ORDER BY created_at;

-- 8. Show active policies
SELECT 'Active RLS policies:' as info;
SELECT schemaname, tablename, policyname, permissive, cmd, qual 
FROM pg_policies 
WHERE tablename = 'tenants';