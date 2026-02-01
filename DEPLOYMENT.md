# Co.Property Dashboard - Cloudflare Production Deployment Guide

## Overview

This document provides comprehensive instructions for deploying the Co.Property Dashboard to Cloudflare's edge infrastructure.

**Production URLs:**
- **Frontend (Pages)**: https://co-property-dashboard.pages.dev
- **API (Workers)**: https://co-property-api.sheshnarayan-iyer.workers.dev

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Cloudflare Infrastructure                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────┐          ┌──────────────────────┐                │
│  │   Cloudflare Pages   │          │  Cloudflare Workers  │                │
│  │   (Next.js Frontend) │◄────────►│   (API Backend)      │                │
│  │                      │   HTTP   │                      │                │
│  └──────────────────────┘          └──────────┬───────────┘                │
│                                               │                             │
│                                               ▼                             │
│                                ┌──────────────────────┐                    │
│                                │   Cloudflare R2      │                    │
│                                │  (Photo Storage)     │                    │
│                                └──────────────────────┘                    │
│                                               │                             │
│                                               ▼                             │
│                                ┌──────────────────────┐                    │
│                                │   Cloudflare KV      │                    │
│                                │  (Caching & Tasks)   │                    │
│                                └──────────────────────┘                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

- Cloudflare account with API token
- Node.js 18+ and npm/bun
- Wrangler CLI authenticated (`wrangler login`)

### Environment Variables

Create a `.env` file with:

```bash
# Cloudflare
CLOUDFLARE_API_TOKEN=your_token_here

# API Keys (for local development)
API_KEY=your_secure_api_key
NEXT_PUBLIC_WORKERS_URL=http://localhost:8787

# External API Tokens (stored in Workers secrets)
HOSPITABLE_API_TOKEN=your_hospitable_token
TURNO_TOKEN_ID=your_turno_token_id
TURNO_SECRET_KEY=your_turno_secret
```

---

## Deployment Steps

### 1. Upgrade Next.js (One-time)

```bash
# Upgrade to Next.js 15.x (required for Cloudflare Pages compatibility)
npm install next@15.5.2 eslint-config-next@15.5.2 --save
```

### 2. Create R2 Bucket (One-time)

```bash
# Create bucket for photo storage
wrangler r2 bucket create coproperty-photos-dev
```

### 3. Deploy Workers API

```bash
cd workers

# Deploy to production
wrangler deploy

# Set secrets (one-time setup)
wrangler secret put HOSPITABLE_API_TOKEN
wrangler secret put TURNO_API_KEY
wrangler secret put API_KEY
```

### 4. Build Frontend for Pages

```bash
# Set production Workers URL
export NEXT_PUBLIC_WORKERS_URL=https://co-property-api.sheshnarayan-iyer.workers.dev

# Build Next.js
npm run build

# Build for Cloudflare Pages
npm run pages:build
```

### 5. Deploy to Pages

```bash
# Create Pages project (one-time)
wrangler pages project create co-property-dashboard --production-branch=main

# Deploy
wrangler pages deploy .vercel/output/static --project-name=co-property-dashboard --branch=main
```

### 6. Configure Environment Variables

```bash
# Set environment variable for Pages
wrangler pages secret put NEXT_PUBLIC_WORKERS_URL --project-name=co-property-dashboard
# Value: https://co-property-api.sheshnarayan-iyer.workers.dev
```

---

## Configuration Files

### wrangler.toml (Workers)

```toml
name = "co-property-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# KV Namespaces
[[kv_namespaces]]
binding = "CACHE"
id = "d5aa9b42b2f948bfa59143d5a56ea58b"

[[kv_namespaces]]
binding = "TASKS"
id = "be7ca1853bb44067b6d3481b2133a64f"

[vars]
HOSPITABLE_BASE_URL = "https://public.api.hospitable.com/v2"
TURNO_BASE_URL = "https://api.turno.com/v1"
R2_PUBLIC_URL = "https://photos.coproperty.com"

# R2 Buckets for photo storage
[[r2_buckets]]
binding = "PHOTOS"
bucket_name = "coproperty-photos-dev"
preview_bucket_name = "coproperty-photos-preview"
```

### wrangler.pages.toml (Pages)

```toml
name = "co-property-dashboard"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[vars]
NEXT_PUBLIC_WORKERS_URL = "https://co-property-api.sheshnarayan-iyer.workers.dev"
```

---

## API Endpoints

### Health Check
```bash
curl https://co-property-api.sheshnarayan-iyer.workers.dev/api/health
```

### Properties
```bash
curl https://co-property-api.sheshnarayan-iyer.workers.dev/api/properties \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Dashboard Stats
```bash
curl https://co-property-api.sheshnarayan-iyer.workers.dev/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Reservations
```bash
curl https://co-property-api.sheshnarayan-iyer.workers.dev/api/reservations \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Cleaning Jobs
```bash
curl https://co-property-api.sheshnarayan-iyer.workers.dev/api/cleaning \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Troubleshooting

### Build Errors

**Error: `ssr: false` is not allowed with `next/dynamic` in Server Components**
- **Fix**: Remove `ssr: false` from dynamic imports in Server Components
- The imported client components are already marked with `"use client"`

**Error: `Type 'Props' does not satisfy the constraint 'PageProps'`**
- **Fix**: Update page props to use `Promise` for params:
```typescript
interface Props {
  params: Promise<{ id: string }>
}
```

### Runtime Errors

**Error: `node:buffer` or `node:async_hooks` not found**
- **Fix**: Enable `nodejs_compat` compatibility flag in wrangler.toml

**Error: Dynamic server usage during static generation**
- **Expected**: These are warnings for data-fetching routes
- Routes are marked as dynamic (`ƒ`) and will be server-rendered on demand

### Deployment Issues

**Project not found**
```bash
# Create the project first
wrangler pages project create co-property-dashboard --production-branch=main
```

**Secrets not available**
```bash
# Set secrets for both Workers and Pages
wrangler secret put API_KEY  # For Workers
wrangler pages secret put NEXT_PUBLIC_WORKERS_URL --project-name=co-property-dashboard
```

---

## Monitoring

### Workers Logs
```bash
cd workers
wrangler tail
```

### Pages Analytics
- Visit https://dash.cloudflare.com/ > Pages > co-property-dashboard > Analytics

### Workers Analytics
- Visit https://dash.cloudflare.com/ > Workers & Pages > co-property-api > Analytics

---

## Security Considerations

1. **API Key Storage**: All API keys are stored as encrypted secrets
2. **CORS**: API is configured to accept requests from the Pages domain
3. **Rate Limiting**: Implement rate limiting at the Workers level
4. **R2 Bucket**: Private bucket with public access controlled via Workers

---

## Rollback Procedure

### Workers Rollback
```bash
cd workers
wrangler rollback [VERSION_ID]
```

### Pages Rollback
- Visit Cloudflare Dashboard > Pages > co-property-dashboard
- Select previous deployment and click "Rollback"

---

## Maintenance

### Updating Dependencies
```bash
# Update Workers dependencies
cd workers
npm update
wrangler deploy

# Update Frontend dependencies
npm update
npm run build
npm run pages:build
wrangler pages deploy .vercel/output/static --project-name=co-property-dashboard --branch=main
```

### Rotating Secrets
```bash
# Workers secrets
wrangler secret put HOSPITABLE_API_TOKEN
wrangler secret put TURNO_API_KEY
wrangler secret put API_KEY

# Pages secrets
wrangler pages secret put NEXT_PUBLIC_WORKERS_URL --project-name=co-property-dashboard
```

---

## Support

For issues or questions:
1. Check Cloudflare Status: https://www.cloudflarestatus.com/
2. Review Workers Documentation: https://developers.cloudflare.com/workers/
3. Review Pages Documentation: https://developers.cloudflare.com/pages/

---

**Last Updated**: February 2026
**Version**: 1.0.0
