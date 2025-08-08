import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Setting up list_members table...');

    // Create the list_members table with all necessary columns
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS list_members (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
          tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          identification_number TEXT,
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
    `;

    // Try to create via direct query (this probably won't work but we'll try)
    const { data: createResult, error: createError } = await supabase
      .from('_')
      .select('1')
      .limit(0);

    // Test if the table exists by trying to insert a dummy record
    const testInsert = {
      list_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      tenant_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      name: 'Test Person',
      screening_status: 'pending',
      is_active: true
    };

    const { error: insertError } = await supabase
      .from('list_members')
      .insert(testInsert);

    if (insertError) {
      console.log('Table creation needed. Error:', insertError.message);
      
      return NextResponse.json({
        success: false,
        message: 'List members table needs to be created',
        sqlToRun: `
-- Run this SQL to create the list_members table:

CREATE TABLE IF NOT EXISTS list_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    identification_number TEXT,
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

-- Create policies
CREATE POLICY "Enable read access for list_members" ON list_members
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for list_members" ON list_members
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for list_members" ON list_members
    FOR UPDATE USING (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_list_members_list_id ON list_members(list_id);
CREATE INDEX IF NOT EXISTS idx_list_members_tenant_id ON list_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_list_members_screening_status ON list_members(screening_status);

-- Function to auto-update list counts
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

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_list_count ON list_members;
CREATE TRIGGER trigger_update_list_count
    AFTER INSERT OR UPDATE OR DELETE ON list_members
    FOR EACH ROW EXECUTE FUNCTION update_list_count();
        `,
        error: insertError.message
      });
    }

    // Clean up test record
    await supabase
      .from('list_members')
      .delete()
      .eq('name', 'Test Person')
      .eq('list_id', '00000000-0000-0000-0000-000000000000');

    console.log('✅ List members table is ready');

    return NextResponse.json({ 
      success: true, 
      message: 'List members table is ready!' 
    });

  } catch (error) {
    console.error('❌ Setup failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}