# Analytics Setup

## Cloudflare Web Analytics

Co.Property uses [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) for privacy-first, cookie-free page view tracking. The beacon script is loaded in the root layout and requires no user consent banner.

**Dashboard:** `https://dash.cloudflare.com/[account-id]/analytics/web`

### Configuration

1. Go to your Cloudflare Dashboard
2. Navigate to **Web Analytics**
3. Add your site (or select existing domain)
4. Copy the beacon token
5. Set `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` in `.env.local`

The beacon script loads via `next/script` with `strategy="afterInteractive"` so it never blocks page rendering.

## Custom Event Tracking

Custom events are tracked via the `trackEvent()` helper in `src/lib/analytics.ts`. In development mode, events are logged to the browser console.

### Usage

```typescript
import { trackEvent } from "@/lib/analytics"

trackEvent("task_created", { priority: "high", category: "maintenance" })
```

### Events Tracked

#### User Actions

| Event | Description | Metadata |
|-------|-------------|----------|
| `task_created` | User creates a new task | `priority`, `category` |
| `property_viewed` | Property detail page visited | `propertyId` |
| `cleaning_job_completed` | Cleaning job marked complete | `jobId` |

#### Navigation

| Event | Description | Metadata |
|-------|-------------|----------|
| `command_palette_opened` | User opens Cmd+K palette | - |
| `notifications_viewed` | Notification dropdown opened | `unreadCount` |

### Privacy

- No cookies are set by the analytics beacon
- No PII is tracked in custom events
- Property IDs are internal identifiers, not user data
- All tracking fails gracefully if blocked by browser extensions

## Viewing Data

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select **Web Analytics**
3. Choose your site
4. View page views, visitors, and performance metrics
5. Custom events can be viewed in the Events tab (when using Analytics Engine)

## Web Vitals Monitoring

Core Web Vitals are automatically tracked via the `web-vitals` library (v5) and sent to Cloudflare Workers for logging and storage.

### Metrics Tracked

| Metric | Full Name | Target | Description |
|--------|-----------|--------|-------------|
| **LCP** | Largest Contentful Paint | <=2.5s | Main content load time |
| **INP** | Interaction to Next Paint | <=200ms | Interactivity responsiveness (replaces FID) |
| **CLS** | Cumulative Layout Shift | <=0.1 | Visual stability |
| **FCP** | First Contentful Paint | <=1.8s | First render time |
| **TTFB** | Time to First Byte | <=600ms | Server response time |

### Architecture

```
Browser (web-vitals lib)
  --> sendBeacon / fetch
    --> Workers API (/api/analytics/vitals)
      --> console.log (Workers Logs)
      --> KV storage (30-day retention)
```

### Implementation Files

- `src/lib/web-vitals.ts` - Client-side metric collection and transmission
- `src/components/providers/web-vitals-provider.tsx` - React integration (useEffect on mount)
- `workers/src/routes/analytics.ts` - Server-side ingestion endpoint

### Performance Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | <=2.5s | 2.5s-4.0s | >4.0s |
| INP | <=200ms | 200ms-500ms | >500ms |
| CLS | <=0.1 | 0.1-0.25 | >0.25 |
| FCP | <=1.8s | 1.8s-3.0s | >3.0s |
| TTFB | <=600ms | 600ms-1500ms | >1500ms |

### Viewing Web Vitals Data

1. Go to Cloudflare Dashboard -> Workers & Pages
2. Select the coproperty-api worker
3. Open **Logs** tab
4. Filter by `[Web Vitals]` to see metric data
5. For historical data, check the CACHE KV namespace with prefix `vitals:`

### Privacy

- No cookies used
- User agent is collected for browser compatibility analysis only
- URLs are page paths (no query parameters with user data)
- `sendBeacon` ensures metrics are sent even during page unload without blocking
- All collection fails silently if blocked by privacy extensions

## Extending Analytics

To add a new tracked event:

1. Import `trackEvent` from `@/lib/analytics`
2. Call it with a snake_case event name and optional metadata
3. Add the event to the table above in this document
4. Ensure no PII is included in the metadata
