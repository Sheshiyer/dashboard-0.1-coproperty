/**
 * Mock Helpers for Workers API Tests
 *
 * Provides reusable mock data and fetch mocking utilities
 * for testing data layer functions against Workers API endpoints.
 */

import type { Property, Reservation, CleaningJob, Task, ApiResponse } from "@/types/api"
import type { DashboardStats, OccupancyTrendPoint, BookingSource, PropertyPerformance, RevenueTrendItem, Activity, TaskPriorityItem, UpcomingReservation, CleaningJobWithProperty } from "../dashboard"

// ============================================================================
// Mock Properties
// ============================================================================

export const mockProperty: Property = {
    id: "prop_001",
    hospitable_id: "hosp_001",
    name: "Downtown Loft",
    internal_code: "DTL-001",
    address: "123 Main St, Suite 4A",
    building_name: "The Main Building",
    room_number: "4A",
    bedrooms: 2,
    bathrooms: 1,
    max_guests: 4,
    check_in_time: "15:00",
    check_out_time: "11:00",
    status: "active",
    segment: "urban",
    picture: "https://example.com/dtl001.jpg"
}

export const mockProperty2: Property = {
    id: "prop_002",
    hospitable_id: "hosp_002",
    name: "Beach House",
    internal_code: "BH-001",
    address: "456 Ocean Ave",
    bedrooms: 3,
    bathrooms: 2,
    max_guests: 6,
    check_in_time: "16:00",
    check_out_time: "10:00",
    status: "active",
    segment: "coastal"
}

export const mockProperties: Property[] = [mockProperty, mockProperty2]

// ============================================================================
// Mock Reservations
// ============================================================================

export const mockReservation: Reservation = {
    id: "res_001",
    property_id: "prop_001",
    hospitable_id: "hosp_res_001",
    confirmation_code: "ABC123",
    platform: "Airbnb",
    check_in_date: "2026-02-01",
    check_out_date: "2026-02-05",
    guest_name: "John Smith",
    guest_email: "john@example.com",
    guest_phone: "+1234567890",
    guest_count: 2,
    total_price: 500,
    payout_amount: 450,
    currency: "USD",
    status: "confirmed",
    special_requests: "Late check-in"
}

export const mockReservation2: Reservation = {
    id: "res_002",
    property_id: "prop_002",
    hospitable_id: "hosp_res_002",
    confirmation_code: "DEF456",
    platform: "Booking.com",
    check_in_date: "2026-02-10",
    check_out_date: "2026-02-15",
    guest_name: "Jane Doe",
    guest_count: 4,
    total_price: 750,
    payout_amount: 675,
    currency: "USD",
    status: "confirmed"
}

export const mockReservations: Reservation[] = [mockReservation, mockReservation2]

// ============================================================================
// Mock Cleaning Jobs
// ============================================================================

export const mockCleaningJob: CleaningJob = {
    id: "clean_001",
    turno_id: "turno_001",
    property_id: "prop_001",
    reservation_id: "res_001",
    scheduled_date: "2026-02-05",
    scheduled_time: "11:30",
    deadline_time: "15:00",
    cleaner_name: "Maria Garcia",
    cleaner_phone: "+1987654321",
    status: "pending",
    checklist_completed: false,
    photo_count: 0
}

export const mockCleaningJob2: CleaningJob = {
    id: "clean_002",
    turno_id: "turno_002",
    property_id: "prop_002",
    reservation_id: "res_002",
    scheduled_date: "2026-02-15",
    scheduled_time: "10:30",
    deadline_time: "16:00",
    cleaner_name: "Carlos Lopez",
    status: "in_progress",
    started_at: "2026-02-15T10:35:00Z",
    checklist_completed: false,
    photo_count: 3
}

export const mockCleaningJobs: CleaningJob[] = [mockCleaningJob, mockCleaningJob2]

// ============================================================================
// Mock Tasks
// ============================================================================

export const mockTask: Task = {
    id: "task_001",
    property_id: "prop_001",
    title: "Replace broken lamp",
    description: "The bedside lamp in the master bedroom is not working",
    category: "maintenance",
    priority: "medium",
    status: "pending",
    assigned_to: "John Maintenance",
    due_date: "2026-02-10",
    created_by: "system",
    created_at: "2026-01-30T10:00:00Z",
    updated_at: "2026-01-30T10:00:00Z"
}

export const mockTask2: Task = {
    id: "task_002",
    property_id: "prop_002",
    title: "Restock cleaning supplies",
    description: "Low on dish soap and paper towels",
    category: "inventory",
    priority: "low",
    status: "in_progress",
    created_by: "cleaner",
    created_at: "2026-01-29T14:00:00Z",
    updated_at: "2026-01-30T08:00:00Z"
}

export const mockTasks: Task[] = [mockTask, mockTask2]

// ============================================================================
// Mock Dashboard Data
// ============================================================================

export const mockDashboardStats: DashboardStats = {
    activeReservations: 5,
    pendingCleaning: 3,
    taskIssues: 2,
    totalProperties: 10,
    occupancyRate: 78.5,
    totalRevenue: 25000
}

export const mockOccupancyTrends: OccupancyTrendPoint[] = [
    { date: "2026-01-01", rate: 65 },
    { date: "2026-01-08", rate: 72 },
    { date: "2026-01-15", rate: 80 },
    { date: "2026-01-22", rate: 75 },
    { date: "2026-01-29", rate: 78 }
]

export const mockBookingSources: BookingSource[] = [
    { name: "Airbnb", value: 45, revenue: 15000 },
    { name: "Booking.com", value: 30, revenue: 8500 },
    { name: "Direct", value: 15, revenue: 3000 },
    { name: "VRBO", value: 10, revenue: 2500 }
]

export const mockPropertyPerformance: PropertyPerformance[] = [
    { name: "Downtown Loft", revenue: 5000, bookings: 8 },
    { name: "Beach House", revenue: 4500, bookings: 6 },
    { name: "Mountain Cabin", revenue: 3200, bookings: 4 }
]

export const mockRevenueTrends: RevenueTrendItem[] = [
    { date: "2026-01-01", revenue: 1200, payout: 1080 },
    { date: "2026-01-08", revenue: 1500, payout: 1350 },
    { date: "2026-01-15", revenue: 1800, payout: 1620 },
    { date: "2026-01-22", revenue: 1400, payout: 1260 }
]

export const mockRecentActivity: Activity[] = [
    { type: "booking", property: "Downtown Loft", description: "New booking from Airbnb", timestamp: "2026-01-30T14:00:00Z" },
    { type: "check-in", property: "Beach House", description: "Guest checked in", timestamp: "2026-01-30T15:00:00Z" },
    { type: "cleaning", property: "Mountain Cabin", description: "Cleaning completed", timestamp: "2026-01-30T12:00:00Z" }
]

export const mockTaskPriorityBreakdown: TaskPriorityItem[] = [
    { label: "Urgent", count: 2, filterParam: "urgent" },
    { label: "High", count: 5, filterParam: "high" },
    { label: "Medium", count: 8, filterParam: "medium" },
    { label: "Low", count: 3, filterParam: "low" }
]

export const mockUpcomingCheckIns: UpcomingReservation[] = [
    {
        id: "res_003",
        property_id: "prop_001",
        guest_name: "Alice Brown",
        check_in_date: "2026-02-01",
        check_out_date: "2026-02-03",
        platform: "Airbnb",
        status: "confirmed",
        property_name: "Downtown Loft",
        check_in_time: "15:00"
    }
]

export const mockTodayCleaning: CleaningJobWithProperty[] = [
    {
        id: "clean_003",
        turno_id: "turno_003",
        property_id: "prop_001",
        property_name: "Downtown Loft",
        scheduled_date: "2026-01-31",
        scheduled_time: "11:00",
        deadline_time: "14:00",
        cleaner_name: "Maria Garcia",
        status: "pending"
    }
]

// ============================================================================
// Fetch Mock Utilities
// ============================================================================

type MockResponse = {
    ok: boolean
    status: number
    json: () => Promise<unknown>
}

type MockFetch = (url: string, init?: RequestInit) => Promise<MockResponse>

/**
 * Creates a mock fetch function that returns specified responses for endpoints
 */
export function createMockFetch(responses: Record<string, { data: unknown; status?: number }>): MockFetch {
    return async (url: string) => {
        // Extract endpoint from full URL
        const endpoint = url.replace(/^https?:\/\/[^/]+/, "")

        // Find matching response
        for (const [pattern, response] of Object.entries(responses)) {
            if (endpoint.startsWith(pattern) || endpoint === pattern) {
                const status = response.status || 200
                return {
                    ok: status >= 200 && status < 300,
                    status,
                    json: async () => response.data
                }
            }
        }

        // Default 404 response
        return {
            ok: false,
            status: 404,
            json: async () => ({ message: "Not found" })
        }
    }
}

/**
 * Creates a mock fetch that returns an error response
 */
export function createErrorFetch(status: number, message: string): MockFetch {
    return async () => ({
        ok: false,
        status,
        json: async () => ({ message, code: `ERR_${status}` })
    })
}

/**
 * Creates a mock fetch that throws a network error
 */
export function createNetworkErrorFetch(errorMessage: string = "Network error"): MockFetch {
    return async () => {
        throw new Error(errorMessage)
    }
}

/**
 * Wraps API response data in the expected ApiResponse format
 */
export function wrapApiResponse<T>(data: T, count?: number): ApiResponse<T> {
    return { data, count }
}
