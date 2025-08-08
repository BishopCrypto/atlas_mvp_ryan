import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Check if we have a Disney Cruise tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', 'disney-cruise')
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Disney Cruise tenant not found' }, { status: 404 });
    }

    // Create sample containers if they don't exist
    const { data: existingContainers } = await supabase
      .from('containers')
      .select('id')
      .eq('tenant_id', tenant.id)
      .limit(1);

    if (!existingContainers || existingContainers.length === 0) {
      // Insert sample containers
      const containersToInsert = [
        {
          tenant_id: tenant.id,
          name: 'Disney Magic - March 2025 Sailing',
          description: 'Complete screening package for Disney Magic Eastern Caribbean cruise',
          is_active: true
        },
        {
          tenant_id: tenant.id,
          name: 'Disney Wonder - March 2025 Sailing',
          description: 'Western Caribbean cruise screening package',
          is_active: true
        },
        {
          tenant_id: tenant.id,
          name: 'Port Operations Q1 2025',
          description: 'Quarterly port staff and vendor screening',
          is_active: true
        }
      ];

      const { data: newContainers, error: containerError } = await supabase
        .from('containers')
        .insert(containersToInsert)
        .select();

      if (containerError) {
        console.error('Container creation error:', containerError);
        return NextResponse.json({ error: 'Failed to create containers', details: containerError }, { status: 500 });
      }

      // Create sample lists for the containers
      if (newContainers && newContainers.length > 0) {
        const listsToInsert = [
          // Lists for Disney Magic
          {
            container_id: newContainers[0].id,
            tenant_id: tenant.id,
            name: 'Passenger Manifest',
            type: 'sailing',
            count: 2500,
            status: 'clear',
            due_date: '2025-03-21',
            flagged: 0
          },
          {
            container_id: newContainers[0].id,
            tenant_id: tenant.id,
            name: 'Bridge Officers',
            type: 'crew',
            count: 45,
            status: 'clear',
            due_date: '2025-03-13',
            flagged: 0
          },
          {
            container_id: newContainers[0].id,
            tenant_id: tenant.id,
            name: 'Port Services',
            type: 'vendor',
            count: 85,
            status: 'attention',
            due_date: '2025-03-14',
            flagged: 2
          },
          // Lists for Disney Wonder
          {
            container_id: newContainers[1].id,
            tenant_id: tenant.id,
            name: 'Passenger Manifest',
            type: 'sailing',
            count: 2400,
            status: 'in-progress',
            due_date: '2025-03-29',
            flagged: 0
          },
          {
            container_id: newContainers[1].id,
            tenant_id: tenant.id,
            name: 'Food & Beverage Staff',
            type: 'crew',
            count: 320,
            status: 'attention',
            due_date: '2025-03-21',
            flagged: 8
          }
        ];

        const { error: listsError } = await supabase
          .from('lists')
          .insert(listsToInsert);

        if (listsError) {
          console.error('Lists creation error:', listsError);
          // Don't fail completely, just log the error
          console.log('Containers created but failed to create sample lists');
        }
      }

      return NextResponse.json({ 
        message: 'Database initialized successfully with containers and sample lists!', 
        containers: newContainers 
      });
    }

    return NextResponse.json({ message: 'Database already has containers' });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}