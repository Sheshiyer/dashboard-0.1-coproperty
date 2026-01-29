import { apiClient } from "@/lib/api-client"

export interface DashboardStats {
    activeReservations: number
    pendingCleaning: number
    taskIssues: number
    totalProperties: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        const response = await apiClient<{ data: DashboardStats }>('/api/dashboard/stats')
        return response.data
    } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        return {
            activeReservations: 0,
            pendingCleaning: 0,
            taskIssues: 0,
            totalProperties: 0
        }
    }
}
