-- Safe setup: Only add what doesn't exist
-- This handles existing policies gracefully

-- Only add containers table if it doesn't exist
CREATE TABLE IF NOT EXISTS containers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS (safe if already enabled)
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can see containers from their tenant" ON containers;
DROP POLICY IF EXISTS "Users can insert containers for their tenant" ON containers;  
DROP POLICY IF EXISTS "Users can update containers from their tenant" ON containers;

-- Create policies
CREATE POLICY "Users can see containers from their tenant" ON containers
    FOR SELECT USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can insert containers for their tenant" ON containers
    FOR INSERT WITH CHECK (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can update containers from their tenant" ON containers
    FOR UPDATE USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

-- Add index (safe if already exists)
CREATE INDEX IF NOT EXISTS idx_containers_tenant_id ON containers(tenant_id);

-- Success
SELECT 'Containers table ready!' as result;