import React from 'react';
import { Ship, Anchor, Truck, UserCheck } from 'lucide-react';

interface EmptyStateProps {
  userRole: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ userRole }) => {
  const getIcon = () => {
    switch (userRole) {
      case 'sailings':
        return <Ship className="h-16 w-16 mx-auto mb-4 text-gray-300" />;
      case 'sailingstaff':
        return <Anchor className="h-16 w-16 mx-auto mb-4 text-gray-300" />;
      case 'vendors':
        return <Truck className="h-16 w-16 mx-auto mb-4 text-gray-300" />;
      case 'frontdesk':
        return <UserCheck className="h-16 w-16 mx-auto mb-4 text-gray-300" />;
      default:
        return <Ship className="h-16 w-16 mx-auto mb-4 text-gray-300" />;
    }
  };

  return (
    <div className="text-center text-gray-500 mt-20">
      {getIcon()}
      <p>Select a container to view details</p>
    </div>
  );
};

export default EmptyState;