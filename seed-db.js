const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const tenantData = [
  {
    id: 'disney-cruise',
    name: 'Disney Cruise Line',
    slug: 'disney',
    brand_colors: {
      primary: '#003087',
      secondary: '#FFD100',
      accent: '#00A651'
    },
    settings: {
      departments: [],
      screening_enabled: false
    },
    is_active: true
  },
  {
    id: 'royal-caribbean',
    name: 'Royal Caribbean International',
    slug: 'royal-caribbean',
    brand_colors: {
      primary: '#003f7f',
      secondary: '#00a0e6',
      accent: '#ffd700'
    },
    settings: {
      departments: ['sailings', 'sailingstaff', 'vendors', 'frontdesk'],
      screening_enabled: true
    },
    is_active: true
  },
  {
    id: 'virgin-voyages',
    name: 'Virgin Voyages',
    slug: 'virgin',
    brand_colors: {
      primary: '#E10078',
      secondary: '#FF6B35',
      accent: '#00D4AA'
    },
    settings: {
      departments: [],
      screening_enabled: false
    },
    is_active: true
  }
];

async function seedDatabase() {
  console.log('🌱 Seeding database with tenant data...\n');
  
  try {
    // Check if tenants table exists and is accessible
    console.log('📋 Checking database connection...');
    const { data: existing, error: checkError } = await supabase
      .from('tenants')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Database error:', checkError.message);
      console.log('\n💡 Possible solutions:');
      console.log('1. Check your SUPABASE_SERVICE_ROLE_KEY in .env.local');
      console.log('2. Make sure the tenants table exists in your Supabase database');
      console.log('3. Verify RLS policies allow inserts');
      return;
    }
    
    console.log('✅ Database connection successful\n');
    
    // Clear existing tenants
    console.log('🧹 Clearing existing tenants...');
    const { error: deleteError } = await supabase
      .from('tenants')
      .delete()
      .neq('id', 'nonexistent'); // Delete all
    
    if (deleteError) {
      console.log('⚠️  Could not clear existing tenants:', deleteError.message);
    }
    
    // Insert tenant data
    console.log('📥 Inserting tenant data...');
    for (const tenant of tenantData) {
      console.log(`  → Adding ${tenant.name}...`);
      
      const { data, error } = await supabase
        .from('tenants')
        .insert([tenant])
        .select();
      
      if (error) {
        console.error(`    ❌ Error adding ${tenant.name}:`, error.message);
      } else {
        console.log(`    ✅ Added ${tenant.name} successfully`);
      }
    }
    
    // Verify results
    console.log('\n🔍 Verifying results...');
    const { data: finalCount, error: countError } = await supabase
      .from('tenants')
      .select('name, is_active')
      .order('name');
    
    if (countError) {
      console.error('❌ Error verifying results:', countError.message);
    } else {
      console.log(`✅ Database now contains ${finalCount.length} tenants:`);
      finalCount.forEach(tenant => {
        console.log(`  • ${tenant.name} (${tenant.is_active ? 'Active' : 'Inactive'})`);
      });
    }
    
    console.log('\n🎉 Database seeding complete!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

seedDatabase();