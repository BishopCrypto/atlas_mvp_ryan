import React from 'react';
import { Search, Filter, AlertTriangle, Plus } from 'lucide-react';
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
  activeListType: string;
  setActiveListType: (type: string) => void;
  getAvailableListTypes: () => string[];
  filteredContainers: Container[];
  attentionCount: number;
  selectedContainer: Container | null;
  handleContainerClick: (container: Container) => void;
  containerIcons: Record<string, React.ReactNode>;
  statusIcons: Record<string, React.ReactNode>;
  getTypeCount: (type: string) => number;
  containers: any[];
  selectedRealContainer: any;
  onSelectContainer: (container: any) => void;
  onAddList: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeListType,
  setActiveListType,
  getAvailableListTypes,
  filteredContainers,
  attentionCount,
  selectedContainer,
  handleContainerClick,
  containerIcons,
  statusIcons,
  getTypeCount,
  containers,
  selectedRealContainer,
  onSelectContainer,
  onAddList
}) => {
  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Container type tabs */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex justify-between items-center mb-4">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search containers..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <button className="ml-3 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        
        <Tabs defaultValue="all" onValueChange={setActiveListType}>
          <TabsList className="grid grid-cols-4 w-full h-10">
            <TabsTrigger value="all" className="text-xs font-medium">All</TabsTrigger>
            {getAvailableListTypes().slice(0, 3).map(type => (
              <TabsTrigger key={type} value={type} className="text-xs font-medium capitalize">
                {type}s
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      {/* Container list */}
      <div className="flex-1 overflow-y-auto">
        {attentionCount > 0 && (
          <div className="p-4 bg-amber-50 border-b border-amber-200">
            <Alert className="bg-amber-50 border-amber-200 border-0 p-0 bg-transparent">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <AlertTitle className="text-sm font-semibold text-amber-800 mb-1">Attention Required</AlertTitle>
                  <AlertDescription className="text-sm text-amber-700">
                    {attentionCount} list{attentionCount !== 1 ? 's' : ''} need{attentionCount === 1 ? 's' : ''} your attention
                  </AlertDescription>
                  <div className="mt-2 text-xs text-amber-600 font-medium">
                    ALL LISTS({filteredContainers.length})
                  </div>
                </div>
              </div>
            </Alert>
          </div>
        )}
        
        <div className="p-4">
          {!attentionCount && (
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-gray-500 font-semibold tracking-wide">
                {activeListType === 'all' ? 'ALL LISTS' : 
                 `${activeListType.toUpperCase()}S`}
                 ({filteredContainers.length})
              </div>
              {selectedRealContainer && (
                <button
                  onClick={onAddList}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Add new list to this container"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          
          <div className="space-y-3">
            {filteredContainers.map(container => (
              <div 
                key={container.id}
                onClick={() => handleContainerClick(container)}
                className={`
                  p-4 rounded-lg cursor-pointer transition-all duration-200 border
                  ${selectedContainer?.id === container.id 
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                    : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm'}
                `}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div className="flex-shrink-0 text-gray-600">
                      {containerIcons[container.type]}
                    </div>
                    <span className="font-semibold text-gray-900 text-sm leading-tight truncate">
                      {container.name}
                    </span>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {statusIcons[container.status]}
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-medium text-gray-700">
                    {container.count.toLocaleString()} {
                      container.type === 'sailing' ? 'passengers' : 
                      container.type === 'crew' ? 'crew members' : 
                      container.type === 'vendor' ? 'vendors' :
                      container.type === 'guest' ? 'guests' :
                      container.type === 'visitor' ? 'visitors' : 'items'
                    }
                  </span>
                  {container.flagged > 0 && (
                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                      {container.flagged} flagged
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 font-medium">
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
          {getAvailableListTypes().map(type => (
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