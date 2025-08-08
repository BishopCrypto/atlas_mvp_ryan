require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateTenants() {
  console.log('Updating existing tenant records...');
  
  // First, let's see what we have
  const { data: currentTenants, error: fetchError } = await supabase
    .from('tenants')
    .select('*')
    .order('name');
    
  if (fetchError) {
    console.error('Error fetching tenants:', fetchError);
    return;
  }
  
  console.log('Current tenants:', currentTenants.map(t => ({ name: t.name, slug: t.slug, settings: t.settings })));
  
  // We need to bypass RLS by using the RPC function approach instead
  console.log('\nSince RLS is blocking updates, you need to update the database directly via Supabase dashboard or SQL.');
  console.log('Here are the SQL commands to run:');
  console.log('');
  console.log("UPDATE tenants SET settings = '{\"departments\": [], \"screening_enabled\": false}' WHERE slug = 'disney';");
  console.log("UPDATE tenants SET settings = '{\"departments\": [], \"screening_enabled\": false}' WHERE slug = 'virgin';");
  console.log('');
}

updateTenants().catch(console.error);