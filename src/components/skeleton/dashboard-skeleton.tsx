import { Skeleton, SkeletonCard } from "@/components/ui/skeleton"

/**
 * DashboardSkeleton - Matches the full dashboard page layout.
 *
 * Sections:
 * 1. Alert banner placeholder
 * 2. Page header (title + sync button)
 * 3. KPI stat cards (4-column grid)
 * 4. Primary charts (2-column grid)
 * 5. Secondary charts (2-column grid)
 * 6. Activity widgets (3-column grid)
 * 7. Priority matrix (full width)
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading dashboard" role="status">
      {/* Alert banner */}
      <Skeleton className="h-12 w-full rounded-lg" />

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" variant="text" />
          <Skeleton className="h-4 w-72" variant="text" />
        </div>
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>

      {/* KPI Cards - 4 columns */}
      <KpiCardsSkeleton />

      {/* Primary charts - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Secondary charts - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Activity widgets - 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <WidgetSkeleton />
        <WidgetSkeleton />
        <WidgetSkeleton />
      </div>

      {/* Priority matrix */}
      <div className="rounded-xl border bg-card/50 p-6 space-y-4">
        <Skeleton className="h-5 w-40" variant="text" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * KpiCardsSkeleton - 4 stat cards in a responsive grid.
 */
export function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

/**
 * ChartSkeleton - A chart card placeholder.
 */
function ChartSkeleton() {
  return (
    <div className="rounded-xl border bg-card/50 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-36" variant="text" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      <Skeleton className="h-56 w-full rounded-lg" />
    </div>
  )
}

/**
 * WidgetSkeleton - A widget card placeholder for activity feeds, schedules, etc.
 */
function WidgetSkeleton() {
  return (
    <div className="rounded-xl border bg-card/50 p-6 space-y-3">
      <Skeleton className="h-5 w-32" variant="text" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-8 w-8" variant="circular" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-3/4" variant="text" />
            <Skeleton className="h-3 w-1/2" variant="text" />
          </div>
        </div>
      ))}
    </div>
  )
}
