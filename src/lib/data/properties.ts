import { apiClient } from "@/lib/api-client"
import type { Property, PropertyWithDetails, ApiResponse, Reservation, CleaningJob, Task } from "@/types/api"
export type { Property, PropertyWithDetails, Reservation, CleaningJob, Task }

import { getReservationsByProperty } from "./reservations"
import { getCleaningJobsByProperty } from "./cleaning"
import { getTasksByProperty } from "./tasks"

export async function getProperties(): Promise<Property[]> {
    try {
        const response = await apiClient<ApiResponse<Property[]>>('/api/properties')
        return response.data || []
    } catch (error) {
        console.error("Error fetching properties:", error)
        return []
    }
}

export async function getProperty(id: string): Promise<PropertyWithDetails | null> {
    try {
        // Fetch core property data and related data in parallel
        const [propertyRes, reservations, cleaning_jobs, tasks] = await Promise.all([
            apiClient<ApiResponse<Property>>(`/api/properties/${id}`),
            getReservationsByProperty(id),
            getCleaningJobsByProperty(id),
            getTasksByProperty(id)
        ])

        if (!propertyRes.data) return null

        return {
            ...propertyRes.data,
            reservations,
            cleaning_jobs,
            tasks
        }
    } catch (error) {
        console.error("Error fetching property:", error)
        return null
    }
}
