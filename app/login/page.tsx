'use client';

import React, { useState, useEffect } from 'react';
import { Building, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  brand_colors: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  settings: Record<string, any>;
  is_active: boolean;
}

const LoginPage = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<string>('Connecting...');
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);

  // Demo tenants for development
  const demoTenants: Tenant[] = [
    {
      id: 'disney-cruise',
      name: 'Disney Cruise Line',
      slug: 'disney-cruise',
      brand_colors: {
        primary: '#003087',
        secondary: '#FFD100',
        accent: '#FF6B35'
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
      slug: 'virgin-voyages',
      brand_colors: {
        primary: '#e91e63',
        secondary: '#ff9800',
        accent: '#00bcd4'
      },
      settings: {
        departments: ['sailings', 'sailingstaff', 'vendors', 'frontdesk'],
        screening_enabled: false
      },
      is_active: true
    }
  ];

  useEffect(() => {
    async function fetchTenants() {
      try {
        // First try without filters to test basic access
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .order('name');
        
        if (error) {
          console.log('Database error:', error);
          setDbStatus(`DB Error: ${error.message}`);
          setTenants(demoTenants);
        } else if (data && data.length > 0) {
          setDbStatus(`Connected - Found ${data.length} tenants`);
          setTenants(data);
        } else {
          console.log('No tenants found - likely RLS blocking read access');
          setDbStatus('RLS Blocking - Demo Mode');
          setTenants(demoTenants);
        }
      } catch (err) {
        console.log('Connection error, using demo tenants:', err);
        setDbStatus('Connection Failed - Using Demo Data');
        setTenants(demoTenants);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTenants();
  }, []);

  const handleTenantSelect = (tenant: Tenant) => {
    // Store both slug and full tenant info in localStorage
    localStorage.setItem('selectedTenant', tenant.slug);
    localStorage.setItem('selectedTenantData', JSON.stringify(tenant));
    // Redirect to main app
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading tenants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Atlas Intelligence</h1>
          <p className="text-lg text-gray-600 mb-2">Select your organization to continue</p>
          
          {/* DB Status */}
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm">
            <span className={`px-2 py-1 rounded-full font-medium ${
              dbStatus.includes('Connected') ? 'bg-green-100 text-green-700' :
              dbStatus.includes('Failed') ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {dbStatus}
            </span>
          </div>
        </div>

        {/* Tenant Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
              onClick={() => handleTenantSelect(tenant)}
              className={`
                relative bg-white rounded-xl border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg
                ${selectedTenant === tenant.slug ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-gray-300'}
                ${!tenant.is_active ? 'opacity-60' : ''}
              `}
              style={{
                borderTopColor: tenant.is_active ? tenant.brand_colors.primary : '#d1d5db'
              }}
            >
              {/* Status indicator */}
              <div className="absolute top-4 right-4">
                {tenant.is_active ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
              </div>

              {/* Content */}
              <div className="flex items-start space-x-4">
                <div 
                  className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: tenant.brand_colors.primary }}
                >
                  {tenant.logo_url ? (
                    <img src={tenant.logo_url} alt={tenant.name} className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <Building className="h-6 w-6" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{tenant.name}</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Departments:</span>
                      <span className="text-xs font-medium text-gray-700">
                        {tenant.settings.departments?.length || tenant.settings.features?.length || 0}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Screening:</span>
                      <span className={`text-xs font-medium ${
                        tenant.settings.screening_enabled ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {tenant.settings.screening_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  {!tenant.is_active && (
                    <div className="mt-3 text-xs text-yellow-600 font-medium">
                      Inactive
                    </div>
                  )}
                </div>
              </div>

              {/* Brand colors preview */}
              <div className="mt-4 flex space-x-2">
                <div 
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ backgroundColor: tenant.brand_colors.primary }}
                  title="Primary"
                />
                <div 
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ backgroundColor: tenant.brand_colors.secondary }}
                  title="Secondary"
                />
                {tenant.brand_colors.accent && (
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-200"
                    style={{ backgroundColor: tenant.brand_colors.accent }}
                    title="Accent"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>Atlas Intelligence - Secure Multi-Tenant Platform</p>
          <p className="mt-1">Select an active tenant to access your dashboard</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;