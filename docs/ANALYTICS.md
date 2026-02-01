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

## Extending Analytics

To add a new tracked event:

1. Import `trackEvent` from `@/lib/analytics`
2. Call it with a snake_case event name and optional metadata
3. Add the event to the table above in this document
4. Ensure no PII is included in the metadata
