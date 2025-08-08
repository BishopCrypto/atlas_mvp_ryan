export interface Container {
  id: number;
  type: string;
  name: string;
  count: number;
  status: string;
  dueDate: string;
  flagged: number;
  department: string;
}

export const containers: Container[] = [
  // Sailings department - Disney cruise sailings
  { id: 1, type: 'sailing', name: 'Disney Magic - Eastern Caribbean', count: 2500, status: 'clear', dueDate: '14/3/2025 - 21/3/2025', flagged: 0, department: 'sailings' },
  { id: 2, type: 'sailing', name: 'Disney Wonder - Western Caribbean', count: 2400, status: 'clear', dueDate: '22/3/2025 - 29/3/2025', flagged: 0, department: 'sailings' },
  { id: 3, type: 'sailing', name: 'Disney Dream - Bahamas 4-Night', count: 4000, status: 'in-progress', dueDate: '04/4/2025 - 08/4/2025', flagged: 0, department: 'sailings' },
  { id: 4, type: 'sailing', name: 'Disney Fantasy - Western Caribbean', count: 4000, status: 'attention', dueDate: '18/4/2025 - 25/4/2025', flagged: 5, department: 'sailings' },
  { id: 5, type: 'sailing', name: 'Disney Wish - Bahamas 3-Night', count: 4000, status: 'clear', dueDate: '25/4/2025 - 28/4/2025', flagged: 0, department: 'sailings' },
  
  // Sailing Staff department - Disney cruise employees
  { id: 6, type: 'crew', name: 'Disney Magic - Bridge Officers', count: 45, status: 'clear', dueDate: 'Monthly (Next: 15/3/2025)', flagged: 0, department: 'sailingstaff' },
  { id: 7, type: 'crew', name: 'Disney Wonder - Food & Beverage', count: 320, status: 'attention', dueDate: 'Monthly (Next: 15/3/2025)', flagged: 8, department: 'sailingstaff' },
  { id: 8, type: 'crew', name: 'Disney Dream - Entertainment', count: 180, status: 'clear', dueDate: 'Monthly (Next: 15/3/2025)', flagged: 0, department: 'sailingstaff' },
  { id: 9, type: 'crew', name: 'Disney Fantasy - Guest Services', count: 250, status: 'in-progress', dueDate: 'Monthly (Next: 15/3/2025)', flagged: 0, department: 'sailingstaff' },
  { id: 10, type: 'crew', name: 'Disney Wish - Youth Activities', count: 95, status: 'clear', dueDate: 'Monthly (Next: 15/3/2025)', flagged: 0, department: 'sailingstaff' },
  
  // Vendors department - By ship vendors
  { id: 11, type: 'vendor', name: 'Disney Magic - Port Services', count: 85, status: 'clear', dueDate: 'Per Sailing (Next: 14/3/2025)', flagged: 0, department: 'vendors' },
  { id: 12, type: 'vendor', name: 'Disney Wonder - Excursion Providers', count: 120, status: 'attention', dueDate: 'Per Sailing (Next: 22/3/2025)', flagged: 3, department: 'vendors' },
  { id: 13, type: 'vendor', name: 'Disney Dream - Specialty Dining', count: 45, status: 'clear', dueDate: 'Monthly (Next: 01/4/2025)', flagged: 0, department: 'vendors' },
  { id: 14, type: 'vendor', name: 'Disney Fantasy - Merchandise', count: 75, status: 'in-progress', dueDate: 'Per Sailing (Next: 18/4/2025)', flagged: 0, department: 'vendors' },
  { id: 15, type: 'vendor', name: 'Disney Wish - Spa Services', count: 55, status: 'clear', dueDate: 'Monthly (Next: 25/4/2025)', flagged: 0, department: 'vendors' },
  
  // Front desk view - Guest services and VIP screening
  { id: 16, type: 'guest', name: 'VIP Guest Arrivals', count: 47, status: 'active', dueDate: 'Today (10/3/2025)', flagged: 0, department: 'frontdesk' },
  { id: 17, type: 'guest', name: 'Concierge Level Guests', count: 120, status: 'scheduled', dueDate: 'Tomorrow (11/3/2025)', flagged: 0, department: 'frontdesk' },
  { id: 18, type: 'guest', name: 'Disney Vacation Club Members', count: 85, status: 'scheduled', dueDate: 'This Week', flagged: 0, department: 'frontdesk' },
  { id: 19, type: 'visitor', name: 'Media & Press', count: 12, status: 'active', dueDate: 'Recurring', flagged: 0, department: 'frontdesk' },
];

export const getAvailableContainerTypes = (userRole: string): string[] => {
  switch(userRole) {
    case 'sailings':
      return ['sailing'];
    case 'sailingstaff':
      return ['crew'];
    case 'vendors':
      return ['vendor'];
    case 'frontdesk':
      return ['guest', 'visitor'];
    default:
      return ['sailing'];
  }
};

export const getFilteredContainers = (userRole: string, activeContainerType: string): Container[] => {
  const departmentContainers = containers.filter(container => container.department === userRole);
  
  if (activeContainerType === 'all') {
    return departmentContainers;
  } else {
    return departmentContainers.filter(container => container.type === activeContainerType);
  }
};

export const getTypeCount = (containers: Container[], type: string): number => {
  return containers.filter(c => c.type === type).length;
};