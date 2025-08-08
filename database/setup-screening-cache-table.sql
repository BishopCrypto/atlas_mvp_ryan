-- Setup screening_cache table for Atlas Intelligence
-- This table caches screening results from Atlas API to avoid re-running

CREATE TABLE IF NOT EXISTS screening_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES list_members(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Search parameters (for cache key)
    search_name TEXT NOT NULL,
    search_email TEXT,
    search_phone TEXT,
    search_id_number TEXT,
    search_dob DATE,
    
    -- Atlas API results
    atlas_request_id TEXT,
    atlas_response JSONB NOT NULL,
    match_count INTEGER NOT NULL DEFAULT 0,
    highest_confidence_score DECIMAL(5,2),
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    
    -- Cache metadata
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_valid BOOLEAN NOT NULL DEFAULT true,
    
    -- Audit trail
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE screening_cache ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development
CREATE POLICY "Enable read access for screening_cache" ON screening_cache
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for screening_cache" ON screening_cache
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for screening_cache" ON screening_cache
    FOR UPDATE USING (true);

-- Add indexes for performance and cache lookups
CREATE INDEX IF NOT EXISTS idx_screening_cache_person_id ON screening_cache(person_id);
CREATE INDEX IF NOT EXISTS idx_screening_cache_tenant_id ON screening_cache(tenant_id);
CREATE INDEX IF NOT EXISTS idx_screening_cache_search_params ON screening_cache(search_name, search_email, search_dob);
CREATE INDEX IF NOT EXISTS idx_screening_cache_cached_at ON screening_cache(cached_at);
CREATE INDEX IF NOT EXISTS idx_screening_cache_expires_at ON screening_cache(expires_at);

-- Function to check if cache is still valid (not expired)
CREATE OR REPLACE FUNCTION is_cache_valid(cache_expires_at TIMESTAMP WITH TIME ZONE)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN cache_expires_at IS NULL OR cache_expires_at > NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to find cached screening results
CREATE OR REPLACE FUNCTION find_cached_screening(
    p_name TEXT,
    p_email TEXT DEFAULT NULL,
    p_dob DATE DEFAULT NULL
)
RETURNS TABLE(
    cache_id UUID,
    atlas_response JSONB,
    match_count INTEGER,
    highest_confidence_score DECIMAL,
    risk_level TEXT,
    cached_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sc.id,
        sc.atlas_response,
        sc.match_count,
        sc.highest_confidence_score,
        sc.risk_level,
        sc.cached_at
    FROM screening_cache sc
    WHERE sc.search_name ILIKE p_name
        AND (p_email IS NULL OR sc.search_email ILIKE p_email)
        AND (p_dob IS NULL OR sc.search_dob = p_dob)
        AND sc.is_valid = true
        AND is_cache_valid(sc.expires_at)
    ORDER BY sc.cached_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

SELECT 'Screening cache table created successfully!' as result;