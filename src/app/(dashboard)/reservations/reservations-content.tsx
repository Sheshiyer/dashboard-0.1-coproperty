"use client"

import { Suspense, useState, useMemo } from "react"
import dynamic from "next/dynamic"
import {
  ReservationFilters,
  useReservationFilters,
} from "@/components/reservations/reservation-filters"
import { ReservationSearch } from "@/components/reservations/reservation-search"
import { ReservationCalendarSkeleton } from "@/components/skeleton/reservations-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDays } from "lucide-react"
import type { Reservation, Property } from "@/types/api"
import { filterReservations } from "@/lib/utils/reservation-filters"
import { searchReservations } from "@/lib/utils/reservation-search"

// ---------------------------------------------------------------------------
// Dynamic import for the heavy reservation list component
// ---------------------------------------------------------------------------
const ReservationList = dynamic(
    () => import("@/components/reservations/reservation-list").then(m => ({ default: m.ReservationList })),
    {
        loading: () => <Skeleton className="h-96 w-full rounded-xl" />,
        ssr: false,
    }
)

interface ReservationsContentProps {
  reservations: Reservation[]
  properties: Property[]
}

function FilteredContent({ reservations, properties }: ReservationsContentProps) {
  const filters = useReservationFilters()
  const [searchQuery, setSearchQuery] = useState("")

  // Apply filters and search
  const filtered = useMemo(() => {
    let result = filterReservations(reservations, filters)
    if (searchQuery) {
      result = searchReservations(result, searchQuery)
    }
    return result
  }, [reservations, filters, searchQuery])

  return (
    <>
      {/* Search Bar */}
      <div className="mb-6">
        <ReservationSearch
          reservations={reservations}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Reservation List or Empty State */}
      {filtered && filtered.length > 0 ? (
        <ReservationList
          reservations={filtered}
          properties={properties}
        />
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="No reservations"
          description="No reservations match your filters. Reservations from connected booking platforms will appear here automatically."
          actionLabel="Add Reservation"
          secondaryActionLabel="Clear Filters"
        />
      )}
    </>
  )
}

export function ReservationsContent({ reservations, properties }: ReservationsContentProps) {
  return (
    <Suspense
      fallback={<ReservationCalendarSkeleton />}
    >
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar Filters */}
        <aside>
          <ReservationFilters properties={properties} />
        </aside>

        {/* Main Content */}
        <main>
          <FilteredContent reservations={reservations} properties={properties} />
        </main>
      </div>
    </Suspense>
  )
}
