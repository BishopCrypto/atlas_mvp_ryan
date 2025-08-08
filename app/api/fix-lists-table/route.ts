import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Fixing lists table schema...');

    // Add missing columns to lists table
    const { data, error } = await supabase
      .from('_')
      .select('1')
      .limit(0);

    // Since we can't execute raw SQL directly through supabase-js client,
    // we'll try to insert a test record to see what columns are missing
    const testInsert = {
      container_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      tenant_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      name: 'Test List',
      type: 'sailing',
      description: 'Test description', // This should fail if column doesn't exist
      count: 0,
      status: 'pending',
      due_date: '2025-01-01',
      flagged: 0,
      is_active: true
    };

    // Try to insert test record
    const { error: insertError } = await supabase
      .from('lists')
      .insert(testInsert);

    if (insertError) {
      console.log('Insert error (expected):', insertError);
      
      // The error tells us what columns are missing
      return NextResponse.json({
        success: false,
        message: 'Lists table needs schema update',
        error: insertError.message,
        sqlToRun: `
          -- Run this SQL to fix the lists table:
          ALTER TABLE lists ADD COLUMN IF NOT EXISTS description TEXT;
          ALTER TABLE lists ADD COLUMN IF NOT EXISTS due_date DATE;
        `
      });
    }

    // If insert succeeded, clean up the test record
    await supabase
      .from('lists')
      .delete()
      .eq('name', 'Test List')
      .eq('container_id', '00000000-0000-0000-0000-000000000000');

    return NextResponse.json({ 
      success: true, 
      message: 'Lists table schema is correct!' 
    });

  } catch (error) {
    console.error('❌ Schema check failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}