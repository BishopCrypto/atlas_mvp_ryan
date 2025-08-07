-- Atlas Intelligence Multi-Tenant Database Schema

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Create tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- 'disney', 'virgin'
    domain VARCHAR(255), -- optional custom domain
    logo_url TEXT,
    brand_colors JSONB, -- { "primary": "#003087", "secondary": "#FFD100" }
    settings JSONB DEFAULT '{}', -- tenant-specific settings
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial tenants
INSERT INTO tenants (name, slug, brand_colors, settings) VALUES 
('Disney Cruise Line', 'disney', 
 '{"primary": "#003087", "secondary": "#FFD100", "accent": "#00A651"}',
 '{"features": ["sailings", "crew", "vendors", "guests"], "max_users": 1000}'
),
('Virgin Voyages', 'virgin', 
 '{"primary": "#E10078", "secondary": "#FF6B35", "accent": "#00D4AA"}',
 '{"features": ["voyages", "crew", "partners", "passengers"], "max_users": 500}'
);

-- Create users table with tenant association
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL, -- 'sailings', 'sailingstaff', 'vendors', 'frontdesk', 'admin'
    department VARCHAR(100),
    permissions JSONB DEFAULT '[]', -- array of permission strings
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create containers table (multi-tenant)
CREATE TABLE containers (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'sailing', 'crew', 'vendor', 'guest', 'visitor'
    name VARCHAR(255) NOT NULL,
    count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- 'clear', 'attention', 'in-progress', 'active', 'scheduled'
    due_date TIMESTAMP WITH TIME ZONE,
    flagged INTEGER DEFAULT 0,
    department VARCHAR(100), -- 'sailings', 'sailingstaff', 'vendors', 'frontdesk'
    metadata JSONB DEFAULT '{}', -- flexible data storage per tenant
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create screening_records table
CREATE TABLE screening_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    container_id BIGINT REFERENCES containers(id) ON DELETE CASCADE,
    person_name VARCHAR(255) NOT NULL,
    person_id VARCHAR(100), -- external ID like passport, employee ID
    screening_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'clear', 'flagged', 'requires_review'
    risk_score INTEGER, -- 1-100 scale
    notes TEXT,
    flags JSONB DEFAULT '[]', -- array of flag objects
    screened_by UUID REFERENCES users(id),
    screened_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_log table for compliance
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login', 'screen'
    resource_type VARCHAR(50), -- 'container', 'screening_record', 'user'
    resource_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_containers_tenant_id ON containers(tenant_id);
CREATE INDEX idx_containers_department ON containers(department);
CREATE INDEX idx_containers_status ON containers(status);
CREATE INDEX idx_screening_records_tenant_id ON screening_records(tenant_id);
CREATE INDEX idx_screening_records_container_id ON screening_records(container_id);
CREATE INDEX idx_screening_records_status ON screening_records(screening_status);
CREATE INDEX idx_audit_log_tenant_id ON audit_log(tenant_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Row Level Security Policies
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenants table
CREATE POLICY "Tenants are viewable by authenticated users" ON tenants
    FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for users table
CREATE POLICY "Users can view own tenant users" ON users
    FOR SELECT USING (tenant_id = (
        SELECT tenant_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update own record" ON users
    FOR UPDATE USING (id = auth.uid());

-- RLS Policies for containers table
CREATE POLICY "Containers are isolated by tenant" ON containers
    FOR ALL USING (tenant_id = (
        SELECT tenant_id FROM users WHERE id = auth.uid()
    ));

-- RLS Policies for screening_records table
CREATE POLICY "Screening records are isolated by tenant" ON screening_records
    FOR ALL USING (tenant_id = (
        SELECT tenant_id FROM users WHERE id = auth.uid()
    ));

-- RLS Policies for audit_log table
CREATE POLICY "Audit logs are isolated by tenant" ON audit_log
    FOR SELECT USING (tenant_id = (
        SELECT tenant_id FROM users WHERE id = auth.uid()
    ));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_containers_updated_at BEFORE UPDATE ON containers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_screening_records_updated_at BEFORE UPDATE ON screening_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for Disney
INSERT INTO users (tenant_id, email, full_name, role, department) VALUES 
((SELECT id FROM tenants WHERE slug = 'disney'), 'admin@disney.com', 'Disney Admin', 'admin', 'administration'),
((SELECT id FROM tenants WHERE slug = 'disney'), 'sailings@disney.com', 'Sarah Johnson', 'sailings', 'sailings'),
((SELECT id FROM tenants WHERE slug = 'disney'), 'crew@disney.com', 'Mike Rodriguez', 'sailingstaff', 'sailingstaff'),
((SELECT id FROM tenants WHERE slug = 'disney'), 'vendors@disney.com', 'Lisa Chen', 'vendors', 'vendors'),
((SELECT id FROM tenants WHERE slug = 'disney'), 'frontdesk@disney.com', 'Tom Wilson', 'frontdesk', 'frontdesk');

-- Sample containers for Disney
INSERT INTO containers (tenant_id, type, name, count, status, due_date, department) VALUES 
((SELECT id FROM tenants WHERE slug = 'disney'), 'sailing', 'Disney Magic - Eastern Caribbean', 2500, 'clear', '2025-03-21', 'sailings'),
((SELECT id FROM tenants WHERE slug = 'disney'), 'sailing', 'Disney Wonder - Western Caribbean', 2400, 'clear', '2025-03-29', 'sailings'),
((SELECT id FROM tenants WHERE slug = 'disney'), 'crew', 'Disney Magic - Bridge Officers', 45, 'clear', '2025-03-15', 'sailingstaff'),
((SELECT id FROM tenants WHERE slug = 'disney'), 'vendor', 'Disney Magic - Port Services', 85, 'clear', '2025-03-14', 'vendors'),
((SELECT id FROM tenants WHERE slug = 'disney'), 'guest', 'VIP Guest Arrivals', 47, 'active', '2025-03-10', 'frontdesk');

-- Sample data for Virgin (optional, for testing)
INSERT INTO users (tenant_id, email, full_name, role, department) VALUES 
((SELECT id FROM tenants WHERE slug = 'virgin'), 'admin@virgin.com', 'Virgin Admin', 'admin', 'administration');