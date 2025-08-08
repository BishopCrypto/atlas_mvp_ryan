-- Create tenant_settings table for better organization
CREATE TABLE IF NOT EXISTS tenant_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB,
    setting_type VARCHAR(50) DEFAULT 'general', -- 'general', 'features', 'security', 'ui'
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, setting_key)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_settings_tenant_id ON tenant_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_settings_key ON tenant_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_tenant_settings_type ON tenant_settings(setting_type);

-- Enable RLS on tenant_settings
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for tenant_settings (users can only access their tenant's settings)
DROP POLICY IF EXISTS "Tenant settings isolation" ON tenant_settings;
CREATE POLICY "Tenant settings isolation" ON tenant_settings
    USING (tenant_id IN (
        SELECT id FROM tenants WHERE is_active = true
    ));

-- Insert initial settings for Disney
INSERT INTO tenant_settings (tenant_id, setting_key, setting_value, setting_type, description)
SELECT 
    t.id,
    'departments',
    '[]'::jsonb,
    'features',
    'Available departments for this tenant'
FROM tenants t 
WHERE t.slug = 'disney'
ON CONFLICT (tenant_id, setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

INSERT INTO tenant_settings (tenant_id, setting_key, setting_value, setting_type, description)
SELECT 
    t.id,
    'screening_enabled',
    'false'::jsonb,
    'security',
    'Whether screening functionality is enabled'
FROM tenants t 
WHERE t.slug = 'disney'
ON CONFLICT (tenant_id, setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- Insert initial settings for Virgin
INSERT INTO tenant_settings (tenant_id, setting_key, setting_value, setting_type, description)
SELECT 
    t.id,
    'departments',
    '[]'::jsonb,
    'features',
    'Available departments for this tenant'
FROM tenants t 
WHERE t.slug = 'virgin'
ON CONFLICT (tenant_id, setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

INSERT INTO tenant_settings (tenant_id, setting_key, setting_value, setting_type, description)
SELECT 
    t.id,
    'screening_enabled',
    'false'::jsonb,
    'security',
    'Whether screening functionality is enabled'
FROM tenants t 
WHERE t.slug = 'virgin'
ON CONFLICT (tenant_id, setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- Insert initial settings for Royal Caribbean
INSERT INTO tenant_settings (tenant_id, setting_key, setting_value, setting_type, description)
SELECT 
    t.id,
    'departments',
    '["sailings", "sailingstaff", "vendors", "frontdesk"]'::jsonb,
    'features',
    'Available departments for this tenant'
FROM tenants t 
WHERE t.slug = 'royal-caribbean'
ON CONFLICT (tenant_id, setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

INSERT INTO tenant_settings (tenant_id, setting_key, setting_value, setting_type, description)
SELECT 
    t.id,
    'screening_enabled',
    'true'::jsonb,
    'security',
    'Whether screening functionality is enabled'
FROM tenants t 
WHERE t.slug = 'royal-caribbean'
ON CONFLICT (tenant_id, setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- Verify the results
SELECT 
    t.name,
    t.slug,
    ts.setting_key,
    ts.setting_value,
    ts.setting_type
FROM tenants t
LEFT JOIN tenant_settings ts ON t.id = ts.tenant_id
ORDER BY t.name, ts.setting_key;