'use client';

import React, { useState, useEffect } from 'react';
import { Ship, Users, Briefcase, Clock, AlertTriangle, CheckCircle, Calendar, Home, Book, UserCheck, Building, Shield, Anchor, Truck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ContainerDetails from '@/components/ContainerDetailsNew';
import QuickScreenMode from '@/components/QuickScreenMode';
import EmptyState from '@/components/EmptyState';
import AddContainerModal from '@/components/AddContainerModal';
import AddListModal from '@/components/AddListModal';

interface Container {
  id: number;
  name: string;
  description?: string;
  lists: List[];
}

interface List {
  id: number;
  container_id: number;
  type: 'sailing' | 'crew' | 'vendor' | 'guest' | 'visitor';
  name: string;
  count: number;
  status: string;
  dueDate: string;
  flagged: number;
}

const AtlasGlobalInsightsDashboard = () => {
  const [userRole, setUserRole] = useState('sailings');
  const [activeListType, setActiveListType] = useState('all');
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [quickScreenMode, setQuickScreenMode] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<string>('disney-cruise');
  const [tenantData, setTenantData] = useState<any>(null);
  const [tenantRoles, setTenantRoles] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddListModalOpen, setIsAddListModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [containers, setContainers] = useState<Container[]>([]);

  // Load selected tenant from localStorage
  useEffect(() => {
    const tenant = localStorage.getItem('selectedTenant');
    const tenantDataStr = localStorage.getItem('selectedTenantData');
    
    if (tenant) {
      setSelectedTenant(tenant);
    }
    
    if (tenantDataStr) {
      try {
        const parsedData = JSON.parse(tenantDataStr);
        setTenantData(parsedData);
        // Fetch tenant roles and containers when tenant data is loaded
        if (parsedData?.id) {
          fetchTenantRoles(parsedData.id);
          fetchContainers(parsedData.id);
        }
      } catch (e) {
        console.error('Error parsing tenant data:', e);
      }
    }
    
    // If no tenant selected, redirect to login
    if (!tenant) {
      window.location.href = '/login';
    }
  }, []);

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
          { name: 'sailings', display_name: `${tenantData?.name || 'Tenant'} Sailings` },
          { name: 'sailingstaff', display_name: 'Sailing Staff' },
          { name: 'vendors', display_name: 'Vendors' },
          { name: 'frontdesk', display_name: 'Guest Services' }
        ]);
      } else {
        setTenantRoles(roles || []);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  // Fetch containers for the selected tenant
  const fetchContainers = async (tenantId: string) => {
    try {
      setLoading(true);
      
      // First get containers
      const { data: containersData, error: containersError } = await supabase
        .from('containers')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (containersError) {
        console.error('Error fetching containers:', containersError);
        console.log('Using fallback sample data...');
        
        // Fallback to sample data if database isn't ready
        const fallbackContainers: Container[] = [
          {
            id: 1,
            name: "Disney Magic - March 2025 Sailing",
            description: "Complete screening for Disney Magic Eastern Caribbean cruise",
            lists: [
              { id: 1, container_id: 1, type: 'sailing', name: 'Passenger Manifest', count: 2500, status: 'clear', dueDate: '14/3/2025 - 21/3/2025', flagged: 0 },
              { id: 2, container_id: 1, type: 'crew', name: 'Bridge Officers', count: 45, status: 'clear', dueDate: '13/3/2025', flagged: 0 },
              { id: 3, container_id: 1, type: 'vendor', name: 'Port Services', count: 85, status: 'attention', dueDate: '14/3/2025', flagged: 2 }
            ]
          },
          {
            id: 2,
            name: "Disney Wonder - March 2025 Sailing",
            description: "Western Caribbean cruise screening package",
            lists: [
              { id: 4, container_id: 2, type: 'sailing', name: 'Passenger Manifest', count: 2400, status: 'in-progress', dueDate: '22/3/2025 - 29/3/2025', flagged: 0 },
              { id: 5, container_id: 2, type: 'crew', name: 'Food & Beverage Staff', count: 320, status: 'attention', dueDate: '21/3/2025', flagged: 8 }
            ]
          }
        ];
        
        setContainers(fallbackContainers);
        if (!selectedContainer && fallbackContainers.length > 0) {
          setSelectedContainer(fallbackContainers[0]);
        }
        setLoading(false);
        return;
      }

      // Then get all lists for these containers
      const containerIds = containersData?.map(c => c.id) || [];
      let listsData: any[] = [];
      
      if (containerIds.length > 0) {
        const { data: lists, error: listsError } = await supabase
          .from('lists')
          .select('*')
          .in('container_id', containerIds)
          .order('created_at', { ascending: false });

        if (listsError) {
          console.error('Error fetching lists:', listsError);
        } else {
          listsData = lists || [];
        }
      }

      // Combine containers with their lists
      const containersWithLists: Container[] = containersData?.map(container => ({
        id: container.id,
        name: container.name,
        description: container.description,
        lists: listsData
          .filter(list => list.container_id === container.id)
          .map(list => ({
            id: list.id,
            container_id: list.container_id,
            type: list.type,
            name: list.name,
            count: list.count,
            status: list.status,
            dueDate: list.due_date,
            flagged: list.flagged
          }))
      })) || [];

      setContainers(containersWithLists);
      
      // Auto-select first container if none selected
      if (!selectedContainer && containersWithLists.length > 0) {
        setSelectedContainer(containersWithLists[0]);
      }

      return containersWithLists;
    } catch (err) {
      console.error('Error fetching containers:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Add new container to database
  const handleAddContainer = async (containerData: Omit<Container, 'id'>) => {
    console.log('🔄 Creating container...', { containerData, tenantData });
    
    if (!tenantData?.id) {
      console.error('❌ No tenant selected', { tenantData });
      alert('No tenant selected. Please refresh and select a tenant.');
      return;
    }

    try {
      console.log('📤 Sending to database:', {
        tenant_id: tenantData.id,
        name: containerData.name,
        description: containerData.description,
        is_active: true
      });

      const { data, error } = await supabase
        .from('containers')
        .insert({
          tenant_id: tenantData.id,
          name: containerData.name,
          description: containerData.description,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Database error creating container:', error);
        console.log('📝 Error details:', JSON.stringify(error, null, 2));
        
        // Show user the actual error
        alert(`Failed to create container: ${error.message || 'Unknown error'}\nCheck console for details.`);
        
        // Fallback: Add to local state only (temporary until DB is fixed)
        const newId = Math.max(...containers.map(c => c.id as number), 0) + 1;
        const newContainer: Container = {
          id: newId,
          name: containerData.name,
          description: containerData.description,
          lists: []
        };
        
        setContainers(prev => [newContainer, ...prev]);
        setSelectedContainer(newContainer);
        return;
      }

      // Add to local state
      const newContainer: Container = {
        id: data.id,
        name: data.name,
        description: data.description,
        lists: []
      };
      
      setContainers(prev => [newContainer, ...prev]);
      
      // Auto-select the new container
      setSelectedContainer(newContainer);
    } catch (err) {
      console.error('Error creating container:', err);
      alert('Failed to create container. Please try again.');
    }
  };

  // Add new list to database
  const handleAddList = async (listData: Omit<List, 'id' | 'container_id'>) => {
    console.log('🔄 Creating list...', { listData, selectedContainer, tenantData });
    
    if (!selectedContainer || !tenantData?.id) {
      console.error('❌ No container or tenant selected', { selectedContainer, tenantData });
      alert('No container selected. Please select a container first.');
      return;
    }

    try {
      console.log('📤 Sending list to database:', {
        container_id: selectedContainer.id,
        tenant_id: tenantData.id,
        name: listData.name,
        type: listData.type,
        description: listData.description,
        count: listData.count,
        status: listData.status,
        due_date: listData.due_date,
        is_active: true
      });

      const { data, error } = await supabase
        .from('lists')
        .insert({
          container_id: selectedContainer.id,
          tenant_id: tenantData.id,
          name: listData.name,
          type: listData.type,
          description: listData.description,
          count: listData.count,
          status: listData.status,
          due_date: listData.due_date,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Database error creating list:', error);
        console.log('📝 Error details:', JSON.stringify(error, null, 2));
        alert(`Failed to create list: ${error.message || 'Unknown error'}`);
        return;
      }

      console.log('✅ List created successfully:', data);

      // Refresh containers to get updated lists
      if (tenantData?.id) {
        console.log('🔄 Refreshing containers after list creation...');
        const updatedContainers = await fetchContainers(tenantData.id);
        console.log('✅ Containers refreshed, new state:', updatedContainers.length, 'containers');
        
        // Update selectedContainer with the refreshed data
        if (selectedContainer) {
          const updatedContainer = updatedContainers.find(c => c.id === selectedContainer.id);
          if (updatedContainer) {
            setSelectedContainer(updatedContainer);
            console.log('✅ Selected container updated with new lists:', updatedContainer.lists.length, 'lists');
            
            // Auto-select the newly created list
            const newList = updatedContainer.lists.find(list => list.id === data.id);
            if (newList) {
              setSelectedList(newList);
              console.log('✅ New list auto-selected:', newList.name);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error creating list:', err);
      alert('Failed to create list. Please try again.');
    }
  };

  // Open/close modal handlers
  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);
  const openAddListModal = () => setIsAddListModalOpen(true);
  const closeAddListModal = () => setIsAddListModalOpen(false);
  
  const getAvailableListTypes = () => {
    switch(userRole) {
      case 'sailings':
        return ['sailing'];
      case 'sailingstaff':
        return ['crew'];
      case 'vendors':
        return ['vendor'];
      case 'frontdesk':
        return ['guest', 'visitor'];
      default:
        return ['sailing', 'crew', 'vendor', 'guest', 'visitor'];
    }
  };
  
  const getFilteredLists = () => {
    if (!selectedContainer) return [];
    
    const availableTypes = getAvailableListTypes();
    let lists = selectedContainer.lists.filter(list => 
      availableTypes.includes(list.type)
    );
    
    if (activeListType !== 'all') {
      lists = lists.filter(list => list.type === activeListType);
    }
    
    return lists;
  };
  
  const filteredLists = getFilteredLists();
  const attentionCount = filteredLists.filter(l => l.status === 'attention').length;
  
  const getTypeCount = (type: string) => {
    return filteredLists.filter(l => l.type === type).length;
  };
  
  const containerIcons = {
    'sailing': <Ship className="h-5 w-5 mr-2" />,
    'crew': <Anchor className="h-5 w-5 mr-2" />,
    'vendor': <Truck className="h-5 w-5 mr-2" />,
    'guest': <UserCheck className="h-5 w-5 mr-2" />,
    'visitor': <Building className="h-5 w-5 mr-2" />
  };
  
  const statusIcons = {
    'clear': <CheckCircle className="h-5 w-5 text-green-500" />,
    'attention': <AlertTriangle className="h-5 w-5 text-amber-500" />,
    'in-progress': <Clock className="h-5 w-5 text-blue-500" />,
    'active': <CheckCircle className="h-5 w-5 text-green-500" />,
    'scheduled': <Calendar className="h-5 w-5 text-blue-500" />
  };
  
  const typeLabels = {
    'sailing': 'Sailing',
    'crew': 'Crew Group',
    'vendor': 'Vendor Group',
    'guest': 'Guest Group',
    'visitor': 'Visitor Group'
  };
  
  const handleListClick = (list: List) => {
    setSelectedList(list);
    setQuickScreenMode(false);
  };
  
  const getRoleTitle = () => {
    const tenantName = tenantData?.name?.split(' ')[0] || 'Cruise';
    
    switch(userRole) {
      case 'sailings': return `${tenantName} Sailings`;
      case 'sailingstaff': return 'Sailing Staff Management';
      case 'vendors': return 'Vendor Management';
      case 'frontdesk': return 'Guest Services';
      default: return `${tenantName} Intelligence`;
    }
  };

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
  
  const toggleQuickScreen = () => {
    setSelectedContainer(null);
    setQuickScreenMode(!quickScreenMode);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserRole(e.target.value);
    setSelectedContainer(null);
    setSelectedList(null);
    setActiveListType('all');
    setQuickScreenMode(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        userRole={userRole}
        getRoleTitle={getRoleTitle}
        handleRoleChange={handleRoleChange}
        quickScreenMode={quickScreenMode}
        toggleQuickScreen={toggleQuickScreen}
        activeListType={activeListType}
        typeLabels={typeLabels}
        selectedTenant={selectedTenant}
        tenantData={tenantData}
        roleOptions={getTenantRoleOptions()}
        onAddContainer={openAddModal}
        containers={containers}
        selectedContainer={selectedContainer}
        onSelectContainer={setSelectedContainer}
        loading={loading}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {!quickScreenMode ? (
          <>
            <Sidebar
              activeListType={activeListType}
              setActiveListType={setActiveListType}
              getAvailableListTypes={getAvailableListTypes}
              filteredContainers={filteredLists}
              attentionCount={attentionCount}
              selectedContainer={selectedList}
              handleContainerClick={handleListClick}
              containerIcons={containerIcons}
              statusIcons={statusIcons}
              getTypeCount={getTypeCount}
              containers={containers}
              selectedRealContainer={selectedContainer}
              onSelectContainer={setSelectedContainer}
              onAddList={openAddListModal}
            />
            
            <div className="flex-1 overflow-y-auto p-6">
              {!selectedList ? (
                <EmptyState userRole={userRole} />
              ) : (
                <ContainerDetails
                  selectedContainer={selectedList}
                  containerIcons={containerIcons}
                  onRefreshData={async () => {
                    if (tenantData?.id) {
                      const updatedContainers = await fetchContainers(tenantData.id);
                      if (selectedContainer) {
                        const updatedContainer = updatedContainers.find(c => c.id === selectedContainer.id);
                        if (updatedContainer) {
                          setSelectedContainer(updatedContainer);
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
          </>
        ) : (
          <QuickScreenMode />
        )}
      </div>
      
      {/* Add Container Modal */}
      <AddContainerModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onAddContainer={handleAddContainer}
        userRole={userRole}
        activeListType={activeListType}
      />

      {/* Add List Modal */}
      <AddListModal
        isOpen={isAddListModalOpen}
        onClose={closeAddListModal}
        onAddList={handleAddList}
        userRole={userRole}
        containerId={selectedContainer?.id || 0}
        containerName={selectedContainer?.name || ''}
      />
    </div>
  );
};

export default AtlasGlobalInsightsDashboard;