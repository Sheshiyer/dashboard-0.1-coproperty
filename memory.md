# PROJECT MEMORY

## Overview
Co.Property Operations Dashboard: A Next.js 14 application for property management, integrating with Hospitable and Turno APIs via Cloudflare Workers.

## Architecture (v2.0 - Cloudflare Workers)
- **Frontend**: Next.js 14 App Router on Vercel
- **Backend**: Cloudflare Workers with Hono router
- **Data Sources**: Hospitable API (properties, reservations), Turno API (cleaning)
- **Storage**: Workers KV for caching and tasks
- **Auth**: API key-based authentication

## Completed Tasks

### [2026-01-29] Architecture Migration: Supabase → Cloudflare Workers
- **Outcome**: Removed Supabase, created Workers API with Hospitable/Turno integrations.
- **Breakthrough**: Edge-first serverless architecture with external APIs as source of truth.
- **Code Changes**:
  - Removed: `@supabase/ssr`, `@supabase/supabase-js`, `src/lib/supabase/`
  - Created: `workers/` project with Hono router
  - Updated: `src/lib/api-client.ts`, all data fetchers, middleware
  - Updated: `ProjectArchitecture.md`, `PromptScaffolding.md`, `.context/` files
- **Next Dependencies**: Testing & Verification Phase

### [2026-01-29] Frontend Integration Complete
- **Outcome**: Frontend fully using Workers API. TypeScript errors resolved. Data enrichment logic (joins) moved to client-side service layer.
- **Verification**: Build passes. Manual verification required.

### [2026-01-29] Workers Project Setup
- **Outcome**: Created complete Workers API with all routes and services.
- **KV Namespaces**: CACHE (`d5aa9b...`), TASKS (`be7ca1...`)
- **Routes**: `/api/properties`, `/api/reservations`, `/api/cleaning`, `/api/tasks`, `/api/dashboard`
- **Services**: HospitableService (with caching), TurnoService (with caching)

### [2026-01-29] Unit Tests (Services) - Deprecated with migration
- Tests for Supabase-based services removed during migration.
- New tests needed for Workers API.

## Key Decisions
1. No local database - Hospitable/Turno are sources of truth
2. API key auth for simple internal dashboard
3. Workers KV for caching (TTL-based) and task storage
4. Edge deployment for global low-latency

## Known Issues & Limitations

### [2026-01-29] Workers API Debugging Session
- **Root Cause Found**: Workers secrets were not configured with correct API tokens
- **Resolution**: Updated all 3 secrets (HOSPITABLE_API_TOKEN, TURNO_API_KEY, API_KEY) via `wrangler secret put`
- **Current Status**:
  - ✅ Properties endpoint working (`/api/properties`)
  - ✅ Tasks endpoint working (`/api/tasks`)
  - ✅ Cleaning endpoint returns empty list (Turno has Cloudflare CAPTCHA protection blocking Workers - see below)
  - ⚠️ Reservations endpoint requires modification (see below)
  - ⚠️ Dashboard stats endpoint failing due to reservations dependency

### Hospitable API Constraint: Reservations Require Property Filter
- **Issue**: Hospitable v2 API `/reservations` endpoint requires `properties` query parameter
- **Impact**: Cannot fetch all reservations without property IDs
- **Workaround Needed**: Modify `/api/reservations` route to:
  1. First fetch all properties
  2. Then fetch reservations for each property
  3. Aggregate results
- **Files to Update**: `workers/src/routes/reservations.ts`, `workers/src/routes/dashboard.ts`

### Turno API Cloudflare Protection
- **Issue**: Turno API has Cloudflare bot protection that blocks Workers
- **Error**: `403 Forbidden` with Cloudflare CAPTCHA challenge page
- **Impact**: Cannot fetch cleaning jobs from Turno
- **Potential Solutions**:
  1. Contact Turno to whitelist Cloudflare Workers IPs
  2. Use a proxy service
  3. Implement browser-based scraping (complex, not recommended)
  4. Find alternative Turno API endpoints without protection
- **Status**: Low priority - cleaning functionality optional for MVP
