-- CORRECTED SCHEMA: Containers as permission boundaries, Lists as content
-- This replaces the old containers table with proper Container/List separation

-- Drop old structure if exists
DROP TABLE IF EXISTS screening_records CASCADE;
DROP TABLE IF EXISTS containers CASCADE;

-- CONTAINERS TABLE (Permission boundaries)
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

-- LISTS TABLE (Actual screening lists within containers)
CREATE TABLE IF NOT EXISTS lists (
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

-- SCREENING_RECORDS TABLE (Individual screening records within lists)
CREATE TABLE IF NOT EXISTS screening_records (
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

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_records ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Containers: Users can see containers from their tenant
CREATE POLICY "Users can see containers from their tenant" ON containers
    FOR SELECT USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can insert containers for their tenant" ON containers
    FOR INSERT WITH CHECK (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can update containers from their tenant" ON containers
    FOR UPDATE USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

-- Lists: Users can see lists from their tenant
CREATE POLICY "Users can see lists from their tenant" ON lists
    FOR SELECT USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can insert lists for their tenant" ON lists
    FOR INSERT WITH CHECK (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can update lists from their tenant" ON lists
    FOR UPDATE USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

-- Screening Records: Users can see records from their tenant
CREATE POLICY "Users can see screening records from their tenant" ON screening_records
    FOR SELECT USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can insert screening records for their tenant" ON screening_records
    FOR INSERT WITH CHECK (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can update screening records from their tenant" ON screening_records
    FOR UPDATE USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_containers_tenant_id ON containers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lists_tenant_id ON lists(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lists_container_id ON lists(container_id);
CREATE INDEX IF NOT EXISTS idx_lists_type ON lists(type);
CREATE INDEX IF NOT EXISTS idx_lists_status ON lists(status);
CREATE INDEX IF NOT EXISTS idx_screening_records_tenant_id ON screening_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_screening_records_list_id ON screening_records(list_id);
CREATE INDEX IF NOT EXISTS idx_screening_records_status ON screening_records(screening_status);

-- SEED DATA: Sample containers and lists
INSERT INTO containers (tenant_id, name, description, created_at) VALUES 
(
  (SELECT id FROM tenants WHERE slug = 'disney-cruise' LIMIT 1),
  'Disney Magic - March 2025 Sailing',
  'Complete screening package for Disney Magic Eastern Caribbean cruise',
  NOW()
),
(
  (SELECT id FROM tenants WHERE slug = 'disney-cruise' LIMIT 1),
  'Disney Wonder - March 2025 Sailing', 
  'Western Caribbean cruise screening package',
  NOW()
),
(
  (SELECT id FROM tenants WHERE slug = 'disney-cruise' LIMIT 1),
  'Port Operations Q1 2025',
  'Quarterly port staff and vendor screening',
  NOW()
);

-- Sample lists within containers
INSERT INTO lists (tenant_id, container_id, type, name, count, status, due_date, flagged) VALUES
-- Disney Magic container lists
(
  (SELECT id FROM tenants WHERE slug = 'disney-cruise' LIMIT 1),
  (SELECT id FROM containers WHERE name = 'Disney Magic - March 2025 Sailing' LIMIT 1),
  'sailing', 'Passenger Manifest', 2500, 'clear', '14/3/2025 - 21/3/2025', 0
),
(
  (SELECT id FROM tenants WHERE slug = 'disney-cruise' LIMIT 1),
  (SELECT id FROM containers WHERE name = 'Disney Magic - March 2025 Sailing' LIMIT 1),
  'crew', 'Bridge Officers', 45, 'clear', '13/3/2025', 0
),
(
  (SELECT id FROM tenants WHERE slug = 'disney-cruise' LIMIT 1),
  (SELECT id FROM containers WHERE name = 'Disney Magic - March 2025 Sailing' LIMIT 1),
  'vendor', 'Port Services', 85, 'attention', '14/3/2025', 2
),
(
  (SELECT id FROM tenants WHERE slug = 'disney-cruise' LIMIT 1),
  (SELECT id FROM containers WHERE name = 'Disney Magic - March 2025 Sailing' LIMIT 1),
  'guest', 'VIP Guests', 47, 'active', '14/3/2025', 0
),
-- Disney Wonder container lists
(
  (SELECT id FROM tenants WHERE slug = 'disney-cruise' LIMIT 1),
  (SELECT id FROM containers WHERE name = 'Disney Wonder - March 2025 Sailing' LIMIT 1),
  'sailing', 'Passenger Manifest', 2400, 'in-progress', '22/3/2025 - 29/3/2025', 0
),
(
  (SELECT id FROM tenants WHERE slug = 'disney-cruise' LIMIT 1),
  (SELECT id FROM containers WHERE name = 'Disney Wonder - March 2025 Sailing' LIMIT 1),
  'crew', 'Food & Beverage Staff', 320, 'attention', '21/3/2025', 8
),
-- Port Operations container lists  
(
  (SELECT id FROM tenants WHERE slug = 'disney-cruise' LIMIT 1),
  (SELECT id FROM containers WHERE name = 'Port Operations Q1 2025' LIMIT 1),
  'vendor', 'Port Contractors', 150, 'in-progress', 'Monthly Review', 5
),
(
  (SELECT id FROM tenants WHERE slug = 'disney-cruise' LIMIT 1),
  (SELECT id FROM containers WHERE name = 'Port Operations Q1 2025' LIMIT 1),
  'visitor', 'Media & Press Access', 12, 'active', 'Ongoing', 0
);