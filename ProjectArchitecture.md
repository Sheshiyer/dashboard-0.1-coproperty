# Co.Property Operations Dashboard
## Project Architecture Document v2.0

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

## 1. System Overview

The Co.Property Operations Dashboard is a property management system designed to streamline daily operations for managing 100+ short-term rental properties in Bangkok. The architecture follows a modern edge-first approach with **Cloudflare Workers** for backend API, **Workers KV** for caching, and a **Next.js** React-based frontend.

> **Architecture Migration Note (v2.0)**: This version migrated from Supabase to Cloudflare Workers with direct Hospitable/Turno API integration. Data is fetched on-demand from external APIs with KV caching rather than stored in a persistent database.

### 1.1 Core Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------| 
| Frontend | Next.js 14 (App Router) | React framework with SSR/SSG |
| Styling | Tailwind CSS | Utility-first CSS framework |
| State | Zustand + React Query | Client state and server state |
| **Backend** | **Cloudflare Workers** | Edge-based API handlers |
| **Caching** | **Workers KV** | Key-value caching for API responses |
| **Routing** | **Hono** | Lightweight web framework for Workers |
| Auth | API Key-based | Simple authentication for internal dashboard |
| External APIs | Hospitable API v2 | Properties and reservations data source |
| External APIs | Turno API | Cleaning coordination data source |
| Package Manager | Bun | Fast JavaScript runtime |
| Deployment | Vercel (Frontend) / Cloudflare (Backend) | Platform hosting |

### 1.2 Architecture Principles

1. **Edge-First**: API handlers run at Cloudflare's global edge network for low latency
2. **On-Demand Data**: Fetch data from external APIs when needed, cache aggressively
3. **API-driven**: Clean separation between frontend and backend via REST endpoints
4. **Stateless**: No persistent database - data lives in Hospitable/Turno
5. **Simple Auth**: API key authentication for internal operational dashboard
6. **Horizontal Scalability**: Stateless workers scale automatically with demand

---

## 2. System Architecture Diagram

```
                                    EXTERNAL SERVICES
    +------------------------------------------------------------------+
    |                                                                   |
    |   +-------------------+        +-------------------+              |
    |   |    HOSPITABLE     |        |      TURNO        |              |
    |   |    API v2         |        |   API             |              |
    |   |                   |        |                   |              |
    |   | - Properties      |        | - Cleaning Jobs   |              |
    |   | - Reservations    |        | - Status Updates  |              |
    |   | - Calendar        |        | - Assignments     |              |
    |   | - Messages        |        |                   |              |
    |   +--------+----------+        +---------+---------+              |
    |            |                             |                        |
    |            | REST API                    | REST API               |
    |            | Bearer Token                | API Key                |
    +------------|-----------------------------|-----------------------+
                 |                             |
                 v                             v
    +------------------------------------------------------------------+
    |                   CLOUDFLARE WORKERS LAYER                        |
    +------------------------------------------------------------------+
    |                                                                   |
    |   +-----------------------------------------------------------+  |
    |   |                    HONO ROUTER                             |  |
    |   |                    (Edge Runtime)                          |  |
    |   |                                                            |  |
    |   |  +------------------+  +------------------+                 |  |
    |   |  | /api/properties  |  | /api/reservations|                 |  |
    |   |  |                  |  |                  |                 |  |
    |   |  | Fetch from       |  | Fetch from       |                 |  |
    |   |  | Hospitable API   |  | Hospitable API   |                 |  |
    |   |  +------------------+  +------------------+                 |  |
    |   |                                                            |  |
    |   |  +------------------+  +------------------+                 |  |
    |   |  | /api/cleaning    |  | /api/tasks       |                 |  |
    |   |  |                  |  |                  |                 |  |
    |   |  | Fetch from       |  | CRUD via         |                 |  |
    |   |  | Turno API        |  | Workers KV       |                 |  |
    |   |  +------------------+  +------------------+                 |  |
    |   |                                                            |  |
    |   |  +------------------+  +------------------+                 |  |
    |   |  | /api/dashboard   |  | /api/health      |                 |  |
    |   |  |                  |  |                  |                 |  |
    |   |  | Aggregate stats  |  | Health check     |                 |  |
    |   |  | from all sources |  | endpoint         |                 |  |
    |   |  +------------------+  +------------------+                 |  |
    |   +-----------------------------------------------------------+  |
    |                              |                                    |
    |                              v                                    |
    |   +-----------------------------------------------------------+  |
    |   |                    WORKERS KV                              |  |
    |   |                                                            |  |
    |   |  Namespace: CACHE     - API response caching (TTL-based)   |  |
    |   |  Namespace: TASKS     - Task storage (persistent)          |  |
    |   |  Namespace: SESSIONS  - API key sessions                   |  |
    |   +-----------------------------------------------------------+  |
    |                              |                                    |
    |   +-----------------------------------------------------------+  |
    |   |                   AUTH MIDDLEWARE                          |  |
    |   |                                                            |  |
    |   |  - API key validation                                      |  |
    |   |  - Authorization header parsing                            |  |
    |   |  - Rate limiting per key                                   |  |
    |   +-----------------------------------------------------------+  |
    +------------------------------------------------------------------+
                                   |
                                   | HTTPS
                                   |
    +------------------------------------------------------------------+
    |                        FRONTEND LAYER                            |
    +------------------------------------------------------------------+
    |                                                                   |
    |   +-----------------------------------------------------------+  |
    |   |                   NEXT.JS APPLICATION                      |  |
    |   |                   (Vercel Deployment)                      |  |
    |   |                                                            |  |
    |   |  +------------------+  +------------------+                 |  |
    |   |  | App Router       |  | API Client       |                 |  |
    |   |  | /app/*           |  | Workers API      |                 |  |
    |   |  +------------------+  +------------------+                 |  |
    |   |                                                            |  |
    |   |  +------------------+  +------------------+                 |  |
    |   |  | Server Comps     |  | Client Comps     |                 |  |
    |   |  | Data fetching    |  | Interactivity    |                 |  |
    |   |  +------------------+  +------------------+                 |  |
    |   |                                                            |  |
    |   |  +------------------+  +------------------+                 |  |
    |   |  | Zustand Store    |  | React Query      |                 |  |
    |   |  | UI State         |  | Server State     |                 |  |
    |   |  +------------------+  +------------------+                 |  |
    |   +-----------------------------------------------------------+  |
    |                                                                   |
    +------------------------------------------------------------------+
                                   |
                                   | HTTPS
                                   |
    +------------------------------------------------------------------+
    |                         CLIENT DEVICES                           |
    +------------------------------------------------------------------+
    |                                                                   |
    |   +---------------+  +---------------+  +---------------+        |
    |   |   Desktop     |  |   Tablet      |  |   Mobile      |        |
    |   |   Browser     |  |   Browser     |  |   Browser     |        |
    |   +---------------+  +---------------+  +---------------+        |
    |                                                                   |
    +------------------------------------------------------------------+
```

---

## 3. Data Flow Diagrams

### 3.1 Property Data Flow

```
+---------------+     +------------------+     +------------------+
|  HOSPITABLE   |     |  CLOUDFLARE      |     |  NEXT.JS         |
|  API          |     |  WORKERS         |     |  FRONTEND        |
+-------+-------+     +--------+---------+     +--------+---------+
        |                      |                        |
        |                      |  1. GET /api/properties|
        |                      |<-----------------------|
        |                      |                        |
        |                      |  2. Check KV cache     |
        |                      |                        |
        |  3. Fetch if expired |                        |
        |<---------------------|                        |
        |                      |                        |
        |  4. Return properties|                        |
        |--------------------->|                        |
        |                      |                        |
        |                      |  5. Store in KV cache  |
        |                      |  (TTL: 5 minutes)      |
        |                      |                        |
        |                      |  6. Return JSON        |
        |                      |----------------------->|
        |                      |                        |
        |                      |                        |  7. Display
        |                      |                        |  properties
```

### 3.2 Cleaning Job Status Update Flow

```
+---------------+     +------------------+     +------------------+
|  TURNO        |     |  CLOUDFLARE      |     |  NEXT.JS         |
|  API          |     |  WORKERS         |     |  FRONTEND        |
+-------+-------+     +--------+---------+     +--------+---------+
        |                      |                        |
        |                      |  1. User drags card    |
        |                      |  to new status column  |
        |                      |                        |
        |                      |  2. PATCH /api/cleaning|
        |                      |  { status: 'completed'}|
        |                      |<-----------------------|
        |                      |                        |
        |  3. Update status    |                        |
        |<---------------------|                        |
        |                      |                        |
        |  4. Return success   |                        |
        |--------------------->|                        |
        |                      |                        |
        |                      |  5. Invalidate cache   |
        |                      |                        |
        |                      |  6. Return success     |
        |                      |----------------------->|
        |                      |                        |
        |                      |                        |  7. Update UI
        |                      |                        |  optimistically
```

### 3.3 Task CRUD Flow (KV Storage)

```
+------------------+     +------------------+     +------------------+
|  WORKERS KV      |     |  CLOUDFLARE      |     |  NEXT.JS         |
|  (TASKS)         |     |  WORKERS         |     |  FRONTEND        |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         |                        |  1. POST /api/tasks    |
         |                        |  { title, priority }   |
         |                        |<-----------------------|
         |                        |                        |
         |  2. Generate UUID      |                        |
         |  Store task in KV      |                        |
         |<-----------------------|                        |
         |                        |                        |
         |  3. Return success     |                        |
         |----------------------->|                        |
         |                        |                        |
         |                        |  4. Return new task    |
         |                        |----------------------->|
         |                        |                        |
         |                        |                        |  5. Add to
         |                        |                        |  task list
```

---

## 4. API Architecture

### 4.1 Workers API Endpoints

```
/api
  /health
    GET    /                   - Health check and connectivity test
  
  /properties
    GET    /                   - List properties (from Hospitable)
    GET    /:id                - Single property detail
    GET    /count              - Property count
  
  /reservations
    GET    /                   - List reservations (filtered)
    GET    /:id                - Single reservation detail
    PATCH  /:id                - Update reservation notes
  
  /cleaning
    GET    /                   - List cleaning jobs (from Turno)
    GET    /:id                - Single job detail
    PATCH  /:id                - Update job status
  
  /tasks
    GET    /                   - List tasks (from KV)
    POST   /                   - Create task
    GET    /:id                - Single task detail
    PATCH  /:id                - Update task
    DELETE /:id                - Delete task
  
  /dashboard
    GET    /                   - Aggregated stats
```

### 4.2 External API Integrations

#### Hospitable API v2

```
Base URL: https://public.api.hospitable.com/v2

Endpoints Used:
  GET  /user                - Connection test
  GET  /properties          - List all properties
  GET  /properties/:id      - Single property
  GET  /reservations        - List reservations
  GET  /reservations/:id    - Single reservation

Authentication:
  Header: Authorization: Bearer {PAT_TOKEN}

Rate Limits:
  100 requests per minute per token
```

#### Turno API

```
Base URL: https://api.turno.com/v1

Endpoints Used:
  GET  /jobs                - List cleaning jobs
  GET  /jobs/:id            - Single job detail
  PATCH /jobs/:id           - Update job status

Authentication:
  Header: X-API-Key: {TURNO_API_KEY}
```

---

## 5. Authentication

### 5.1 API Key Authentication

The dashboard uses simple API key authentication for internal operational use:

```typescript
// Request header format
Authorization: Bearer {API_KEY}

// Middleware validation
const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '')
if (!apiKey || apiKey !== env.API_KEY) {
  return new Response('Unauthorized', { status: 401 })
}
```

### 5.2 Frontend Auth Flow

```
+---------------+     +------------------+     +------------------+
|  USER         |     |  NEXT.JS         |     |  CLOUDFLARE      |
|  (Browser)    |     |  FRONTEND        |     |  WORKERS         |
+-------+-------+     +--------+---------+     +--------+---------+
        |                      |                        |
        |  1. Navigate to      |                        |
        |  /login              |                        |
        |--------------------->|                        |
        |                      |                        |
        |  2. Enter API key    |                        |
        |--------------------->|                        |
        |                      |                        |
        |                      |  3. Validate API key   |
        |                      |  GET /api/health       |
        |                      |----------------------->|
        |                      |                        |
        |                      |  4. 200 OK = valid     |
        |                      |<-----------------------|
        |                      |                        |
        |  5. Store in         |                        |
        |  localStorage        |                        |
        |<---------------------|                        |
        |                      |                        |
        |  6. Redirect to      |                        |
        |  /dashboard          |                        |
```

---

## 6. Caching Strategy

### 6.1 Workers KV Caching

| Data Type | TTL | Invalidation |
|-----------|-----|--------------|
| Properties list | 5 minutes | Manual or on update |
| Single property | 5 minutes | Manual or on update |
| Reservations list | 2 minutes | On status change |
| Cleaning jobs | 1 minute | On status change |
| Dashboard stats | 1 minute | Automatic expiry |

### 6.2 Cache Key Structure

```
CACHE:properties:list
CACHE:properties:{id}
CACHE:reservations:list:{date_range}
CACHE:cleaning:list:{date}
CACHE:dashboard:stats
```

---

## 7. Environment Variables

### 7.1 Frontend (.env)

```bash
# Cloudflare Workers
NEXT_PUBLIC_WORKERS_URL=http://localhost:8787
# API_KEY for authentication (stored in localStorage after login)
```

### 7.2 Workers (wrangler.toml secrets)

```bash
# External API tokens
HOSPITABLE_API_TOKEN=<token>
TURNO_API_KEY=<key>

# Authentication
API_KEY=<secure-random-string>
```

---

## 8. Deployment

### 8.1 Frontend (Vercel)

- Automatic deployments from main branch
- Preview deployments for PRs
- Environment variables in Vercel dashboard

### 8.2 Backend (Cloudflare Workers)

```bash
# Deploy to production
wrangler deploy

# Deploy secrets
wrangler secret put HOSPITABLE_API_TOKEN
wrangler secret put TURNO_API_KEY
wrangler secret put API_KEY
```

---

## 9. Migration Notes (v1.0 → v2.0)

### Removed
- Supabase PostgreSQL database
- Supabase Realtime subscriptions
- Supabase Auth (JWT-based)
- Supabase RLS policies
- Supabase Edge Functions

### Added
- Cloudflare Workers API layer
- Workers KV for caching and task storage
- Hono router framework
- Direct Hospitable API integration
- Direct Turno API integration
- Simple API key authentication

### Changed
- Data fetching: Database queries → API calls with caching
- Authentication: JWT sessions → API key in header
- Tasks storage: PostgreSQL → Workers KV
- Real-time updates: Removed (polling or manual refresh)
