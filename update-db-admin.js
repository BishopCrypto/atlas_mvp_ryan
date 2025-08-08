require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateTenants() {
  console.log('Updating tenant settings with service role...');
  
  // Update Disney
  const { data: disney, error: disneyError } = await supabase
    .from('tenants')
    .update({ 
      settings: { 
        departments: [],
        screening_enabled: false 
      }
    })
    .eq('slug', 'disney')
    .select();
    
  if (disneyError) {
    console.error('Error updating Disney:', disneyError);
  } else {
    console.log('Updated Disney:', disney);
  }
  
  // Update Virgin
  const { data: virgin, error: virginError } = await supabase
    .from('tenants')
    .update({ 
      settings: { 
        departments: [],
        screening_enabled: false 
      }
    })
    .eq('slug', 'virgin')
    .select();
    
  if (virginError) {
    console.error('Error updating Virgin:', virginError);
  } else {
    console.log('Updated Virgin:', virgin);
  }
  
  // Verify all tenants
  const { data: allTenants, error: fetchError } = await supabase
    .from('tenants')
    .select('name, slug, settings')
    .order('name');
    
  if (fetchError) {
    console.error('Error fetching tenants:', fetchError);
  } else {
    console.log('\nAll tenants after update:');
    allTenants.forEach(tenant => {
      console.log(`${tenant.name} (${tenant.slug}):`, tenant.settings);
    });
  }
}

updateTenants().catch(console.error);