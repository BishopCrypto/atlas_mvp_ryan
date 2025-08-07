import React, { useState } from 'react';
import { Ship, Users, Briefcase, Clock, AlertTriangle, CheckCircle, ExternalLink, ChevronDown, Search, Filter, Calendar, Settings, Home, Book, UserCheck, Building, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const AtlasGlobalInsightsDashboard = () => {
  // State for different user roles/views
  const [userRole, setUserRole] = useState('security'); // 'security', 'frontdesk', 'education'
  const [activeContainerType, setActiveContainerType] = useState('all');
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [quickScreenMode, setQuickScreenMode] = useState(false);
  
  // Mock data for different container types
  const containers = [
    // Security department view - Cruise industry
    { id: 1, type: 'sailing', name: 'Sailing One', count: 250, status: 'clear', dueDate: '14/3/2025 - 21/3/2025', flagged: 0, department: 'security' },
    { id: 2, type: 'sailing', name: 'Sailing Two', count: 250, status: 'clear', dueDate: '22/3/2025 - 29/3/2025', flagged: 0, department: 'security' },
    { id: 3, type: 'sailing', name: 'Sailing Three', count: 250, status: 'in-progress', dueDate: '04/4/2025 - 11/4/2025', flagged: 0, department: 'security' },
    { id: 4, type: 'sailing', name: 'Sailing Four', count: 250, status: 'attention', dueDate: '18/4/2025 - 25/4/2025', flagged: 2, department: 'security' },
    { id: 5, type: 'employee', name: 'Bridge Crew', count: 45, status: 'clear', dueDate: 'Monthly (Next: 15/3/2025)', flagged: 0, department: 'security' },
    { id: 6, type: 'employee', name: 'Restaurant Staff', count: 120, status: 'attention', dueDate: 'Monthly (Next: 15/3/2025)', flagged: 3, department: 'security' },
    { id: 7, type: 'employee', name: 'Engineering', count: 80, status: 'clear', dueDate: 'Monthly (Next: 15/3/2025)', flagged: 0, department: 'security' },
    { id: 8, type: 'contractor', name: 'Port Services', count: 35, status: 'clear', dueDate: 'Quarterly (Next: 01/4/2025)', flagged: 0, department: 'security' },
    { id: 9, type: 'contractor', name: 'Entertainment', count: 28, status: 'attention', dueDate: 'Per Event (Next: 14/3/2025)', flagged: 1, department: 'security' },
    
    // Front desk view - Visitor screening
    { id: 10, type: 'visitor', name: 'Today\'s Visitors', count: 47, status: 'active', dueDate: 'Today (10/3/2025)', flagged: 0, department: 'frontdesk' },
    { id: 11, type: 'visitor', name: 'Tomorrow\'s Appointments', count: 32, status: 'scheduled', dueDate: 'Tomorrow (11/3/2025)', flagged: 0, department: 'frontdesk' },
    { id: 12, type: 'visitor', name: 'VIP Guests', count: 5, status: 'scheduled', dueDate: 'This Week', flagged: 0, department: 'frontdesk' },
    { id: 13, type: 'visitor', name: 'Vendor Representatives', count: 12, status: 'active', dueDate: 'Recurring', flagged: 0, department: 'frontdesk' },
    
    // Education screening
    { id: 14, type: 'student', name: 'Spring 2025 Admissions', count: 1250, status: 'in-progress', dueDate: 'Before 01/4/2025', flagged: 15, department: 'education' },
    { id: 15, type: 'student', name: 'Transfer Students', count: 320, status: 'attention', dueDate: 'Before 15/3/2025', flagged: 8, department: 'education' },
    { id: 16, type: 'parent', name: 'Family Background Checks', count: 1780, status: 'in-progress', dueDate: 'Before 01/4/2025', flagged: 27, department: 'education' },
    { id: 17, type: 'faculty', name: 'Faculty Review', count: 120, status: 'clear', dueDate: 'Annual (Next: 01/6/2025)', flagged: 0, department: 'education' },
    { id: 18, type: 'visitor', name: 'Campus Visitors', count: 75, status: 'active', dueDate: 'Daily', flagged: 2, department: 'education' },
  ];
  
  // Available container types based on user role
  const getAvailableContainerTypes = () => {
    switch(userRole) {
      case 'security':
        return ['sailing', 'employee', 'contractor'];
      case 'frontdesk':
        return ['visitor'];
      case 'education':
        return ['student', 'parent', 'faculty', 'visitor'];
      default:
        return ['sailing', 'employee', 'contractor'];
    }
  };
  
  // Filter containers based on department and active type
  const getFilteredContainers = () => {
    const departmentContainers = containers.filter(container => container.department === userRole);
    
    if (activeContainerType === 'all') {
      return departmentContainers;
    } else {
      return departmentContainers.filter(container => container.type === activeContainerType);
    }
  };
  
  const filteredContainers = getFilteredContainers();
  
  // Count containers needing attention
  const attentionCount = filteredContainers.filter(c => c.status === 'attention').length;
  
  // Calculate container type counts
  const getTypeCount = (type) => {
    return filteredContainers.filter(c => c.type === type).length;
  };
  
  // Container type icon mapping
  const containerIcons = {
    'sailing': <Ship className="h-5 w-5 mr-2" />,
    'employee': <Users className="h-5 w-5 mr-2" />,
    'contractor': <Briefcase className="h-5 w-5 mr-2" />,
    'visitor': <UserCheck className="h-5 w-5 mr-2" />,
    'student': <Book className="h-5 w-5 mr-2" />,
    'parent': <Home className="h-5 w-5 mr-2" />,
    'faculty': <Building className="h-5 w-5 mr-2" />
  };
  
  // Container status icon mapping
  const statusIcons = {
    'clear': <CheckCircle className="h-5 w-5 text-green-500" />,
    'attention': <AlertTriangle className="h-5 w-5 text-amber-500" />,
    'in-progress': <Clock className="h-5 w-5 text-blue-500" />,
    'active': <CheckCircle className="h-5 w-5 text-green-500" />,
    'scheduled': <Calendar className="h-5 w-5 text-blue-500" />
  };
  
  // Type labels mapping
  const typeLabels = {
    'sailing': 'Sailing',
    'employee': 'Employee Group',
    'contractor': 'Contractor Group',
    'visitor': 'Visitor Group',
    'student': 'Student Group',
    'parent': 'Parent Group',
    'faculty': 'Faculty Group'
  };
  
  // Handle container selection
  const handleContainerClick = (container) => {
    setSelectedContainer(container);
    setQuickScreenMode(false);
  };
  
  // Role-specific titles
  const getRoleTitle = () => {
    switch(userRole) {
      case 'security': return 'Security Screening Dashboard';
      case 'frontdesk': return 'Visitor Management';
      case 'education': return 'Educational Institution Screening';
      default: return 'Atlas Global Insights';
    }
  };
  
  // Toggle quick screen mode
  const toggleQuickScreen = () => {
    setSelectedContainer(null);
    setQuickScreenMode(!quickScreenMode);
  };

  // Role switcher - For demo purposes
  const handleRoleChange = (e) => {
    setUserRole(e.target.value);
    setSelectedContainer(null);
    setActiveContainerType('all');
    setQuickScreenMode(false);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Atlas Global Insights</h1>
            <span className="mx-3 text-gray-400">|</span>
            <h2 className="text-lg">{getRoleTitle()}</h2>
            
            {/* Demo role switcher - would be removed in production */}
            <select 
              value={userRole} 
              onChange={handleRoleChange}
              className="ml-6 border border-gray-300 rounded-md px-2 py-1 text-sm bg-gray-50"
            >
              <option value="security">Security Department</option>
              <option value="frontdesk">Front Desk</option>
              <option value="education">Educational Institution</option>
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
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {!quickScreenMode ? (
          <>
            {/* Left sidebar - container list */}
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
                            container.type === 'employee' ? 'employees' : 
                            container.type === 'contractor' ? 'contractors' :
                            container.type === 'visitor' ? 'visitors' :
                            container.type === 'student' ? 'students' :
                            container.type === 'parent' ? 'parents' : 'faculty'
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
            
            {/* Main content area */}
            <div className="flex-1 overflow-y-auto p-6">
              {!selectedContainer ? (
                <div className="text-center text-gray-500 mt-20">
                  {userRole === 'security' ? (
                    <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  ) : userRole === 'frontdesk' ? (
                    <UserCheck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  ) : (
                    <Book className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  )}
                  <p>Select a container to view details</p>
                </div>
              ) : (
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
                           selectedContainer.type === 'employee' ? 'Employees' : 
                           selectedContainer.type === 'contractor' ? 'Contractors' :
                           selectedContainer.type === 'visitor' ? 'Visitors' :
                           selectedContainer.type === 'student' ? 'Students' :
                           selectedContainer.type === 'parent' ? 'Parents' : 'Faculty'}
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
                         selectedContainer.type === 'employee' ? 'Employee List' : 
                         selectedContainer.type === 'contractor' ? 'Contractor List' :
                         selectedContainer.type === 'visitor' ? 'Visitor List' :
                         selectedContainer.type === 'student' ? 'Student List' :
                         selectedContainer.type === 'parent' ? 'Parent List' : 'Faculty List'}
                         ({selectedContainer.count})
                      </CardTitle>
                      <button className="text-sm text-indigo-600 flex items-center">
                        View All <ExternalLink className="h-4 w-4 ml-1" />
                      </button>
                    </CardHeader>
                    <CardContent>
                      {/* This would be a paginated table in a real implementation */}
                      <div className="text-sm text-gray-500">
                        Showing 10 of {selectedContainer.count} records
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </>
        ) : (
          // Quick Screen mode for front desk
          <div className="flex-1 p-8 bg-gray-50">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <UserCheck className="h-5 w-5 mr-2 text-indigo-500" />
                    Quick Visitor Screening
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
                              <div className="font-medium">John Doe</div>
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
        )}
      </div>
    </div>
  );
};

export default AtlasGlobalInsightsDashboard;