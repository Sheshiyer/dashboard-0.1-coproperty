"use client"

import {
  ThemedBarChart,
  chartColors,
  formatCurrency,
} from "@/components/ui/charts"
import { GlassCard } from "@/components/ui/glass"
import type { PropertyPerformance } from "@/lib/data/dashboard"

// ============================================================================
// PropertyPerformanceChartClient Component - Client Component (renders chart)
// ============================================================================

interface PropertyPerformanceChartClientProps {
  data: PropertyPerformance[]
}

export function PropertyPerformanceChartClient({ data }: PropertyPerformanceChartClientProps) {
  return (
    <GlassCard id="property-bar" className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-gray-100">
          Top Properties by Revenue
        </h3>
        <p className="text-sm font-body text-gray-600 dark:text-gray-400 mt-1">
          Best performing properties this month
        </p>
      </div>
      <ThemedBarChart
        data={data}
        series={[
          {
            dataKey: "revenue",
            name: "Revenue",
            color: chartColors.primary,
          },
        ]}
        xAxisKey="name"
        horizontal={true}
        height={260}
        yAxisFormatter={formatCurrency}
        tooltipFormatter={formatCurrency}
        radius={[0, 8, 8, 0]}
      />
    </GlassCard>
  )
}
