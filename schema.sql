-- Atlas Intelligence Database Schema
-- Complete schema for multi-tenant screening management system

-- 1. TENANTS TABLE
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    brand_colors JSONB NOT NULL DEFAULT '{}',
    settings JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. PERMISSIONS TABLE (System-wide permissions)
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. ROLES TABLE (Tenant-specific roles)
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(tenant_id, name)
);

-- 4. USERS TABLE (Tenant users with roles)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    department TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. CONTAINERS TABLE (Sailings, crews, vendors, guests)
CREATE TABLE IF NOT EXISTS containers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('sailing', 'crew', 'vendor', 'guest', 'visitor')),
    name TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('clear', 'attention', 'in-progress', 'active', 'scheduled', 'pending')),
    due_date TEXT,
    flagged INTEGER NOT NULL DEFAULT 0,
    department TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. SCREENING_RECORDS TABLE (Individual screening records)
CREATE TABLE IF NOT EXISTS screening_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    container_id UUID NOT NULL REFERENCES containers(id) ON DELETE CASCADE,
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

-- 7. AUDIT_LOG TABLE (System audit trail)
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Tenants: Public read access for login
CREATE POLICY "Enable read access for all users on tenants" ON tenants
    FOR SELECT USING (true);

-- Permissions: Public read access
CREATE POLICY "Enable read access for all users on permissions" ON permissions
    FOR SELECT USING (true);

-- Roles: Public read access  
CREATE POLICY "Enable read access for all users on roles" ON roles
    FOR SELECT USING (true);

-- Users: Users can see users from their tenant
CREATE POLICY "Users can see users from their tenant" ON users
    FOR SELECT USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

-- Containers: Users can see containers from their tenant
CREATE POLICY "Users can see containers from their tenant" ON containers
    FOR SELECT USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

-- Screening Records: Users can see records from their tenant
CREATE POLICY "Users can see screening records from their tenant" ON screening_records
    FOR SELECT USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

-- Audit Log: Users can see audit logs from their tenant
CREATE POLICY "Users can see audit logs from their tenant" ON audit_log
    FOR SELECT USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_roles_tenant_id ON roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_containers_tenant_id ON containers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_containers_type ON containers(type);
CREATE INDEX IF NOT EXISTS idx_containers_status ON containers(status);
CREATE INDEX IF NOT EXISTS idx_screening_records_tenant_id ON screening_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_screening_records_container_id ON screening_records(container_id);
CREATE INDEX IF NOT EXISTS idx_screening_records_status ON screening_records(screening_status);
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_id ON audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- SEED DATA (System permissions)
INSERT INTO permissions (name, display_name, category, description)
VALUES 
    ('view_sailings', 'View Sailings', 'sailings', 'Can view sailing containers and data'),
    ('manage_sailings', 'Manage Sailings', 'sailings', 'Can create, edit, and manage sailings'),
    ('view_staff', 'View Staff', 'staff', 'Can view sailing staff information'),
    ('manage_staff', 'Manage Staff', 'staff', 'Can manage sailing staff assignments'),
    ('view_vendors', 'View Vendors', 'vendors', 'Can view vendor information'),
    ('manage_vendors', 'Manage Vendors', 'vendors', 'Can manage vendor relationships'),
    ('view_guests', 'View Guests', 'frontdesk', 'Can view guest information'),
    ('quick_screen', 'Quick Screen', 'frontdesk', 'Can perform quick screening operations'),
    ('admin_access', 'Admin Access', 'admin', 'Full administrative access')
ON CONFLICT (name) DO NOTHING;