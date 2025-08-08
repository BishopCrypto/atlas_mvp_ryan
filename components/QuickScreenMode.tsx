import React from 'react';
import { UserCheck, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const QuickScreenMode: React.FC = () => {
  return (
    <div className="flex-1 p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-indigo-500" />
              Quick Guest Screening
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Visitor Information</label>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="First Name" 
                    className="p-2 border border-gray-300 rounded-md"
                  />
                  <input 
                    type="text" 
                    placeholder="Last Name" 
                    className="p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <input 
                    type="text" 
                    placeholder="ID Number" 
                    className="p-2 border border-gray-300 rounded-md"
                  />
                  <input 
                    type="date" 
                    className="p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Visit Information</label>
                <div className="grid grid-cols-2 gap-4">
                  <select className="p-2 border border-gray-300 rounded-md">
                    <option value="">-- Purpose of Visit --</option>
                    <option value="meeting">Meeting</option>
                    <option value="delivery">Delivery</option>
                    <option value="interview">Interview</option>
                    <option value="tour">Tour</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Host/Department" 
                    className="p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button className="px-4 py-2 border border-gray-300 rounded-md">
                  Cancel
                </button>
                <button className="px-4 py-2 bg-indigo-700 text-white rounded-md">
                  Screen Visitor
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Visitors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center p-3 border border-gray-200 rounded-md">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <Users className="h-4 w-4 text-indigo-700" />
                      </div>
                      <div>
                        <div className="font-medium">Ryan Scott</div>
                        <div className="text-xs text-gray-500">Meeting with HR • 10:15 AM</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Cleared</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuickScreenMode;