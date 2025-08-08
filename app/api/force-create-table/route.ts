import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Force creating list_members table...');

    // Try to execute raw SQL by using a different approach
    // We'll create the table by trying to insert and then handling the error
    
    // First, let's see if we can use the 'rpc' function with a custom function
    const { data, error } = await supabase.rpc('sql', { 
      query: `
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
            screening_status TEXT NOT NULL DEFAULT 'pending',
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE list_members ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Enable read access for list_members" ON list_members FOR SELECT USING (true);
        CREATE POLICY "Enable insert access for list_members" ON list_members FOR INSERT WITH CHECK (true);
        CREATE POLICY "Enable update access for list_members" ON list_members FOR UPDATE USING (true);
      ` 
    });

    if (error) {
      console.log('RPC approach failed:', error);
      
      return NextResponse.json({
        success: false,
        message: 'Could not create table automatically. Please run the SQL manually.',
        instructions: `
          Go to your Supabase dashboard:
          1. Open SQL Editor
          2. Paste this SQL and run it:
          
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
              screening_status TEXT NOT NULL DEFAULT 'pending',
              is_active BOOLEAN NOT NULL DEFAULT true,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          ALTER TABLE list_members ENABLE ROW LEVEL SECURITY;
          CREATE POLICY "Enable read access for list_members" ON list_members FOR SELECT USING (true);
          CREATE POLICY "Enable insert access for list_members" ON list_members FOR INSERT WITH CHECK (true);
          CREATE POLICY "Enable update access for list_members" ON list_members FOR UPDATE USING (true);
        `
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Table created successfully!',
      data 
    });

  } catch (error) {
    console.error('❌ Force creation failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Please create the table manually using your database interface'
    }, { status: 500 });
  }
}