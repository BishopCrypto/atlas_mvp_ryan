-- Fix RLS policies to prevent infinite recursion

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own tenant users" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;
DROP POLICY IF EXISTS "Containers are isolated by tenant" ON containers;
DROP POLICY IF EXISTS "Screening records are isolated by tenant" ON screening_records;
DROP POLICY IF EXISTS "Audit logs are isolated by tenant" ON audit_log;

-- Create a function to get current user's tenant_id safely
CREATE OR REPLACE FUNCTION get_current_user_tenant_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT tenant_id FROM users WHERE id = auth.uid();
$$;

-- Fixed RLS Policies for users table
CREATE POLICY "Users can view same tenant users" ON users
    FOR SELECT USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can update own record" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage tenant users" ON users
    FOR ALL USING (
        tenant_id = get_current_user_tenant_id() 
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Fixed RLS Policies for containers table
CREATE POLICY "Containers are isolated by tenant" ON containers
    FOR ALL USING (tenant_id = get_current_user_tenant_id());

-- Fixed RLS Policies for screening_records table  
CREATE POLICY "Screening records are isolated by tenant" ON screening_records
    FOR ALL USING (tenant_id = get_current_user_tenant_id());

-- Fixed RLS Policies for audit_log table
CREATE POLICY "Audit logs are isolated by tenant" ON audit_log
    FOR SELECT USING (tenant_id = get_current_user_tenant_id());

-- Allow service role to bypass RLS for administrative tasks
CREATE POLICY "Service role can access all data" ON users
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can access all containers" ON containers
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can access all screening records" ON screening_records
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can access all audit logs" ON audit_log
    FOR ALL TO service_role USING (true);