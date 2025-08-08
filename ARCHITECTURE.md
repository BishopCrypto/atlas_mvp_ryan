# Atlas Intelligence Architecture

## Data Structure

### Containers (Top Level)
- **Purpose**: Permission boundaries and organizational units
- **Examples**: "Disney Magic March 2025", "Port Operations Q1", "Corporate Events 2025"
- **Permissions**: Will eventually have role-based access controls
- **Restrictions**: None - can contain any type of lists

### Lists (Within Containers)
- **Purpose**: Actual screening/management lists
- **Types**: 
  - `sailing` - Passenger manifests, sailing schedules
  - `crew` - Crew assignments, staff groups  
  - `vendor` - Vendor access, contractor groups
  - `guest` - VIP guests, special accommodations
  - `visitor` - Media, press, temporary access
- **Restrictions**: Typed by content, multiple types allowed per container

## Current Implementation (INCORRECT)
```typescript
// What I built - treating lists as containers
Container {
  type: 'sailing' | 'crew' | 'vendor' // WRONG
  name: 'Disney Magic - Eastern Caribbean' // This is a list name
}
```

## Correct Implementation (TO BE BUILT)
```typescript
// Containers - permission boundaries
Container {
  id: number
  name: string // "Disney Magic March 2025"
  description?: string
  permissions: Permission[]
  lists: List[]
}

// Lists - actual screening data
List {
  id: number
  container_id: number
  type: 'sailing' | 'crew' | 'vendor' | 'guest' | 'visitor'
  name: string // "Passenger Manifest" or "Bridge Officers"
  count: number
  status: string
  dueDate: string
  flagged: number
}
```

## User Interface Flow
1. **Container Selection** (Top dropdown) - Choose permission boundary
2. **List View** (Left sidebar) - See all lists within selected container
3. **List Details** (Main area) - Manage specific list content
4. **Add Container** - Create new permission boundary (unrestricted)
5. **Add List** - Create new list within selected container (typed)

## Role Permissions (Future)
- Users will have access to specific containers based on their role
- Within containers, they may have different permissions on different list types
- E.g., "Front Desk" role might access "Guest Services Container" but only see guest/visitor lists