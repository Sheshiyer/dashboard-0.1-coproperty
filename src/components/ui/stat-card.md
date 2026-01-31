# StatCard Component Documentation

**Task:** P6-S8-07 - Animated Stat Cards with Sparklines

A professional, animated stat card component with number counting animations, mini recharts sparkline charts, trend indicators, and Month-over-Month (MoM) comparison badges. Built with framer-motion for micro-interactions and integrated with the Co.Property glass morphism design system.

## Features

- **Animated Number Counter**: Smooth count-up animation using framer-motion `useMotionValue` and `animate`
- **Mini Sparkline Charts**: Trend visualization using recharts `AreaChart` with gradient fill
- **Trend Indicators**: Percentage change with color-coded arrows (ArrowUp/ArrowDown) and pills
- **MoM Comparison Badge**: Month-over-Month comparison with label and value
- **Two Variants**: Default (card) and glass morphism
- **Three Sizes**: sm, md (default), lg
- **Loading Skeleton**: Shimmer animation skeleton state
- **TypeScript**: Fully typed props with JSDoc comments
- **Responsive**: Works on all screen sizes
- **Composable**: Subcomponents (AnimatedNumber, Sparkline, TrendIndicator, MomBadge) are individually exported

## Installation

All dependencies are already included in the project:

```bash
bun add framer-motion recharts lucide-react class-variance-authority
```

## Import

```tsx
import { StatCard } from "@/components/ui/stat-card";

// Or import subcomponents individually
import {
  StatCard,
  AnimatedNumber,
  Sparkline,
  TrendIndicator,
  MomBadge,
  StatCardSkeleton,
  statCardVariants,
  type StatCardProps,
  type SparklineDataPoint,
  type TrendDirection,
} from "@/components/ui/stat-card";
```

## Props

### StatCardProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | Required | Label displayed above the stat value |
| `value` | `number` | Required | Numeric value to display (animated) |
| `prefix` | `string` | `undefined` | Prefix for value (e.g., "$") |
| `suffix` | `string` | `undefined` | Suffix for value (e.g., "%") |
| `decimals` | `number` | `0` | Decimal places to display |
| `changePercent` | `number` | `undefined` | Percentage change from previous period |
| `trend` | `"up" \| "down" \| "neutral"` | `undefined` | Direction of the trend |
| `momLabel` | `string` | `undefined` | MoM comparison label (e.g., "vs last month") |
| `momValue` | `string` | `undefined` | MoM comparison value (e.g., "+$8,200") |
| `sparklineData` | `SparklineDataPoint[]` | `undefined` | Array of `{value: number}` for the mini chart |
| `sparklineColor` | `string` | auto | Color for sparkline (auto-detected from trend) |
| `icon` | `LucideIcon` | `undefined` | Lucide icon component reference |
| `loading` | `boolean` | `false` | Show loading skeleton |
| `animationDuration` | `number` | `1.2` | Duration in seconds for number animation |
| `formatValue` | `(value: number) => string` | `undefined` | Custom value formatter |
| `variant` | `"default" \| "glass"` | `"default"` | Visual style variant |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Card size |
| `className` | `string` | `undefined` | Additional CSS classes |

### SparklineDataPoint

```tsx
interface SparklineDataPoint {
  value: number;
}
```

### TrendDirection

```tsx
type TrendDirection = "up" | "down" | "neutral";
```

## Variants

### Default
Standard card with border and shadow.

```tsx
<StatCard
  title="Total Revenue"
  value={72400}
  prefix="$"
  trend="up"
  changePercent={12.5}
/>
```

### Glass
Glass morphism effect with backdrop blur. Matches the Co.Property design system.

```tsx
<StatCard
  variant="glass"
  title="Active Properties"
  value={156}
  trend="up"
  changePercent={5.2}
/>
```

## Size Variants

```tsx
<StatCard size="sm" title="Small" value={100} />
<StatCard size="md" title="Medium (default)" value={200} />
<StatCard size="lg" title="Large" value={300} />
```

## Usage Examples

### Basic Usage

```tsx
<StatCard title="Total Properties" value={156} />
```

### With Trend Indicator

```tsx
<StatCard
  title="Monthly Revenue"
  value={45780}
  prefix="$"
  trend="up"
  changePercent={12.5}
  formatValue={(v) => v.toLocaleString("en-US")}
/>
```

### With Sparkline

```tsx
<StatCard
  title="Revenue Trend"
  value={72400}
  prefix="$"
  sparklineData={[
    { value: 4200 },
    { value: 4800 },
    { value: 5100 },
    { value: 5400 },
    { value: 5800 },
    { value: 6400 },
    { value: 7200 },
  ]}
  formatValue={(v) => v.toLocaleString("en-US")}
/>
```

### With MoM Comparison

```tsx
<StatCard
  title="Occupancy Rate"
  value={94}
  suffix="%"
  trend="up"
  changePercent={5.3}
  momValue="+4.2%"
  momLabel="vs last month"
  sparklineData={occupancyData}
/>
```

### Complete Example (All Features)

```tsx
import { StatCard } from "@/components/ui/stat-card";
import { DollarSign } from "lucide-react";

<StatCard
  variant="glass"
  title="Total Revenue"
  value={72400}
  prefix="$"
  trend="up"
  changePercent={12.5}
  momValue="+$8,200"
  momLabel="vs last month"
  sparklineData={[
    { value: 4200 }, { value: 4800 }, { value: 5100 },
    { value: 5400 }, { value: 5800 }, { value: 6400 },
    { value: 7200 },
  ]}
  icon={DollarSign}
  formatValue={(v) => v.toLocaleString("en-US")}
/>
```

### Loading State

```tsx
<StatCard loading title="" value={0} />
<StatCard loading variant="glass" title="" value={0} />
```

### Dashboard Grid Layout

```tsx
import { DollarSign, Home, CheckCircle, Users } from "lucide-react";

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
    sparklineData={revenueData}
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
    sparklineData={propertiesData}
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
    sparklineData={occupancyData}
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
    sparklineData={guestsData}
    icon={Users}
  />
</div>
```

### Negative Trend

```tsx
<StatCard
  title="Cancellation Rate"
  value={62}
  suffix="%"
  trend="down"
  changePercent={-8.3}
  momValue="-5.1%"
  momLabel="vs last month"
  sparklineData={declineData}
  sparklineColor="#ef4444"
/>
```

### Custom Alert Styling

```tsx
<StatCard
  title="Urgent Maintenance"
  value={8}
  trend="down"
  changePercent={-33.3}
  sparklineData={declineData}
  sparklineColor="#ef4444"
  className="border-l-4 border-l-error-500"
  icon={AlertCircle}
/>
```

## Subcomponents

### AnimatedNumber

Standalone animated number counter.

```tsx
import { AnimatedNumber } from "@/components/ui/stat-card";

<AnimatedNumber
  value={99750.50}
  decimals={2}
  prefix="$"
  className="text-3xl font-heading font-bold"
/>
```

### Sparkline

Standalone sparkline chart.

```tsx
import { Sparkline, type SparklineDataPoint } from "@/components/ui/stat-card";

const data: SparklineDataPoint[] = [
  { value: 10 }, { value: 15 }, { value: 12 },
  { value: 18 }, { value: 22 }, { value: 20 },
];

<Sparkline data={data} color="#10b981" height={60} />
```

## Animation Details

### Number Counter Animation
- **Duration**: 1.2 seconds (configurable via `animationDuration`)
- **Easing**: Ease-out quad `[0.25, 0.46, 0.45, 0.94]`
- **Engine**: Framer Motion `useMotionValue` + `animate`

### Card Entry Animation
- **Effect**: Fade up (opacity 0 to 1, y 12 to 0)
- **Duration**: 400ms
- **Easing**: Ease-out quad

### Hover Animation
- **Effect**: Lift up 2px (`y: -2`)
- **Duration**: 200ms

### Trend Indicator Animation
- **Effect**: Fade in + slide up (y 4 to 0)
- **Delay**: 600ms (appears after number finishes)

### MoM Badge Animation
- **Effect**: Fade in
- **Delay**: 800ms

### Sparkline Animation
- **Effect**: Fade in with recharts built-in draw animation
- **Duration**: 800ms
- **Delay**: 300ms

## Design Tokens

### Colors
- **Positive Trend**: `text-success-600` / pill bg `bg-success-50`
- **Negative Trend**: `text-error-600` / pill bg `bg-error-50`
- **Neutral**: `text-muted-foreground` / `bg-muted`
- **Sparkline Up**: `#10b981` (success green)
- **Sparkline Down**: `#ef4444` (error red)
- **Sparkline Default**: `#14B8A6` (teal 500)

### Typography
- **Title**: `text-sm font-medium text-muted-foreground` (Open Sans)
- **Value**: `text-2xl font-heading font-bold` (Poppins)
- **Trend**: `text-xs font-semibold`
- **MoM**: `text-xs text-muted-foreground`

### Glass Variant Styles
- `backdrop-blur-xl`
- `bg-white/80 dark:bg-white/10`
- `border border-white/20 dark:border-white/15`
- `shadow-xl shadow-primary/5`
- Hover: `shadow-2xl shadow-primary/10`

## Best Practices

1. **Sparkline Data**: Provide 7-30 `{value}` data points for optimal visualization
2. **Icon Prop**: Pass the Lucide icon component reference directly (e.g., `icon={DollarSign}`) not JSX
3. **formatValue**: Use for currency or custom number formatting
4. **prefix/suffix**: Use for simple additions like "$" or "%"
5. **Grid Layout**: Use 4 columns on large screens, 2 on medium, 1 on small
6. **Consistent Variants**: Use the same variant within a row for visual consistency
7. **Loading**: Set `loading={true}` while data is being fetched

## Files

- **Component**: `src/components/ui/stat-card.tsx`
- **Examples**: `src/components/ui/stat-card.examples.tsx`
- **Documentation**: `src/components/ui/stat-card.md`

## Examples File

See `src/components/ui/stat-card.examples.tsx` for 8 comprehensive example sections:

1. Default variant dashboard row
2. Glass variant dashboard row
3. Mixed trends (up, down, neutral)
4. Size variants (sm, md, lg)
5. Loading skeleton states
6. Minimal (no sparkline)
7. Custom styling with alert borders
8. Standalone subcomponents (AnimatedNumber, Sparkline)

Plus a `DashboardStatsSection` showing a real-world dashboard layout pattern.
