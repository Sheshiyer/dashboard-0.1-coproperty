"use client";

import * as React from "react";
import {
  LineChart as RechartsLineChart,
  AreaChart as RechartsAreaChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsJsPieChart,
  Line,
  Area,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { GlassCard } from "./glass";

// ============================================================================
// Chart Colors - Co.Property Design System
// ============================================================================

export const chartColors = {
  primary: "#0F766E", // property-primary (Teal 700)
  secondary: "#14B8A6", // property-secondary (Teal 500)
  cta: "#0369A1", // property-cta (Sky 700)
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  blue: "#3b82f6",
  purple: "#a855f7",
  indigo: "#6366f1",
  pink: "#ec4899",
  teal: "#14b8a6",
  cyan: "#06b6d4",
  orange: "#f97316",
} as const;

/** Ordered palette for multi-series charts */
export const chartPalette = [
  chartColors.primary,
  chartColors.cta,
  chartColors.success,
  chartColors.warning,
  chartColors.purple,
  chartColors.pink,
  chartColors.orange,
  chartColors.cyan,
  chartColors.indigo,
  chartColors.blue,
] as const;

export const gradientIds = {
  primary: "colorPrimary",
  secondary: "colorSecondary",
  cta: "colorCta",
  success: "colorSuccess",
  warning: "colorWarning",
  error: "colorError",
  blue: "colorBlue",
  purple: "colorPurple",
} as const;

// ============================================================================
// Type Definitions
// ============================================================================

export interface ChartContainerProps {
  /** Chart title displayed above the chart */
  title?: string;
  /** Description text below the title */
  description?: string;
  /** Show loading skeleton state */
  loading?: boolean;
  /** Show empty state */
  empty?: boolean;
  /** Custom message for empty state */
  emptyMessage?: string;
  /** Visual container variant */
  variant?: "default" | "glass";
  /** Chart area height in pixels */
  height?: number;
  /** Additional CSS classes */
  className?: string;
  /** Chart content */
  children: React.ReactNode;
}

/** A single series definition for multi-series charts */
export interface ChartSeries {
  /** Data key in the data objects */
  dataKey: string;
  /** Display name for legend/tooltip */
  name?: string;
  /** Line/area color */
  color?: string;
  /** Stroke width */
  strokeWidth?: number;
  /** Whether to show dots (LineChart only) */
  showDots?: boolean;
  /** Stroke dash array for dashed lines */
  strokeDasharray?: string;
}

export interface LineChartProps {
  /** Data array for the chart */
  data: Record<string, unknown>[];
  /** Single data key (simple mode) */
  dataKey?: string;
  /** Multiple series definitions (multi-series mode) */
  series?: ChartSeries[];
  /** X-axis data key */
  xAxisKey?: string;
  /** Line color (simple mode) */
  color?: string;
  /** Show grid lines */
  showGrid?: boolean;
  /** Show data point dots */
  showDots?: boolean;
  /** Line stroke width */
  strokeWidth?: number;
  /** Chart height in pixels */
  height?: number;
  /** Show legend */
  showLegend?: boolean;
  /** Y-axis label formatter */
  yAxisFormatter?: (value: number) => string;
  /** Tooltip value formatter */
  tooltipFormatter?: (value: number) => string;
  /** Additional CSS classes */
  className?: string;
}

export interface AreaChartProps {
  /** Data array for the chart */
  data: Record<string, unknown>[];
  /** Single data key (simple mode) */
  dataKey?: string;
  /** Multiple series definitions (multi-series mode) */
  series?: ChartSeries[];
  /** X-axis data key */
  xAxisKey?: string;
  /** Area color (simple mode) */
  color?: string;
  /** Apply gradient fill */
  gradient?: boolean;
  /** Show grid lines */
  showGrid?: boolean;
  /** Area stroke width */
  strokeWidth?: number;
  /** Chart height in pixels */
  height?: number;
  /** Show legend */
  showLegend?: boolean;
  /** Y-axis label formatter */
  yAxisFormatter?: (value: number) => string;
  /** Tooltip value formatter */
  tooltipFormatter?: (value: number) => string;
  /** Additional CSS classes */
  className?: string;
}

export interface BarChartProps {
  /** Data array for the chart */
  data: Record<string, unknown>[];
  /** Single data key (simple mode) */
  dataKey?: string;
  /** Multiple series definitions (multi-series mode) */
  series?: ChartSeries[];
  /** X-axis data key */
  xAxisKey?: string;
  /** Bar color (simple mode) */
  color?: string;
  /** Use horizontal bar layout */
  horizontal?: boolean;
  /** Show grid lines */
  showGrid?: boolean;
  /** Bar corner radius */
  radius?: [number, number, number, number];
  /** Chart height in pixels */
  height?: number;
  /** Show legend */
  showLegend?: boolean;
  /** Y-axis label formatter */
  yAxisFormatter?: (value: number) => string;
  /** Tooltip value formatter */
  tooltipFormatter?: (value: number) => string;
  /** Additional CSS classes */
  className?: string;
}

export interface PieChartProps {
  /** Data array with name, value, and optional color per entry */
  data: Array<{ name: string; value: number; color?: string }>;
  /** Override colors for each slice */
  colors?: string[];
  /** Show percentage labels on slices */
  showLabels?: boolean;
  /** Render as donut chart */
  donut?: boolean;
  /** Donut inner radius */
  innerRadius?: number;
  /** Outer radius */
  outerRadius?: number;
  /** Chart height in pixels */
  height?: number;
  /** Show legend below chart */
  showLegend?: boolean;
  /** Tooltip value formatter */
  tooltipFormatter?: (value: number) => string;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Chart Skeleton / Loading Component
// ============================================================================

interface ChartSkeletonProps {
  height: number;
  type?: "line" | "area" | "bar" | "pie";
}

const ChartSkeleton: React.FC<ChartSkeletonProps> = ({
  height,
  type = "line",
}) => {
  return (
    <div
      className="relative overflow-hidden rounded-lg"
      style={{ height: `${height}px` }}
      role="status"
      aria-label="Loading chart data"
    >
      {/* Animated shimmer background */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200/0 via-gray-200/50 dark:via-gray-700/50 to-gray-200/0 animate-shimmer bg-[length:200%_100%]" />

      {/* Skeleton shape based on type */}
      <div className="absolute inset-0 flex items-end p-4 gap-1">
        {type === "bar" && (
          <>
            {[40, 65, 50, 80, 60, 75, 45, 70].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-gray-200 dark:bg-gray-700/60 rounded-t-md transition-all"
                style={{ height: `${h}%` }}
              />
            ))}
          </>
        )}

        {type === "pie" && (
          <div className="flex items-center justify-center w-full h-full">
            <div className="w-40 h-40 rounded-full bg-gray-200 dark:bg-gray-700/60 border-8 border-gray-100 dark:border-gray-800" />
          </div>
        )}

        {(type === "line" || type === "area") && (
          <svg
            viewBox="0 0 200 80"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {type === "area" && (
              <path
                d="M0,60 Q25,40 50,45 T100,30 T150,35 T200,20 L200,80 L0,80 Z"
                className="fill-gray-200 dark:fill-gray-700/60"
              />
            )}
            <path
              d="M0,60 Q25,40 50,45 T100,30 T150,35 T200,20"
              className="stroke-gray-300 dark:stroke-gray-600"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {/* Axis placeholder lines */}
      <div className="absolute bottom-3 left-4 right-4 h-px bg-gray-200 dark:bg-gray-700" />
      <div className="absolute top-3 bottom-3 left-4 w-px bg-gray-200 dark:bg-gray-700" />

      {/* Loading text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-property-primary/30 border-t-property-primary rounded-full animate-spin" />
          <p className="text-xs text-gray-500 dark:text-gray-400 font-body">
            Loading chart...
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Custom Tooltip Component
// ============================================================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value?: number;
    name?: string;
    color?: string;
    dataKey?: string;
  }>;
  label?: string;
  formatter?: (value: number) => string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  formatter,
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-700/40 shadow-xl rounded-lg p-3 font-body">
      {label && (
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 font-heading">
          {label}
        </p>
      )}
      {payload.map((entry, index: number) => (
        <div key={`tooltip-item-${index}`} className="flex items-center gap-2 py-0.5">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {entry.name}:
          </span>
          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 ml-auto">
            {formatter && entry.value != null ? formatter(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// Styled Legend Renderer
// ============================================================================

interface StyledLegendProps {
  payload?: Array<{
    value: string;
    type?: string;
    id?: string;
    color?: string;
  }>;
}

const StyledLegend: React.FC<StyledLegendProps> = ({ payload }) => {
  if (!payload || payload.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-2">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs font-body text-gray-600 dark:text-gray-400">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// ChartContainer Component
// ============================================================================

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  ChartContainerProps
>(
  (
    {
      title,
      description,
      loading = false,
      empty = false,
      emptyMessage = "No data available",
      variant = "default",
      height = 300,
      className,
      children,
    },
    ref
  ) => {
    const Container = variant === "glass" ? GlassCard : "div";
    const containerProps =
      variant === "glass"
        ? { intensity: "medium" as const }
        : {
            className: cn(
              "rounded-xl border bg-card shadow-md",
              "border-gray-200 dark:border-gray-800"
            ),
          };

    return (
      <Container ref={ref} className={cn("p-6", className)} {...containerProps}>
        {/* Header */}
        {(title || description) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm font-body text-gray-600 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Loading Skeleton State */}
        {loading && <ChartSkeleton height={height} />}

        {/* Empty State */}
        {!loading && empty && (
          <div
            className="flex items-center justify-center"
            style={{ height: `${height}px` }}
          >
            <div className="flex flex-col items-center gap-3">
              <svg
                className="w-14 h-14 text-gray-300 dark:text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p className="text-sm font-body text-gray-500 dark:text-gray-400">
                {emptyMessage}
              </p>
            </div>
          </div>
        )}

        {/* Chart Content */}
        {!loading && !empty && children}
      </Container>
    );
  }
);

ChartContainer.displayName = "ChartContainer";

// ============================================================================
// ThemedLineChart Component (supports single + multi-series)
// ============================================================================

export const ThemedLineChart = React.forwardRef<HTMLDivElement, LineChartProps>(
  (
    {
      data,
      dataKey,
      series,
      xAxisKey = "name",
      color = chartColors.primary,
      showGrid = true,
      showDots = false,
      strokeWidth = 2,
      height = 300,
      showLegend = false,
      yAxisFormatter,
      tooltipFormatter,
      className,
    },
    ref
  ) => {
    // Resolve series: if explicit series provided, use those; otherwise build from dataKey
    const resolvedSeries: ChartSeries[] = series ?? [
      { dataKey: dataKey ?? "value", color, strokeWidth, showDots },
    ];

    // Auto-detect legend visibility: show if multi-series
    const legendVisible = showLegend || resolvedSeries.length > 1;

    return (
      <div ref={ref} className={className}>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsLineChart
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: legendVisible ? 20 : 5 }}
          >
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200 dark:stroke-gray-700"
                opacity={0.5}
              />
            )}
            <XAxis
              dataKey={xAxisKey}
              className="text-xs font-body"
              tick={{ fill: "currentColor", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              className="text-xs font-body"
              tick={{ fill: "currentColor", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={yAxisFormatter}
              width={50}
            />
            <Tooltip
              content={<CustomTooltip formatter={tooltipFormatter} />}
              cursor={{ stroke: resolvedSeries[0].color ?? color, strokeWidth: 1, opacity: 0.2 }}
            />
            {legendVisible && (
              <Legend content={<StyledLegend />} />
            )}
            {resolvedSeries.map((s, i) => {
              const seriesColor = s.color ?? chartPalette[i % chartPalette.length];
              return (
                <Line
                  key={s.dataKey}
                  type="monotone"
                  dataKey={s.dataKey}
                  name={s.name ?? s.dataKey}
                  stroke={seriesColor}
                  strokeWidth={s.strokeWidth ?? strokeWidth}
                  strokeDasharray={s.strokeDasharray}
                  dot={s.showDots ?? showDots}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: seriesColor, fill: "white" }}
                  animationDuration={800}
                  animationEasing="ease-in-out"
                />
              );
            })}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

ThemedLineChart.displayName = "ThemedLineChart";

// ============================================================================
// ThemedAreaChart Component (supports single + multi-series)
// ============================================================================

export const ThemedAreaChart = React.forwardRef<HTMLDivElement, AreaChartProps>(
  (
    {
      data,
      dataKey,
      series,
      xAxisKey = "name",
      color = chartColors.primary,
      gradient = true,
      showGrid = true,
      strokeWidth = 2,
      height = 300,
      showLegend = false,
      yAxisFormatter,
      tooltipFormatter,
      className,
    },
    ref
  ) => {
    const resolvedSeries: ChartSeries[] = series ?? [
      { dataKey: dataKey ?? "value", color, strokeWidth },
    ];

    const legendVisible = showLegend || resolvedSeries.length > 1;

    // Stable gradient IDs using dataKey
    const getGradientId = (key: string) => `area-gradient-${key}`;

    return (
      <div ref={ref} className={className}>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsAreaChart
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: legendVisible ? 20 : 5 }}
          >
            <defs>
              {resolvedSeries.map((s, i) => {
                const seriesColor = s.color ?? chartPalette[i % chartPalette.length];
                return (
                  <linearGradient
                    key={s.dataKey}
                    id={getGradientId(s.dataKey)}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={seriesColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={seriesColor} stopOpacity={0.02} />
                  </linearGradient>
                );
              })}
            </defs>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200 dark:stroke-gray-700"
                opacity={0.5}
              />
            )}
            <XAxis
              dataKey={xAxisKey}
              className="text-xs font-body"
              tick={{ fill: "currentColor", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              className="text-xs font-body"
              tick={{ fill: "currentColor", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={yAxisFormatter}
              width={50}
            />
            <Tooltip
              content={<CustomTooltip formatter={tooltipFormatter} />}
              cursor={{ stroke: resolvedSeries[0].color ?? color, strokeWidth: 1, opacity: 0.2 }}
            />
            {legendVisible && (
              <Legend content={<StyledLegend />} />
            )}
            {resolvedSeries.map((s, i) => {
              const seriesColor = s.color ?? chartPalette[i % chartPalette.length];
              return (
                <Area
                  key={s.dataKey}
                  type="monotone"
                  dataKey={s.dataKey}
                  name={s.name ?? s.dataKey}
                  stroke={seriesColor}
                  strokeWidth={s.strokeWidth ?? strokeWidth}
                  fill={gradient ? `url(#${getGradientId(s.dataKey)})` : seriesColor}
                  fillOpacity={gradient ? 1 : 0.15}
                  animationDuration={800}
                  animationEasing="ease-in-out"
                />
              );
            })}
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

ThemedAreaChart.displayName = "ThemedAreaChart";

// ============================================================================
// ThemedBarChart Component (supports single + multi-series)
// ============================================================================

export const ThemedBarChart = React.forwardRef<HTMLDivElement, BarChartProps>(
  (
    {
      data,
      dataKey,
      series,
      xAxisKey = "name",
      color = chartColors.primary,
      horizontal = false,
      showGrid = true,
      radius = [8, 8, 0, 0],
      height = 300,
      showLegend = false,
      yAxisFormatter,
      tooltipFormatter,
      className,
    },
    ref
  ) => {
    const resolvedSeries: ChartSeries[] = series ?? [
      { dataKey: dataKey ?? "value", color },
    ];

    const legendVisible = showLegend || resolvedSeries.length > 1;

    return (
      <div ref={ref} className={className}>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart
            data={data}
            layout={horizontal ? "vertical" : "horizontal"}
            margin={{ top: 5, right: 20, left: 10, bottom: legendVisible ? 20 : 5 }}
          >
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200 dark:stroke-gray-700"
                opacity={0.5}
              />
            )}
            {horizontal ? (
              <>
                <XAxis
                  type="number"
                  className="text-xs font-body"
                  tick={{ fill: "currentColor", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={yAxisFormatter}
                />
                <YAxis
                  type="category"
                  dataKey={xAxisKey}
                  className="text-xs font-body"
                  tick={{ fill: "currentColor", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey={xAxisKey}
                  className="text-xs font-body"
                  tick={{ fill: "currentColor", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  className="text-xs font-body"
                  tick={{ fill: "currentColor", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={yAxisFormatter}
                  width={50}
                />
              </>
            )}
            <Tooltip
              content={<CustomTooltip formatter={tooltipFormatter} />}
              cursor={{ fill: resolvedSeries[0].color ?? color, opacity: 0.08 }}
            />
            {legendVisible && (
              <Legend content={<StyledLegend />} />
            )}
            {resolvedSeries.map((s, i) => {
              const seriesColor = s.color ?? chartPalette[i % chartPalette.length];
              return (
                <Bar
                  key={s.dataKey}
                  dataKey={s.dataKey}
                  name={s.name ?? s.dataKey}
                  fill={seriesColor}
                  radius={radius}
                  animationDuration={800}
                  animationEasing="ease-in-out"
                />
              );
            })}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

ThemedBarChart.displayName = "ThemedBarChart";

// ============================================================================
// ThemedPieChart Component
// ============================================================================

export const ThemedPieChart = React.forwardRef<HTMLDivElement, PieChartProps>(
  (
    {
      data,
      colors = [
        chartColors.primary,
        chartColors.cta,
        chartColors.success,
        chartColors.warning,
        chartColors.purple,
        chartColors.pink,
      ],
      showLabels = true,
      donut = false,
      innerRadius = 0,
      outerRadius = 80,
      height = 300,
      showLegend = true,
      tooltipFormatter,
      className,
    },
    ref
  ) => {
    // Calculate total for percentage labels
    const total = data.reduce((sum, d) => sum + d.value, 0);

    const renderLabel = (entry: { value: number }) => {
      if (total === 0) return "0%";
      const percent = ((entry.value / total) * 100).toFixed(0);
      return `${percent}%`;
    };

    return (
      <div ref={ref} className={className}>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsJsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={showLabels}
              label={showLabels ? renderLabel : false}
              outerRadius={outerRadius}
              innerRadius={donut ? innerRadius || outerRadius * 0.6 : 0}
              fill="#8884d8"
              dataKey="value"
              animationDuration={800}
              animationEasing="ease-out"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              content={<CustomTooltip formatter={tooltipFormatter} />}
            />
            {showLegend && (
              <Legend content={<StyledLegend />} />
            )}
          </RechartsJsPieChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

ThemedPieChart.displayName = "ThemedPieChart";

// ============================================================================
// Utility Functions
// ============================================================================

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(0)}%`;
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("en-US").format(value);
};

export const formatCompactNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

// ============================================================================
// Export All
// ============================================================================

const ChartComponents = {
  ChartContainer,
  ChartSkeleton,
  ThemedLineChart,
  ThemedAreaChart,
  ThemedBarChart,
  ThemedPieChart,
  chartColors,
  chartPalette,
  formatCurrency,
  formatPercentage,
  formatNumber,
  formatCompactNumber,
};

export default ChartComponents;
