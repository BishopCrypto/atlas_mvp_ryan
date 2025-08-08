const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://twlablmqfupjgaqksswtsupabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key-here';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'database', 'migrate-containers.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: migrationSQL 
    });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Database structure updated:');
    console.log('  - containers table: Permission boundaries');
    console.log('  - lists table: Screening lists within containers');
    console.log('  - screening_records table: Individual records within lists');
    console.log('  - Sample data inserted for Disney Cruise tenant');
    
  } catch (err) {
    console.error('💥 Migration error:', err.message);
    process.exit(1);
  }
}

// Run the migration
runMigration();