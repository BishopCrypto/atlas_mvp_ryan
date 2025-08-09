import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface TenantData {
  id: string;
  name: string;
  [key: string]: any;
}

interface TenantRole {
  name: string;
  display_name: string;
}

export const useTenant = () => {
  const [selectedTenant, setSelectedTenant] = useState<string>('disney-cruise');
  const [tenantData, setTenantData] = useState<TenantData | null>(null);
  const [tenantRoles, setTenantRoles] = useState<TenantRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch roles for the selected tenant
  const fetchTenantRoles = async (tenantId: string) => {
    try {
      const { data: roles, error } = await supabase
        .from('roles')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching tenant roles:', error);
        // Fall back to default roles if database fetch fails
        setTenantRoles([
          { name: 'sailings', display_name: 'Management' },
          { name: 'sailingstaff', display_name: 'Sailing Staff' },
          { name: 'vendors', display_name: 'Vendors' },
          { name: 'frontdesk', display_name: 'Guest Services' }
        ]);
      } else {
        setTenantRoles(roles || []);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load tenant data from localStorage and fetch roles
  useEffect(() => {
    const loadTenantData = async () => {
      const tenant = localStorage.getItem('selectedTenant');
      const tenantDataStr = localStorage.getItem('selectedTenantData');
      
      if (tenant) {
        setSelectedTenant(tenant);
      }
      
      if (tenantDataStr) {
        try {
          const parsedData = JSON.parse(tenantDataStr);
          setTenantData(parsedData);
          
          if (parsedData?.id) {
            await fetchTenantRoles(parsedData.id);
          } else {
            setIsLoading(false);
          }
        } catch (e) {
          console.error('Error parsing tenant data:', e);
          setIsLoading(false);
        }
      } else {
        // If no tenant selected, redirect to login
        window.location.href = '/login';
      }
    };

    loadTenantData();
  }, []);

  const getTenantRoleOptions = () => {
    if (tenantRoles.length > 0) {
      return tenantRoles.map(role => ({
        value: role.name,
        label: role.display_name
      }));
    }
    
    // Fallback options if roles not loaded yet
    return [
      { value: 'sailings', label: 'Loading...' }
    ];
  };

  return {
    selectedTenant,
    tenantData,
    tenantRoles,
    isLoading,
    getTenantRoleOptions,
    setSelectedTenant,
    setTenantData
  };
};