import type { Metric } from "web-vitals"

const WORKERS_URL =
  process.env.NEXT_PUBLIC_WORKERS_URL || "http://localhost:8787"

/**
 * Send a single Web Vitals metric to Cloudflare Workers Analytics.
 *
 * Uses `navigator.sendBeacon` for reliable delivery during page unload,
 * falling back to `fetch` with `keepalive` when sendBeacon is unavailable.
 *
 * This function is intentionally exported for testing. In production it is
 * only called as a callback from the web-vitals library.
 */
export function sendToAnalytics(metric: Metric): void {
  try {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      url: window.location.href,
      userAgent: navigator.userAgent,
    })

    const endpoint = `${WORKERS_URL}/api/analytics/vitals`

    // Prefer sendBeacon for reliable delivery during page transitions
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, body)
    } else {
      fetch(endpoint, {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      })
    }
  } catch {
    // Analytics must never break the application
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("[Web Vitals] Failed to send metric:", metric.name)
    }
  }
}

/**
 * Initialise Core Web Vitals tracking.
 *
 * Registers callbacks for all five metrics:
 *  - CLS  (Cumulative Layout Shift)
 *  - INP  (Interaction to Next Paint) - replaces FID in web-vitals v4+
 *  - LCP  (Largest Contentful Paint)
 *  - FCP  (First Contentful Paint)
 *  - TTFB (Time to First Byte)
 *
 * Call once in a client component that mounts on every page.
 */
export function initWebVitals(): void {
  try {
    // Dynamic import avoids bundling web-vitals on the server
    // and allows tree-shaking of unused attribution code
    import("web-vitals").then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      onCLS(sendToAnalytics)
      onINP(sendToAnalytics)
      onLCP(sendToAnalytics)
      onFCP(sendToAnalytics)
      onTTFB(sendToAnalytics)
    })
  } catch {
    // Fail silently in production
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("[Web Vitals] Failed to initialise tracking")
    }
  }
}
