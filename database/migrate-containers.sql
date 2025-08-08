-- Migration: Update database to correct Container/List structure
-- Run this to fix the "containers table doesn't exist" error

-- 1. First backup existing data if any
CREATE TABLE IF NOT EXISTS containers_backup AS SELECT * FROM containers;

-- 2. Drop existing tables that need restructuring
DROP TABLE IF EXISTS screening_records CASCADE;
DROP TABLE IF EXISTS containers CASCADE;

-- 3. Create new CONTAINERS table (permission boundaries)
CREATE TABLE containers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create new LISTS table (actual screening lists within containers)
CREATE TABLE lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    container_id UUID NOT NULL REFERENCES containers(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('sailing', 'crew', 'vendor', 'guest', 'visitor')),
    name TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('clear', 'attention', 'in-progress', 'active', 'scheduled', 'pending')),
    due_date TEXT,
    flagged INTEGER NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Create new SCREENING_RECORDS table (individual screening records within lists)
CREATE TABLE screening_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    person_name TEXT NOT NULL,
    person_id TEXT,
    screening_status TEXT NOT NULL DEFAULT 'pending' CHECK (screening_status IN ('pending', 'clear', 'flagged', 'requires_review')),
    risk_score INTEGER,
    notes TEXT,
    flags JSONB NOT NULL DEFAULT '[]',
    screened_by UUID REFERENCES users(id) ON DELETE SET NULL,
    screened_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Enable RLS
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_records ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
CREATE POLICY "Users can see containers from their tenant" ON containers
    FOR SELECT USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can insert containers for their tenant" ON containers
    FOR INSERT WITH CHECK (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can update containers from their tenant" ON containers
    FOR UPDATE USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can see lists from their tenant" ON lists
    FOR SELECT USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can insert lists for their tenant" ON lists
    FOR INSERT WITH CHECK (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can update lists from their tenant" ON lists
    FOR UPDATE USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can see screening records from their tenant" ON screening_records
    FOR SELECT USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can insert screening records for their tenant" ON screening_records
    FOR INSERT WITH CHECK (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can update screening records from their tenant" ON screening_records
    FOR UPDATE USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

-- 8. Indexes
CREATE INDEX idx_containers_tenant_id ON containers(tenant_id);
CREATE INDEX idx_lists_tenant_id ON lists(tenant_id);
CREATE INDEX idx_lists_container_id ON lists(container_id);
CREATE INDEX idx_lists_type ON lists(type);
CREATE INDEX idx_lists_status ON lists(status);
CREATE INDEX idx_screening_records_tenant_id ON screening_records(tenant_id);
CREATE INDEX idx_screening_records_list_id ON screening_records(list_id);
CREATE INDEX idx_screening_records_status ON screening_records(screening_status);

-- 9. Sample data for Disney Cruise tenant
DO $$ 
DECLARE 
    disney_tenant_id UUID;
    container1_id UUID;
    container2_id UUID;
    container3_id UUID;
BEGIN
    -- Get Disney Cruise tenant ID
    SELECT id INTO disney_tenant_id FROM tenants WHERE slug = 'disney-cruise' LIMIT 1;
    
    IF disney_tenant_id IS NOT NULL THEN
        -- Insert sample containers
        INSERT INTO containers (tenant_id, name, description) VALUES 
        (disney_tenant_id, 'Disney Magic - March 2025 Sailing', 'Complete screening package for Disney Magic Eastern Caribbean cruise')
        RETURNING id INTO container1_id;
        
        INSERT INTO containers (tenant_id, name, description) VALUES 
        (disney_tenant_id, 'Disney Wonder - March 2025 Sailing', 'Western Caribbean cruise screening package')
        RETURNING id INTO container2_id;
        
        INSERT INTO containers (tenant_id, name, description) VALUES 
        (disney_tenant_id, 'Port Operations Q1 2025', 'Quarterly port staff and vendor screening')
        RETURNING id INTO container3_id;
        
        -- Insert sample lists for container 1 (Disney Magic)
        INSERT INTO lists (tenant_id, container_id, type, name, count, status, due_date, flagged) VALUES
        (disney_tenant_id, container1_id, 'sailing', 'Passenger Manifest', 2500, 'clear', '14/3/2025 - 21/3/2025', 0),
        (disney_tenant_id, container1_id, 'crew', 'Bridge Officers', 45, 'clear', '13/3/2025', 0),
        (disney_tenant_id, container1_id, 'vendor', 'Port Services', 85, 'attention', '14/3/2025', 2),
        (disney_tenant_id, container1_id, 'guest', 'VIP Guests', 47, 'active', '14/3/2025', 0);
        
        -- Insert sample lists for container 2 (Disney Wonder)
        INSERT INTO lists (tenant_id, container_id, type, name, count, status, due_date, flagged) VALUES
        (disney_tenant_id, container2_id, 'sailing', 'Passenger Manifest', 2400, 'in-progress', '22/3/2025 - 29/3/2025', 0),
        (disney_tenant_id, container2_id, 'crew', 'Food & Beverage Staff', 320, 'attention', '21/3/2025', 8);
        
        -- Insert sample lists for container 3 (Port Operations)
        INSERT INTO lists (tenant_id, container_id, type, name, count, status, due_date, flagged) VALUES
        (disney_tenant_id, container3_id, 'vendor', 'Port Contractors', 150, 'in-progress', 'Monthly Review', 5),
        (disney_tenant_id, container3_id, 'visitor', 'Media & Press Access', 12, 'active', 'Ongoing', 0);
    END IF;
END $$;

-- Success message
SELECT 'Migration completed successfully! Containers and lists structure updated.' as result;