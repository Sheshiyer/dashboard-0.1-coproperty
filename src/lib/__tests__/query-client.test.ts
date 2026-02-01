/**
 * Tests for React Query Client Configuration
 *
 * Validates that the query client is properly configured with
 * correct stale times, cache times, retry logic, and defaults.
 */

import { describe, expect, it } from "bun:test"

describe("Query Client Configuration", () => {
    it("exports a configured QueryClient instance", async () => {
        const { queryClient } = await import("../query-client")
        expect(queryClient).toBeDefined()
        expect(typeof queryClient.getDefaultOptions).toBe("function")
    })

    it("sets staleTime to 5 minutes", async () => {
        const { queryClient } = await import("../query-client")
        const defaults = queryClient.getDefaultOptions()
        expect(defaults.queries?.staleTime).toBe(5 * 60 * 1000)
    })

    it("sets gcTime to 10 minutes", async () => {
        const { queryClient } = await import("../query-client")
        const defaults = queryClient.getDefaultOptions()
        expect(defaults.queries?.gcTime).toBe(10 * 60 * 1000)
    })

    it("disables refetchOnWindowFocus", async () => {
        const { queryClient } = await import("../query-client")
        const defaults = queryClient.getDefaultOptions()
        expect(defaults.queries?.refetchOnWindowFocus).toBe(false)
    })

    it("enables refetchOnReconnect", async () => {
        const { queryClient } = await import("../query-client")
        const defaults = queryClient.getDefaultOptions()
        expect(defaults.queries?.refetchOnReconnect).toBe(true)
    })

    it("sets query retry to 3", async () => {
        const { queryClient } = await import("../query-client")
        const defaults = queryClient.getDefaultOptions()
        expect(defaults.queries?.retry).toBe(3)
    })

    it("sets mutation retry to 1", async () => {
        const { queryClient } = await import("../query-client")
        const defaults = queryClient.getDefaultOptions()
        expect(defaults.mutations?.retry).toBe(1)
    })

    it("implements exponential backoff retry delay", async () => {
        const { queryClient } = await import("../query-client")
        const defaults = queryClient.getDefaultOptions()
        const retryDelay = defaults.queries?.retryDelay as (attemptIndex: number) => number

        expect(typeof retryDelay).toBe("function")

        // Attempt 0: min(1000 * 2^0, 30000) = 1000
        expect(retryDelay(0)).toBe(1000)

        // Attempt 1: min(1000 * 2^1, 30000) = 2000
        expect(retryDelay(1)).toBe(2000)

        // Attempt 2: min(1000 * 2^2, 30000) = 4000
        expect(retryDelay(2)).toBe(4000)

        // Attempt 10: min(1000 * 2^10, 30000) = 30000 (capped)
        expect(retryDelay(10)).toBe(30000)
    })
})

describe("Query Key Factory", () => {
    it("exports query key factory with all expected keys", async () => {
        const { queryKeys } = await import("../query-client")
        expect(queryKeys).toBeDefined()
        expect(queryKeys.properties).toBeDefined()
        expect(queryKeys.reservations).toBeDefined()
        expect(queryKeys.tasks).toBeDefined()
        expect(queryKeys.cleaning).toBeDefined()
        expect(queryKeys.dashboard).toBeDefined()
    })

    it("generates correct property query keys", async () => {
        const { queryKeys } = await import("../query-client")
        expect(queryKeys.properties.all()).toEqual(["properties"])
        expect(queryKeys.properties.detail("prop_001")).toEqual(["properties", "prop_001"])
    })

    it("generates correct reservation query keys", async () => {
        const { queryKeys } = await import("../query-client")
        expect(queryKeys.reservations.all()).toEqual(["reservations"])
        expect(queryKeys.reservations.byProperty("prop_001")).toEqual(["reservations", "property", "prop_001"])
        expect(queryKeys.reservations.byDateRange("2026-01-01", "2026-01-31")).toEqual([
            "reservations", "dateRange", "2026-01-01", "2026-01-31"
        ])
    })

    it("generates correct task query keys", async () => {
        const { queryKeys } = await import("../query-client")
        expect(queryKeys.tasks.all()).toEqual(["tasks"])
        expect(queryKeys.tasks.byProperty("prop_001")).toEqual(["tasks", "property", "prop_001"])
        expect(queryKeys.tasks.byStatus("pending")).toEqual(["tasks", "status", "pending"])
    })

    it("generates correct cleaning query keys", async () => {
        const { queryKeys } = await import("../query-client")
        expect(queryKeys.cleaning.all()).toEqual(["cleaning"])
        expect(queryKeys.cleaning.byDate("2026-01-31")).toEqual(["cleaning", "date", "2026-01-31"])
        expect(queryKeys.cleaning.byProperty("prop_001")).toEqual(["cleaning", "property", "prop_001"])
    })

    it("generates correct dashboard query keys", async () => {
        const { queryKeys } = await import("../query-client")
        expect(queryKeys.dashboard.stats()).toEqual(["dashboard", "stats"])
        expect(queryKeys.dashboard.upcomingCheckIns()).toEqual(["dashboard", "upcoming-checkins"])
        expect(queryKeys.dashboard.todayCleaning()).toEqual(["dashboard", "today-cleaning"])
        expect(queryKeys.dashboard.recentActivity()).toEqual(["dashboard", "recent-activity"])
        expect(queryKeys.dashboard.occupancyTrends()).toEqual(["dashboard", "occupancy-trends"])
        expect(queryKeys.dashboard.revenueTrends()).toEqual(["dashboard", "revenue-trends"])
        expect(queryKeys.dashboard.bookingSources()).toEqual(["dashboard", "booking-sources"])
        expect(queryKeys.dashboard.propertyPerformance()).toEqual(["dashboard", "property-performance"])
        expect(queryKeys.dashboard.taskPriority()).toEqual(["dashboard", "task-priority"])
    })
})
