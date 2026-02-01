"use client"

import { Suspense, useState, useMemo } from "react"
import {
  ReservationFilters,
  useReservationFilters,
} from "@/components/reservations/reservation-filters"
import { ReservationSearch } from "@/components/reservations/reservation-search"
import { ReservationList } from "@/components/reservations/reservation-list"
import type { Reservation, Property } from "@/types/api"
import { filterReservations } from "@/lib/utils/reservation-filters"
import { searchReservations } from "@/lib/utils/reservation-search"

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

      {/* Reservation List */}
      <ReservationList
        reservations={filtered}
        properties={properties}
      />
    </>
  )
}

export function ReservationsContent({ reservations, properties }: ReservationsContentProps) {
  return (
    <Suspense
      fallback={
        <div className="h-24 w-full bg-muted/20 animate-pulse rounded" />
      }
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
