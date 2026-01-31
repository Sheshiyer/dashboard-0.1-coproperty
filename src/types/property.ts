/**
 * Property Card Data Types
 *
 * Extends the core API Property type with display-oriented fields
 * used by the PropertyCard component for rich card rendering.
 */

import type { Property } from "@/types/api"

/**
 * Extended property data for card display.
 * Currently only adds imageUrl - other display fields may be added
 * as we calculate metrics from reservation data in the future.
 */
export interface PropertyCardData extends Property {
  /** URL for the property hero image */
  imageUrl?: string
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
