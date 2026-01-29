import { apiClient } from "@/lib/api-client"
import type { CleaningJob, ApiResponse, Property } from "@/types/api"
export type { CleaningJob }

export async function getCleaningJobs(): Promise<CleaningJob[]> {
    try {
        const [cleaningRes, propertiesRes] = await Promise.all([
            apiClient<ApiResponse<CleaningJob[]>>('/api/cleaning'),
            apiClient<ApiResponse<Property[]>>('/api/properties')
        ])

        const jobs = cleaningRes.data || []
        const properties = propertiesRes.data || []

        return jobs.map(j => ({
            ...j,
            properties: properties.find(p => p.id === j.property_id)
        }))
    } catch (error) {
        console.error("Error fetching cleaning jobs:", error)
        return []
    }
}

export async function getCleaningJobsByDate(date: string): Promise<CleaningJob[]> {
    try {
        const response = await apiClient<ApiResponse<CleaningJob[]>>(
            `/api/cleaning?date=${date}`
        )
        return response.data || []
    } catch (error) {
        console.error("Error fetching cleaning jobs by date:", error)
        return []
    }
}

export async function getCleaningJobsByProperty(propertyId: string): Promise<CleaningJob[]> {
    try {
        const response = await apiClient<ApiResponse<CleaningJob[]>>(
            `/api/cleaning?property_id=${propertyId}`
        )
        return response.data || []
    } catch (error) {
        console.error("Error fetching cleaning jobs for property:", error)
        return []
    }
}

export async function updateCleaningJobStatus(
    id: string,
    status: CleaningJob['status']
): Promise<CleaningJob | null> {
    try {
        const response = await apiClient<ApiResponse<CleaningJob>>(
            `/api/cleaning/${id}/status`,
            {
                method: 'PATCH',
                body: { status }
            }
        )
        return response.data || null
    } catch (error) {
        console.error("Error updating cleaning job status:", error)
        return null
    }
}
