/**
 * Property Card Data Types
 *
 * Extends the core API Property type with display-oriented fields
 * used by the PropertyCard component for rich card rendering.
 */

import type { Property } from "@/types/api"

/**
 * Extended property data for card display.
 * Fields not present in the API (imageUrl, occupancyRate, monthlyRevenue)
 * are optional and the component provides sensible defaults/fallbacks.
 */
export interface PropertyCardData extends Property {
  /** URL for the property hero image */
  imageUrl?: string
  /** Occupancy rate as a percentage (0-100) */
  occupancyRate?: number
  /** Monthly revenue in the property's local currency */
  monthlyRevenue?: number
  /** 30-day occupancy trend data points for sparkline */
  occupancyTrend?: Array<{ value: number }>
  /** 30-day revenue trend data points for sparkline */
  revenueTrend?: Array<{ value: number }>
}

/**
 * Status variant mapping for badge display.
 * Maps API status values to badge visual variants.
 */
export const STATUS_CONFIG = {
  active: {
    label: "Active",
    variant: "success" as const,
  },
  inactive: {
    label: "Inactive",
    variant: "glass" as const,
  },
  maintenance: {
    label: "Maintenance",
    variant: "warning" as const,
  },
} as const

export type PropertyStatus = keyof typeof STATUS_CONFIG
