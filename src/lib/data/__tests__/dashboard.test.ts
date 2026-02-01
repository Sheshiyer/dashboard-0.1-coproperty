/**
 * Tests for Dashboard Data Layer
 *
 * Tests dashboard stats, trends, and analytics endpoints
 * with Workers API mocks.
 */

import { describe, expect, it, beforeEach, afterEach } from "bun:test"
import {
    mockDashboardStats,
    mockOccupancyTrends,
    mockBookingSources,
    mockPropertyPerformance,
    mockRevenueTrends,
    mockRecentActivity,
    mockTaskPriorityBreakdown,
    mockUpcomingCheckIns,
    mockTodayCleaning,
    wrapApiResponse
} from "./mock-helpers"

describe("Dashboard Data Layer", () => {
    const originalFetch = globalThis.fetch
    const originalConsoleError = console.error

    beforeEach(() => {
        console.error = () => {}
    })

    afterEach(() => {
        globalThis.fetch = originalFetch
        console.error = originalConsoleError
    })

    describe("getDashboardStats", () => {
        it("fetches dashboard stats from Workers API", async () => {
            let capturedUrl = ""

            globalThis.fetch = async (url) => {
                capturedUrl = url as string
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse(mockDashboardStats)
                } as Response
            }

            const { getDashboardStats } = await import("../dashboard")
            const result = await getDashboardStats()

            expect(capturedUrl).toContain("/api/dashboard/stats")
            expect(result.activeReservations).toBe(5)
            expect(result.pendingCleaning).toBe(3)
            expect(result.taskIssues).toBe(2)
            expect(result.totalProperties).toBe(10)
            expect(result.occupancyRate).toBe(78.5)
            expect(result.totalRevenue).toBe(25000)
        })

        it("returns default stats on API error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 500,
                json: async () => ({ message: "Server error" })
            } as Response)

            const { getDashboardStats } = await import("../dashboard")
            const result = await getDashboardStats()

            expect(result.activeReservations).toBe(0)
            expect(result.pendingCleaning).toBe(0)
            expect(result.taskIssues).toBe(0)
            expect(result.totalProperties).toBe(0)
            expect(result.occupancyRate).toBe(0)
            expect(result.totalRevenue).toBe(0)
        })

        it("returns default stats on network error", async () => {
            globalThis.fetch = async () => {
                throw new Error("Network failure")
            }

            const { getDashboardStats } = await import("../dashboard")
            const result = await getDashboardStats()

            expect(result.activeReservations).toBe(0)
            expect(result.totalRevenue).toBe(0)
        })
    })

    describe("getOccupancyTrends", () => {
        it("fetches occupancy trends with default days", async () => {
            let capturedUrl = ""

            globalThis.fetch = async (url) => {
                capturedUrl = url as string
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse(mockOccupancyTrends)
                } as Response
            }

            const { getOccupancyTrends } = await import("../dashboard")
            const result = await getOccupancyTrends()

            expect(capturedUrl).toContain("/api/dashboard/occupancy-trends?days=30")
            expect(result).toHaveLength(5)
            expect(result[0].date).toBe("2026-01-01")
            expect(result[0].rate).toBe(65)
        })

        it("fetches occupancy trends with custom days", async () => {
            let capturedUrl = ""

            globalThis.fetch = async (url) => {
                capturedUrl = url as string
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse(mockOccupancyTrends)
                } as Response
            }

            const { getOccupancyTrends } = await import("../dashboard")
            await getOccupancyTrends(60)

            expect(capturedUrl).toContain("/api/dashboard/occupancy-trends?days=60")
        })

        it("returns empty array on error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 500,
                json: async () => ({ message: "Server error" })
            } as Response)

            const { getOccupancyTrends } = await import("../dashboard")
            const result = await getOccupancyTrends()

            expect(result).toEqual([])
        })
    })

    describe("getBookingSources", () => {
        it("fetches booking sources", async () => {
            let capturedUrl = ""

            globalThis.fetch = async (url) => {
                capturedUrl = url as string
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse(mockBookingSources)
                } as Response
            }

            const { getBookingSources } = await import("../dashboard")
            const result = await getBookingSources()

            expect(capturedUrl).toContain("/api/dashboard/booking-sources")
            expect(result).toHaveLength(4)
            expect(result[0].name).toBe("Airbnb")
            expect(result[0].value).toBe(45)
            expect(result[0].revenue).toBe(15000)
        })

        it("returns empty array on error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 500,
                json: async () => ({ message: "Server error" })
            } as Response)

            const { getBookingSources } = await import("../dashboard")
            const result = await getBookingSources()

            expect(result).toEqual([])
        })
    })

    describe("getPropertyPerformance", () => {
        it("fetches property performance with defaults", async () => {
            let capturedUrl = ""

            globalThis.fetch = async (url) => {
                capturedUrl = url as string
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse(mockPropertyPerformance)
                } as Response
            }

            const { getPropertyPerformance } = await import("../dashboard")
            const result = await getPropertyPerformance()

            expect(capturedUrl).toContain("/api/dashboard/property-performance?limit=5&period=30")
            expect(result).toHaveLength(3)
            expect(result[0].name).toBe("Downtown Loft")
            expect(result[0].revenue).toBe(5000)
            expect(result[0].bookings).toBe(8)
        })

        it("fetches property performance with custom params", async () => {
            let capturedUrl = ""

            globalThis.fetch = async (url) => {
                capturedUrl = url as string
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse(mockPropertyPerformance)
                } as Response
            }

            const { getPropertyPerformance } = await import("../dashboard")
            await getPropertyPerformance(10, 90)

            expect(capturedUrl).toContain("/api/dashboard/property-performance?limit=10&period=90")
        })

        it("returns empty array on error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 500,
                json: async () => ({ message: "Server error" })
            } as Response)

            const { getPropertyPerformance } = await import("../dashboard")
            const result = await getPropertyPerformance()

            expect(result).toEqual([])
        })
    })

    describe("getRevenueTrends", () => {
        it("fetches revenue trends with default days", async () => {
            let capturedUrl = ""

            globalThis.fetch = async (url) => {
                capturedUrl = url as string
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse(mockRevenueTrends)
                } as Response
            }

            const { getRevenueTrends } = await import("../dashboard")
            const result = await getRevenueTrends()

            expect(capturedUrl).toContain("/api/dashboard/revenue-trends?days=30")
            expect(result).toHaveLength(4)
            expect(result[0].date).toBe("2026-01-01")
            expect(result[0].revenue).toBe(1200)
            expect(result[0].payout).toBe(1080)
        })

        it("fetches revenue trends with custom days", async () => {
            let capturedUrl = ""

            globalThis.fetch = async (url) => {
                capturedUrl = url as string
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse(mockRevenueTrends)
                } as Response
            }

            const { getRevenueTrends } = await import("../dashboard")
            await getRevenueTrends(7)

            expect(capturedUrl).toContain("/api/dashboard/revenue-trends?days=7")
        })

        it("returns empty array on error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 500,
                json: async () => ({ message: "Server error" })
            } as Response)

            const { getRevenueTrends } = await import("../dashboard")
            const result = await getRevenueTrends()

            expect(result).toEqual([])
        })
    })

    describe("getRecentActivity", () => {
        it("fetches recent activity with default limit", async () => {
            let capturedUrl = ""

            globalThis.fetch = async (url) => {
                capturedUrl = url as string
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse(mockRecentActivity)
                } as Response
            }

            const { getRecentActivity } = await import("../dashboard")
            const result = await getRecentActivity()

            expect(capturedUrl).toContain("/api/dashboard/recent-activity?limit=15")
            expect(result).toHaveLength(3)
            expect(result[0].type).toBe("booking")
            expect(result[0].property).toBe("Downtown Loft")
            expect(result[0].description).toBe("New booking from Airbnb")
        })

        it("fetches recent activity with custom limit", async () => {
            let capturedUrl = ""

            globalThis.fetch = async (url) => {
                capturedUrl = url as string
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse(mockRecentActivity)
                } as Response
            }

            const { getRecentActivity } = await import("../dashboard")
            await getRecentActivity(5)

            expect(capturedUrl).toContain("/api/dashboard/recent-activity?limit=5")
        })

        it("returns empty array on error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 500,
                json: async () => ({ message: "Server error" })
            } as Response)

            const { getRecentActivity } = await import("../dashboard")
            const result = await getRecentActivity()

            expect(result).toEqual([])
        })
    })

    describe("getTaskPriorityBreakdown", () => {
        it("fetches task priority breakdown", async () => {
            let capturedUrl = ""

            globalThis.fetch = async (url) => {
                capturedUrl = url as string
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse(mockTaskPriorityBreakdown)
                } as Response
            }

            const { getTaskPriorityBreakdown } = await import("../dashboard")
            const result = await getTaskPriorityBreakdown()

            expect(capturedUrl).toContain("/api/dashboard/task-priority-breakdown")
            expect(result).toHaveLength(4)
            expect(result[0].label).toBe("Urgent")
            expect(result[0].count).toBe(2)
            expect(result[0].filterParam).toBe("urgent")
        })

        it("returns empty array on error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 500,
                json: async () => ({ message: "Server error" })
            } as Response)

            const { getTaskPriorityBreakdown } = await import("../dashboard")
            const result = await getTaskPriorityBreakdown()

            expect(result).toEqual([])
        })
    })

    describe("getUpcomingCheckIns", () => {
        it("fetches upcoming check-ins with default limit", async () => {
            let capturedUrl = ""

            globalThis.fetch = async (url) => {
                capturedUrl = url as string
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse(mockUpcomingCheckIns)
                } as Response
            }

            const { getUpcomingCheckIns } = await import("../dashboard")
            const result = await getUpcomingCheckIns()

            expect(capturedUrl).toContain("/api/dashboard/upcoming?limit=50")
            expect(result).toHaveLength(1)
            expect(result[0].guest_name).toBe("Alice Brown")
            expect(result[0].property_name).toBe("Downtown Loft")
            expect(result[0].check_in_time).toBe("15:00")
        })

        it("fetches upcoming check-ins with custom limit", async () => {
            let capturedUrl = ""

            globalThis.fetch = async (url) => {
                capturedUrl = url as string
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse(mockUpcomingCheckIns)
                } as Response
            }

            const { getUpcomingCheckIns } = await import("../dashboard")
            await getUpcomingCheckIns(10)

            expect(capturedUrl).toContain("/api/dashboard/upcoming?limit=10")
        })

        it("returns empty array on error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 500,
                json: async () => ({ message: "Server error" })
            } as Response)

            const { getUpcomingCheckIns } = await import("../dashboard")
            const result = await getUpcomingCheckIns()

            expect(result).toEqual([])
        })
    })

    describe("getTodayCleaning", () => {
        it("fetches today's cleaning jobs", async () => {
            let capturedUrl = ""

            globalThis.fetch = async (url) => {
                capturedUrl = url as string
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse(mockTodayCleaning)
                } as Response
            }

            const { getTodayCleaning } = await import("../dashboard")
            const result = await getTodayCleaning()

            expect(capturedUrl).toContain("/api/dashboard/today-cleaning")
            expect(result).toHaveLength(1)
            expect(result[0].property_name).toBe("Downtown Loft")
            expect(result[0].cleaner_name).toBe("Maria Garcia")
            expect(result[0].status).toBe("pending")
        })

        it("returns empty array on error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 500,
                json: async () => ({ message: "Server error" })
            } as Response)

            const { getTodayCleaning } = await import("../dashboard")
            const result = await getTodayCleaning()

            expect(result).toEqual([])
        })
    })

    describe("Activity Types", () => {
        it("handles booking activity type", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([{
                    type: "booking",
                    property: "Test Property",
                    description: "New booking",
                    timestamp: "2026-01-31T10:00:00Z"
                }])
            } as Response)

            const { getRecentActivity } = await import("../dashboard")
            const result = await getRecentActivity()

            expect(result[0].type).toBe("booking")
        })

        it("handles check-in activity type", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([{
                    type: "check-in",
                    property: "Test Property",
                    description: "Guest arrived",
                    timestamp: "2026-01-31T15:00:00Z"
                }])
            } as Response)

            const { getRecentActivity } = await import("../dashboard")
            const result = await getRecentActivity()

            expect(result[0].type).toBe("check-in")
        })

        it("handles check-out activity type", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([{
                    type: "check-out",
                    property: "Test Property",
                    description: "Guest departed",
                    timestamp: "2026-01-31T11:00:00Z"
                }])
            } as Response)

            const { getRecentActivity } = await import("../dashboard")
            const result = await getRecentActivity()

            expect(result[0].type).toBe("check-out")
        })

        it("handles cleaning activity type", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([{
                    type: "cleaning",
                    property: "Test Property",
                    description: "Cleaning completed",
                    timestamp: "2026-01-31T14:00:00Z"
                }])
            } as Response)

            const { getRecentActivity } = await import("../dashboard")
            const result = await getRecentActivity()

            expect(result[0].type).toBe("cleaning")
        })

        it("handles maintenance activity type", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([{
                    type: "maintenance",
                    property: "Test Property",
                    description: "Repair completed",
                    timestamp: "2026-01-31T16:00:00Z"
                }])
            } as Response)

            const { getRecentActivity } = await import("../dashboard")
            const result = await getRecentActivity()

            expect(result[0].type).toBe("maintenance")
        })
    })

    describe("Cleaning Job Statuses in Dashboard", () => {
        it("handles pending cleaning status", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([{
                    ...mockTodayCleaning[0],
                    status: "pending"
                }])
            } as Response)

            const { getTodayCleaning } = await import("../dashboard")
            const result = await getTodayCleaning()

            expect(result[0].status).toBe("pending")
        })

        it("handles in_progress cleaning status", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([{
                    ...mockTodayCleaning[0],
                    status: "in_progress",
                    started_at: "2026-01-31T11:30:00Z"
                }])
            } as Response)

            const { getTodayCleaning } = await import("../dashboard")
            const result = await getTodayCleaning()

            expect(result[0].status).toBe("in_progress")
            expect(result[0].started_at).toBe("2026-01-31T11:30:00Z")
        })

        it("handles completed cleaning status", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([{
                    ...mockTodayCleaning[0],
                    status: "completed",
                    completed_at: "2026-01-31T13:00:00Z"
                }])
            } as Response)

            const { getTodayCleaning } = await import("../dashboard")
            const result = await getTodayCleaning()

            expect(result[0].status).toBe("completed")
            expect(result[0].completed_at).toBe("2026-01-31T13:00:00Z")
        })

        it("handles verified cleaning status", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([{
                    ...mockTodayCleaning[0],
                    status: "verified"
                }])
            } as Response)

            const { getTodayCleaning } = await import("../dashboard")
            const result = await getTodayCleaning()

            expect(result[0].status).toBe("verified")
        })
    })

    describe("Error Recovery", () => {
        it("individual endpoints fail independently", async () => {
            // Each dashboard function should fail gracefully without affecting others
            globalThis.fetch = async (url) => {
                const urlStr = url as string

                // Stats succeeds
                if (urlStr.includes("/stats")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse(mockDashboardStats)
                    } as Response
                }

                // Everything else fails
                return {
                    ok: false,
                    status: 500,
                    json: async () => ({ message: "Server error" })
                } as Response
            }

            const dashboard = await import("../dashboard")

            const stats = await dashboard.getDashboardStats()
            const trends = await dashboard.getOccupancyTrends()

            // Stats should succeed
            expect(stats.activeReservations).toBe(5)
            // Trends should return empty (graceful failure)
            expect(trends).toEqual([])
        })
    })
})
