import React from 'react';
import { AlertTriangle, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Container {
  id: number;
  type: string;
  name: string;
  count: number;
  status: string;
  dueDate: string;
  flagged: number;
}

interface ContainerSummaryProps {
  container: Container;
  containerIcons: Record<string, React.ReactNode>;
  membersCount: number;
}

const ContainerSummary: React.FC<ContainerSummaryProps> = ({
  container,
  containerIcons,
  membersCount
}) => {
  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          {containerIcons[container.type]}
          <h2 className="text-2xl font-bold">{container.name}</h2>
          {container.status === 'attention' && (
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
              {containerIcons[container.type]}
              <span className="text-lg font-medium capitalize">{container.type}</span>
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
              <span className="text-lg font-medium">{container.dueDate}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">People Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-500" />
              <span className="text-lg font-medium">{membersCount}</span>
              {container.flagged > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  {container.flagged} flagged
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ContainerSummary;