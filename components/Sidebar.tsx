import React from 'react';
import { Search, Filter, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Container {
  id: number;
  type: string;
  name: string;
  count: number;
  status: string;
  dueDate: string;
  flagged: number;
  department: string;
}

interface SidebarProps {
  activeContainerType: string;
  setActiveContainerType: (type: string) => void;
  getAvailableContainerTypes: () => string[];
  filteredContainers: Container[];
  attentionCount: number;
  selectedContainer: Container | null;
  handleContainerClick: (container: Container) => void;
  containerIcons: Record<string, React.ReactNode>;
  statusIcons: Record<string, React.ReactNode>;
  getTypeCount: (type: string) => number;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeContainerType,
  setActiveContainerType,
  getAvailableContainerTypes,
  filteredContainers,
  attentionCount,
  selectedContainer,
  handleContainerClick,
  containerIcons,
  statusIcons,
  getTypeCount
}) => {
  return (
    <div className="w-72 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Container type tabs */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search containers..." 
              className="w-full pl-8 pr-4 py-1.5 border border-gray-300 rounded-md text-sm"
            />
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
          </div>
          <button className="ml-2 p-1.5 border border-gray-300 rounded-md">
            <Filter className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        
        <Tabs defaultValue="all" onValueChange={setActiveContainerType}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            {getAvailableContainerTypes().slice(0, 3).map(type => (
              <TabsTrigger key={type} value={type} className="text-xs capitalize">
                {type}s
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      {/* Container list */}
      <div className="flex-1 overflow-y-auto">
        {attentionCount > 0 && (
          <div className="p-3">
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-sm font-medium">Attention Required</AlertTitle>
              <AlertDescription className="text-xs">
                {attentionCount} containers need your attention
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <div className="p-3">
          <div className="text-xs text-gray-500 font-medium mb-2">
            {activeContainerType === 'all' ? 'ALL CONTAINERS' : 
             `${activeContainerType.toUpperCase()}S`}
             ({filteredContainers.length})
          </div>
          
          <div className="space-y-2">
            {filteredContainers.map(container => (
              <div 
                key={container.id}
                onClick={() => handleContainerClick(container)}
                className={`
                  p-3 rounded-md cursor-pointer
                  ${selectedContainer?.id === container.id ? 'bg-indigo-50 border-indigo-200 border' : 'hover:bg-gray-100 border border-transparent'}
                `}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {containerIcons[container.type]}
                    <span className="font-medium">{container.name}</span>
                  </div>
                  {statusIcons[container.status]}
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>{container.count} {
                    container.type === 'sailing' ? 'passengers' : 
                    container.type === 'crew' ? 'crew members' : 
                    container.type === 'vendor' ? 'vendors' :
                    container.type === 'guest' ? 'guests' :
                    container.type === 'visitor' ? 'visitors' : 'items'
                  }</span>
                  {container.flagged > 0 && (
                    <span className="text-amber-500 font-medium">{container.flagged} flagged</span>
                  )}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {container.dueDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Stats footer */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          {getAvailableContainerTypes().map(type => (
            <div key={type} className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1.5"></span>
              {type.charAt(0).toUpperCase() + type.slice(1)}s: {getTypeCount(type)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;