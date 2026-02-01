import { Skeleton } from "@/components/ui/skeleton"

/**
 * ReservationsSkeleton - Matches the reservations page layout.
 *
 * Sections:
 * 1. Page header
 * 2. Filter/search toolbar
 * 3. View toggle (calendar/list)
 * 4. Calendar grid or list of reservation cards
 */
export function ReservationsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-label="Loading reservations" role="status">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-44" variant="text" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      {/* Toolbar: search + filters + view toggle */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 flex-1 max-w-sm rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
        <div className="ml-auto flex gap-1">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>

      {/* Calendar timeline view skeleton */}
      <ReservationCalendarSkeleton />
    </div>
  )
}

/**
 * ReservationCalendarSkeleton - A calendar/timeline view placeholder.
 */
export function ReservationCalendarSkeleton() {
  return (
    <div className="rounded-xl border bg-card/50 p-6 space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-6 w-36" variant="text" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-8 rounded-md" />
        ))}
      </div>

      {/* Calendar grid - 5 weeks */}
      {Array.from({ length: 5 }).map((_, week) => (
        <div key={week} className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, day) => (
            <Skeleton key={day} className="h-20 rounded-md" />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * ReservationListSkeleton - A list view placeholder.
 */
export function ReservationListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ReservationRowSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * ReservationRowSkeleton - A single reservation row placeholder.
 */
function ReservationRowSkeleton() {
  return (
    <div className="rounded-xl border bg-card/50 p-4 flex items-center gap-4" aria-hidden="true">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-2/5" variant="text" />
        <Skeleton className="h-3.5 w-1/3" variant="text" />
      </div>
      <div className="text-right space-y-1.5">
        <Skeleton className="h-4 w-24 ml-auto" variant="text" />
        <Skeleton className="h-6 w-20 ml-auto rounded-full" />
      </div>
    </div>
  )
}
