import type { Context } from "hono"
import type { Bindings } from "../index"

/**
 * Web Vitals payload sent from the browser.
 */
interface WebVitalsPayload {
  name: "CLS" | "INP" | "LCP" | "FCP" | "TTFB"
  value: number
  rating: "good" | "needs-improvement" | "poor"
  delta: number
  id: string
  navigationType: string
  url: string
  userAgent: string
}

/**
 * Ingest a single Core Web Vital metric from the browser.
 *
 * - Logs to console so metrics appear in Workers Logs / Analytics.
 * - Stores in KV with a 30-day TTL for historical analysis.
 * - Returns 204 No Content on success to minimise response size.
 *
 * This endpoint is intentionally NOT behind auth middleware because
 * it receives fire-and-forget `sendBeacon` requests from browsers
 * that cannot include an Authorization header.
 */
export async function handleWebVitals(
  c: Context<{ Bindings: Bindings }>
): Promise<Response> {
  try {
    const vitals: WebVitalsPayload = await c.req.json()

    // Validate required fields
    if (!vitals.name || typeof vitals.value !== "number") {
      return c.json({ error: "Invalid vitals payload" }, 400)
    }

    // Log to Workers Analytics (visible in Cloudflare dashboard > Workers > Logs)
    console.log("[Web Vitals]", {
      metric: vitals.name,
      value: Math.round(vitals.value * 100) / 100,
      rating: vitals.rating,
      url: vitals.url,
      navigationType: vitals.navigationType,
    })

    // Store in KV for historical analysis (optional, 30-day retention)
    if (c.env.CACHE) {
      const key = `vitals:${vitals.name}:${Date.now()}`
      await c.env.CACHE.put(
        key,
        JSON.stringify({
          ...vitals,
          timestamp: new Date().toISOString(),
        }),
        { expirationTtl: 30 * 24 * 60 * 60 } // 30 days
      )
    }

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error("[Web Vitals] Error processing metric:", error)
    return c.json({ error: "Failed to process vitals" }, 500)
  }
}
