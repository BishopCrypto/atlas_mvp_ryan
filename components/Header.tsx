import React from 'react';
import { Calendar, UserCheck } from 'lucide-react';

interface HeaderProps {
  userRole: string;
  getRoleTitle: () => string;
  handleRoleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  quickScreenMode: boolean;
  toggleQuickScreen: () => void;
  activeContainerType: string;
  typeLabels: Record<string, string>;
}

const Header: React.FC<HeaderProps> = ({
  userRole,
  getRoleTitle,
  handleRoleChange,
  quickScreenMode,
  toggleQuickScreen,
  activeContainerType,
  typeLabels
}) => {
  return (
    <header className="bg-white border-b border-gray-200 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Disney Cruise Intelligence</h1>
          <span className="mx-3 text-gray-400">|</span>
          <h2 className="text-lg">{getRoleTitle()}</h2>
          
          {/* Demo role switcher - would be removed in production */}
          <select 
            value={userRole} 
            onChange={handleRoleChange}
            className="ml-6 border border-gray-300 rounded-md px-2 py-1 text-sm bg-gray-50"
          >
            <option value="sailings">Disney Cruise Sailings</option>
            <option value="sailingstaff">Sailing Staff</option>
            <option value="vendors">Vendors</option>
            <option value="frontdesk">Guest Services</option>
          </select>
        </div>
        <div className="flex items-center space-x-4">
          {userRole === 'frontdesk' && (
            <button 
              onClick={toggleQuickScreen}
              className={`flex items-center px-3 py-2 rounded-md text-sm ${
                quickScreenMode 
                  ? 'bg-indigo-700 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Quick Screen
            </button>
          )}
          <button className="flex items-center bg-blue-100 text-blue-800 rounded-md px-3 py-2">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </button>
          <button className="flex items-center bg-indigo-700 text-white rounded-md px-3 py-2">
            <span className="mr-2">+</span>
            Add {activeContainerType === 'all' ? 'Container' : typeLabels[activeContainerType]}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;