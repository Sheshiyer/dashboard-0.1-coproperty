"use client"

import { ThemedAreaChart, chartColors, formatPercentage } from "@/components/ui/charts"
import { GlassCard } from "@/components/ui/glass"
import type { OccupancyTrendPoint } from "@/lib/data/dashboard"

interface OccupancyChartClientProps {
    data: OccupancyTrendPoint[]
}

export function OccupancyChartClient({ data }: OccupancyChartClientProps) {
    return (
        <GlassCard id="occupancy-chart" className="h-full p-6">
            <div className="mb-4">
                <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-gray-100">
                    Occupancy Rate - Last 30 Days
                </h3>
                <p className="text-sm font-body text-gray-600 dark:text-gray-400 mt-1">
                    Property occupancy trends
                </p>
            </div>
            <ThemedAreaChart
                data={data}
                series={[
                    {
                        dataKey: "rate",
                        name: "Occupancy %",
                        color: chartColors.primary,
                    },
                ]}
                xAxisKey="date"
                height={300}
                gradient={true}
                yAxisFormatter={(v: number) => `${v}%`}
                tooltipFormatter={(v: number) => formatPercentage(v)}
            />
        </GlassCard>
    )
}
