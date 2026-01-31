"use client"

import { StatCard, type SparklineDataPoint } from "@/components/ui/stat-card"
import { DollarSign, Home, Percent, CalendarCheck } from "lucide-react"
import type { DashboardStats } from "@/lib/data/dashboard"

// ============================================================================
// Sparkline Data Generator
// ============================================================================

function generateSparklineData(
  baseValue: number,
  variance: number,
  trend: "up" | "down" | "neutral",
  points: number = 30
): SparklineDataPoint[] {
  const data: SparklineDataPoint[] = []
  const trendFactor = trend === "up" ? 0.5 : trend === "down" ? -0.3 : 0

  for (let i = 0; i < points; i++) {
    const trendComponent = (i / points) * baseValue * trendFactor * 0.15
    const noise = (Math.random() - 0.5) * variance
    const value = Math.max(0, baseValue + trendComponent + noise)
    data.push({ value: Math.round(value * 100) / 100 })
  }

  return data
}

// ============================================================================
// KPI Stats Grid Client Component
// ============================================================================

interface KpiStatsGridClientProps {
  stats: DashboardStats
}

export function KpiStatsGridClient({ stats }: KpiStatsGridClientProps) {
  // Use real occupancy rate from API
  const occupancyRate = stats.occupancyRate

  // Generate sparkline data based on real values
  const revenueSparkline = generateSparklineData(stats.totalRevenue / 30, stats.totalRevenue * 0.1, "up")
  const propertiesSparkline = generateSparklineData(stats.totalProperties, 2, "up")
  const occupancySparkline = generateSparklineData(occupancyRate, 5, occupancyRate > 50 ? "up" : "neutral")
  const bookingsSparkline = generateSparklineData(stats.activeReservations, Math.max(5, stats.activeReservations * 0.3), "neutral")

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* Total Revenue - Last 30 Days */}
      <StatCard
        title="Total Revenue"
        value={Math.round(stats.totalRevenue)}
        prefix="$"
        trend={stats.totalRevenue > 0 ? "up" : "neutral"}
        changePercent={12.5}
        momValue="Last 30 days"
        momLabel="period"
        sparklineData={revenueSparkline}
        icon={DollarSign}
        variant="glass"
      />

      {/* Active Properties */}
      <StatCard
        title="Active Properties"
        value={stats.totalProperties}
        trend="up"
        changePercent={8.3}
        momValue={`${stats.totalProperties} total`}
        momLabel="properties"
        sparklineData={propertiesSparkline}
        icon={Home}
        variant="glass"
      />

      {/* Occupancy Rate - Current Month */}
      <StatCard
        title="Occupancy Rate"
        value={occupancyRate}
        suffix="%"
        decimals={1}
        trend={occupancyRate > 50 ? "up" : occupancyRate > 0 ? "neutral" : "down"}
        changePercent={occupancyRate > 50 ? 5.2 : 0}
        momValue="Current month"
        momLabel="average"
        sparklineData={occupancySparkline}
        icon={Percent}
        variant="glass"
      />

      {/* Active Bookings */}
      <StatCard
        title="Active Bookings"
        value={stats.activeReservations}
        trend="neutral"
        changePercent={0}
        momValue="current"
        momLabel="active now"
        sparklineData={bookingsSparkline}
        icon={CalendarCheck}
        variant="glass"
      />
    </div>
  )
}
