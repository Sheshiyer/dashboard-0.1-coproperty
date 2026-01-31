"use client";

import * as React from "react";
import {
  ChartContainer,
  ThemedLineChart,
  ThemedAreaChart,
  ThemedBarChart,
  ThemedPieChart,
  chartColors,
  formatCurrency,
  formatPercentage,
  formatCompactNumber,
} from "./charts";
import type { ChartSeries } from "./charts";

// ============================================================================
// Realistic Dashboard Data (Phase 7 Integration)
// ============================================================================

// -- Occupancy rate data (30-day view for Phase 7 AreaChart)
const occupancyData30Days = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const base = 78 + Math.sin(day * 0.3) * 12 + Math.random() * 5;
  return {
    day: `Jan ${day}`,
    rate: Math.round(Math.min(100, Math.max(50, base))),
  };
});

// -- Revenue vs Payout data (monthly, for Phase 7 LineChart)
const revenuePayoutData = [
  { month: "Jul", revenue: 45200, payout: 38900 },
  { month: "Aug", revenue: 52100, payout: 44800 },
  { month: "Sep", revenue: 48700, payout: 41500 },
  { month: "Oct", revenue: 61300, payout: 52700 },
  { month: "Nov", revenue: 55800, payout: 47200 },
  { month: "Dec", revenue: 67400, payout: 58100 },
  { month: "Jan", revenue: 72100, payout: 62300 },
];

// -- Property performance data (for Phase 7 BarChart)
const propertyPerformanceData = [
  { name: "Sunset Villa", revenue: 18500, bookings: 12, avgNightlyRate: 285 },
  { name: "Ocean View", revenue: 15200, bookings: 10, avgNightlyRate: 310 },
  { name: "Mountain Lodge", revenue: 12800, bookings: 8, avgNightlyRate: 245 },
  { name: "City Loft", revenue: 9500, bookings: 14, avgNightlyRate: 165 },
  { name: "Beach House", revenue: 16700, bookings: 11, avgNightlyRate: 295 },
  { name: "Lake Cabin", revenue: 8200, bookings: 6, avgNightlyRate: 220 },
];

// -- Booking source distribution (for Phase 7 PieChart)
const bookingSourceData = [
  { name: "Airbnb", value: 42 },
  { name: "Booking.com", value: 28 },
  { name: "VRBO", value: 16 },
  { name: "Direct", value: 9 },
  { name: "Other", value: 5 },
];

// -- Additional realistic data
const weeklyBookingsData = [
  { day: "Mon", bookings: 8 },
  { day: "Tue", bookings: 12 },
  { day: "Wed", bookings: 15 },
  { day: "Thu", bookings: 18 },
  { day: "Fri", bookings: 25 },
  { day: "Sat", bookings: 32 },
  { day: "Sun", bookings: 22 },
];

const guestDemographicsData = [
  { name: "Families", value: 38 },
  { name: "Couples", value: 32 },
  { name: "Solo Travelers", value: 18 },
  { name: "Business", value: 12 },
];

// ============================================================================
// Phase 7 Integration Examples
// ============================================================================

/**
 * Occupancy Rate Area Chart (30 days)
 * Phase 7 Dashboard - Main occupancy metric
 */
export function OccupancyRateAreaChart() {
  return (
    <ChartContainer
      title="Occupancy Rate"
      description="30-day occupancy trend across all properties"
      variant="glass"
    >
      <ThemedAreaChart
        data={occupancyData30Days}
        dataKey="rate"
        xAxisKey="day"
        color={chartColors.primary}
        gradient={true}
        showGrid={true}
        strokeWidth={2}
        height={280}
        yAxisFormatter={formatPercentage}
        tooltipFormatter={(v) => `${v}%`}
      />
    </ChartContainer>
  );
}

/**
 * Revenue vs Payout Line Chart (multi-series)
 * Phase 7 Dashboard - Revenue comparison metric
 */
export function RevenuePayoutLineChart() {
  const series: ChartSeries[] = [
    { dataKey: "revenue", name: "Revenue", color: chartColors.primary, strokeWidth: 2.5 },
    { dataKey: "payout", name: "Payout", color: chartColors.cta, strokeWidth: 2, strokeDasharray: "5 5" },
  ];

  return (
    <ChartContainer
      title="Revenue vs Payout"
      description="Monthly revenue and payout comparison"
      variant="glass"
    >
      <ThemedLineChart
        data={revenuePayoutData}
        series={series}
        xAxisKey="month"
        showGrid={true}
        height={280}
        yAxisFormatter={formatCompactNumber}
        tooltipFormatter={formatCurrency}
      />
    </ChartContainer>
  );
}

/**
 * Property Performance Bar Chart
 * Phase 7 Dashboard - Property comparison
 */
export function PropertyPerformanceBarChart() {
  return (
    <ChartContainer
      title="Property Performance"
      description="Monthly revenue by property"
      variant="glass"
    >
      <ThemedBarChart
        data={propertyPerformanceData}
        dataKey="revenue"
        xAxisKey="name"
        color={chartColors.cta}
        showGrid={true}
        radius={[6, 6, 0, 0]}
        height={320}
        yAxisFormatter={formatCompactNumber}
        tooltipFormatter={formatCurrency}
      />
    </ChartContainer>
  );
}

/**
 * Booking Source Pie Chart
 * Phase 7 Dashboard - Source distribution
 */
export function BookingSourcePieChart() {
  return (
    <ChartContainer
      title="Booking Sources"
      description="Distribution of bookings by platform"
      variant="glass"
    >
      <ThemedPieChart
        data={bookingSourceData}
        colors={[
          chartColors.primary,
          chartColors.cta,
          chartColors.success,
          chartColors.warning,
          chartColors.purple,
        ]}
        showLabels={true}
        donut={true}
        innerRadius={55}
        outerRadius={90}
        height={320}
        tooltipFormatter={(v) => `${v} bookings`}
      />
    </ChartContainer>
  );
}

// ============================================================================
// Multi-Series Examples
// ============================================================================

/**
 * Multi-series bar chart comparing revenue and bookings
 */
export function MultiSeriesBarChartExample() {
  const series: ChartSeries[] = [
    { dataKey: "revenue", name: "Revenue ($)", color: chartColors.primary },
    { dataKey: "bookings", name: "Bookings", color: chartColors.warning },
  ];

  return (
    <ChartContainer
      title="Revenue & Bookings by Property"
      description="Comparing revenue and booking counts side by side"
      variant="glass"
    >
      <ThemedBarChart
        data={propertyPerformanceData.slice(0, 5)}
        series={series}
        xAxisKey="name"
        showGrid={true}
        radius={[4, 4, 0, 0]}
        height={320}
      />
    </ChartContainer>
  );
}

/**
 * Multi-series area chart with overlapping series
 */
export function MultiSeriesAreaChartExample() {
  const series: ChartSeries[] = [
    { dataKey: "revenue", name: "Revenue", color: chartColors.primary, strokeWidth: 2 },
    { dataKey: "payout", name: "Payout", color: chartColors.success, strokeWidth: 2 },
  ];

  return (
    <ChartContainer
      title="Revenue & Payout Trend"
      description="Monthly revenue overlaid with payout amounts"
      variant="glass"
    >
      <ThemedAreaChart
        data={revenuePayoutData}
        series={series}
        xAxisKey="month"
        gradient={true}
        showGrid={true}
        height={280}
        yAxisFormatter={formatCompactNumber}
        tooltipFormatter={formatCurrency}
      />
    </ChartContainer>
  );
}

// ============================================================================
// State Examples
// ============================================================================

/**
 * Loading skeleton states for each chart type
 */
export function LoadingSkeletonExamples() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartContainer
        title="Area Chart Loading"
        loading={true}
        variant="glass"
        height={200}
      >
        <div />
      </ChartContainer>

      <ChartContainer
        title="Bar Chart Loading"
        loading={true}
        variant="default"
        height={200}
      >
        <div />
      </ChartContainer>

      <ChartContainer
        title="Line Chart Loading"
        loading={true}
        variant="glass"
        height={200}
      >
        <div />
      </ChartContainer>

      <ChartContainer
        title="Empty State"
        empty={true}
        emptyMessage="No bookings data for this period"
        variant="default"
        height={200}
      >
        <div />
      </ChartContainer>
    </div>
  );
}

// ============================================================================
// Widget Examples (compact dashboard cards)
// ============================================================================

/**
 * Small dashboard widget charts for stat cards
 */
export function DashboardWidgetExamples() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ChartContainer title="Revenue Trend" variant="glass">
        <ThemedAreaChart
          data={revenuePayoutData}
          dataKey="revenue"
          xAxisKey="month"
          color={chartColors.primary}
          gradient={true}
          showGrid={false}
          strokeWidth={2}
          height={140}
          tooltipFormatter={formatCurrency}
        />
      </ChartContainer>

      <ChartContainer title="Occupancy" variant="glass">
        <ThemedLineChart
          data={occupancyData30Days.filter((_, i) => i % 3 === 0)}
          dataKey="rate"
          xAxisKey="day"
          color={chartColors.success}
          showGrid={false}
          showDots={false}
          strokeWidth={2}
          height={140}
          tooltipFormatter={(v) => `${v}%`}
        />
      </ChartContainer>

      <ChartContainer title="This Week" variant="glass">
        <ThemedBarChart
          data={weeklyBookingsData}
          dataKey="bookings"
          xAxisKey="day"
          color={chartColors.cta}
          showGrid={false}
          radius={[4, 4, 0, 0]}
          height={140}
          tooltipFormatter={(v) => `${v} bookings`}
        />
      </ChartContainer>
    </div>
  );
}

// ============================================================================
// Full Dashboard Layout (Phase 7 Preview)
// ============================================================================

/**
 * Complete dashboard layout showing all chart types together
 * This is a preview of the Phase 7 dashboard integration
 */
export function FullDashboardExample() {
  return (
    <div className="space-y-6">
      {/* Top Row: Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OccupancyRateAreaChart />
        <RevenuePayoutLineChart />
      </div>

      {/* Middle Row: Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PropertyPerformanceBarChart />
        </div>
        <BookingSourcePieChart />
      </div>

      {/* Bottom Row: Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartContainer
          title="Guest Demographics"
          description="Visitor type breakdown"
          variant="glass"
        >
          <ThemedPieChart
            data={guestDemographicsData}
            colors={[chartColors.purple, chartColors.cta, chartColors.cyan, chartColors.orange]}
            showLabels={true}
            donut={true}
            innerRadius={50}
            outerRadius={85}
            height={280}
            tooltipFormatter={(v) => `${v}%`}
          />
        </ChartContainer>

        <ChartContainer
          title="Weekly Booking Pattern"
          description="Average bookings by day of week"
          variant="glass"
        >
          <ThemedBarChart
            data={weeklyBookingsData}
            dataKey="bookings"
            xAxisKey="day"
            color={chartColors.indigo}
            showGrid={true}
            radius={[6, 6, 0, 0]}
            height={280}
            tooltipFormatter={(v) => `${v} bookings`}
          />
        </ChartContainer>
      </div>
    </div>
  );
}

// ============================================================================
// Horizontal Bar Chart Example
// ============================================================================

export function HorizontalBarChartExample() {
  return (
    <ChartContainer
      title="Top Properties by Bookings"
      description="Total bookings per property this month"
      variant="default"
    >
      <ThemedBarChart
        data={propertyPerformanceData}
        dataKey="bookings"
        xAxisKey="name"
        color={chartColors.secondary}
        horizontal={true}
        showGrid={true}
        radius={[0, 6, 6, 0]}
        height={320}
        tooltipFormatter={(v) => `${v} bookings`}
      />
    </ChartContainer>
  );
}

// ============================================================================
// Custom Color Example
// ============================================================================

export function CustomColorChartExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ChartContainer title="Brand Primary" variant="glass">
        <ThemedLineChart
          data={revenuePayoutData}
          dataKey="revenue"
          xAxisKey="month"
          color="#0F766E"
          showGrid={false}
          strokeWidth={3}
          height={180}
          tooltipFormatter={formatCurrency}
        />
      </ChartContainer>

      <ChartContainer title="CTA Blue" variant="glass">
        <ThemedAreaChart
          data={occupancyData30Days.filter((_, i) => i % 3 === 0)}
          dataKey="rate"
          xAxisKey="day"
          color="#0369A1"
          gradient={true}
          showGrid={false}
          height={180}
          tooltipFormatter={(v) => `${v}%`}
        />
      </ChartContainer>

      <ChartContainer title="Success Green" variant="glass">
        <ThemedBarChart
          data={weeklyBookingsData}
          dataKey="bookings"
          xAxisKey="day"
          color="#10b981"
          showGrid={false}
          radius={[6, 6, 0, 0]}
          height={180}
        />
      </ChartContainer>
    </div>
  );
}

// ============================================================================
// Export All Examples
// ============================================================================

const ChartExamples = {
  // Phase 7 Integration
  OccupancyRateAreaChart,
  RevenuePayoutLineChart,
  PropertyPerformanceBarChart,
  BookingSourcePieChart,
  // Multi-series
  MultiSeriesBarChartExample,
  MultiSeriesAreaChartExample,
  // States
  LoadingSkeletonExamples,
  // Widgets
  DashboardWidgetExamples,
  // Layouts
  FullDashboardExample,
  HorizontalBarChartExample,
  CustomColorChartExample,
};

export default ChartExamples;
