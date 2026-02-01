"use client"

import { useEffect } from "react"
import { initWebVitals } from "@/lib/web-vitals"

/**
 * Client component that initialises Core Web Vitals tracking on mount.
 *
 * Placed in the root layout so metrics are captured for every page.
 * The web-vitals library is dynamically imported inside `initWebVitals`
 * to avoid increasing the initial JS bundle.
 */
export function WebVitalsProvider() {
  useEffect(() => {
    initWebVitals()
  }, [])

  return null
}
