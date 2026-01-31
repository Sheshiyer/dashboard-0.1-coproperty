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
  // Calculate occupancy rate
  const occupancyRate = stats.totalProperties > 0
    ? (stats.activeReservations / stats.totalProperties) * 100
    : 0

  // Generate sparkline data
  const revenueSparkline = generateSparklineData(2400, 400, "up")
  const propertiesSparkline = generateSparklineData(stats.totalProperties, 2, "up")
  const occupancySparkline = generateSparklineData(occupancyRate, 5, "up")
  const bookingsSparkline = generateSparklineData(stats.activeReservations, 15, "neutral")

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* Total Revenue */}
      <StatCard
        title="Total Revenue"
        value={72400}
        prefix="$"
        trend="up"
        changePercent={12.5}
        momValue="+$8,200"
        momLabel="vs last month"
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
        momValue="+2"
        momLabel="vs last month"
        sparklineData={propertiesSparkline}
        icon={Home}
        variant="glass"
      />

      {/* Occupancy Rate */}
      <StatCard
        title="Occupancy Rate"
        value={Math.round(occupancyRate * 10) / 10}
        suffix="%"
        decimals={1}
        trend={occupancyRate > 50 ? "up" : "down"}
        changePercent={5.2}
        momValue="+4.1%"
        momLabel="vs last month"
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
