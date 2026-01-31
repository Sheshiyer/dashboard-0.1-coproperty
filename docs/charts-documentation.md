# Chart Components Documentation

## Overview

The chart components provide reusable, themed wrappers around Recharts with full integration into the Co.Property design system. All charts support light/dark mode, glass morphism effects, responsive layouts, multi-series data, and skeleton loading states.

**File:** `/src/components/ui/charts.tsx`
**Examples:** `/src/components/ui/charts.examples.tsx`

## Installation

Recharts is already installed as a dependency:

```json
{
  "dependencies": {
    "recharts": "^3.7.0"
  }
}
```

---

## Components

### ChartContainer

A wrapper component that provides consistent styling, loading skeletons, empty states, and optional glass effects for all charts.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string?` | - | Chart title |
| `description` | `string?` | - | Chart description |
| `loading` | `boolean` | `false` | Show skeleton loading state |
| `empty` | `boolean` | `false` | Show empty state |
| `emptyMessage` | `string` | `"No data available"` | Custom empty message |
| `variant` | `"default" \| "glass"` | `"default"` | Visual style |
| `height` | `number` | `300` | Chart area height in pixels |
| `className` | `string?` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Chart component |

#### Usage

```tsx
import { ChartContainer, ThemedLineChart } from "@/components/ui/charts";

<ChartContainer
  title="Revenue Trend"
  description="Monthly revenue over the past year"
  variant="glass"
>
  <ThemedLineChart
    data={revenueData}
    dataKey="revenue"
    xAxisKey="month"
    color={chartColors.primary}
  />
</ChartContainer>
```

---

### ThemedLineChart

A line chart component for displaying trends over time. Supports single and multi-series modes.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Record<string, unknown>[]` | - | Chart data array |
| `dataKey` | `string?` | - | Key for Y-axis values (simple mode) |
| `series` | `ChartSeries[]?` | - | Multiple series (multi-series mode) |
| `xAxisKey` | `string` | `"name"` | Key for X-axis values |
| `color` | `string` | `chartColors.primary` | Line color (simple mode) |
| `showGrid` | `boolean` | `true` | Show background grid |
| `showDots` | `boolean` | `false` | Show data point dots |
| `strokeWidth` | `number` | `2` | Line thickness |
| `height` | `number` | `300` | Chart height |
| `showLegend` | `boolean` | `false` | Show legend (auto-enabled for multi-series) |
| `yAxisFormatter` | `(value: number) => string` | - | Format Y-axis labels |
| `tooltipFormatter` | `(value: number) => string` | - | Format tooltip values |

#### Single Series Usage

```tsx
<ThemedLineChart
  data={revenueData}
  dataKey="revenue"
  xAxisKey="month"
  color={chartColors.primary}
  strokeWidth={3}
  yAxisFormatter={formatCompactNumber}
  tooltipFormatter={formatCurrency}
/>
```

#### Multi-Series Usage

```tsx
import type { ChartSeries } from "@/components/ui/charts";

const series: ChartSeries[] = [
  { dataKey: "revenue", name: "Revenue", color: chartColors.primary, strokeWidth: 2.5 },
  { dataKey: "payout", name: "Payout", color: chartColors.cta, strokeDasharray: "5 5" },
];

<ThemedLineChart
  data={revenuePayoutData}
  series={series}
  xAxisKey="month"
  yAxisFormatter={formatCompactNumber}
  tooltipFormatter={formatCurrency}
/>
```

---

### ThemedAreaChart

An area chart with gradient fill, supporting single and multi-series modes.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Record<string, unknown>[]` | - | Chart data array |
| `dataKey` | `string?` | - | Key for Y-axis values (simple mode) |
| `series` | `ChartSeries[]?` | - | Multiple series (multi-series mode) |
| `xAxisKey` | `string` | `"name"` | Key for X-axis values |
| `color` | `string` | `chartColors.primary` | Area color (simple mode) |
| `gradient` | `boolean` | `true` | Use gradient fill |
| `showGrid` | `boolean` | `true` | Show background grid |
| `strokeWidth` | `number` | `2` | Border line thickness |
| `height` | `number` | `300` | Chart height |
| `showLegend` | `boolean` | `false` | Show legend (auto-enabled for multi-series) |
| `yAxisFormatter` | `(value: number) => string` | - | Format Y-axis labels |
| `tooltipFormatter` | `(value: number) => string` | - | Format tooltip values |

#### Usage

```tsx
<ThemedAreaChart
  data={occupancyData}
  dataKey="rate"
  xAxisKey="month"
  color={chartColors.success}
  gradient={true}
  yAxisFormatter={formatPercentage}
  tooltipFormatter={(v) => `${v}%`}
/>
```

---

### ThemedBarChart

A bar chart for comparing values. Supports horizontal layout and multi-series grouping.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Record<string, unknown>[]` | - | Chart data array |
| `dataKey` | `string?` | - | Key for bar values (simple mode) |
| `series` | `ChartSeries[]?` | - | Multiple series (multi-series mode) |
| `xAxisKey` | `string` | `"name"` | Key for category labels |
| `color` | `string` | `chartColors.primary` | Bar color (simple mode) |
| `horizontal` | `boolean` | `false` | Use horizontal layout |
| `showGrid` | `boolean` | `true` | Show background grid |
| `radius` | `[number, number, number, number]` | `[8, 8, 0, 0]` | Bar corner radius |
| `height` | `number` | `300` | Chart height |
| `showLegend` | `boolean` | `false` | Show legend (auto-enabled for multi-series) |
| `yAxisFormatter` | `(value: number) => string` | - | Format Y-axis labels |
| `tooltipFormatter` | `(value: number) => string` | - | Format tooltip values |

#### Usage

```tsx
// Multi-series grouped bars
const series: ChartSeries[] = [
  { dataKey: "revenue", name: "Revenue ($)", color: chartColors.primary },
  { dataKey: "bookings", name: "Bookings", color: chartColors.warning },
];

<ThemedBarChart
  data={propertyData}
  series={series}
  xAxisKey="name"
  radius={[4, 4, 0, 0]}
  height={350}
/>
```

---

### ThemedPieChart

A pie/donut chart for showing distribution and proportions.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Array<{name: string, value: number, color?: string}>` | - | Chart data |
| `colors` | `string[]` | Design system palette | Slice colors |
| `showLabels` | `boolean` | `true` | Show percentage labels |
| `donut` | `boolean` | `false` | Use donut variant |
| `innerRadius` | `number` | `0` | Inner radius for donut |
| `outerRadius` | `number` | `80` | Outer radius |
| `height` | `number` | `300` | Chart height |
| `showLegend` | `boolean` | `true` | Show legend below chart |
| `tooltipFormatter` | `(value: number) => string` | - | Format tooltip values |

#### Usage

```tsx
<ThemedPieChart
  data={[
    { name: "Airbnb", value: 42 },
    { name: "Booking.com", value: 28 },
    { name: "Direct", value: 16 },
  ]}
  colors={[chartColors.primary, chartColors.cta, chartColors.success]}
  donut={true}
  innerRadius={55}
  outerRadius={90}
/>
```

---

## ChartSeries Type

The `ChartSeries` interface defines a data series for multi-series charts:

```tsx
interface ChartSeries {
  dataKey: string;           // Data key in the data objects
  name?: string;             // Display name for legend/tooltip
  color?: string;            // Series color
  strokeWidth?: number;      // Line stroke width
  showDots?: boolean;        // Show data points (LineChart)
  strokeDasharray?: string;  // Dashed line pattern (e.g., "5 5")
}
```

---

## Color System

### Chart Colors

```tsx
import { chartColors, chartPalette } from "@/components/ui/charts";

// Named colors
chartColors.primary    // #0F766E - Teal 700 (main brand)
chartColors.secondary  // #14B8A6 - Teal 500
chartColors.cta        // #0369A1 - Sky 700 (call to action)
chartColors.success    // #10b981 - Green
chartColors.warning    // #f59e0b - Orange
chartColors.error      // #ef4444 - Red
chartColors.blue       // #3b82f6 - Blue
chartColors.purple     // #a855f7 - Purple
chartColors.indigo     // #6366f1 - Indigo
chartColors.pink       // #ec4899 - Pink
chartColors.teal       // #14b8a6 - Teal
chartColors.cyan       // #06b6d4 - Cyan
chartColors.orange     // #f97316 - Orange

// Ordered palette (auto-assigned to multi-series)
chartPalette // [primary, cta, success, warning, purple, pink, orange, cyan, indigo, blue]
```

---

## Loading States

### Skeleton Loading

The `ChartContainer` component displays an animated skeleton when `loading={true}`. The skeleton includes:
- Shimmer animation over the chart area
- Placeholder axis lines
- Spinning loading indicator
- "Loading chart..." text

```tsx
<ChartContainer
  title="Revenue Trend"
  loading={isLoading}
  height={300}
  variant="glass"
>
  <ThemedLineChart data={data} dataKey="revenue" />
</ChartContainer>
```

### Empty State

```tsx
<ChartContainer
  title="No Data"
  empty={data.length === 0}
  emptyMessage="No revenue data for this period"
  height={300}
>
  <ThemedLineChart data={data} dataKey="revenue" />
</ChartContainer>
```

### Conditional Pattern

```tsx
<ChartContainer
  title="Revenue Trend"
  loading={isLoading}
  empty={!isLoading && data.length === 0}
  emptyMessage="No data available"
>
  <ThemedLineChart data={data} dataKey="revenue" />
</ChartContainer>
```

---

## Tooltip Styling

All charts use a consistent glass-morphism tooltip with:
- Backdrop blur effect
- Semi-transparent white/dark background
- Color indicator circles per series
- Formatted values using the provided formatter
- Poppins heading font for labels, Open Sans for values

---

## Legend Styling

Legends are automatically shown for multi-series charts. The styled legend features:
- Centered layout with flex wrap
- Rounded color indicators
- Open Sans body font
- Light/dark mode compatible text colors

Force legend visibility on single-series charts:

```tsx
<ThemedLineChart
  data={data}
  dataKey="revenue"
  showLegend={true}
/>
```

---

## Responsive Design

All charts use `ResponsiveContainer` and automatically adapt to container width.

### Grid Layout

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <ChartContainer title="Revenue" variant="glass">
    <ThemedLineChart data={data} dataKey="revenue" />
  </ChartContainer>
  <ChartContainer title="Occupancy" variant="glass">
    <ThemedAreaChart data={data} dataKey="rate" />
  </ChartContainer>
</div>
```

### Compact Widgets

```tsx
<ChartContainer title="Quick View" variant="glass">
  <ThemedBarChart data={data} dataKey="value" height={140} showGrid={false} />
</ChartContainer>
```

---

## Phase 7 Integration

These chart components are designed for the Phase 7 dashboard. Exact integration patterns:

### Occupancy Rate (30-day Area Chart)

```tsx
<ChartContainer title="Occupancy Rate" variant="glass">
  <ThemedAreaChart
    data={occupancyData}
    dataKey="rate"
    xAxisKey="day"
    color={chartColors.primary}
    gradient={true}
    height={280}
    yAxisFormatter={formatPercentage}
    tooltipFormatter={(v) => `${v}%`}
  />
</ChartContainer>
```

### Revenue vs Payout (Multi-series Line Chart)

```tsx
const series: ChartSeries[] = [
  { dataKey: "revenue", name: "Revenue", color: chartColors.primary, strokeWidth: 2.5 },
  { dataKey: "payout", name: "Payout", color: chartColors.cta, strokeDasharray: "5 5" },
];

<ChartContainer title="Revenue vs Payout" variant="glass">
  <ThemedLineChart
    data={monthlyData}
    series={series}
    xAxisKey="month"
    yAxisFormatter={formatCompactNumber}
    tooltipFormatter={formatCurrency}
  />
</ChartContainer>
```

### Property Performance (Bar Chart)

```tsx
<ChartContainer title="Property Performance" variant="glass">
  <ThemedBarChart
    data={properties}
    dataKey="revenue"
    xAxisKey="name"
    color={chartColors.cta}
    radius={[6, 6, 0, 0]}
    height={320}
    yAxisFormatter={formatCompactNumber}
    tooltipFormatter={formatCurrency}
  />
</ChartContainer>
```

### Booking Source (Donut Chart)

```tsx
<ChartContainer title="Booking Sources" variant="glass">
  <ThemedPieChart
    data={sources}
    colors={[chartColors.primary, chartColors.cta, chartColors.success, chartColors.warning]}
    donut={true}
    innerRadius={55}
    outerRadius={90}
    height={320}
  />
</ChartContainer>
```

---

## Utility Functions

```tsx
import {
  formatCurrency,
  formatPercentage,
  formatNumber,
  formatCompactNumber,
} from "@/components/ui/charts";

formatCurrency(45000)       // "$45,000"
formatPercentage(85.5)      // "86%"
formatNumber(1234567)       // "1,234,567"
formatCompactNumber(1500)   // "1.5K"
formatCompactNumber(2500000) // "2.5M"
```

---

## Theme Support

All charts automatically adapt to light and dark modes.

### Light Mode
- Gray-200 grid lines at 50% opacity
- White/light backgrounds for tooltips
- Dark text for labels and values

### Dark Mode
- Gray-700 grid lines at 50% opacity
- Dark glass backgrounds for tooltips
- Light text for labels and values

### Glass Variant

```tsx
<ChartContainer variant="glass">
  <ThemedLineChart data={data} dataKey="value" />
</ChartContainer>
```

---

## Performance Tips

1. **Limit Data Points**: Keep line/area charts to ~50-100 points
2. **Use Compact Formatters**: `formatCompactNumber` for large Y-axis values
3. **Memoize Data**: Use `useMemo` for computed chart data

```tsx
const chartData = useMemo(() =>
  rawData.map(item => ({ month: item.date, revenue: item.total })),
  [rawData]
);
```

---

## Accessibility

All charts include:
- `role="status"` and `aria-label` on loading skeletons
- Semantic HTML structure
- ARIA labels from Recharts internals
- High contrast color palette
- Tooltips with clear formatted values

---

## Resources

- [Recharts Documentation](https://recharts.org/en-US/)
- [Component Examples](/src/components/ui/charts.examples.tsx)
- [Glass Effects](/src/components/ui/glass.tsx)
