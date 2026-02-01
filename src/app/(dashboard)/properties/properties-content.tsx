"use client"

import { Suspense } from "react"
import {
  PropertyFilters,
  usePropertyFilters,
  filterProperties,
} from "@/components/properties/property-filters"
import { PropertyList } from "@/components/properties/property-list"
import { PropertyCardsGridSkeleton } from "@/components/skeleton/properties-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { Home } from "lucide-react"
import type { Property } from "@/types/api"

interface PropertiesContentProps {
  properties: Property[]
}

function FilteredContent({ properties }: PropertiesContentProps) {
  const filters = usePropertyFilters()
  const filtered = filterProperties(properties, filters)

  if (!filtered || filtered.length === 0) {
    return (
      <EmptyState
        icon={Home}
        title="No properties found"
        description="No properties match your current filters. Try adjusting your search criteria, or add a new property to get started."
        actionLabel="Add Property"
        secondaryActionLabel="Clear Filters"
      />
    )
  }

  return <PropertyList properties={filtered} />
}

export function PropertiesContent({ properties }: PropertiesContentProps) {
  return (
    <Suspense
      fallback={<PropertyCardsGridSkeleton />}
    >
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar Filters */}
        <aside>
          <PropertyFilters />
        </aside>

        {/* Main Content */}
        <main>
          <FilteredContent properties={properties} />
        </main>
      </div>
    </Suspense>
  )
}
