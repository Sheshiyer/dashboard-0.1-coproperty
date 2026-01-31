"use client"

import { GlassCard } from "@/components/ui/glass"
import { StatCard } from "@/components/ui/stat-card"
import {
  ThemedAreaChart,
  ThemedBarChart,
  ThemedPieChart,
  chartColors,
} from "@/components/ui/charts"
import { Percent, TrendingUp, Calendar, Clock } from "lucide-react"

// ============================================================================
// Mock Data Generators (deterministic for consistent SSR/CSR)
// ============================================================================

function generateOccupancyTrend() {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]
  // Deterministic rates that follow a realistic seasonal pattern
  const rates = [72, 68, 74, 78, 85, 92, 95, 93, 88, 82, 76, 80]
  return months.map((month, i) => ({
    month,
    rate: rates[i],
  }))
}

function generateStayDurationDistribution() {
  return [
    { name: "1-2 nights", value: 45, color: chartColors.primary },
    { name: "3-5 nights", value: 68, color: chartColors.secondary },
    { name: "6-7 nights", value: 32, color: chartColors.cta },
    { name: "8+ nights", value: 15, color: chartColors.success },
  ]
}

function generateDayOfWeekBookings() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  // Deterministic values reflecting typical booking patterns (weekends heavier)
  const bookings = [24, 12, 14, 16, 18, 28, 30]
  return days.map((day, i) => ({
    day,
    bookings: bookings[i],
  }))
}

function generateLeadTimeData() {
  return [
    { range: "0-7 days", count: 22 },
    { range: "8-14 days", count: 35 },
    { range: "15-30 days", count: 48 },
    { range: "31-60 days", count: 38 },
    { range: "61-90 days", count: 25 },
    { range: "90+ days", count: 12 },
  ]
}

// ============================================================================
// OccupancyAnalytics Component
// ============================================================================

interface OccupancyAnalyticsProps {
  propertyId: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function OccupancyAnalytics({ propertyId: _propertyId }: OccupancyAnalyticsProps) {
  const occupancyTrend = generateOccupancyTrend()
  const stayDuration = generateStayDurationDistribution()
  const dayOfWeekBookings = generateDayOfWeekBookings()
  const leadTimeData = generateLeadTimeData()

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Month"
          value={87.5}
          suffix="%"
          decimals={1}
          trend="up"
          changePercent={5.2}
          icon={Percent}
          variant="glass"
        />
        <StatCard
          title="Last 30 Days"
          value={82.3}
          suffix="%"
          decimals={1}
          trend="up"
          changePercent={3.1}
          icon={TrendingUp}
          variant="glass"
        />
        <StatCard
          title="YTD Average"
          value={78.9}
          suffix="%"
          decimals={1}
          trend="up"
          changePercent={8.4}
          icon={Calendar}
          variant="glass"
        />
        <StatCard
          title="Avg Stay Duration"
          value={4.2}
          suffix=" nights"
          decimals={1}
          trend="neutral"
          icon={Clock}
          variant="glass"
        />
      </div>

      {/* Occupancy Rate Trend - 12 Month Area Chart */}
      <GlassCard className="p-6">
        <h3 className="font-heading font-semibold text-lg mb-4 text-foreground">
          Occupancy Rate Trend
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Monthly occupancy rate over the past 12 months
        </p>
        <ThemedAreaChart
          data={occupancyTrend}
          series={[
            {
              dataKey: "rate",
              name: "Occupancy Rate",
              color: chartColors.primary,
            },
          ]}
          xAxisKey="month"
          height={300}
          gradient={true}
          yAxisFormatter={(v: number) => `${v}%`}
          tooltipFormatter={(v: number) => `${v}%`}
        />
      </GlassCard>

      {/* Stay Duration Distribution + Day of Week Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="font-heading font-semibold text-lg mb-4 text-foreground">
            Stay Duration Distribution
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Breakdown of bookings by length of stay
          </p>
          <ThemedPieChart
            data={stayDuration}
            height={300}
            showLegend={true}
            showLabels={true}
            donut={true}
            outerRadius={90}
          />
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="font-heading font-semibold text-lg mb-4 text-foreground">
            Bookings by Day of Week
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Check-in distribution across days of the week
          </p>
          <ThemedBarChart
            data={dayOfWeekBookings}
            series={[
              {
                dataKey: "bookings",
                name: "Bookings",
                color: chartColors.secondary,
              },
            ]}
            xAxisKey="day"
            height={300}
          />
        </GlassCard>
      </div>

      {/* Booking Lead Time Analysis */}
      <GlassCard className="p-6">
        <h3 className="font-heading font-semibold text-lg mb-4 text-foreground">
          Booking Lead Time Analysis
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          How far in advance guests book their stays
        </p>
        <ThemedBarChart
          data={leadTimeData}
          series={[
            {
              dataKey: "count",
              name: "Bookings",
              color: chartColors.cta,
            },
          ]}
          xAxisKey="range"
          height={280}
          tooltipFormatter={(v: number) => `${v} bookings`}
        />
      </GlassCard>
    </div>
  )
}
