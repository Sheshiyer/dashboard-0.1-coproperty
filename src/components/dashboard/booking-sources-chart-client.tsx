"use client"

import type { BookingSource } from "@/lib/data/dashboard"
import { ThemedPieChart, chartColors } from "@/components/ui/charts"
import { GlassCard } from "@/components/ui/glass"

// ============================================================================
// Types
// ============================================================================

interface BookingSourcesChartClientProps {
  sources: BookingSource[]
}

// ============================================================================
// Color Cycle (client-side only)
// ============================================================================

const bookingColorCycle = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.cta,
]

// ============================================================================
// BookingSourcesChartClient Component (Client Component)
// ============================================================================

export function BookingSourcesChartClient({
  sources,
}: BookingSourcesChartClientProps) {
  // Apply colors in the client component
  const bookingSourceData = sources.map((source, index) => ({
    name: source.name,
    value: source.value,
    color: bookingColorCycle[index % bookingColorCycle.length],
  }))

  const totalBookings = bookingSourceData.reduce((sum, d) => sum + d.value, 0)

  return (
    <GlassCard id="booking-pie" className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-gray-100">
          Booking Sources
        </h3>
        <p className="text-sm font-body text-gray-600 dark:text-gray-400 mt-1">
          Distribution across platforms &bull; {totalBookings} total
        </p>
      </div>
      <ThemedPieChart
        data={bookingSourceData}
        height={300}
        showLabels={true}
        showLegend={true}
        outerRadius={90}
        tooltipFormatter={(value: number) =>
          `${value} (${totalBookings > 0 ? Math.round((value / totalBookings) * 100) : 0}%)`
        }
      />
    </GlassCard>
  )
}
