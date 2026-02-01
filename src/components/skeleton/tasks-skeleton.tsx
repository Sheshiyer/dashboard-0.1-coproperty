import { Skeleton } from "@/components/ui/skeleton"

/**
 * TasksSkeleton - Matches the tasks page layout.
 *
 * Sections:
 * 1. Page header with create task button
 * 2. Data table with header row + body rows
 */
export function TasksSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-label="Loading tasks" role="status">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-28" variant="text" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Data table card */}
      <TaskTableSkeleton />
    </div>
  )
}

/**
 * TaskTableSkeleton - A data table placeholder with header and rows.
 */
export function TaskTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="rounded-xl border bg-card shadow">
      <div className="p-6 space-y-4">
        {/* Toolbar: search + filters */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 flex-1 max-w-sm rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>

        {/* Table header */}
        <div className="flex items-center gap-4 py-3 border-b">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-32" variant="text" />
          <Skeleton className="h-4 w-24 ml-auto" variant="text" />
          <Skeleton className="h-4 w-20" variant="text" />
          <Skeleton className="h-4 w-24" variant="text" />
          <Skeleton className="h-4 w-16" variant="text" />
        </div>

        {/* Table rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <TaskRowSkeleton key={i} />
        ))}

        {/* Pagination */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-32" variant="text" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * TaskRowSkeleton - A single task table row placeholder.
 */
function TaskRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border/50" aria-hidden="true">
      <Skeleton className="h-4 w-4 rounded" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-4 w-2/3" variant="text" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-4 w-16" variant="text" />
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-4 w-20" variant="text" />
    </div>
  )
}
