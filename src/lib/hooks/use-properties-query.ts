"use client"

/**
 * React Query hooks for Properties
 *
 * Properties are the most frequently accessed entity in the dashboard.
 * Caching them aggressively (via staleTime) prevents duplicate fetches
 * across components that all need property data (tasks, reservations,
 * cleaning jobs each join with properties).
 */

import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-client"
import { getProperties, getProperty } from "@/lib/data/properties"

export function usePropertiesQuery() {
    return useQuery({
        queryKey: queryKeys.properties.all(),
        queryFn: getProperties,
    })
}

export function usePropertyQuery(id: string) {
    return useQuery({
        queryKey: queryKeys.properties.detail(id),
        queryFn: () => getProperty(id),
        enabled: !!id,
    })
}
