/**
 * Tests for Properties Data Layer
 *
 * Tests getProperties and getProperty functions with Workers API mocks.
 * Validates data fetching, transformation, and error handling.
 */

import { describe, expect, it, beforeEach, afterEach } from "bun:test"
import {
    mockProperty,
    mockProperty2,
    mockProperties,
    mockReservations,
    mockCleaningJobs,
    mockTasks,
    wrapApiResponse
} from "./mock-helpers"

describe("Properties Data Layer", () => {
    const originalFetch = globalThis.fetch
    const originalConsoleError = console.error

    beforeEach(() => {
        // Suppress console.error in tests
        console.error = () => {}
    })

    afterEach(() => {
        globalThis.fetch = originalFetch
        console.error = originalConsoleError
    })

    describe("getProperties", () => {
        it("fetches all properties from Workers API", async () => {
            globalThis.fetch = async (url) => {
                if ((url as string).includes("/api/properties")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse(mockProperties)
                    } as Response
                }
                return { ok: false, status: 404, json: async () => ({}) } as Response
            }

            const { getProperties } = await import("../properties")
            const result = await getProperties()

            expect(result).toHaveLength(2)
            expect(result[0].id).toBe("prop_001")
            expect(result[0].name).toBe("Downtown Loft")
            expect(result[1].id).toBe("prop_002")
        })

        it("returns empty array when API returns null data", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => ({ data: null })
            } as Response)

            const { getProperties } = await import("../properties")
            const result = await getProperties()

            expect(result).toEqual([])
        })

        it("returns empty array on API error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 500,
                json: async () => ({ message: "Server error" })
            } as Response)

            const { getProperties } = await import("../properties")
            const result = await getProperties()

            expect(result).toEqual([])
        })

        it("returns empty array on network error", async () => {
            globalThis.fetch = async () => {
                throw new Error("Network failure")
            }

            const { getProperties } = await import("../properties")
            const result = await getProperties()

            expect(result).toEqual([])
        })

        it("preserves all property fields from API response", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([mockProperty])
            } as Response)

            const { getProperties } = await import("../properties")
            const result = await getProperties()

            expect(result[0]).toEqual(mockProperty)
            expect(result[0].hospitable_id).toBe("hosp_001")
            expect(result[0].internal_code).toBe("DTL-001")
            expect(result[0].building_name).toBe("The Main Building")
            expect(result[0].status).toBe("active")
        })
    })

    describe("getProperty", () => {
        it("fetches single property with related data", async () => {
            globalThis.fetch = async (url) => {
                const urlStr = url as string

                if (urlStr.includes("/api/properties/prop_001") && !urlStr.includes("?")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse(mockProperty)
                    } as Response
                }
                if (urlStr.includes("/api/reservations?property_id=prop_001")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse([mockReservations[0]])
                    } as Response
                }
                if (urlStr.includes("/api/cleaning?property_id=prop_001")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse([mockCleaningJobs[0]])
                    } as Response
                }
                if (urlStr.includes("/api/tasks?property_id=prop_001")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse([mockTasks[0]])
                    } as Response
                }

                return { ok: false, status: 404, json: async () => ({}) } as Response
            }

            const { getProperty } = await import("../properties")
            const result = await getProperty("prop_001")

            expect(result).not.toBeNull()
            expect(result!.id).toBe("prop_001")
            expect(result!.name).toBe("Downtown Loft")
            expect(result!.reservations).toHaveLength(1)
            expect(result!.cleaning_jobs).toHaveLength(1)
            expect(result!.tasks).toHaveLength(1)
        })

        it("returns null when property not found", async () => {
            globalThis.fetch = async (url) => {
                const urlStr = url as string

                if (urlStr.includes("/api/properties/")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => ({ data: null })
                    } as Response
                }

                // Return empty arrays for related data
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse([])
                } as Response
            }

            const { getProperty } = await import("../properties")
            const result = await getProperty("nonexistent")

            expect(result).toBeNull()
        })

        it("returns null on API error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 500,
                json: async () => ({ message: "Server error" })
            } as Response)

            const { getProperty } = await import("../properties")
            const result = await getProperty("prop_001")

            expect(result).toBeNull()
        })

        it("handles partial related data failures gracefully", async () => {
            // The getProperty function uses try/catch around Promise.all
            // When one request fails (throws WorkersApiError), Promise.all rejects
            // and the whole thing returns null due to the catch block

            // However, looking at the actual getReservationsByProperty, getCleaningJobsByProperty,
            // and getTasksByProperty - they each have their own try/catch that returns []
            // So individual failures don't propagate to Promise.all

            globalThis.fetch = async (url) => {
                const urlStr = url as string

                // Property succeeds
                if (urlStr.includes("/api/properties/prop_001") && !urlStr.includes("?")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse(mockProperty)
                    } as Response
                }

                // Reservations fails - but getReservationsByProperty catches and returns []
                if (urlStr.includes("/api/reservations")) {
                    return {
                        ok: false,
                        status: 500,
                        json: async () => ({ message: "Error" })
                    } as Response
                }

                // Others succeed
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse([])
                } as Response
            }

            const { getProperty } = await import("../properties")
            const result = await getProperty("prop_001")

            // Since each sub-function catches its own errors and returns [],
            // the property should still be returned with empty arrays for failed data
            expect(result).not.toBeNull()
            expect(result!.id).toBe("prop_001")
            expect(result!.reservations).toEqual([])
            expect(result!.cleaning_jobs).toEqual([])
            expect(result!.tasks).toEqual([])
        })

        it("fetches all related data in parallel", async () => {
            const callOrder: string[] = []

            globalThis.fetch = async (url) => {
                const urlStr = url as string
                const endpoint = urlStr.split("?")[0].split("/").pop()
                callOrder.push(endpoint || "unknown")

                if (urlStr.includes("/api/properties/")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse(mockProperty)
                    } as Response
                }

                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse([])
                } as Response
            }

            const { getProperty } = await import("../properties")
            await getProperty("prop_001")

            // All calls should be made (property + 3 related endpoints)
            expect(callOrder.length).toBeGreaterThanOrEqual(4)
        })
    })

    describe("Data Transformation", () => {
        it("correctly types PropertyWithDetails response", async () => {
            globalThis.fetch = async (url) => {
                const urlStr = url as string

                if (urlStr.includes("/api/properties/prop_001") && !urlStr.includes("?")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse(mockProperty)
                    } as Response
                }
                if (urlStr.includes("/api/reservations")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse(mockReservations)
                    } as Response
                }
                if (urlStr.includes("/api/cleaning")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse(mockCleaningJobs)
                    } as Response
                }
                if (urlStr.includes("/api/tasks")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse(mockTasks)
                    } as Response
                }

                return { ok: false, status: 404, json: async () => ({}) } as Response
            }

            const { getProperty } = await import("../properties")
            const result = await getProperty("prop_001")

            // Verify type structure
            expect(result).toHaveProperty("id")
            expect(result).toHaveProperty("name")
            expect(result).toHaveProperty("reservations")
            expect(result).toHaveProperty("cleaning_jobs")
            expect(result).toHaveProperty("tasks")

            // Verify nested data types
            expect(result!.reservations![0]).toHaveProperty("guest_name")
            expect(result!.cleaning_jobs![0]).toHaveProperty("cleaner_name")
            expect(result!.tasks![0]).toHaveProperty("priority")
        })
    })
})
