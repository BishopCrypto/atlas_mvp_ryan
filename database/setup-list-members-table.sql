-- Setup list_members table for Atlas Intelligence
-- This table stores individual people/items within each list

CREATE TABLE IF NOT EXISTS list_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    identification_number TEXT, -- Passport, ID, etc.
    date_of_birth DATE,
    nationality TEXT,
    notes TEXT,
    screening_status TEXT NOT NULL DEFAULT 'pending' CHECK (screening_status IN ('pending', 'in-progress', 'clear', 'flagged', 'rejected')),
    screening_score INTEGER,
    screening_details JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE list_members ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development
CREATE POLICY "Enable read access for list_members" ON list_members
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for list_members" ON list_members
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for list_members" ON list_members
    FOR UPDATE USING (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_list_members_list_id ON list_members(list_id);
CREATE INDEX IF NOT EXISTS idx_list_members_tenant_id ON list_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_list_members_screening_status ON list_members(screening_status);
CREATE INDEX IF NOT EXISTS idx_list_members_email ON list_members(email);

-- Function to update list count when members are added/removed
CREATE OR REPLACE FUNCTION update_list_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE lists 
        SET count = (SELECT COUNT(*) FROM list_members WHERE list_id = NEW.list_id AND is_active = true)
        WHERE id = NEW.list_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE lists 
        SET count = (SELECT COUNT(*) FROM list_members WHERE list_id = NEW.list_id AND is_active = true)
        WHERE id = NEW.list_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE lists 
        SET count = (SELECT COUNT(*) FROM list_members WHERE list_id = OLD.list_id AND is_active = true)
        WHERE id = OLD.list_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update list counts
DROP TRIGGER IF EXISTS trigger_update_list_count ON list_members;
CREATE TRIGGER trigger_update_list_count
    AFTER INSERT OR UPDATE OR DELETE ON list_members
    FOR EACH ROW EXECUTE FUNCTION update_list_count();

SELECT 'List members table created successfully with auto-count triggers!' as result;