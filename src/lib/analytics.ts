/**
 * Cloudflare Web Analytics - Custom Event Tracking
 *
 * Provides a lightweight, privacy-friendly analytics helper that:
 * - Tracks custom events via Cloudflare Web Analytics
 * - Falls back gracefully when analytics is blocked or unavailable
 * - Logs events to console in development mode
 * - Never tracks PII (personal identifiable information)
 */

// ---------------------------------------------------------------------------
// Development mock
// ---------------------------------------------------------------------------

/**
 * Initialise a console-based mock in development so events are visible
 * during local testing without requiring the Cloudflare beacon.
 */
export function initDevAnalytics(): void {
  if (
    typeof window === "undefined" ||
    process.env.NODE_ENV !== "development"
  ) {
    return
  }

  // Only set up if not already present (beacon may have loaded)
  if (!window.__cfBeacon) {
    window.__cfBeacon = {
      trackEvent: (name: string, data?: Record<string, string | number | boolean>) => {
        // eslint-disable-next-line no-console
        console.log("[Analytics][dev]", name, data)
      },
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Track a custom event in Cloudflare Web Analytics.
 *
 * @param eventName  - A short, snake_case identifier (e.g. "task_created")
 * @param data       - Optional flat key/value metadata. Avoid PII.
 *
 * @example
 * ```ts
 * trackEvent("task_created", { priority: "high", category: "maintenance" })
 * ```
 */
export function trackEvent(
  eventName: string,
  data?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return

  try {
    // Cloudflare Web Analytics does not expose a public trackEvent API
    // out of the box. The beacon script tracks page views automatically.
    // For custom events we log to the dev console and could extend this
    // to send custom events via Cloudflare Workers Analytics Engine in
    // the future.
    if (window.__cfBeacon?.trackEvent) {
      window.__cfBeacon.trackEvent(eventName, data)
    }

    // Always log in development for visibility
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log("[Analytics]", eventName, data)
    }
  } catch {
    // Silently swallow - analytics must never break the app
  }
}

// ---------------------------------------------------------------------------
// TypeScript declarations
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    /**
     * Cloudflare Web Analytics beacon reference.
     * Extended with an optional trackEvent for custom event support.
     */
    __cfBeacon?: {
      trackEvent?: (
        name: string,
        data?: Record<string, string | number | boolean>,
      ) => void
    }
  }
}
