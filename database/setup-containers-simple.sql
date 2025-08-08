-- Simple setup: Just add containers table to existing schema
-- This works with your current database setup

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

-- Enable RLS
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can see containers from their tenant" ON containers
    FOR SELECT USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can insert containers for their tenant" ON containers
    FOR INSERT WITH CHECK (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can update containers from their tenant" ON containers
    FOR UPDATE USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

-- Add index
CREATE INDEX IF NOT EXISTS idx_containers_tenant_id ON containers(tenant_id);

-- Success
SELECT 'Containers table created successfully!' as result;