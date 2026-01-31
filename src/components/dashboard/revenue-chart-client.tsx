"use client"

import * as React from "react"
import { GlassCard } from "@/components/ui/glass"
import { ThemedLineChart, chartColors, formatCurrency } from "@/components/ui/charts"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import type { RevenueTrendItem } from "@/lib/data/dashboard"

// ============================================================================
// RevenueChartClient Component
// Client-side wrapper for date range filtering
// ============================================================================

interface RevenueChartClientProps {
    data: RevenueTrendItem[]
}

export function RevenueChartClient({ data }: RevenueChartClientProps) {
    const [dateRange, setDateRange] = React.useState("30")

    // Filter data based on selected date range
    const filteredData = React.useMemo(() => {
        const days = parseInt(dateRange)
        // Data is already sorted chronologically, take the last N days
        return data.slice(-days)
    }, [data, dateRange])

    const formatYAxis = React.useCallback((value: number) => {
        if (value >= 1000) {
            return `$${(value / 1000).toFixed(0)}K`
        }
        return `$${value}`
    }, [])

    // Handle empty data case
    if (data.length === 0) {
        return (
            <GlassCard id="revenue-chart" className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-sm leading-none tracking-tight text-gray-900 dark:text-gray-100 font-heading">
                            Revenue vs Payout
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 font-body">
                            Income comparison over time
                        </p>
                    </div>
                </div>
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                    No revenue data available
                </div>
            </GlassCard>
        )
    }

    return (
        <GlassCard id="revenue-chart" className="p-6">
            {/* Header with date range selector */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-sm leading-none tracking-tight text-gray-900 dark:text-gray-100 font-heading">
                        Revenue vs Payout
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 font-body">
                        Income comparison over time
                    </p>
                </div>
                <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger variant="glass" className="w-[130px] h-8 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent variant="glass">
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Chart */}
            <ThemedLineChart
                data={filteredData}
                series={[
                    {
                        dataKey: "revenue",
                        name: "Revenue",
                        color: chartColors.primary,
                        strokeWidth: 2,
                    },
                    {
                        dataKey: "payout",
                        name: "Payout",
                        color: chartColors.secondary,
                        strokeWidth: 2,
                        strokeDasharray: "5 3",
                    },
                ]}
                xAxisKey="date"
                height={280}
                showLegend
                yAxisFormatter={formatYAxis}
                tooltipFormatter={formatCurrency}
            />
        </GlassCard>
    )
}
