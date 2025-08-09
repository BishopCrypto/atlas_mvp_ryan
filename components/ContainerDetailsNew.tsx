import React, { useState, useEffect } from 'react';
import { ExternalLink, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import AddPersonModal from './AddPersonModal';
import ScreeningDetails from './ScreeningDetails';
import ContainerSummary from './ContainerSummary';
import PersonList from './PersonList';
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


  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className={selectedPerson ? "w-2/3 pr-4" : "w-full"}>
        <ContainerSummary
          container={selectedContainer}
          containerIcons={containerIcons}
          membersCount={members.length}
        />
      
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
          <PersonList
            members={members}
            loading={loading}
            selectedPerson={selectedPerson}
            containerType={selectedContainer.type}
            containerName={selectedContainer.name}
            onPersonClick={setSelectedPerson}
            onAddPerson={() => setIsAddPersonModalOpen(true)}
          />
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