"use client"

import { useState, useMemo } from "react"
import { GlassCard } from "@/components/ui/glass"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/ui/stat-card"
import {
  ThemedBarChart,
  ThemedPieChart,
  ThemedLineChart,
  chartColors,
  formatCurrency,
} from "@/components/ui/charts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Download,
  DollarSign,
  TrendingUp,
  Calendar,
  Trophy,
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================

interface MonthlyRevenueData {
  [key: string]: unknown
  month: string
  revenue: number
}

interface PlatformData {
  name: string
  value: number
  color?: string
}

interface RevenuePayoutData {
  [key: string]: unknown
  month: string
  revenue: number
  payout: number
}

interface RevenueAnalyticsProps {
  propertyId: string
}

// ============================================================================
// Mock Data Generator (deterministic based on propertyId)
// ============================================================================

function generateMockData(propertyId: string) {
  // Simple hash to create consistent data per property
  const seed = propertyId.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const seededRandom = (i: number) => {
    const x = Math.sin(seed + i) * 10000
    return x - Math.floor(x)
  }

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]

  const monthlyRevenue: MonthlyRevenueData[] = months.map((month, i) => ({
    month,
    revenue: Math.floor(seededRandom(i) * 5000 + 8000),
  }))

  const platformBreakdown: PlatformData[] = [
    { name: "Airbnb", value: Math.floor(seededRandom(100) * 20000 + 35000), color: chartColors.primary },
    { name: "Booking.com", value: Math.floor(seededRandom(101) * 15000 + 20000), color: chartColors.cta },
    { name: "Direct", value: Math.floor(seededRandom(102) * 8000 + 8000), color: chartColors.success },
  ]

  const revenueVsPayout: RevenuePayoutData[] = months.slice(6).map((month, i) => ({
    month,
    revenue: Math.floor(seededRandom(i + 50) * 5000 + 12000),
    payout: Math.floor(seededRandom(i + 80) * 4000 + 9000),
  }))

  return { monthlyRevenue, platformBreakdown, revenueVsPayout }
}

// ============================================================================
// CSV Export Utility
// ============================================================================

function exportToCsv(
  monthlyRevenue: MonthlyRevenueData[],
  platformBreakdown: PlatformData[],
  revenueVsPayout: RevenuePayoutData[]
) {
  const lines: string[] = []

  // Monthly Revenue section
  lines.push("Monthly Revenue")
  lines.push("Month,Revenue")
  monthlyRevenue.forEach((d) => lines.push(`${d.month},${d.revenue}`))
  lines.push("")

  // Platform Breakdown section
  lines.push("Platform Breakdown")
  lines.push("Platform,Revenue")
  platformBreakdown.forEach((d) => lines.push(`${d.name},${d.value}`))
  lines.push("")

  // Revenue vs Payout section
  lines.push("Revenue vs Payout")
  lines.push("Month,Revenue,Payout")
  revenueVsPayout.forEach((d) => lines.push(`${d.month},${d.revenue},${d.payout}`))

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "revenue-analytics.csv"
  link.click()
  URL.revokeObjectURL(url)
}

// ============================================================================
// Top Earning Months Component
// ============================================================================

function TopEarningMonths({ data }: { data: MonthlyRevenueData[] }) {
  const sorted = [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 3)

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-amber-500" />
        <h3 className="font-heading font-semibold text-lg">Top Earning Months</h3>
      </div>
      <div className="space-y-3">
        {sorted.map((item, i) => {
          const maxRevenue = sorted[0].revenue
          const widthPercent = (item.revenue / maxRevenue) * 100

          return (
            <div key={item.month} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center gap-2">
                  <span className={
                    i === 0
                      ? "text-amber-500 font-bold"
                      : i === 1
                        ? "text-gray-400 font-bold"
                        : "text-amber-700 font-bold"
                  }>
                    #{i + 1}
                  </span>
                  {item.month}
                </span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(item.revenue)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor:
                      i === 0
                        ? chartColors.primary
                        : i === 1
                          ? chartColors.secondary
                          : chartColors.cta,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}

// ============================================================================
// Revenue Analytics Component
// ============================================================================

export function RevenueAnalytics({ propertyId }: RevenueAnalyticsProps) {
  const [dateRange, setDateRange] = useState("12months")

  const { monthlyRevenue, platformBreakdown, revenueVsPayout } = useMemo(
    () => generateMockData(propertyId),
    [propertyId]
  )

  // Computed metrics
  const totalRevenue = platformBreakdown.reduce((sum, p) => sum + p.value, 0)
  const monthlyAvg = Math.round(totalRevenue / 12)
  const avgPerNight = Math.round(monthlyAvg / 22) // ~22 booked nights/month average

  // Filter data based on date range
  const filteredMonthlyRevenue = useMemo(() => {
    switch (dateRange) {
      case "3months":
        return monthlyRevenue.slice(-3)
      case "6months":
        return monthlyRevenue.slice(-6)
      case "12months":
      default:
        return monthlyRevenue
    }
  }, [dateRange, monthlyRevenue])

  const handleExport = () => {
    exportToCsv(filteredMonthlyRevenue, platformBreakdown, revenueVsPayout)
  }

  return (
    <div className="space-y-6">
      {/* Header: Date Range + Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-heading font-semibold text-lg">Revenue Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Financial performance overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger variant="glass" className="w-[160px]">
              <Calendar className="h-4 w-4 mr-2 opacity-50" />
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent variant="glass">
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Monthly Revenue"
          value={monthlyAvg}
          prefix="$"
          trend="up"
          changePercent={8.5}
          icon={DollarSign}
          variant="glass"
        />
        <StatCard
          title="YTD Revenue"
          value={totalRevenue}
          prefix="$"
          trend="up"
          changePercent={12.3}
          icon={TrendingUp}
          variant="glass"
        />
        <StatCard
          title="Avg Per Night"
          value={avgPerNight}
          prefix="$"
          decimals={0}
          trend="up"
          changePercent={5.2}
          icon={Calendar}
          variant="glass"
        />
      </div>

      {/* Monthly Revenue Bar Chart */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-semibold text-lg">Monthly Revenue</h3>
            <p className="text-sm text-muted-foreground">
              {dateRange === "3months"
                ? "Last 3 months"
                : dateRange === "6months"
                  ? "Last 6 months"
                  : "Last 12 months"}
            </p>
          </div>
        </div>
        <ThemedBarChart
          data={filteredMonthlyRevenue}
          series={[
            {
              dataKey: "revenue",
              name: "Revenue",
              color: chartColors.primary,
            },
          ]}
          xAxisKey="month"
          height={300}
          yAxisFormatter={formatCurrency}
          tooltipFormatter={formatCurrency}
        />
      </GlassCard>

      {/* Platform Breakdown & Revenue vs Payout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="font-heading font-semibold text-lg mb-1">
            Platform Breakdown
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Revenue by booking platform
          </p>
          <ThemedPieChart
            data={platformBreakdown}
            height={280}
            showLegend={true}
            showLabels={true}
            donut={true}
            tooltipFormatter={(value: number) => formatCurrency(value)}
          />
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="font-heading font-semibold text-lg mb-1">
            Revenue vs Payout
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Last 6 months comparison
          </p>
          <ThemedLineChart
            data={revenueVsPayout}
            series={[
              {
                dataKey: "revenue",
                name: "Revenue",
                color: chartColors.primary,
              },
              {
                dataKey: "payout",
                name: "Payout",
                color: chartColors.cta,
              },
            ]}
            xAxisKey="month"
            height={280}
            showLegend={true}
            yAxisFormatter={formatCurrency}
            tooltipFormatter={formatCurrency}
          />
        </GlassCard>
      </div>

      {/* Top Earning Months */}
      <TopEarningMonths data={monthlyRevenue} />
    </div>
  )
}
