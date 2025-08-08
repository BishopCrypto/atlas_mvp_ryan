-- Setup roles, permissions and add Royal Caribbean

-- 1. Create roles table for tenant-specific roles
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

-- 2. Enable RLS on roles table
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for roles
DROP POLICY IF EXISTS "Enable read access for all users on roles" ON roles;
CREATE POLICY "Enable read access for all users on roles" ON roles
    FOR SELECT USING (true);

-- 4. Create permissions table for available system permissions
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Enable RLS on permissions table
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users on permissions" ON permissions
    FOR SELECT USING (true);

-- 6. Insert system permissions
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

-- 7. Add Royal Caribbean tenant
INSERT INTO tenants (id, name, slug, brand_colors, settings, is_active)
VALUES (
    gen_random_uuid(),
    'Royal Caribbean International',
    'royal-caribbean',
    '{"primary": "#003f7f", "secondary": "#00a0e6", "accent": "#ffd700"}',
    '{"departments": ["sailings", "sailingstaff", "vendors", "frontdesk"], "screening_enabled": true}',
    true
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    brand_colors = EXCLUDED.brand_colors,
    settings = EXCLUDED.settings,
    is_active = EXCLUDED.is_active;

-- 8. Insert roles for Disney Cruise
INSERT INTO roles (tenant_id, name, display_name, description, permissions)
SELECT 
    t.id,
    'sailings',
    t.name || ' Sailings',
    'Manage ' || t.name || ' sailing operations',
    '["view_sailings", "manage_sailings"]'::jsonb
FROM tenants t WHERE t.slug = 'disney-cruise'
ON CONFLICT (tenant_id, name) DO NOTHING;

INSERT INTO roles (tenant_id, name, display_name, description, permissions)
SELECT 
    t.id,
    'sailingstaff',
    'Sailing Staff',
    'Manage sailing staff for ' || t.name,
    '["view_staff", "manage_staff", "view_sailings"]'::jsonb
FROM tenants t WHERE t.slug = 'disney-cruise'
ON CONFLICT (tenant_id, name) DO NOTHING;

INSERT INTO roles (tenant_id, name, display_name, description, permissions)
SELECT 
    t.id,
    'vendors',
    'Vendors',
    'Manage vendors for ' || t.name,
    '["view_vendors", "manage_vendors"]'::jsonb
FROM tenants t WHERE t.slug = 'disney-cruise'
ON CONFLICT (tenant_id, name) DO NOTHING;

INSERT INTO roles (tenant_id, name, display_name, description, permissions)
SELECT 
    t.id,
    'frontdesk',
    'Guest Services',
    'Front desk and guest services for ' || t.name,
    '["view_guests", "quick_screen"]'::jsonb
FROM tenants t WHERE t.slug = 'disney-cruise'
ON CONFLICT (tenant_id, name) DO NOTHING;

-- Insert roles for Royal Caribbean
INSERT INTO roles (tenant_id, name, display_name, description, permissions)
SELECT 
    t.id,
    'sailings',
    t.name || ' Sailings',
    'Manage ' || t.name || ' sailing operations',
    '["view_sailings", "manage_sailings"]'::jsonb
FROM tenants t WHERE t.slug = 'royal-caribbean'
ON CONFLICT (tenant_id, name) DO NOTHING;

INSERT INTO roles (tenant_id, name, display_name, description, permissions)
SELECT 
    t.id,
    'sailingstaff',
    'Sailing Staff',
    'Manage sailing staff for ' || t.name,
    '["view_staff", "manage_staff", "view_sailings"]'::jsonb
FROM tenants t WHERE t.slug = 'royal-caribbean'
ON CONFLICT (tenant_id, name) DO NOTHING;

INSERT INTO roles (tenant_id, name, display_name, description, permissions)
SELECT 
    t.id,
    'vendors',
    'Vendors',
    'Manage vendors for ' || t.name,
    '["view_vendors", "manage_vendors"]'::jsonb
FROM tenants t WHERE t.slug = 'royal-caribbean'
ON CONFLICT (tenant_id, name) DO NOTHING;

INSERT INTO roles (tenant_id, name, display_name, description, permissions)
SELECT 
    t.id,
    'frontdesk',
    'Guest Services',
    'Front desk and guest services for ' || t.name,
    '["view_guests", "quick_screen"]'::jsonb
FROM tenants t WHERE t.slug = 'royal-caribbean'
ON CONFLICT (tenant_id, name) DO NOTHING;

-- 9. Verify the setup
SELECT 'Tenants:' as info;
SELECT name, slug, is_active FROM tenants ORDER BY name;

SELECT 'Roles by tenant:' as info;
SELECT 
    t.name as tenant_name,
    r.name as role_name,
    r.display_name,
    r.permissions
FROM tenants t
JOIN roles r ON t.id = r.tenant_id
ORDER BY t.name, r.name;

SELECT 'System permissions:' as info;
SELECT name, display_name, category FROM permissions ORDER BY category, name;