-- Check current database schema for Atlas Intelligence
-- This will show what tables and columns actually exist

-- 1. Show all tables
SELECT 'Current tables in database:' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Show containers table structure (if exists)
SELECT 'Containers table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'containers' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Show lists table structure (if exists)
SELECT 'Lists table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'lists' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Show current containers data
SELECT 'Current containers:' as info;
SELECT id, name, tenant_id, created_at FROM containers ORDER BY created_at;

-- 5. Show current lists data (if table exists)
SELECT 'Current lists:' as info;
SELECT id, name, type, container_id FROM lists ORDER BY created_at;