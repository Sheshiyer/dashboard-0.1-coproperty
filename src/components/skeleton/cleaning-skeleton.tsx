import { Skeleton } from "@/components/ui/skeleton"

/**
 * CleaningSkeleton - Matches the cleaning page Kanban board layout.
 *
 * Sections:
 * 1. Page header
 * 2. Kanban columns (4 columns: Pending, Assigned, In Progress, Verified)
 *    Each column has a header and placeholder job cards.
 */
export function CleaningSkeleton() {
  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)]" aria-label="Loading cleaning schedule" role="status">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" variant="text" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      {/* Kanban columns */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full gap-4 overflow-x-auto pb-4">
          <KanbanColumnSkeleton title="Pending" cards={3} />
          <KanbanColumnSkeleton title="Assigned" cards={2} />
          <KanbanColumnSkeleton title="In Progress" cards={2} />
          <KanbanColumnSkeleton title="Verified" cards={1} />
        </div>
      </div>
    </div>
  )
}

/**
 * KanbanColumnSkeleton - A single Kanban column placeholder.
 */
function KanbanColumnSkeleton({
  title,
  cards = 3,
}: {
  title: string
  cards?: number
}) {
  return (
    <div className="flex-shrink-0 w-72 rounded-xl border bg-card/50 p-3 space-y-3" aria-hidden="true">
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24" variant="text" />
          <Skeleton className="h-5 w-6 rounded-full" />
        </div>
      </div>

      {/* Job cards */}
      {Array.from({ length: cards }).map((_, i) => (
        <CleaningJobCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * CleaningJobCardSkeleton - A single cleaning job card placeholder.
 */
function CleaningJobCardSkeleton() {
  return (
    <div className="rounded-lg border bg-background/80 p-3 space-y-2">
      {/* Property name */}
      <Skeleton className="h-4 w-3/4" variant="text" />
      {/* Cleaner + date */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6" variant="circular" />
        <Skeleton className="h-3.5 w-20" variant="text" />
      </div>
      {/* Time / status */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-16" variant="text" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  )
}
