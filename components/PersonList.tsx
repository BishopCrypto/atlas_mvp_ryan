import React from 'react';
import { Shield, Users, Plus } from 'lucide-react';

interface ListMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  identification_number?: string;
  screening_status: string;
}

interface PersonListProps {
  members: ListMember[];
  loading: boolean;
  selectedPerson?: ListMember | null;
  containerType: string;
  containerName: string;
  onPersonClick: (person: ListMember) => void;
  onAddPerson: () => void;
}

const PersonList: React.FC<PersonListProps> = ({
  members,
  loading,
  selectedPerson,
  containerType,
  containerName,
  onPersonClick,
  onAddPerson
}) => {
  const getListTitle = () => {
    switch (containerType) {
      case 'sailing': return 'Passenger List';
      case 'crew': return 'Crew Member List';
      case 'vendor': return 'Vendor List';
      case 'guest': return 'Guest List';
      case 'visitor': return 'Visitor List';
      default: return 'Item List';
    }
  };

  const statusIcons = {
    clear: <Shield className="h-4 w-4 text-green-500" />,
    flagged: <Shield className="h-4 w-4 text-red-500" />,
    'in-progress': <Shield className="h-4 w-4 text-orange-500" />,
    attention: <Shield className="h-4 w-4 text-orange-500" />,
    not_screened: <Users className="h-4 w-4 text-gray-400" />
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading members...</div>;
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">No people added to this list yet</p>
        <button 
          onClick={onAddPerson}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center mx-auto transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add First Person
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {members.slice(0, 10).map((member) => (
        <div 
          key={member.id} 
          className={`flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
            selectedPerson?.id === member.id ? 'bg-indigo-50 border-indigo-300' : ''
          }`}
          onClick={() => onPersonClick(member)}
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
  );
};

export default PersonList;