# Co.Property System Integration Guide

Complete system documentation with detailed flowcharts showing frontend-backend integration patterns.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Request Lifecycle](#request-lifecycle)
3. [Data Flow Patterns](#data-flow-patterns)
4. [Component Integration](#component-integration)
5. [Error Handling Flows](#error-handling-flows)
6. [Authentication Flow](#authentication-flow)

---

## System Overview

### Full System Architecture

```mermaid
flowchart TB
    subgraph Browser["🌐 Browser"]
        React[React Components]
        Query[React Query]
        Zustand[Zustand Store]
    end

    subgraph NextApp["⚛️ Next.js App"]
        Router[App Router]
        
        subgraph Server["Server Components"]
            SProps[fetchProperties]
            SRes[fetchReservations]
            SDash[fetchDashboardStats]
        end
        
        subgraph Client["Client Components"]
            CProps[useProperties]
            CRes[useReservations]
            CClean[useCleaningJobs]
        end
        
        APIClient[API Client]
    end

    subgraph Edge["☁️ Cloudflare Edge"]
        Worker[Worker]
        
        subgraph WorkerRoutes["Routes"]
            RProps[/api/properties]
            RRes[/api/reservations]
            RClean[/api/cleaning]
            RDash[/api/dashboard/*]
        end
        
        Auth[Auth Middleware]
        Cache[Cache Layer]
    end

    subgraph Storage["💾 Storage"]
        KV[(Workers KV)]
        R2[(R2 Photos)]
    end

    subgraph External["🔗 External APIs"]
        Hospitable[Hospitable API]
        Turno[Turno API]
    end

    React --> Query
    Query --> Zustand
    
    Router --> Server
    Router --> Client
    
    Server --> APIClient
    Client --> APIClient
    
    APIClient -->|HTTPS + Auth| Worker
    Worker --> Auth
    Auth --> WorkerRoutes
    
    RProps --> Cache
    RRes --> Cache
    RClean --> Cache
    RDash --> Cache
    
    Cache --> KV
    
    RProps -->|Cache Miss| Hospitable
    RRes -->|Cache Miss| Hospitable
    RClean -->|Cache Miss| Turno
    
    RClean --> R2
```

---

## Request Lifecycle

### 1. Dashboard Page Load

```mermaid
sequenceDiagram
    autonumber
    participant Browser
    participant Next as Next.js Server
    participant Worker as Cloudflare Worker
    participant KV as Workers KV
    participant Hospitable as Hospitable API

    Note over Browser: User navigates to /
    
    Browser->>Next: Request page
    activate Next
    
    par Parallel Data Fetching
        Next->>Worker: GET /api/dashboard/stats
        Worker->>Worker: Check Auth
        Worker->>KV: GET cache:dashboard:stats
        
        alt Cache Miss
            KV-->>Worker: null
            Worker->>Hospitable: Fetch properties
            Worker->>Hospitable: Fetch reservations
            Worker->>Worker: Aggregate stats
            Worker->>KV: SET cache:dashboard:stats
        else Cache Hit
            KV-->>Worker: Cached stats
        end
        
        Worker-->>Next: { stats }
        
        Next->>Worker: GET /api/dashboard/upcoming
        Worker->>KV: Check cache
        Worker-->>Next: { checkIns }
        
        Next->>Worker: GET /api/dashboard/today-cleaning
        Worker->>KV: Check cache
        Worker-->>Next: { cleaningJobs }
    end
    
    Next->>Next: Render Server Components
    Next-->>Browser: HTML + Initial Data
    deactivate Next
    
    Note over Browser: Hydration Complete
    
    Browser->>Browser: React Query Hydrates
    Browser->>Browser: Interactive Dashboard
```

### 2. User Interaction Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as React Component
    participant Hook as Custom Hook
    participant Query as React Query
    participant Client as API Client
    participant Worker as Worker
    participant Turno as Turno API
    participant KV as Workers KV

    Note over User: User updates cleaning status
    
    User->>UI: Click "Mark Complete"
    UI->>Hook: updateCleaningStatus(id, status)
    Hook->>Query: mutation.mutate()
    Query->>Client: PATCH /api/cleaning/:id
    
    Client->>Client: Add Auth header
    Client->>Worker: PATCH /api/cleaning/:id
    
    Worker->>Worker: Validate API Key
    Worker->>Turno: PATCH /cleaning-jobs/:id
    Turno-->>Worker: Updated job
    
    Worker->>KV: DELETE cache:cleaning:*
    Worker-->>Client: Success response
    
    Client-->>Query: Success
    Query->>Query: Invalidate related queries
    Query->>Query: Refetch cleaning jobs
    Query-->>Hook: onSuccess callback
    Hook-->>UI: Update UI state
    UI-->>User: Show success toast
```

---

## Data Flow Patterns

### Pattern 1: Server-Side Fetching (Properties Page)

```mermaid
flowchart LR
    subgraph Page["Properties Page"]
        ServerComp[Server Component
        async function]
        
        ServerComp -->|await| Fetch[fetchProperties]
    end

    subgraph ClientLib["Client Library"]
        Fetch -->|calls| APIClient[apiClient]
        APIClient -->|server-side| Auth[Add API Key]
    end

    subgraph Worker["Cloudflare Worker"]
        Auth -->|request| Hono[Hono Router]
        Hono --> Middleware[Auth Middleware]
        Middleware --> Route[GET /api/properties]
        Route --> Cache{Cache Check}
        Cache -->|miss| Hospitable[Hospitable API]
        Cache -->|hit| Response[Return Data]
        Hospitable --> Store[Store in KV]
        Store --> Response
    end

    Response -->|JSON| ServerComp
    ServerComp --> Render[Render HTML]
    Render --> Hydrate[Hydrate Page]
```

**Code Example:**
```typescript
// Server Component (app/properties/page.tsx)
async function PropertiesPage() {
  // This runs on the server during SSR
  const properties = await fetchProperties()
  
  return (
    <div>
      <PropertyTable data={properties} />
    </div>
  )
}

// Data function (lib/data/properties.ts)
export async function fetchProperties() {
  // Server-side API call with API key from env
  return apiClient('/api/properties')
}

// API Client (lib/api-client.ts)
async function apiClient(endpoint: string) {
  const headers: HeadersInit = {}
  
  // Server-side: use env var
  if (typeof window === 'undefined') {
    headers['Authorization'] = `Bearer ${process.env.API_KEY}`
  }
  
  const response = await fetch(`${WORKERS_URL}${endpoint}`, {
    headers,
    cache: 'no-store'
  })
  
  return response.json()
}
```

### Pattern 2: Client-Side Fetching (Real-time Updates)

```mermaid
flowchart LR
    subgraph Component["Cleaning Dashboard"]
        UseHook[useCleaningJobs]
        UI[CleaningJobList]
    end

    subgraph TanStack["TanStack Query"]
        UseHook --> Query[useQuery]
        Query --> Cache[Query Cache]
        Query --> Fetch[fetchFn]
    end

    subgraph Client["Client-Side"]
        Fetch --> ClientAPI[apiClient]
        ClientAPI --> LocalStorage[Get API Key
        from localStorage]
    end

    subgraph Worker["Cloudflare Worker"]
        LocalStorage --> Request[GET /api/cleaning]
        Request --> Auth[Auth Middleware]
        Auth --> Route[Route Handler]
        Route --> KV[KV Cache]
        Route --> Turno[Turno API
        if needed]
    end

    KV --> Response[JSON Response]
    Turno --> Response
    Response --> Query
    Query --> UI
```

**Code Example:**
```typescript
// Hook (lib/hooks/use-cleaning-query.ts)
export function useCleaningJobs(filters?: CleaningFilters) {
  return useQuery({
    queryKey: ['cleaning', filters],
    queryFn: () => fetchCleaningJobs(filters),
    staleTime: 60000, // 1 minute
  })
}

// Component (components/cleaning/cleaning-dashboard.tsx)
function CleaningDashboard() {
  const { data: jobs, isLoading } = useCleaningJobs({ date: 'today' })
  
  if (isLoading) return <Skeleton />
  
  return <CleaningJobList jobs={jobs} />
}

// Client-side API call
async function fetchCleaningJobs(filters) {
  // Client-side: get key from localStorage
  const apiKey = localStorage.getItem('api_key')
  
  return apiClient('/api/cleaning?' + new URLSearchParams(filters), {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  })
}
```

### Pattern 3: Mutation with Optimistic Updates

```mermaid
flowchart TD
    subgraph UI["Task Component"]
        Action[User Action]
        Optimistic[Optimistic Update]
        Success[Success State]
        Error[Error State]
    end

    subgraph Mutation["TanStack Mutation"]
        Mutate[mutate]
        onMutate[onMutate
        Update cache]
        onSuccess[onSuccess
        Invalidate queries]
        onError[onError
        Rollback]
    end

    subgraph API["API Layer"]
        Post[POST /api/tasks]
        Worker[Worker Handler]
        KV[Store in KV]
    end

    Action --> Mutate
    Mutate --> onMutate
    onMutate --> Optimistic
    Mutate --> Post
    Post --> Worker
    Worker --> KV
    KV --> Success
    
    Post -.->|Error| onError
    onError --> Error
    Success --> onSuccess
```

**Code Example:**
```typescript
// Mutation hook
export function useCreateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (task: CreateTaskInput) => 
      apiClient('/api/tasks', { method: 'POST', body: task }),
    
    onMutate: async (newTask) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      
      // Snapshot previous value
      const previousTasks = queryClient.getQueryData(['tasks'])
      
      // Optimistically update
      queryClient.setQueryData(['tasks'], (old) => [...old, newTask])
      
      return { previousTasks }
    },
    
    onError: (err, newTask, context) => {
      // Rollback on error
      queryClient.setQueryData(['tasks'], context?.previousTasks)
    },
    
    onSettled: () => {
      // Refetch to ensure sync
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}
```

---

## Component Integration

### Property Detail Page Flow

```mermaid
flowchart TB
    subgraph Page["Property Detail Page
    /properties/:id"]
        Server[Server Component]
        Tabs[PropertyDetailTabs
    Client Component]
        Gallery[ImageGallery]
        Info[PropertyInfo]
        Calendar[ReservationCalendar]
    end

    subgraph Data["Data Layer"]
        Server -->|fetch| GetProperty[getProperty id]
        Server -->|fetch| GetReservations[getReservations
    propertyId]
        Tabs -->|client| UseProperty[useProperty]
        Calendar -->|client| UseReservations[useReservations]
    end

    subgraph Worker["Cloudflare Worker"]
        GetProperty -->|GET| API1[/api/properties/:id]
        GetReservations -->|GET| API2[/api/reservations?property_id=]
        UseProperty -->|GET| API1
        UseReservations -->|GET| API2
    end

    subgraph Cache["Caching"]
        API1 --> KV1[(KV: Property)]
        API2 --> KV2[(KV: Reservations)]
    end

    subgraph External["External"]
        API1 -->|miss| Hospitable[Hospitable API]
        API2 -->|miss| Hospitable
    end

    Server --> Tabs
    Tabs --> Gallery
    Tabs --> Info
    Tabs --> Calendar
```

### Dashboard Widget Integration

```mermaid
flowchart LR
    subgraph Dashboard["Dashboard Page"]
        Stats[StatsCards
    Server Component]
        Charts[ChartsSection
    Client Component]
        Activity[RecentActivity
    Server Component]
        Cleaning[CleaningWidget
    Client Component]
    end

    subgraph Parallel["Parallel Fetching"]
        Stats -->|await| StatsAPI[/api/dashboard/stats]
        Activity -->|await| ActivityAPI[/api/dashboard/recent-activity]
        Charts -->|useQuery| RevenueAPI[/api/dashboard/revenue-trends]
        Charts -->|useQuery| OccupancyAPI[/api/dashboard/occupancy-trends]
        Cleaning -->|useQuery| CleaningAPI[/api/dashboard/today-cleaning]
    end

    subgraph Worker["Worker Aggregation"]
        StatsAPI -->|parallel| Multi1[Hospitable + Turno]
        ActivityAPI -->|parallel| Multi2[Hospitable + KV]
        RevenueAPI --> Hospitable1[Hospitable]
        OccupancyAPI --> Hospitable2[Hospitable]
        CleaningAPI --> Turno[Turno API]
    end

    subgraph Response["Response"]
        Multi1 --> StatsData[Stats Data]
        Multi2 --> ActivityData[Activity Data]
        Hospitable1 --> ChartData1[Chart Data]
        Hospitable2 --> ChartData2[Chart Data]
        Turno --> CleaningData[Cleaning Data]
    end
```

---

## Error Handling Flows

### API Error Handling

```mermaid
flowchart TD
    Request[API Request] --> Network{Network Error?}
    
    Network -->|Yes| Retry{Retry?}
    Retry -->|Yes| Request
    Retry -->|No| NetworkError[Show Network Error]
    
    Network -->|No| HTTP{HTTP Status}
    
    HTTP -->|401| AuthError[Authentication Error]
    AuthError --> Login[Redirect to Login]
    
    HTTP -->|404| NotFound[Not Found Error]
    NotFound --> Show404[Show 404 Page]
    
    HTTP -->|429| RateLimit[Rate Limited]
    RateLimit --> Wait[Show Wait Message]
    Wait --> Retry
    
    HTTP -->|500| ServerError[Server Error]
    ServerError --> Fallback[Show Error Fallback]
    
    HTTP -->|200| Success[Process Response]
    Success --> Validate{Valid Data?}
    
    Validate -->|No| ParseError[Parse Error]
    ParseError --> Fallback
    
    Validate -->|Yes| ReturnData[Return Data]
```

### Error Boundary Flow

```mermaid
sequenceDiagram
    participant User
    participant Component as React Component
    participant ErrorBoundary as Error Boundary
    participant Fallback as Error Fallback UI
    participant Logger as Error Logger

    User->>Component: Trigger Error
    Component->>ErrorBoundary: throw Error
    
    ErrorBoundary->>ErrorBoundary: componentDidCatch
    ErrorBoundary->>Logger: Log error details
    ErrorBoundary->>Fallback: Render fallback UI
    
    Fallback-->>User: Show error message
    Fallback-->>User: Show retry button
    
    User->>Fallback: Click Retry
    Fallback->>ErrorBoundary: Reset error state
    ErrorBoundary->>Component: Re-render component
```

---

## Authentication Flow

### Login Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Login as Login Page
    participant Client as API Client
    participant Worker as Auth Worker
    participant Storage as localStorage

    User->>Login: Enter credentials
    Login->>Client: verifyCredentials()
    Client->>Worker: GET /api/auth/verify
    
    Worker->>Worker: Validate API Key
    
    alt Valid Key
        Worker-->>Client: { authenticated: true }
        Client-->>Login: Success
        Login->>Storage: Store API key
        Login->>Login: Redirect to dashboard
    else Invalid Key
        Worker-->>Client: 401 Unauthorized
        Client-->>Login: Error
        Login-->>User: Show error message
    end
```

### Authenticated Request Flow

```mermaid
flowchart LR
    subgraph Client["Client"]
        Request[Make Request]
        GetKey[Get API Key
    from localStorage]
        AddHeader[Add Authorization
    Header]
    end

    subgraph Worker["Cloudflare Worker"]
        Receive[Receive Request]
        Extract[Extract Token]
        Validate{Validate
    Token}
        Allow[Allow Request]
        Deny[Return 401]
    end

    subgraph Route["Route Handler"]
        Process[Process Request]
        Response[Return Response]
    end

    Request --> GetKey
    GetKey --> AddHeader
    AddHeader --> Receive
    Receive --> Extract
    Extract --> Validate
    Validate -->|Valid| Allow
    Validate -->|Invalid| Deny
    Allow --> Process
    Process --> Response
```

---

## Caching Strategy Diagram

### Multi-Layer Caching

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        QueryCache[React Query Cache]
        BrowserCache[Browser Cache]
    end

    subgraph Edge["Edge Layer"]
        KVCache[Workers KV]
        CFCache[Cloudflare Cache]
    end

    subgraph Origin["Origin Layer"]
        HospitableCache[Hospitable Cache]
        TurnoCache[Turno Cache]
    end

    Request[API Request] --> QueryCache
    
    QueryCache -->|Cache Miss| BrowserCache
    BrowserCache -->|Cache Miss| CFCache
    CFCache -->|Cache Miss| KVCache
    
    KVCache -->|Cache Miss| Route
    
    subgraph Route["Worker Route"]
        CheckCache{Check KV}
        FetchExternal[Fetch External]
        StoreCache[Store in KV]
    end
    
    CheckCache -->|Miss| FetchExternal
    FetchExternal --> HospitableCache
    FetchExternal --> TurnoCache
    FetchExternal --> StoreCache
    StoreCache --> Response
    CheckCache -->|Hit| Response
```

### Cache Invalidation Flow

```mermaid
sequenceDiagram
    participant Client
    participant Worker
    participant KV
    participant External

    Note over Client: Data Mutation
    
    Client->>Worker: POST /api/tasks
    Worker->>KV: Store new task
    Worker->>KV: DELETE cache:tasks:all
    Worker-->>Client: Success
    
    Note over Client: Subsequent Read
    
    Client->>Worker: GET /api/tasks
    Worker->>KV: GET cache:tasks:all
    KV-->>Worker: null (cache miss)
    Worker->>KV: GET all tasks
    KV-->>Worker: Tasks from storage
    Worker->>KV: SET cache:tasks:all
    Worker-->>Client: Tasks list
```

---

## File Structure Integration

### Import Patterns

```mermaid
flowchart TB
    subgraph App["App Router"]
        Page[page.tsx]
        Layout[layout.tsx]
    end

    subgraph Data["Data Layer"]
        DataFile[data/*.ts]
        Hook[hooks/*.ts]
    end

    subgraph API["API Layer"]
        Client[api-client.ts]
    end

    subgraph Workers["Workers API"]
        Index[index.ts]
        Routes[routes/*.ts]
        Services[services/*.ts]
    end

    subgraph External["External"]
        Hospitable[Hospitable API]
        Turno[Turno API]
    end

    Page -->|imports| DataFile
    DataFile -->|imports| Hook
    DataFile -->|calls| Client
    Hook -->|calls| Client
    
    Client -->|HTTP| Index
    Index -->|routes| Routes
    Routes -->|uses| Services
    Services -->|fetches| Hospitable
    Services -->|fetches| Turno
```

---

## Performance Optimization Flow

### Request Deduplication

```mermaid
sequenceDiagram
    participant C1 as Component A
    participant C2 as Component B
    participant Query as React Query
    participant Worker as Worker

    Note over C1,C2: Same query key
    
    C1->>Query: useProperties()
    C2->>Query: useProperties()
    
    Query->>Query: Single request
    Query->>Worker: GET /api/properties
    Worker-->>Query: Response
    
    Query-->>C1: Data
    Query-->>C2: Data
```

### Prefetching Flow

```mermaid
flowchart LR
    Hover[Hover Link] --> Prefetch[router.prefetch]
    Prefetch --> Fetch[Fetch Data]
    Fetch --> Cache[Store in Query Cache]
    
    Click[Click Link] --> Navigate[Navigate]
    Navigate --> Check{In Cache?}
    Check -->|Yes| Render[Instant Render]
    Check -->|No| Loading[Show Loading]
```

---

## Development Workflow

### Local Development Setup

```mermaid
flowchart TB
    subgraph Local["Local Development"]
        Next[Next.js Dev Server
    localhost:3000]
        Worker[Wrangler Dev
    localhost:8787]
    end

    subgraph Config["Configuration"]
        Env[.env.local
    NEXT_PUBLIC_WORKERS_URL=http://localhost:8787]
        Vars[wrangler.toml
    dev vars]
    end

    subgraph Flow["Request Flow"]
        Browser[Browser]
        Next
        Worker
    end

    Env --> Next
    Vars --> Worker
    
    Browser -->|1. Request| Next
    Next -->|2. API Call| Worker
    Worker -->|3. Mock/Data| Next
    Next -->|4. HTML| Browser
```

---

## Deployment Flow

### Production Deployment

```mermaid
flowchart TB
    subgraph Build["Build Process"]
        NextBuild[Next.js Build]
        StaticExport[Static Export]
        PagesBuild[Pages Build
    @cloudflare/next-on-pages]
    end

    subgraph Deploy["Deployment"]
        WorkersDeploy[wrangler deploy
    Workers API]
        PagesDeploy[wrangler pages deploy
    Frontend]
    end

    subgraph Production["Production"]
        Workers[Cloudflare Workers
    co-property-api]
        Pages[Cloudflare Pages
    co-property-dashboard]
        KV[Workers KV]
        R2[R2 Bucket]
    end

    NextBuild --> StaticExport
    StaticExport --> PagesBuild
    
    PagesBuild --> PagesDeploy
    PagesDeploy --> Pages
    
    WorkersDeploy --> Workers
    
    Workers --> KV
    Workers --> R2
    Pages -->|API Calls| Workers
```

---

*Last Updated: February 2026*
