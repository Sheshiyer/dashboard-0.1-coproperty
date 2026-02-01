/**
 * Tests for Reservations Data Layer
 *
 * Tests reservation fetching and filtering with Workers API mocks.
 * Validates property enrichment and date range queries.
 */

import { describe, expect, it, beforeEach, afterEach } from "bun:test"
import {
    mockReservation,
    mockReservations,
    mockProperties,
    wrapApiResponse
} from "./mock-helpers"

describe("Reservations Data Layer", () => {
    const originalFetch = globalThis.fetch
    const originalConsoleError = console.error

    beforeEach(() => {
        console.error = () => {}
    })

    afterEach(() => {
        globalThis.fetch = originalFetch
        console.error = originalConsoleError
    })

    describe("getReservations", () => {
        it("fetches all reservations with property data enrichment", async () => {
            globalThis.fetch = async (url) => {
                const urlStr = url as string

                if (urlStr.includes("/api/reservations") && !urlStr.includes("?")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse(mockReservations)
                    } as Response
                }
                if (urlStr.includes("/api/properties")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse(mockProperties)
                    } as Response
                }

                return { ok: false, status: 404, json: async () => ({}) } as Response
            }

            const { getReservations } = await import("../reservations")
            const result = await getReservations()

            expect(result).toHaveLength(2)
            expect(result[0].id).toBe("res_001")
            expect(result[0].guest_name).toBe("John Smith")
            // Property should be enriched
            expect(result[0].properties).toBeDefined()
            expect(result[0].properties?.name).toBe("Downtown Loft")
        })

        it("enriches reservations with correct property data", async () => {
            globalThis.fetch = async (url) => {
                const urlStr = url as string

                if (urlStr.includes("/api/reservations")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse([
                            { ...mockReservation, property_id: "prop_002" }
                        ])
                    } as Response
                }
                if (urlStr.includes("/api/properties")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse(mockProperties)
                    } as Response
                }

                return { ok: false, status: 404, json: async () => ({}) } as Response
            }

            const { getReservations } = await import("../reservations")
            const result = await getReservations()

            expect(result[0].properties?.id).toBe("prop_002")
            expect(result[0].properties?.name).toBe("Beach House")
        })

        it("returns empty array on API error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 500,
                json: async () => ({ message: "Server error" })
            } as Response)

            const { getReservations } = await import("../reservations")
            const result = await getReservations()

            expect(result).toEqual([])
        })

        it("returns empty array on network error", async () => {
            globalThis.fetch = async () => {
                throw new Error("Network failure")
            }

            const { getReservations } = await import("../reservations")
            const result = await getReservations()

            expect(result).toEqual([])
        })

        it("handles missing property data gracefully", async () => {
            globalThis.fetch = async (url) => {
                const urlStr = url as string

                if (urlStr.includes("/api/reservations")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse([
                            { ...mockReservation, property_id: "nonexistent_prop" }
                        ])
                    } as Response
                }
                if (urlStr.includes("/api/properties")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse([])
                    } as Response
                }

                return { ok: false, status: 404, json: async () => ({}) } as Response
            }

            const { getReservations } = await import("../reservations")
            const result = await getReservations()

            expect(result).toHaveLength(1)
            expect(result[0].properties).toBeUndefined()
        })
    })

    describe("getReservationsByProperty", () => {
        it("fetches reservations for specific property", async () => {
            let capturedUrl = ""

            globalThis.fetch = async (url) => {
                capturedUrl = url as string
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse([mockReservation])
                } as Response
            }

            const { getReservationsByProperty } = await import("../reservations")
            const result = await getReservationsByProperty("prop_001")

            expect(capturedUrl).toContain("/api/reservations?property_id=prop_001")
            expect(result).toHaveLength(1)
            expect(result[0].property_id).toBe("prop_001")
        })

        it("returns empty array when property has no reservations", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([])
            } as Response)

            const { getReservationsByProperty } = await import("../reservations")
            const result = await getReservationsByProperty("prop_999")

            expect(result).toEqual([])
        })

        it("returns empty array on error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 404,
                json: async () => ({ message: "Not found" })
            } as Response)

            const { getReservationsByProperty } = await import("../reservations")
            const result = await getReservationsByProperty("prop_001")

            expect(result).toEqual([])
        })
    })

    describe("getReservationsByDateRange", () => {
        it("fetches reservations within date range", async () => {
            let capturedUrl = ""

            globalThis.fetch = async (url) => {
                capturedUrl = url as string
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse(mockReservations)
                } as Response
            }

            const { getReservationsByDateRange } = await import("../reservations")
            const result = await getReservationsByDateRange("2026-02-01", "2026-02-28")

            expect(capturedUrl).toContain("/api/reservations?from=2026-02-01&to=2026-02-28")
            expect(result).toHaveLength(2)
        })

        it("returns empty array for date range with no reservations", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([])
            } as Response)

            const { getReservationsByDateRange } = await import("../reservations")
            const result = await getReservationsByDateRange("2020-01-01", "2020-01-31")

            expect(result).toEqual([])
        })

        it("returns empty array on error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 400,
                json: async () => ({ message: "Invalid date format" })
            } as Response)

            const { getReservationsByDateRange } = await import("../reservations")
            const result = await getReservationsByDateRange("invalid", "dates")

            expect(result).toEqual([])
        })
    })

    describe("getReservation", () => {
        it("fetches single reservation by ID", async () => {
            let capturedUrl = ""

            globalThis.fetch = async (url) => {
                capturedUrl = url as string
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse(mockReservation)
                } as Response
            }

            const { getReservation } = await import("../reservations")
            const result = await getReservation("res_001")

            expect(capturedUrl).toContain("/api/reservations/res_001")
            expect(result).not.toBeNull()
            expect(result!.id).toBe("res_001")
            expect(result!.guest_name).toBe("John Smith")
        })

        it("returns null when reservation not found", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => ({ data: null })
            } as Response)

            const { getReservation } = await import("../reservations")
            const result = await getReservation("nonexistent")

            expect(result).toBeNull()
        })

        it("returns null on 404 error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 404,
                json: async () => ({ message: "Reservation not found" })
            } as Response)

            const { getReservation } = await import("../reservations")
            const result = await getReservation("res_999")

            expect(result).toBeNull()
        })

        it("preserves all reservation fields", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse(mockReservation)
            } as Response)

            const { getReservation } = await import("../reservations")
            const result = await getReservation("res_001")

            expect(result!.confirmation_code).toBe("ABC123")
            expect(result!.platform).toBe("Airbnb")
            expect(result!.check_in_date).toBe("2026-02-01")
            expect(result!.check_out_date).toBe("2026-02-05")
            expect(result!.total_price).toBe(500)
            expect(result!.payout_amount).toBe(450)
            expect(result!.currency).toBe("USD")
            expect(result!.special_requests).toBe("Late check-in")
        })
    })

    describe("Data Transformation", () => {
        it("maps reservations with their properties correctly", async () => {
            globalThis.fetch = async (url) => {
                const urlStr = url as string

                if (urlStr.includes("/api/reservations")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse(mockReservations)
                    } as Response
                }
                if (urlStr.includes("/api/properties")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse(mockProperties)
                    } as Response
                }

                return { ok: false, status: 404, json: async () => ({}) } as Response
            }

            const { getReservations } = await import("../reservations")
            const result = await getReservations()

            // First reservation should match first property
            expect(result[0].property_id).toBe("prop_001")
            expect(result[0].properties?.id).toBe("prop_001")

            // Second reservation should match second property
            expect(result[1].property_id).toBe("prop_002")
            expect(result[1].properties?.id).toBe("prop_002")
        })
    })
})
