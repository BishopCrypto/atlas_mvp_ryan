-- Fix RLS policies for containers table
-- The current policies require JWT authentication which isn't working in development

-- First, check if containers table exists and create if needed
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

-- Drop existing restrictive policies (safe with IF EXISTS)
DROP POLICY IF EXISTS "Users can see containers from their tenant" ON containers;
DROP POLICY IF EXISTS "Users can insert containers for their tenant" ON containers;  
DROP POLICY IF EXISTS "Users can update containers from their tenant" ON containers;
DROP POLICY IF EXISTS "Enable read access for containers" ON containers;
DROP POLICY IF EXISTS "Enable insert access for containers" ON containers;
DROP POLICY IF EXISTS "Enable update access for containers" ON containers;

-- Create permissive policies for development
-- These bypass JWT authentication requirements

CREATE POLICY "Enable read access for containers" ON containers
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for containers" ON containers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for containers" ON containers
    FOR UPDATE USING (true);

-- Create index for performance (safe if already exists)
CREATE INDEX IF NOT EXISTS idx_containers_tenant_id ON containers(tenant_id);

SELECT 'Container table and RLS policies updated for development!' as result;