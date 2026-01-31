"use client"

import { Suspense } from "react"
import {
  PropertyFilters,
  usePropertyFilters,
  filterProperties,
} from "@/components/properties/property-filters"
import { PropertyList } from "@/components/properties/property-list"
import type { Property } from "@/types/api"

interface PropertiesContentProps {
  properties: Property[]
}

function FilteredContent({ properties }: PropertiesContentProps) {
  const filters = usePropertyFilters()
  const filtered = filterProperties(properties, filters)

  return <PropertyList properties={filtered} />
}

export function PropertiesContent({ properties }: PropertiesContentProps) {
  return (
    <Suspense
      fallback={
        <div className="h-24 w-full bg-muted/20 animate-pulse rounded" />
      }
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
