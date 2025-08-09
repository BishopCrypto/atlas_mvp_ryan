import React from 'react';
import { Calendar, UserCheck, Container } from 'lucide-react';

interface Container {
  id: string | number;
  name: string;
  description?: string;
  lists: any[];
}

interface HeaderProps {
  userRole: string;
  getRoleTitle: () => string;
  handleRoleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  quickScreenMode: boolean;
  toggleQuickScreen: () => void;
  activeContainerType: string;
  typeLabels: Record<string, string>;
  selectedTenant: string;
  tenantData: any;
  roleOptions: Array<{value: string; label: string}>;
  onAddContainer: () => void;
  containers: Container[];
  selectedContainer: Container | null;
  onSelectContainer: (container: Container) => void;
  loading: boolean;
}

const Header: React.FC<HeaderProps> = ({
  userRole,
  getRoleTitle,
  handleRoleChange,
  quickScreenMode,
  toggleQuickScreen,
  activeContainerType,
  typeLabels,
  selectedTenant,
  tenantData,
  roleOptions,
  onAddContainer,
  containers,
  selectedContainer,
  onSelectContainer,
  loading
}) => {
  return (
    <header className="bg-white border-b border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              {tenantData ? `${tenantData.name} Intelligence` : 'Atlas Intelligence'}
            </h1>
          </div>
          
          {/* Container Selector */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-gray-400">|</span>
            <select 
              value={selectedContainer?.id || ''}
              onChange={(e) => {
                const containerId = e.target.value;
                const container = containers.find(c => c.id.toString() === containerId);
                if (container) {
                  onSelectContainer(container);
                }
              }}
              disabled={loading || !containers || containers.length === 0}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[200px]"
            >
              {loading ? (
                <option>Loading containers...</option>
              ) : !containers || containers.length === 0 ? (
                <option>No containers available</option>
              ) : (
                <>
                  <option value="">Select a container...</option>
                  {containers.map(container => (
                    <option key={container.id} value={container.id}>
                      {container.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
          
          {/* Role indicator */}
          <div className="flex items-center">
            <span className="hidden sm:inline mx-2 text-gray-400">|</span>
            <span className="text-xs px-2 py-1 rounded-full font-medium bg-indigo-100 text-indigo-700">
              {getRoleTitle()}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {userRole === 'frontdesk' && (
            <button 
              onClick={toggleQuickScreen}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                quickScreenMode 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Quick Screen
            </button>
          )}
          <button 
            onClick={onAddContainer}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-3 py-2 text-sm font-medium transition-colors"
          >
            <span className="mr-2">+</span>
            Add {activeContainerType === 'all' ? 'Container' : typeLabels[activeContainerType]}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;