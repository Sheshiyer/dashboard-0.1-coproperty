"use client";

/**
 * StatCard Component Examples
 * Task: P6-S8-07 - Animated Stat Cards with Sparklines
 *
 * Showcases all features: animated counters, sparklines, trends, MoM, glass variant, loading states.
 */

import {
  StatCard,
  AnimatedNumber,
  Sparkline,
  type SparklineDataPoint,
} from "./stat-card";
import {
  DollarSign,
  Home,
  CalendarCheck,
  Users,
  Percent,
  Star,
  Activity,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

// ============================================================================
// Sample Sparkline Data
// ============================================================================

const revenueSparkline: SparklineDataPoint[] = [
  { value: 4200 },
  { value: 4800 },
  { value: 4600 },
  { value: 5100 },
  { value: 5400 },
  { value: 5200 },
  { value: 5800 },
  { value: 6100 },
  { value: 5900 },
  { value: 6400 },
  { value: 6800 },
  { value: 7200 },
];

const occupancySparkline: SparklineDataPoint[] = [
  { value: 78 },
  { value: 82 },
  { value: 85 },
  { value: 80 },
  { value: 88 },
  { value: 92 },
  { value: 90 },
  { value: 87 },
  { value: 91 },
  { value: 93 },
  { value: 89 },
  { value: 94 },
];

const bookingsSparkline: SparklineDataPoint[] = [
  { value: 12 },
  { value: 15 },
  { value: 18 },
  { value: 14 },
  { value: 22 },
  { value: 19 },
  { value: 25 },
  { value: 28 },
  { value: 24 },
  { value: 30 },
  { value: 27 },
  { value: 32 },
];

const guestsSparkline: SparklineDataPoint[] = [
  { value: 45 },
  { value: 52 },
  { value: 48 },
  { value: 55 },
  { value: 60 },
  { value: 58 },
  { value: 63 },
  { value: 67 },
  { value: 65 },
  { value: 70 },
  { value: 72 },
  { value: 75 },
];

const declineSparkline: SparklineDataPoint[] = [
  { value: 95 },
  { value: 90 },
  { value: 88 },
  { value: 85 },
  { value: 82 },
  { value: 78 },
  { value: 75 },
  { value: 72 },
  { value: 70 },
  { value: 68 },
  { value: 65 },
  { value: 62 },
];

const ratingSparkline: SparklineDataPoint[] = [
  { value: 4.2 },
  { value: 4.3 },
  { value: 4.1 },
  { value: 4.4 },
  { value: 4.5 },
  { value: 4.6 },
  { value: 4.5 },
  { value: 4.7 },
  { value: 4.6 },
  { value: 4.8 },
  { value: 4.7 },
  { value: 4.8 },
];

// ============================================================================
// Example 1: Default Variant Dashboard Row
// ============================================================================

export function StatCardDefaultExamples() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-heading font-semibold">
        1. Default Variant - Full Dashboard Row
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          formatValue={(v) =>
            v.toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
          }
        />
        <StatCard
          title="Occupancy Rate"
          value={94}
          suffix="%"
          trend="up"
          changePercent={5.3}
          momValue="+4.2%"
          momLabel="vs last month"
          sparklineData={occupancySparkline}
          icon={Home}
        />
        <StatCard
          title="Bookings"
          value={32}
          trend="up"
          changePercent={18.5}
          momValue="+5"
          momLabel="vs last month"
          sparklineData={bookingsSparkline}
          icon={CalendarCheck}
        />
        <StatCard
          title="Active Guests"
          value={75}
          trend="up"
          changePercent={7.1}
          momValue="+5"
          momLabel="vs last month"
          sparklineData={guestsSparkline}
          icon={Users}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Example 2: Glass Variant Dashboard Row
// ============================================================================

export function StatCardGlassExamples() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-heading font-semibold">
        2. Glass Variant - Premium Dashboard Row
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          variant="glass"
          title="Total Revenue"
          value={72400}
          prefix="$"
          trend="up"
          changePercent={12.5}
          momValue="+$8,200"
          momLabel="vs last month"
          sparklineData={revenueSparkline}
          icon={DollarSign}
          formatValue={(v) =>
            v.toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
          }
        />
        <StatCard
          variant="glass"
          title="Occupancy Rate"
          value={94}
          suffix="%"
          trend="up"
          changePercent={5.3}
          momValue="+4.2%"
          momLabel="vs last month"
          sparklineData={occupancySparkline}
          icon={Home}
        />
        <StatCard
          variant="glass"
          title="Bookings"
          value={32}
          trend="up"
          changePercent={18.5}
          momValue="+5"
          momLabel="vs last month"
          sparklineData={bookingsSparkline}
          icon={CalendarCheck}
        />
        <StatCard
          variant="glass"
          title="Active Guests"
          value={75}
          trend="up"
          changePercent={7.1}
          sparklineData={guestsSparkline}
          icon={Users}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Example 3: Mixed Trends (Up, Down, Neutral)
// ============================================================================

export function StatCardTrendExamples() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-heading font-semibold">
        3. Mixed Trends - Up, Down, and Neutral
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Revenue Growth"
          value={12.5}
          suffix="%"
          decimals={1}
          trend="up"
          changePercent={12.5}
          momValue="+3.2%"
          momLabel="vs last month"
          sparklineData={revenueSparkline}
          icon={Percent}
        />
        <StatCard
          title="Cancellation Rate"
          value={62}
          suffix="%"
          trend="down"
          changePercent={-8.3}
          momValue="-5.1%"
          momLabel="vs last month"
          sparklineData={declineSparkline}
          sparklineColor="#ef4444"
          icon={Percent}
        />
        <StatCard
          title="Guest Rating"
          value={4.8}
          decimals={1}
          trend="up"
          changePercent={2.1}
          momValue="+0.1"
          momLabel="vs last month"
          sparklineData={ratingSparkline}
          icon={Star}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Example 4: Size Variants
// ============================================================================

export function StatCardSizeExamples() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-heading font-semibold">
        4. Size Variants - sm, md, lg
      </h3>
      <div className="flex flex-col gap-4 max-w-md">
        <StatCard
          size="sm"
          title="Small Card"
          value={1234}
          trend="up"
          changePercent={5.0}
          sparklineData={revenueSparkline}
        />
        <StatCard
          size="md"
          title="Medium Card (Default)"
          value={5678}
          trend="up"
          changePercent={8.2}
          sparklineData={occupancySparkline}
          icon={Home}
        />
        <StatCard
          size="lg"
          title="Large Card"
          value={91011}
          prefix="$"
          trend="up"
          changePercent={15.7}
          momValue="+$12,300"
          momLabel="vs last month"
          sparklineData={bookingsSparkline}
          icon={DollarSign}
          formatValue={(v) => v.toLocaleString("en-US")}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Example 5: Loading Skeleton States
// ============================================================================

export function StatCardLoadingExamples() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-heading font-semibold">
        5. Loading Skeleton States
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard loading title="" value={0} />
        <StatCard loading variant="glass" title="" value={0} />
        <StatCard loading size="sm" title="" value={0} />
        <StatCard loading size="lg" title="" value={0} />
      </div>
    </div>
  );
}

// ============================================================================
// Example 6: No Sparkline (Value + Trend Only)
// ============================================================================

export function StatCardMinimalExamples() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-heading font-semibold">
        6. Minimal - Value and Trend Only (No Sparkline)
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Properties"
          value={24}
          trend="up"
          changePercent={4.2}
          icon={Home}
        />
        <StatCard
          title="Revenue"
          value={54200}
          prefix="$"
          trend="up"
          changePercent={11.8}
          icon={DollarSign}
          formatValue={(v) => v.toLocaleString("en-US")}
        />
        <StatCard
          title="Guests"
          value={187}
          trend="down"
          changePercent={-3.1}
          icon={Users}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Example 7: Custom Styling with Alert Borders
// ============================================================================

export function StatCardCustomStylingExamples() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-heading font-semibold">
        7. Custom Styling - Alert Borders
      </h3>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Urgent Maintenance"
          value={8}
          trend="down"
          changePercent={-33.3}
          momValue="-4"
          momLabel="vs last week"
          sparklineData={declineSparkline}
          sparklineColor="#ef4444"
          className="border-l-4 border-l-error-500"
          icon={AlertCircle}
        />
        <StatCard
          title="Completed Tasks"
          value={127}
          trend="up"
          changePercent={42.7}
          momValue="+38"
          momLabel="this month"
          sparklineData={bookingsSparkline}
          className="border-l-4 border-l-success-500"
          icon={CheckCircle}
        />
        <StatCard
          title="In Progress"
          value={34}
          trend="up"
          changePercent={6.2}
          momValue="+2"
          momLabel="vs last week"
          sparklineData={guestsSparkline}
          className="border-l-4 border-l-warning-500"
          icon={Activity}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Example 8: Standalone Subcomponents
// ============================================================================

export function StandaloneSubcomponentExamples() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-heading font-semibold">
        8. Standalone Subcomponents
      </h3>

      {/* AnimatedNumber standalone */}
      <div className="space-y-3 p-6 border rounded-xl">
        <p className="text-sm font-medium text-muted-foreground">AnimatedNumber</p>
        <div className="flex gap-8">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Plain counter</p>
            <AnimatedNumber
              value={12345}
              className="text-3xl font-heading font-bold"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Currency</p>
            <AnimatedNumber
              value={99750.5}
              decimals={2}
              prefix="$"
              className="text-3xl font-heading font-bold text-success-600"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Percentage</p>
            <AnimatedNumber
              value={94.7}
              decimals={1}
              suffix="%"
              className="text-3xl font-heading font-bold text-property-secondary"
            />
          </div>
        </div>
      </div>

      {/* Sparkline standalone */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-2">Teal (default)</p>
          <Sparkline data={revenueSparkline} height={60} />
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-2">Success green</p>
          <Sparkline data={occupancySparkline} color="#10b981" height={60} />
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-2">Error red</p>
          <Sparkline data={declineSparkline} color="#ef4444" height={60} />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Combined Examples Page
// ============================================================================

export function StatCardExamples() {
  return (
    <div className="space-y-10 p-8">
      <div>
        <h2 className="text-2xl font-heading font-bold mb-2">
          StatCard Component Examples
        </h2>
        <p className="text-muted-foreground">
          Animated stat cards with sparklines, trend indicators, and MoM comparison for dashboard metrics.
        </p>
      </div>

      <StatCardDefaultExamples />
      <StatCardGlassExamples />
      <StatCardTrendExamples />
      <StatCardSizeExamples />
      <StatCardLoadingExamples />
      <StatCardMinimalExamples />
      <StatCardCustomStylingExamples />
      <StandaloneSubcomponentExamples />
    </div>
  );
}

// ============================================================================
// Dashboard Stats Section (Real-World Usage Pattern)
// ============================================================================

export function DashboardStatsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">Overview</h2>
        <p className="text-muted-foreground">
          Key metrics for your property portfolio
        </p>
      </div>

      {/* Primary Stats - Glass Variant with Sparklines */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          variant="glass"
          title="Total Revenue"
          value={124500}
          prefix="$"
          trend="up"
          changePercent={12.5}
          momValue="+$13,200"
          momLabel="vs last month"
          sparklineData={revenueSparkline}
          icon={DollarSign}
          formatValue={(v) => v.toLocaleString("en-US")}
        />
        <StatCard
          variant="glass"
          title="Active Properties"
          value={156}
          trend="up"
          changePercent={5.2}
          momValue="+8"
          momLabel="vs last month"
          sparklineData={occupancySparkline}
          icon={Home}
        />
        <StatCard
          variant="glass"
          title="Occupancy Rate"
          value={95.8}
          suffix="%"
          decimals={1}
          trend="up"
          changePercent={2.1}
          momValue="+2.1%"
          momLabel="vs last month"
          sparklineData={occupancySparkline}
          icon={CheckCircle}
        />
        <StatCard
          variant="glass"
          title="Total Guests"
          value={432}
          trend="up"
          changePercent={3.8}
          momValue="+16"
          momLabel="vs last month"
          sparklineData={guestsSparkline}
          icon={Users}
        />
      </div>

      {/* Secondary Stats - Default Variant, No Sparklines */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          size="sm"
          title="Collection Rate"
          value={98.5}
          suffix="%"
          decimals={1}
          trend="up"
          changePercent={1.2}
          icon={CheckCircle}
        />
        <StatCard
          size="sm"
          title="Avg Nightly Rate"
          value={185}
          prefix="$"
          trend="up"
          changePercent={4.5}
          icon={DollarSign}
        />
        <StatCard
          size="sm"
          title="Maintenance Requests"
          value={47}
          trend="down"
          changePercent={-12.3}
          icon={AlertCircle}
        />
        <StatCard
          size="sm"
          title="Active Bookings"
          value={1089}
          trend="up"
          changePercent={6.4}
          icon={Activity}
        />
      </div>
    </div>
  );
}
