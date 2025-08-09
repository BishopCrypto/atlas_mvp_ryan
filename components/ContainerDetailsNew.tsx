import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Users, ExternalLink, Plus, Shield, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import AddPersonModal from './AddPersonModal';
import ScreeningDetails from './ScreeningDetails';
import { ScreeningService } from '@/lib/screening';

interface Container {
  id: number;
  type: string;
  name: string;
  count: number;
  status: string;
  dueDate: string;
  flagged: number;
  department?: string;
}

interface ListMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  identification_number?: string;
  screening_status: string;
  created_at: string;
}

interface ContainerDetailsProps {
  selectedContainer: Container;
  containerIcons: Record<string, React.ReactNode>;
  onRefreshData: () => Promise<void>;
}

const ContainerDetails: React.FC<ContainerDetailsProps> = ({
  selectedContainer,
  containerIcons,
  onRefreshData
}) => {
  const [members, setMembers] = useState<ListMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<ListMember | null>(null);

  // Fetch list members
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('list_members')
        .select('*')
        .eq('list_id', selectedContainer.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching members:', error);
        setMembers([]);
      } else {
        setMembers(data || []);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch members when selected container changes
  useEffect(() => {
    if (selectedContainer?.id) {
      fetchMembers();
    }
  }, [selectedContainer?.id]);

  // Handle adding a person
  const handleAddPerson = async (personData: any) => {
    try {
      // Get tenant data from localStorage (same as main app)
      const tenantDataStr = localStorage.getItem('selectedTenantData');
      let tenantId = null;
      
      if (tenantDataStr) {
        try {
          const parsedData = JSON.parse(tenantDataStr);
          tenantId = parsedData?.id;
        } catch (e) {
          console.error('Error parsing tenant data:', e);
        }
      }
      
      if (!tenantId) {
        throw new Error('No tenant selected. Please refresh and select a tenant.');
      }

      // Extract screening flag and clean person data
      const { runScreening, ...cleanPersonData } = personData;
      
      // Initial screening status
      let initialStatus = 'pending';
      if (!runScreening) {
        initialStatus = 'not_screened';
      }

      const { data, error } = await supabase
        .from('list_members')
        .insert({
          list_id: selectedContainer.id,
          tenant_id: tenantId,
          ...cleanPersonData,
          screening_status: initialStatus
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding person:', error);
        throw error;
      }

      console.log('✅ Person added successfully:', data);

      // Run screening if requested
      if (runScreening && data) {
        console.log('🔍 Running automatic screening...');
        try {
          const screeningResult = await ScreeningService.screenPerson(
            data.id,
            tenantId,
            {
              name: cleanPersonData.name,
              email: cleanPersonData.email,
              phone: cleanPersonData.phone,
              dateOfBirth: cleanPersonData.date_of_birth,
              nationality: cleanPersonData.nationality
            },
            true // Bypass cache for testing - TODO: remove after API is confirmed working
          );

          // Update person with screening results
          const statusSummary = ScreeningService.getStatusSummary(screeningResult);
          
          await supabase
            .from('list_members')
            .update({
              screening_status: statusSummary.status,
              screening_score: Math.round(screeningResult.highestConfidence * 100),
              screening_details: JSON.stringify({
                requestId: screeningResult.requestId,
                matchCount: screeningResult.matchCount,
                highestConfidence: screeningResult.highestConfidence,
                riskLevel: screeningResult.riskLevel,
                matches: screeningResult.matches,
                summary: statusSummary.summary,
                screenedAt: screeningResult.cachedAt
              })
            })
            .eq('id', data.id);

          console.log('✅ Screening completed:', statusSummary.summary);
        } catch (screeningError) {
          console.error('❌ Screening failed:', screeningError);
          // Don't fail the whole operation if screening fails
        }
      }
      
      // Refresh members and parent data
      await fetchMembers();
      await onRefreshData();
    } catch (error) {
      console.error('Failed to add person:', error);
      throw error;
    }
  };

  const statusIcons = {
    pending: <Clock className="h-4 w-4 text-blue-500" />,
    'in-progress': <Clock className="h-4 w-4 text-orange-500" />,
    clear: <CheckCircle className="h-4 w-4 text-green-500" />,
    flagged: <AlertTriangle className="h-4 w-4 text-red-500" />,
    rejected: <AlertTriangle className="h-4 w-4 text-red-600" />,
    attention: <AlertTriangle className="h-4 w-4 text-orange-500" />,
    not_screened: <Users className="h-4 w-4 text-gray-400" />
  };

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className={selectedPerson ? "w-2/3 pr-4" : "w-full"}>
        <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          {containerIcons[selectedContainer.type]}
          <h2 className="text-2xl font-bold">{selectedContainer.name}</h2>
          {selectedContainer.status === 'attention' && (
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Attention Required
            </span>
          )}
        </div>
        <div className="flex space-x-3">
          <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm">
            Export
          </button>
          <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm">
            Schedule
          </button>
          <button className="px-3 py-1.5 bg-indigo-700 text-white rounded-md text-sm">
            Run Screening
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">List Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {containerIcons[selectedContainer.type]}
              <span className="text-lg font-medium capitalize">{selectedContainer.type}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Screening Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              <span className="text-lg font-medium">{selectedContainer.dueDate}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {selectedContainer.type === 'sailing' ? 'Passengers' : 
               selectedContainer.type === 'crew' ? 'Crew Members' : 
               selectedContainer.type === 'vendor' ? 'Vendors' :
               selectedContainer.type === 'guest' ? 'Guests' :
               selectedContainer.type === 'visitor' ? 'Visitors' : 'Items'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-indigo-500" />
              <span className="text-lg font-medium">{members.length}</span>
              {selectedContainer.flagged > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  {selectedContainer.flagged} flagged
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {selectedContainer.type === 'sailing' ? 'Passenger List' : 
             selectedContainer.type === 'crew' ? 'Crew Member List' : 
             selectedContainer.type === 'vendor' ? 'Vendor List' :
             selectedContainer.type === 'guest' ? 'Guest List' :
             selectedContainer.type === 'visitor' ? 'Visitor List' : 'Item List'}
             ({members.length})
          </CardTitle>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsAddPersonModalOpen(true)}
              className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 flex items-center transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Person
            </button>
            <button className="text-sm text-indigo-600 flex items-center hover:text-indigo-700">
              View All <ExternalLink className="h-4 w-4 ml-1" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-gray-500">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No people added to this list yet</p>
              <button 
                onClick={() => setIsAddPersonModalOpen(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center mx-auto transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Person
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {members.slice(0, 10).map((member) => (
                <div 
                  key={member.id} 
                  className={`flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedPerson?.id === member.id ? 'bg-indigo-50 border-indigo-300' : ''
                  }`}
                  onClick={() => setSelectedPerson(member)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {statusIcons[member.screening_status as keyof typeof statusIcons]}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-500">
                        {member.email && <span>{member.email}</span>}
                        {member.identification_number && (
                          <span className="ml-2">ID: {member.identification_number}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize
                      ${member.screening_status === 'clear' ? 'bg-green-100 text-green-800' :
                        member.screening_status === 'flagged' ? 'bg-red-100 text-red-800' :
                        member.screening_status === 'attention' ? 'bg-orange-100 text-orange-800' :
                        member.screening_status === 'not_screened' ? 'bg-gray-100 text-gray-600' :
                        member.screening_status === 'in-progress' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'}
                    `}>
                      {member.screening_status === 'not_screened' ? 'not screened' : member.screening_status}
                    </span>
                    <button className="text-indigo-600 hover:text-indigo-700">
                      <Shield className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {members.length > 10 && (
                <div className="text-center text-sm text-gray-500 py-2">
                  Showing 10 of {members.length} people
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Person Modal */}
      <AddPersonModal
        isOpen={isAddPersonModalOpen}
        onClose={() => setIsAddPersonModalOpen(false)}
        onAddPerson={handleAddPerson}
        listName={selectedContainer.name}
        listType={selectedContainer.type}
      />
      </div>

      {/* Screening Details Panel */}
      {selectedPerson && (
        <ScreeningDetails 
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </div>
  );
};

export default ContainerDetails;