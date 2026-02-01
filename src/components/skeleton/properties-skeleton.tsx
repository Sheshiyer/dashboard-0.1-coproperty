import { Skeleton } from "@/components/ui/skeleton"

/**
 * PropertiesSkeleton - Matches the properties page layout.
 *
 * Sections:
 * 1. Page header with action button
 * 2. Search/filter toolbar
 * 3. Property cards grid (responsive 1/2/3 columns)
 */
export function PropertiesSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-label="Loading properties" role="status">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" variant="text" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      {/* Search and filter toolbar */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 flex-1 max-w-sm rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>

      {/* Property cards grid */}
      <PropertyCardsGridSkeleton />
    </div>
  )
}

/**
 * PropertyCardsGridSkeleton - Grid of property card placeholders.
 */
export function PropertyCardsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * PropertyCardSkeleton - A single property card placeholder.
 */
function PropertyCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card/50 overflow-hidden" aria-hidden="true">
      {/* Image placeholder */}
      <Skeleton className="h-48 w-full rounded-none" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-5 w-3/4" variant="text" />
        {/* Location */}
        <Skeleton className="h-4 w-1/2" variant="text" />
        {/* Stats row */}
        <div className="flex items-center gap-4 pt-2">
          <Skeleton className="h-4 w-16" variant="text" />
          <Skeleton className="h-4 w-16" variant="text" />
          <Skeleton className="h-4 w-16" variant="text" />
        </div>
        {/* Badge row */}
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}
