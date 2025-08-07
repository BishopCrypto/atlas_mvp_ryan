import React from 'react';
import { AlertTriangle, Clock, Users, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

interface ContainerDetailsProps {
  selectedContainer: Container;
  containerIcons: Record<string, React.ReactNode>;
}

const ContainerDetails: React.FC<ContainerDetailsProps> = ({
  selectedContainer,
  containerIcons
}) => {
  return (
    <div>
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
            <CardTitle className="text-sm font-medium text-gray-500">Container Type</CardTitle>
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
              <span className="text-lg font-medium">{selectedContainer.count}</span>
              {selectedContainer.flagged > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  {selectedContainer.flagged} flagged
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {selectedContainer.flagged > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-800">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              Flagged Items ({selectedContainer.flagged})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({length: Math.min(3, selectedContainer.flagged)}).map((_, index) => (
                <div key={index} className="p-3 border border-amber-200 rounded-md bg-amber-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">Entity {index + 1}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Risk Level: High • Detected on {new Date().toLocaleDateString()}
                      </div>
                    </div>
                    <button className="flex items-center text-indigo-600 text-sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Review
                    </button>
                  </div>
                </div>
              ))}
              {selectedContainer.flagged > 3 && (
                <div className="text-center text-sm text-indigo-600">
                  + {selectedContainer.flagged - 3} more flagged items
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {selectedContainer.type === 'sailing' ? 'Passenger List' : 
             selectedContainer.type === 'crew' ? 'Crew Member List' : 
             selectedContainer.type === 'vendor' ? 'Vendor List' :
             selectedContainer.type === 'guest' ? 'Guest List' :
             selectedContainer.type === 'visitor' ? 'Visitor List' : 'Item List'}
             ({selectedContainer.count})
          </CardTitle>
          <button className="text-sm text-indigo-600 flex items-center">
            View All <ExternalLink className="h-4 w-4 ml-1" />
          </button>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">
            Showing 10 of {selectedContainer.count} records
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContainerDetails;