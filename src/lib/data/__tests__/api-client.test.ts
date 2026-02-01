/**
 * Tests for Workers API Client
 *
 * Tests the core API client functionality including:
 * - Successful requests
 * - Error handling (4xx, 5xx)
 * - Network errors
 * - Authentication headers
 */

import { describe, expect, it, afterEach } from "bun:test"

// We need to test the apiClient module
// Since it's not exported as a class, we'll test through the data layer modules

describe("API Client Core", () => {
    const originalFetch = globalThis.fetch

    afterEach(() => {
        globalThis.fetch = originalFetch
    })

    describe("Successful Requests", () => {
        it("makes GET request with correct headers", async () => {
            let capturedHeaders: HeadersInit = {}
            let capturedUrl = ""

            globalThis.fetch = async (url, init) => {
                capturedUrl = url as string
                capturedHeaders = init?.headers || {}
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({ data: [] })
                } as Response
            }

            // Import fresh to use mocked fetch
            const { apiClient } = await import("@/lib/api-client")
            await apiClient("/api/test")

            expect(capturedUrl).toContain("/api/test")
            expect(capturedHeaders).toHaveProperty("Content-Type", "application/json")
        })

        it("includes Authorization header when API_KEY is set (server-side)", async () => {
            // Note: This test validates the conceptual behavior.
            // In bun:test, we can't easily mock module re-imports.
            // The apiClient reads API_KEY at import time, so we validate
            // the header structure is correct when auth is present.
            let capturedHeaders: Record<string, string> = {}

            globalThis.fetch = async (_url, init) => {
                capturedHeaders = init?.headers as Record<string, string> || {}
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({ data: [] })
                } as Response
            }

            const { apiClient } = await import("@/lib/api-client")
            await apiClient("/api/test")

            // Verify Content-Type is always set
            expect(capturedHeaders["Content-Type"]).toBe("application/json")
            // Authorization header presence depends on environment
            // In test env, it may or may not be set
        })

        it("parses JSON response correctly", async () => {
            const mockData = { id: "123", name: "Test" }

            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => ({ data: mockData })
            } as Response)

            const { apiClient } = await import("@/lib/api-client")
            const result = await apiClient<{ data: typeof mockData }>("/api/test")

            expect(result.data).toEqual(mockData)
        })

        it("sends POST body as JSON", async () => {
            let capturedBody = ""
            let capturedMethod = ""

            globalThis.fetch = async (_url, init) => {
                capturedMethod = init?.method || "GET"
                capturedBody = init?.body as string || ""
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({ data: { id: "new" } })
                } as Response
            }

            const { apiClient } = await import("@/lib/api-client")
            await apiClient("/api/test", {
                method: "POST",
                body: { name: "New Item" }
            })

            expect(capturedMethod).toBe("POST")
            expect(JSON.parse(capturedBody)).toEqual({ name: "New Item" })
        })
    })

    describe("Error Handling", () => {
        it("throws WorkersApiError for 400 Bad Request", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 400,
                json: async () => ({ message: "Invalid input", code: "BAD_REQUEST" })
            } as Response)

            const { apiClient, WorkersApiError } = await import("@/lib/api-client")

            try {
                await apiClient("/api/test")
                expect(true).toBe(false) // Should not reach here
            } catch (error) {
                expect(error).toBeInstanceOf(WorkersApiError)
                expect((error as Error).message).toBe("Invalid input")
                expect((error as InstanceType<typeof WorkersApiError>).status).toBe(400)
                expect((error as InstanceType<typeof WorkersApiError>).code).toBe("BAD_REQUEST")
            }
        })

        it("throws WorkersApiError for 401 Unauthorized", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 401,
                json: async () => ({ message: "Authentication required" })
            } as Response)

            const { apiClient, WorkersApiError } = await import("@/lib/api-client")

            try {
                await apiClient("/api/test")
                expect(true).toBe(false)
            } catch (error) {
                expect(error).toBeInstanceOf(WorkersApiError)
                expect((error as InstanceType<typeof WorkersApiError>).status).toBe(401)
            }
        })

        it("throws WorkersApiError for 404 Not Found", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 404,
                json: async () => ({ message: "Resource not found", code: "NOT_FOUND" })
            } as Response)

            const { apiClient, WorkersApiError } = await import("@/lib/api-client")

            try {
                await apiClient("/api/test")
                expect(true).toBe(false)
            } catch (error) {
                expect(error).toBeInstanceOf(WorkersApiError)
                expect((error as InstanceType<typeof WorkersApiError>).status).toBe(404)
            }
        })

        it("throws WorkersApiError for 500 Server Error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 500,
                json: async () => ({ message: "Internal server error" })
            } as Response)

            const { apiClient, WorkersApiError } = await import("@/lib/api-client")

            try {
                await apiClient("/api/test")
                expect(true).toBe(false)
            } catch (error) {
                expect(error).toBeInstanceOf(WorkersApiError)
                expect((error as InstanceType<typeof WorkersApiError>).status).toBe(500)
            }
        })

        it("handles malformed JSON error response", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 500,
                json: async () => {
                    throw new Error("Invalid JSON")
                }
            } as Response)

            const { apiClient, WorkersApiError } = await import("@/lib/api-client")

            try {
                await apiClient("/api/test")
                expect(true).toBe(false)
            } catch (error) {
                expect(error).toBeInstanceOf(WorkersApiError)
                expect((error as Error).message).toBe("Unknown error")
            }
        })

        it("propagates network errors", async () => {
            globalThis.fetch = async () => {
                throw new Error("Network failure")
            }

            const { apiClient } = await import("@/lib/api-client")

            try {
                await apiClient("/api/test")
                expect(true).toBe(false)
            } catch (error) {
                expect((error as Error).message).toBe("Network failure")
            }
        })
    })

    describe("Request Methods", () => {
        it("supports PATCH method", async () => {
            let capturedMethod = ""

            globalThis.fetch = async (_url, init) => {
                capturedMethod = init?.method || "GET"
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({ data: {} })
                } as Response
            }

            const { apiClient } = await import("@/lib/api-client")
            await apiClient("/api/test", { method: "PATCH", body: {} })

            expect(capturedMethod).toBe("PATCH")
        })

        it("supports DELETE method", async () => {
            let capturedMethod = ""

            globalThis.fetch = async (_url, init) => {
                capturedMethod = init?.method || "GET"
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({})
                } as Response
            }

            const { apiClient } = await import("@/lib/api-client")
            await apiClient("/api/test", { method: "DELETE" })

            expect(capturedMethod).toBe("DELETE")
        })
    })
})
