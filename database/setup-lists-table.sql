-- Setup lists table for Atlas Intelligence
-- Lists are contained within containers and have types (sailing, crew, vendor, etc.)

CREATE TABLE IF NOT EXISTS lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    container_id UUID NOT NULL REFERENCES containers(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('sailing', 'crew', 'vendor', 'guest', 'visitor')),
    description TEXT,
    count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'clear', 'attention', 'complete')),
    due_date DATE,
    flagged INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development
CREATE POLICY "Enable read access for lists" ON lists
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for lists" ON lists
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for lists" ON lists
    FOR UPDATE USING (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_lists_container_id ON lists(container_id);
CREATE INDEX IF NOT EXISTS idx_lists_tenant_id ON lists(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lists_type ON lists(type);

SELECT 'Lists table created successfully!' as result;