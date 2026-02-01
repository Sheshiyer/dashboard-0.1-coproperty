import { cn } from "@/lib/utils"

/**
 * Base Skeleton component with shimmer animation.
 * Uses the project's existing `animate-shimmer` keyframe from tailwind config.
 *
 * @example
 * ```tsx
 * <Skeleton className="h-8 w-32" />
 * <Skeleton className="h-4 w-full" variant="text" />
 * <Skeleton className="h-12 w-12" variant="circular" />
 * ```
 */

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Shape variant of the skeleton */
  variant?: "rectangular" | "circular" | "text"
}

function Skeleton({ className, variant = "rectangular", ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-muted via-muted-foreground/10 to-muted",
        variant === "circular" && "rounded-full",
        variant === "text" && "rounded-md h-4",
        variant === "rectangular" && "rounded-xl",
        className
      )}
      {...props}
    />
  )
}

/**
 * SkeletonCard - A complete card skeleton matching the GlassCard/Card pattern.
 * Renders a bordered card-shaped placeholder with optional header, body, and footer lines.
 */
function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-xl border bg-card/50 p-5 space-y-3",
        className
      )}
      {...props}
    >
      <Skeleton className="h-4 w-2/5" variant="text" />
      <Skeleton className="h-7 w-3/5" />
      <Skeleton className="h-10 w-full" />
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-5 w-16" variant="text" />
        <Skeleton className="h-4 w-20" variant="text" />
      </div>
    </div>
  )
}

/**
 * SkeletonText - Multiple text line skeletons for paragraph placeholders.
 */
function SkeletonText({
  lines = 3,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true" {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonText }
