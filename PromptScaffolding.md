# Co.Property Operations Dashboard
## Prompt Scaffolding Document v2.0

---

## Document Information

| Field | Value |
|-------|-------|
| Project | Co.Property Operations Dashboard |
| Version | 2.0.0 |
| Last Updated | January 2026 |
| Status | Active |
| Authors | Development Team |

---

## 1. Project Setup and Configuration

### 1.1 Initialize Frontend Project

```bash
# Create Next.js project with Bun
bun create next-app co-property-dashboard --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd co-property-dashboard

# Install core dependencies
bun add @tanstack/react-query @tanstack/react-query-devtools
bun add zustand
bun add lucide-react
bun add clsx tailwind-merge class-variance-authority
bun add date-fns
bun add zod react-hook-form @hookform/resolvers
bun add sonner

# Install dev dependencies
bun add -d @types/node prettier prettier-plugin-tailwindcss
```

### 1.2 Initialize Workers Project

```bash
# Create Cloudflare Workers project
mkdir workers && cd workers

# Initialize with Wrangler
bunx wrangler init

# Install Hono for routing
bun add hono

# Configure wrangler.toml
cat > wrangler.toml << 'EOF'
name = "co-property-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "CACHE"
id = "your-cache-namespace-id"

[[kv_namespaces]]
binding = "TASKS"
id = "your-tasks-namespace-id"

[vars]
HOSPITABLE_BASE_URL = "https://public.api.hospitable.com/v2"
TURNO_BASE_URL = "https://api.turno.com/v1"
EOF
```

### 1.3 Project Structure

```
co-property-dashboard/
  src/
    app/
      (auth)/
        login/
          page.tsx
        layout.tsx
      (dashboard)/
        page.tsx
        properties/
          page.tsx
          [id]/
            page.tsx
        reservations/
          page.tsx
        cleaning/
          page.tsx
        tasks/
          page.tsx
        inventory/
          page.tsx
        settings/
          page.tsx
        layout.tsx
      api/
        health/
          route.ts
      layout.tsx
      globals.css
    components/
      ui/
        button.tsx
        card.tsx
        input.tsx
        select.tsx
        badge.tsx
        ...
      layout/
        sidebar.tsx
        header.tsx
        breadcrumbs.tsx
      dashboard/
        stats-grid.tsx
        sync-button.tsx
      properties/
        property-card.tsx
        property-table.tsx
      reservations/
        reservation-card.tsx
        reservation-table.tsx
      cleaning/
        kanban-board.tsx
        cleaning-card.tsx
      tasks/
        task-form.tsx
        task-table.tsx
      shared/
        loading.tsx
        error-boundary.tsx
    lib/
      api-client.ts        # Workers API client
      utils.ts
      constants.ts
      validations.ts
      data/
        properties.ts      # Property data fetching
        reservations.ts    # Reservation data fetching
        cleaning.ts        # Cleaning job data fetching
        tasks.ts           # Task data fetching
        dashboard.ts       # Dashboard stats aggregation
      actions/
        cleaning.ts        # Cleaning mutations
        tasks.ts           # Task mutations
    stores/
      ui-store.ts
      filter-store.ts
    types/
      index.ts
      database.ts          # Type definitions (shared with Workers)
    styles/
      theme.css
  workers/
    src/
      index.ts             # Main worker entry
      routes/
        properties.ts
        reservations.ts
        cleaning.ts
        tasks.ts
        dashboard.ts
      middleware/
        auth.ts
        cors.ts
      services/
        hospitable.ts      # Hospitable API client
        turno.ts           # Turno API client
      types.ts
    wrangler.toml
    package.json
  public/
    logo.svg
    favicon.ico
  .env
  tailwind.config.ts
  next.config.js
  tsconfig.json
```

---

## 2. Core API Client

### 2.1 Workers API Client

**Prompt:**

```
Create an API client for communicating with Cloudflare Workers backend.

Requirements:
- Typed wrapper around fetch API
- API key authentication via Bearer token
- Support for GET, POST, PATCH, DELETE methods
- Request/response typing with generics
- Error handling with custom ApiError class
- Base URL from environment variable

Implementation:
- getApiKey() retrieves from localStorage
- request<T>() generic method for all requests
- Handle 401 by redirecting to login
- Parse JSON responses

Methods:
- properties: { list(), get(id) }
- reservations: { list(), get(id), update(id, data) }
- cleaning: { list(), get(id), updateStatus(id, status) }
- tasks: { list(), create(data), get(id), update(id, data), delete(id) }
- dashboard: { getStats() }
```

### 2.2 Data Fetching Pattern

```typescript
// src/lib/data/properties.ts

import { apiClient } from '@/lib/api-client'
import type { Property } from '@/types'

export async function getProperties(): Promise<Property[]> {
  const response = await apiClient.properties.list()
  return response.data
}

export async function getProperty(id: string): Promise<Property | null> {
  try {
    const response = await apiClient.properties.get(id)
    return response.data
  } catch {
    return null
  }
}

export async function getPropertyCount(): Promise<number> {
  const response = await apiClient.properties.list()
  return response.data.length
}
```

---

## 3. Cloudflare Workers Backend

### 3.1 Main Worker Entry

```typescript
// workers/src/index.ts

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authMiddleware } from './middleware/auth'
import properties from './routes/properties'
import reservations from './routes/reservations'
import cleaning from './routes/cleaning'
import tasks from './routes/tasks'
import dashboard from './routes/dashboard'

type Bindings = {
  CACHE: KVNamespace
  TASKS: KVNamespace
  HOSPITABLE_API_TOKEN: string
  TURNO_API_KEY: string
  API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS
app.use('*', cors())

// Health check (no auth)
app.get('/api/health', (c) => c.json({ status: 'ok' }))

// Protected routes
app.use('/api/*', authMiddleware)
app.route('/api/properties', properties)
app.route('/api/reservations', reservations)
app.route('/api/cleaning', cleaning)
app.route('/api/tasks', tasks)
app.route('/api/dashboard', dashboard)

export default app
```

### 3.2 Auth Middleware

```typescript
// workers/src/middleware/auth.ts

import { MiddlewareHandler } from 'hono'

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  const apiKey = authHeader?.replace('Bearer ', '')
  
  if (!apiKey || apiKey !== c.env.API_KEY) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  await next()
}
```

### 3.3 Hospitable Service

```typescript
// workers/src/services/hospitable.ts

export class HospitableService {
  constructor(
    private token: string,
    private cache: KVNamespace,
    private baseUrl = 'https://public.api.hospitable.com/v2'
  ) {}

  private async fetch<T>(endpoint: string, ttl = 300): Promise<T> {
    const cacheKey = `hospitable:${endpoint}`
    
    // Check cache
    const cached = await this.cache.get(cacheKey, 'json')
    if (cached) return cached as T
    
    // Fetch from API
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${this.token}` }
    })
    
    if (!response.ok) throw new Error(`Hospitable API error: ${response.status}`)
    
    const data = await response.json() as T
    
    // Cache with TTL
    await this.cache.put(cacheKey, JSON.stringify(data), {
      expirationTtl: ttl
    })
    
    return data
  }

  async getProperties() {
    return this.fetch<{ data: Property[] }>('/properties')
  }

  async getReservations(params?: { from?: string; to?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString()
    return this.fetch<{ data: Reservation[] }>(`/reservations?${query}`, 120)
  }
}
```

---

## 4. Frontend Component Prompts

### 4.1 Dashboard Stats Grid

**Prompt:**

```
Create a StatsGrid component for the dashboard overview page.

Requirements:
- Grid layout: 1 col mobile, 2 cols tablet, 4 cols desktop
- Each card shows a key metric with icon

Cards to display:
1. Active Reservations - Calendar icon
2. Pending Cleaning - Sparkles icon  
3. Task Issues - AlertCircle icon
4. Total Properties - Home icon

Props:
- stats: DashboardStats (from api-client response)

Styling:
- Card: bg-card border rounded-lg p-6
- hover:shadow-md transition-shadow
- Icon container: w-12 h-12 rounded-full flex items-center justify-center
- Value: text-3xl font-bold mt-4
- Label: text-sm text-muted-foreground mt-1
```

### 4.2 Cleaning Kanban Board

**Prompt:**

```
Create a Kanban board for cleaning job management.

Columns:
- Pending (yellow)
- In Progress (blue)
- Completed (green)
- Verified (purple)

Features:
- Drag and drop between columns
- Job card shows: property name, scheduled time, cleaner name
- Status badge
- Quick actions: View details, Mark complete

Update cleaning status via:
- apiClient.cleaning.updateStatus(jobId, newStatus)

Use optimistic updates with React Query mutation.
```

---

## 5. Environment Configuration

### 5.1 Frontend (.env)

```bash
# Workers API
NEXT_PUBLIC_WORKERS_URL=http://localhost:8787
```

### 5.2 Workers (wrangler.toml secrets)

```bash
# Set secrets via CLI (not in repo)
wrangler secret put HOSPITABLE_API_TOKEN
wrangler secret put TURNO_API_KEY
wrangler secret put API_KEY
```

---

## 6. Development Workflow

### 6.1 Local Development

```bash
# Terminal 1: Run Workers locally
cd workers
wrangler dev

# Terminal 2: Run Next.js frontend
bun run dev
```

### 6.2 Deployment

```bash
# Deploy Workers
cd workers
wrangler deploy

# Deploy Frontend (auto via Vercel)
git push origin main
```

---

## 7. Type Definitions

### 7.1 Shared Types

```typescript
// src/types/index.ts

export interface Property {
  id: string
  hospitable_id: string
  name: string
  internal_code: string
  address: string
  bedrooms: number
  bathrooms: number
  max_guests: number
  status: 'active' | 'inactive'
}

export interface Reservation {
  id: string
  property_id: string
  hospitable_id: string
  confirmation_code: string
  platform: string
  check_in_date: string
  check_out_date: string
  guest_name: string
  guest_email: string
  guest_phone: string
  guest_count: number
  total_price: number
  status: string
}

export interface CleaningJob {
  id: string
  turno_id: string
  property_id: string
  reservation_id: string
  scheduled_date: string
  scheduled_time: string
  cleaner_name: string
  cleaner_phone: string
  status: 'pending' | 'in_progress' | 'completed' | 'verified'
}

export interface Task {
  id: string
  property_id?: string
  title: string
  description?: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed'
  assigned_to?: string
  due_date?: string
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  activeReservations: number
  pendingCleaning: number
  taskIssues: number
  totalProperties: number
}
```

---

## Migration from v1.0 (Supabase)

### Removed Dependencies
- `@supabase/supabase-js`
- `@supabase/ssr`

### Added Dependencies
- `hono` (in workers project)

### Key Changes
1. Replace `createClient()` calls with `apiClient` methods
2. Remove all Supabase query builders
3. Replace auth middleware with API key validation
4. Data now lives in Hospitable/Turno, not local database
