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

export interface OccupancyTrendPoint extends Record<string, unknown> {
    date: string
    rate: number
}

export async function getOccupancyTrends(days: number = 30): Promise<OccupancyTrendPoint[]> {
    try {
        const response = await apiClient<{ data: OccupancyTrendPoint[] }>(`/api/dashboard/occupancy-trends?days=${days}`)
        return response.data
    } catch (error) {
        console.error("Error fetching occupancy trends:", error)
        return []
    }
}

export interface BookingSource extends Record<string, unknown> {
    name: string
    value: number
    revenue: number
}

export async function getBookingSources(): Promise<BookingSource[]> {
    try {
        const response = await apiClient<{ data: BookingSource[] }>('/api/dashboard/booking-sources')
        return response.data
    } catch (error) {
        console.error("Error fetching booking sources:", error)
        return []
    }
}

export interface PropertyPerformance extends Record<string, unknown> {
    name: string
    revenue: number
    bookings: number
}

export async function getPropertyPerformance(limit: number = 5, period: number = 30): Promise<PropertyPerformance[]> {
    try {
        const response = await apiClient<{ data: PropertyPerformance[] }>(`/api/dashboard/property-performance?limit=${limit}&period=${period}`)
        return response.data
    } catch (error) {
        console.error("Error fetching property performance:", error)
        return []
    }
}

// ============================================================================
// Revenue Trends
// ============================================================================

export interface RevenueTrendItem extends Record<string, unknown> {
    date: string
    revenue: number
    payout: number
}

export async function getRevenueTrends(days: number = 30): Promise<RevenueTrendItem[]> {
    try {
        const response = await apiClient<{ data: RevenueTrendItem[] }>(`/api/dashboard/revenue-trends?days=${days}`)
        return response.data
    } catch (error) {
        console.error("Error fetching revenue trends:", error)
        return []
    }
}

// ============================================================================
// Recent Activity
// ============================================================================

export type ActivityType = "booking" | "check-in" | "check-out" | "cleaning" | "maintenance"

export interface Activity {
    type: ActivityType
    property: string
    description: string
    timestamp: string
}

export async function getRecentActivity(limit: number = 15): Promise<Activity[]> {
    try {
        const response = await apiClient<{ data: Activity[] }>(`/api/dashboard/recent-activity?limit=${limit}`)
        return response.data
    } catch (error) {
        console.error("Error fetching recent activity:", error)
        return []
    }
}

// ============================================================================
// Task Priority Breakdown
// ============================================================================

export interface TaskPriorityItem {
    label: string
    count: number
    filterParam: string
}

export async function getTaskPriorityBreakdown(): Promise<TaskPriorityItem[]> {
    try {
        const response = await apiClient<{ data: TaskPriorityItem[] }>('/api/dashboard/task-priority-breakdown')
        return response.data
    } catch (error) {
        console.error("Error fetching task priority breakdown:", error)
        return []
    }
}

// ============================================================================
// Upcoming Check-ins
// ============================================================================

export interface UpcomingReservation {
    id: string
    property_id: string
    guest_name: string
    check_in_date: string
    check_out_date: string
    platform: string
    status: string
    property_name?: string
    check_in_time?: string
}

export async function getUpcomingCheckIns(limit: number = 50): Promise<UpcomingReservation[]> {
    try {
        const response = await apiClient<{ data: UpcomingReservation[] }>(`/api/dashboard/upcoming?limit=${limit}`)
        return response.data
    } catch (error) {
        console.error("Error fetching upcoming check-ins:", error)
        return []
    }
}

// ============================================================================
// Today's Cleaning Jobs
// ============================================================================

export interface CleaningJobWithProperty {
    id: string
    turno_id: string
    property_id: string
    property_name: string
    reservation_id?: string
    scheduled_date: string
    scheduled_time?: string
    deadline_time?: string
    cleaner_name?: string
    cleaner_phone?: string
    status: 'pending' | 'in_progress' | 'completed' | 'verified'
    started_at?: string
    completed_at?: string
}

export async function getTodayCleaning(): Promise<CleaningJobWithProperty[]> {
    try {
        const response = await apiClient<{ data: CleaningJobWithProperty[] }>('/api/dashboard/today-cleaning')
        return response.data
    } catch (error) {
        console.error("Error fetching today's cleaning jobs:", error)
        return []
    }
}
