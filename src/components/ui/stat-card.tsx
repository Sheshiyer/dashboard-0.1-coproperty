"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  type LucideIcon,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";

// ============================================================================
// Type Definitions
// ============================================================================

export interface SparklineDataPoint {
  value: number;
}

export type TrendDirection = "up" | "down" | "neutral";

export interface StatCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof statCardVariants> {
  /** The label displayed above the stat value */
  title: string;
  /** The numeric value to display (will be animated) */
  value: number;
  /** Optional prefix for the value (e.g., "$", "#") */
  prefix?: string;
  /** Optional suffix for the value (e.g., "%", "units") */
  suffix?: string;
  /** Number of decimal places to display */
  decimals?: number;
  /** Percentage change from previous period */
  changePercent?: number;
  /** Direction of the trend */
  trend?: TrendDirection;
  /** Month-over-Month comparison text (e.g., "vs last month") */
  momLabel?: string;
  /** Month-over-Month comparison value (e.g., "+12.5%") */
  momValue?: string;
  /** Sparkline data points (array of {value} objects) */
  sparklineData?: SparklineDataPoint[];
  /** Color for the sparkline area chart */
  sparklineColor?: string;
  /** Optional icon to display in the card header */
  icon?: LucideIcon;
  /** Whether the card is in loading state */
  loading?: boolean;
  /** Duration in seconds for the number animation */
  animationDuration?: number;
  /** Format function for the displayed value */
  formatValue?: (value: number) => string;
}

// ============================================================================
// Variants
// ============================================================================

const statCardVariants = cva(
  "relative overflow-hidden rounded-xl p-5 transition-all duration-300",
  {
    variants: {
      variant: {
        default:
          "border bg-card text-card-foreground shadow-md hover:shadow-lg",
        glass:
          "backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-white/20 dark:border-white/15 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 hover:border-white/40 dark:hover:border-white/25",
      },
      size: {
        sm: "p-4",
        md: "p-5",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

// ============================================================================
// Animated Number Counter
// ============================================================================

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  formatValue?: (value: number) => string;
  className?: string;
}

function AnimatedNumber({
  value,
  decimals = 0,
  duration = 1.2,
  prefix = "",
  suffix = "",
  formatValue,
  className,
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => {
    if (formatValue) return formatValue(latest);
    return latest.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  });
  const [displayValue, setDisplayValue] = React.useState(
    formatValue ? formatValue(0) : "0"
  );

  React.useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => setDisplayValue(v));
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad
    });
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, duration, motionValue, rounded]);

  return (
    <span className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

// ============================================================================
// Mini Sparkline
// ============================================================================

interface SparklineProps {
  data: SparklineDataPoint[];
  color?: string;
  height?: number;
}

function Sparkline({
  data,
  color = "#14B8A6",
  height = 40,
}: SparklineProps) {
  const gradientId = React.useId();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <YAxis domain={["dataMin - 5", "dataMax + 5"]} hide />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          dot={false}
          animationDuration={800}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ============================================================================
// Trend Indicator
// ============================================================================

interface TrendIndicatorProps {
  direction: TrendDirection;
  changePercent: number;
  className?: string;
}

function TrendIndicator({
  direction,
  changePercent,
  className,
}: TrendIndicatorProps) {
  const isUp = direction === "up";
  const isDown = direction === "down";

  const colorClass = isUp
    ? "text-success-600 dark:text-success-500"
    : isDown
      ? "text-error-600 dark:text-error-500"
      : "text-muted-foreground";

  const bgClass = isUp
    ? "bg-success-50 dark:bg-success-500/10"
    : isDown
      ? "bg-error-50 dark:bg-error-500/10"
      : "bg-muted";

  const Icon = isUp ? ArrowUp : isDown ? ArrowDown : ArrowUp;

  return (
    <motion.span
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: 0.6 }}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
        colorClass,
        bgClass,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(changePercent).toFixed(1)}%
    </motion.span>
  );
}

// ============================================================================
// MoM Comparison Badge
// ============================================================================

interface MomBadgeProps {
  label: string;
  value: string;
  className?: string;
}

function MomBadge({ label, value, className }: MomBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.8 }}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
        className
      )}
    >
      <span>{value}</span>
      <span className="opacity-60">{label}</span>
    </motion.div>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function StatCardSkeleton({
  variant,
  size,
  className,
}: Pick<StatCardProps, "variant" | "size" | "className">) {
  return (
    <div className={cn(statCardVariants({ variant, size }), className)}>
      <div className="space-y-3">
        {/* Title skeleton */}
        <div className="h-3.5 w-24 rounded-md bg-muted animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-muted via-muted-foreground/10 to-muted" />
        {/* Value skeleton */}
        <div className="h-8 w-32 rounded-md bg-muted animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-muted via-muted-foreground/10 to-muted" />
        {/* Sparkline skeleton */}
        <div className="h-10 w-full rounded-md bg-muted animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-muted via-muted-foreground/10 to-muted" />
        {/* Trend skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 rounded-full bg-muted animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-muted via-muted-foreground/10 to-muted" />
          <div className="h-4 w-20 rounded bg-muted animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-muted via-muted-foreground/10 to-muted" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// StatCard Component
// ============================================================================

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      variant,
      size,
      title,
      value,
      prefix,
      suffix,
      decimals = 0,
      changePercent,
      trend,
      momLabel,
      momValue,
      sparklineData,
      sparklineColor,
      icon: IconComponent,
      loading = false,
      animationDuration = 1.2,
      formatValue,
      ...props
    },
    ref
  ) => {
    if (loading) {
      return (
        <StatCardSkeleton
          variant={variant}
          size={size}
          className={className}
        />
      );
    }

    // Determine sparkline color based on trend
    const resolvedSparklineColor =
      sparklineColor ??
      (trend === "up"
        ? "#10b981"
        : trend === "down"
          ? "#ef4444"
          : "#14B8A6");

    // Determine trend icon for the header
    const TrendIcon =
      trend === "up"
        ? TrendingUp
        : trend === "down"
          ? TrendingDown
          : undefined;

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className={cn(statCardVariants({ variant, size }), className)}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.div>)}
      >
        {/* Header: Title + Icon */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-muted-foreground truncate">
            {title}
          </span>
          {IconComponent && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2,
              }}
            >
              <IconComponent className="h-4 w-4 text-muted-foreground/60" />
            </motion.div>
          )}
        </div>

        {/* Value Row */}
        <div className="flex items-end gap-2 mb-2">
          <AnimatedNumber
            value={value}
            decimals={decimals}
            duration={animationDuration}
            prefix={prefix}
            suffix={suffix}
            formatValue={formatValue}
            className="text-2xl font-heading font-bold tracking-tight text-foreground"
          />
          {TrendIcon && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <TrendIcon
                className={cn(
                  "h-4 w-4 mb-1",
                  trend === "up"
                    ? "text-success-500"
                    : "text-error-500"
                )}
              />
            </motion.div>
          )}
        </div>

        {/* Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-2 -mx-1"
          >
            <Sparkline
              data={sparklineData}
              color={resolvedSparklineColor}
              height={size === "lg" ? 48 : size === "sm" ? 32 : 40}
            />
          </motion.div>
        )}

        {/* Trend + MoM Row */}
        {(changePercent !== undefined || momValue) && (
          <div className="flex items-center gap-2 flex-wrap">
            {changePercent !== undefined && trend && (
              <TrendIndicator
                direction={trend}
                changePercent={changePercent}
              />
            )}
            {momValue && momLabel && (
              <MomBadge label={momLabel} value={momValue} />
            )}
          </div>
        )}
      </motion.div>
    );
  }
);

StatCard.displayName = "StatCard";

// ============================================================================
// Exports
// ============================================================================

export {
  StatCard,
  StatCardSkeleton,
  AnimatedNumber,
  Sparkline,
  TrendIndicator,
  MomBadge,
  statCardVariants,
};
