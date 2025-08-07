const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testDatabase() {
  try {
    console.log('Testing Supabase connection...');
    
    // Check tenants
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*');
    
    if (tenantsError) {
      console.error('Tenants error:', tenantsError);
    } else {
      console.log('Tenants:', tenants);
    }

    // Check containers
    const { data: containers, error: containersError } = await supabase
      .from('containers')
      .select('*')
      .limit(5);
    
    if (containersError) {
      console.error('Containers error:', containersError);
    } else {
      console.log('Containers count:', containers?.length);
      console.log('Sample containers:', containers);
    }

  } catch (error) {
    console.error('Connection error:', error);
  }
}

testDatabase();