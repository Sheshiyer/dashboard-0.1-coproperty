/**
 * Tests for Cleaning Jobs Data Layer
 *
 * Tests cleaning job fetching, filtering, and status updates
 * with Workers API mocks.
 */

import { describe, expect, it, beforeEach, afterEach } from "bun:test"
import {
    mockCleaningJob,
    mockCleaningJobs,
    mockProperties,
    wrapApiResponse
} from "./mock-helpers"

describe("Cleaning Jobs Data Layer", () => {
    const originalFetch = globalThis.fetch
    const originalConsoleError = console.error

    beforeEach(() => {
        console.error = () => {}
    })

    afterEach(() => {
        globalThis.fetch = originalFetch
        console.error = originalConsoleError
    })

    describe("getCleaningJobs", () => {
        it("fetches all cleaning jobs with property enrichment", async () => {
            globalThis.fetch = async (url) => {
                const urlStr = url as string

                if (urlStr.includes("/api/cleaning") && !urlStr.includes("?")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse(mockCleaningJobs)
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

            const { getCleaningJobs } = await import("../cleaning")
            const result = await getCleaningJobs()

            expect(result).toHaveLength(2)
            expect(result[0].id).toBe("clean_001")
            expect(result[0].cleaner_name).toBe("Maria Garcia")
            expect(result[0].properties).toBeDefined()
            expect(result[0].properties?.name).toBe("Downtown Loft")
        })

        it("enriches cleaning jobs with correct property data", async () => {
            globalThis.fetch = async (url) => {
                const urlStr = url as string

                if (urlStr.includes("/api/cleaning")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse([
                            { ...mockCleaningJob, property_id: "prop_002" }
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

            const { getCleaningJobs } = await import("../cleaning")
            const result = await getCleaningJobs()

            expect(result[0].properties?.id).toBe("prop_002")
            expect(result[0].properties?.name).toBe("Beach House")
        })

        it("returns empty array on API error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 500,
                json: async () => ({ message: "Server error" })
            } as Response)

            const { getCleaningJobs } = await import("../cleaning")
            const result = await getCleaningJobs()

            expect(result).toEqual([])
        })

        it("returns empty array on network error", async () => {
            globalThis.fetch = async () => {
                throw new Error("Network failure")
            }

            const { getCleaningJobs } = await import("../cleaning")
            const result = await getCleaningJobs()

            expect(result).toEqual([])
        })

        it("handles missing property data gracefully", async () => {
            globalThis.fetch = async (url) => {
                const urlStr = url as string

                if (urlStr.includes("/api/cleaning")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse([
                            { ...mockCleaningJob, property_id: "nonexistent_prop" }
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

            const { getCleaningJobs } = await import("../cleaning")
            const result = await getCleaningJobs()

            expect(result).toHaveLength(1)
            expect(result[0].properties).toBeUndefined()
        })
    })

    describe("getCleaningJobsByDate", () => {
        it("fetches cleaning jobs for specific date", async () => {
            let capturedUrl = ""

            globalThis.fetch = async (url) => {
                capturedUrl = url as string
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse([mockCleaningJob])
                } as Response
            }

            const { getCleaningJobsByDate } = await import("../cleaning")
            const result = await getCleaningJobsByDate("2026-02-05")

            expect(capturedUrl).toContain("/api/cleaning?date=2026-02-05")
            expect(result).toHaveLength(1)
            expect(result[0].scheduled_date).toBe("2026-02-05")
        })

        it("returns empty array when no jobs on date", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([])
            } as Response)

            const { getCleaningJobsByDate } = await import("../cleaning")
            const result = await getCleaningJobsByDate("2020-01-01")

            expect(result).toEqual([])
        })

        it("returns empty array on error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 400,
                json: async () => ({ message: "Invalid date" })
            } as Response)

            const { getCleaningJobsByDate } = await import("../cleaning")
            const result = await getCleaningJobsByDate("invalid-date")

            expect(result).toEqual([])
        })
    })

    describe("getCleaningJobsByProperty", () => {
        it("fetches cleaning jobs for specific property", async () => {
            let capturedUrl = ""

            globalThis.fetch = async (url) => {
                capturedUrl = url as string
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse([mockCleaningJob])
                } as Response
            }

            const { getCleaningJobsByProperty } = await import("../cleaning")
            const result = await getCleaningJobsByProperty("prop_001")

            expect(capturedUrl).toContain("/api/cleaning?property_id=prop_001")
            expect(result).toHaveLength(1)
            expect(result[0].property_id).toBe("prop_001")
        })

        it("returns empty array when property has no cleaning jobs", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([])
            } as Response)

            const { getCleaningJobsByProperty } = await import("../cleaning")
            const result = await getCleaningJobsByProperty("prop_999")

            expect(result).toEqual([])
        })

        it("returns empty array on error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 404,
                json: async () => ({ message: "Not found" })
            } as Response)

            const { getCleaningJobsByProperty } = await import("../cleaning")
            const result = await getCleaningJobsByProperty("prop_001")

            expect(result).toEqual([])
        })
    })

    describe("updateCleaningJobStatus", () => {
        it("updates cleaning job status via PATCH", async () => {
            let capturedUrl = ""
            let capturedMethod = ""
            let capturedBody = ""

            globalThis.fetch = async (url, init) => {
                capturedUrl = url as string
                capturedMethod = init?.method || "GET"
                capturedBody = init?.body as string || ""
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse({
                        ...mockCleaningJob,
                        status: "completed",
                        completed_at: "2026-02-05T12:00:00Z"
                    })
                } as Response
            }

            const { updateCleaningJobStatus } = await import("../cleaning")
            const result = await updateCleaningJobStatus("clean_001", "completed")

            expect(capturedUrl).toContain("/api/cleaning/clean_001/status")
            expect(capturedMethod).toBe("PATCH")
            expect(JSON.parse(capturedBody)).toEqual({ status: "completed" })
            expect(result).not.toBeNull()
            expect(result!.status).toBe("completed")
            expect(result!.completed_at).toBeDefined()
        })

        it("updates to in_progress status", async () => {
            let capturedBody = ""

            globalThis.fetch = async (_url, init) => {
                capturedBody = init?.body as string || ""
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse({
                        ...mockCleaningJob,
                        status: "in_progress",
                        started_at: "2026-02-05T11:30:00Z"
                    })
                } as Response
            }

            const { updateCleaningJobStatus } = await import("../cleaning")
            const result = await updateCleaningJobStatus("clean_001", "in_progress")

            expect(JSON.parse(capturedBody)).toEqual({ status: "in_progress" })
            expect(result!.status).toBe("in_progress")
            expect(result!.started_at).toBeDefined()
        })

        it("updates to verified status", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse({
                    ...mockCleaningJob,
                    status: "verified",
                    verified_at: "2026-02-05T13:00:00Z"
                })
            } as Response)

            const { updateCleaningJobStatus } = await import("../cleaning")
            const result = await updateCleaningJobStatus("clean_001", "verified")

            expect(result!.status).toBe("verified")
        })

        it("returns null on 404 error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 404,
                json: async () => ({ message: "Cleaning job not found" })
            } as Response)

            const { updateCleaningJobStatus } = await import("../cleaning")
            const result = await updateCleaningJobStatus("nonexistent", "completed")

            expect(result).toBeNull()
        })

        it("returns null on 400 error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 400,
                json: async () => ({ message: "Invalid status transition" })
            } as Response)

            const { updateCleaningJobStatus } = await import("../cleaning")
            const result = await updateCleaningJobStatus("clean_001", "pending")

            expect(result).toBeNull()
        })

        it("returns null on network error", async () => {
            globalThis.fetch = async () => {
                throw new Error("Network failure")
            }

            const { updateCleaningJobStatus } = await import("../cleaning")
            const result = await updateCleaningJobStatus("clean_001", "completed")

            expect(result).toBeNull()
        })
    })

    describe("Cleaning Job Status Values", () => {
        it("handles pending status", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([{
                    ...mockCleaningJob,
                    status: "pending"
                }])
            } as Response)

            const { getCleaningJobsByDate } = await import("../cleaning")
            const result = await getCleaningJobsByDate("2026-02-05")

            expect(result[0].status).toBe("pending")
        })

        it("handles in_progress status with started_at", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([{
                    ...mockCleaningJob,
                    status: "in_progress",
                    started_at: "2026-02-05T11:30:00Z"
                }])
            } as Response)

            const { getCleaningJobsByDate } = await import("../cleaning")
            const result = await getCleaningJobsByDate("2026-02-05")

            expect(result[0].status).toBe("in_progress")
            expect(result[0].started_at).toBe("2026-02-05T11:30:00Z")
        })

        it("handles completed status with completed_at", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([{
                    ...mockCleaningJob,
                    status: "completed",
                    completed_at: "2026-02-05T14:00:00Z"
                }])
            } as Response)

            const { getCleaningJobsByDate } = await import("../cleaning")
            const result = await getCleaningJobsByDate("2026-02-05")

            expect(result[0].status).toBe("completed")
            expect(result[0].completed_at).toBe("2026-02-05T14:00:00Z")
        })

        it("handles verified status with verified_at", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([{
                    ...mockCleaningJob,
                    status: "verified",
                    verified_at: "2026-02-05T15:00:00Z"
                }])
            } as Response)

            const { getCleaningJobsByDate } = await import("../cleaning")
            const result = await getCleaningJobsByDate("2026-02-05")

            expect(result[0].status).toBe("verified")
        })
    })

    describe("Data Preservation", () => {
        it("preserves all cleaning job fields", async () => {
            const fullJob = {
                ...mockCleaningJob,
                next_reservation_id: "res_002",
                checklist_completed: true,
                photo_count: 5,
                issues_reported: ["Broken handle", "Stain on carpet"]
            }

            globalThis.fetch = async (url) => {
                const urlStr = url as string

                if (urlStr.includes("/api/cleaning")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse([fullJob])
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

            const { getCleaningJobs } = await import("../cleaning")
            const result = await getCleaningJobs()

            expect(result[0].turno_id).toBe("turno_001")
            expect(result[0].reservation_id).toBe("res_001")
            expect(result[0].next_reservation_id).toBe("res_002")
            expect(result[0].scheduled_time).toBe("11:30")
            expect(result[0].deadline_time).toBe("15:00")
            expect(result[0].cleaner_phone).toBe("+1987654321")
            expect(result[0].checklist_completed).toBe(true)
            expect(result[0].photo_count).toBe(5)
            expect(result[0].issues_reported).toEqual(["Broken handle", "Stain on carpet"])
        })
    })
})
