# Client Scoping Implementation Guide

## Overview
This guide explains how to implement client-scoped data filtering throughout the Safety Intelligence Engine to prepare for multi-tenant SaaS deployment.

## What's Already Implemented

### 1. Client Context Provider
- **Location**: `src/context/ClientContext.tsx`
- **Purpose**: Manages active client selection across the app
- **Features**:
  - Stores active client in React Context
  - Persists selection to localStorage
  - Provides `useClient()` hook for components

### 2. Client Selector Component
- **Location**: `src/components/layout/ClientSelector.tsx`
- **Purpose**: Dropdown in header to select active client
- **Features**:
  - Shows all available clients
  - Allows "All Clients" view (no filter)
  - Visual indicator of active selection
  - Clear selection button

### 3. Header Integration
- **Location**: `src/components/layout/Header.jsx`
- **Features**:
  - Shows Client Selector dropdown
  - Displays active client name below page title
  - Updates across all views

---

## How to Use Client Filtering

### In React Components

```typescript
import { useClient } from '@/context/ClientContext';

function MyComponent() {
  const { activeClient } = useClient();

  useEffect(() => {
    loadData();
  }, [activeClient]); // Reload when client changes

  const loadData = async () => {
    // activeClient will be null if "All Clients" is selected
    const data = await window.api.getFilteredData(activeClient?.id);
  };
}
```

### In IPC Handlers (Backend)

Add an optional `clientId` parameter to your handlers:

```typescript
ipc.handle('db:listWorkers', async (_e, clientId?: string) => {
  const where: any = { status: { not: 'inactive' } };

  // Filter by client if provided
  if (clientId) {
    where.roles = {
      some: {
        clientId: clientId,
        // Only active assignments
        OR: [
          { endAt: null },
          { endAt: { gt: new Date() } }
        ]
      }
    };
  }

  return await prisma.worker.findMany({
    where,
    include: { roles: { include: { role: true } } }
  });
});
```

---

## Components That Need Client Filtering

### Priority 1: Core Data Views
- [x] **Header** - Shows active client (DONE)
- [x] **Dashboard** - Filter KPIs and stats by client (DONE)
- [x] **WorkerList** - Filter workers by client assignments (DONE)
- [ ] **WorkerPassport** - Show only client-relevant controls

### Priority 2: Management Views
- [ ] **HazardLibrary** - Optionally filter client-specific hazards
- [ ] **ControlLibrary** - Optionally filter client-specific controls
- [ ] **Reports** - Filter report data by client

### Priority 3: Reference Data
- [x] **ClientList** - No filtering needed (shows all)
- [x] **RoleLibrary** - No filtering needed (global reference)

---

## Implementation Checklist

### Phase 1: Update IPC Handlers (Backend)

#### Workers
```typescript
// electron/ipc.ts
ipc.handle('db:listWorkers', async (_e, clientId?: string) => {
  const where: any = {};

  if (clientId) {
    where.roles = {
      some: {
        clientId,
        OR: [{ endAt: null }, { endAt: { gt: new Date() } }]
      }
    };
  }

  return await prisma.worker.findMany({ where, include: { roles: true } });
});
```

#### Dashboard
```typescript
ipc.handle('db:dashboardSummary', async (_e, clientId?: string) => {
  // Build WHERE clause based on clientId
  const workerFilter = clientId ? {
    roles: { some: { clientId, OR: [{ endAt: null }, { endAt: { gt: new Date() } }] } }
  } : {};

  const workers = await prisma.worker.findMany({ where: workerFilter });

  // Calculate stats only for filtered workers
  // ...
});
```

### Phase 2: Update React Components

#### WorkerList
```typescript
// src/components/workers/WorkerList.tsx
import { useClient } from '@/context/ClientContext';

export function WorkerList() {
  const { activeClient } = useClient();

  const loadWorkers = useCallback(async () => {
    setLoading(true);
    try {
      // Pass activeClient.id to filter by client
      const data = await window.api.listWorkers(activeClient?.id);
      setWorkers(data || []);
    } catch (error) {
      console.error('Failed to load workers:', error);
    } finally {
      setLoading(false);
    }
  }, [activeClient]);

  // Reload when active client changes
  useEffect(() => {
    loadWorkers();
  }, [loadWorkers, activeClient]);
}
```

#### Dashboard
```typescript
// src/components/dashboard/Dashboard.tsx
import { useClient } from '@/context/ClientContext';

export default function Dashboard() {
  const { activeClient } = useClient();

  const loadSummary = async () => {
    const data = await window.api.dashboardSummary(activeClient?.id);
    setSummary(data);
  };

  useEffect(() => {
    loadSummary();
  }, [activeClient]); // Reload when client changes
}
```

### Phase 3: Update Window Types

```typescript
// src/types/window.d.ts
interface Window {
  api: {
    // Add optional clientId parameter
    listWorkers: (clientId?: string) => Promise<Worker[]>;
    dashboardSummary: (clientId?: string) => Promise<DashboardSummary>;
    // ... etc
  }
}
```

### Phase 4: Update Preload

```typescript
// electron/preload.cjs
listWorkers: (clientId) => ipcRenderer.invoke('db:listWorkers', clientId),
dashboardSummary: (clientId) => ipcRenderer.invoke('db:dashboardSummary', clientId),
```

---

## Data Model Considerations

### Current State
- `Worker.companyId` exists but is currently set to 'default'
- `WorkerRole.clientId` exists and links workers to clients
- `Site.clientId` links sites to clients

### Recommended Changes

#### 1. Use WorkerRole for Client Association (Recommended)
**Pro**: Already implemented, supports multiple client assignments
**Con**: Slightly more complex queries

```typescript
// Worker belongs to client via WorkerRole
const clientWorkers = await prisma.worker.findMany({
  where: {
    roles: {
      some: {
        clientId: 'client-123',
        OR: [{ endAt: null }, { endAt: { gt: new Date() } }]
      }
    }
  }
});
```

#### 2. Use Worker.companyId for Primary Client (Alternative)
**Pro**: Simple direct relationship
**Con**: Limits workers to one client (not flexible for contractors)

```typescript
// Worker belongs to one company/client
const clientWorkers = await prisma.worker.findMany({
  where: { companyId: 'client-123' }
});
```

**Recommended**: Keep both!
- Use `Worker.companyId` for the worker's "home" company (employer)
- Use `WorkerRole.clientId` for client assignments (projects/sites)
- This supports contractors working for multiple clients

---

## Client-Specific vs Global Data

### Global (Shared Across All Clients)
- **Roles**: Standard industry roles
- **Hazards**: Base hazard library
- **Controls**: Base control library

### Client-Specific
- **Workers**: Belong to specific clients
- **Sites**: Belong to specific clients
- **WorkerRoles**: Assignments of workers to clients
- **Evidence**: Belongs to worker (scoped by worker's client)

### Client-Customizable (Future)
- **Custom Hazards**: Client adds industry-specific hazards
- **Custom Controls**: Client adds proprietary controls
- **Role Overrides**: Client customizes role → hazard mappings

To implement customization:
```sql
-- Add optional clientId to allow client-specific copies
ALTER TABLE Hazard ADD COLUMN clientId TEXT;
ALTER TABLE Control ADD COLUMN clientId TEXT;

-- Query pattern: show global + client-specific
SELECT * FROM Hazard
WHERE clientId IS NULL OR clientId = 'client-123';
```

---

## Testing Client Filtering

### Test Scenarios
1. **No Client Selected** ("All Clients")
   - Dashboard shows aggregated stats
   - Worker list shows all workers
   - No filters applied

2. **Client A Selected**
   - Dashboard shows only Client A stats
   - Worker list shows only Client A workers
   - Reports filter to Client A data

3. **Switch from Client A to Client B**
   - All views reload automatically
   - Data switches to Client B
   - No stale Client A data visible

4. **Switch from Client A to "All Clients"**
   - Views reload with no filters
   - Shows aggregated data again

---

## Future: Cloud Multi-Tenancy

When moving to cloud SaaS:

### 1. Add Authentication
```typescript
// User → Company mapping
model User {
  id        String @id
  email     String @unique
  companyId String
  company   Client @relation(fields: [companyId], references: [id])
}
```

### 2. Middleware for RLS
```typescript
// Automatically inject clientId from authenticated user
app.use((req, res, next) => {
  req.clientId = req.user.companyId;
  next();
});
```

### 3. Database-Level Security
```sql
-- PostgreSQL Row-Level Security
ALTER TABLE Worker ENABLE ROW LEVEL SECURITY;

CREATE POLICY worker_isolation ON Worker
  USING (companyId = current_setting('app.current_client')::text);
```

---

## Quick Start: Add Filtering to a Component

1. **Import the hook**:
   ```typescript
   import { useClient } from '@/context/ClientContext';
   ```

2. **Get active client**:
   ```typescript
   const { activeClient } = useClient();
   ```

3. **Pass to API call**:
   ```typescript
   const data = await window.api.myMethod(activeClient?.id);
   ```

4. **Reload on client change**:
   ```typescript
   useEffect(() => {
     loadData();
   }, [activeClient]);
   ```

That's it! The component now respects client filtering.

---

## Questions & Considerations

### Should reference data (Hazards/Controls) be client-specific?
- **Option A**: Keep global, all clients share same library
- **Option B**: Allow clients to customize (add `clientId` column)
- **Recommendation**: Start with Option A, add B later if needed

### Should we enforce client filtering at the database level?
- **Now**: Application-level (component queries filter by client)
- **Later**: Database-level RLS when moving to PostgreSQL
- **Benefit**: Impossible to accidentally leak data between clients

### How to handle contractors working for multiple clients?
- **Solution**: Use `WorkerRole.clientId` for assignments
- Worker can have multiple WorkerRole records with different clientIds
- When filtering by client, show worker if they have ANY active role for that client
