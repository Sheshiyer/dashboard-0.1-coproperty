/**
 * Tests for Tasks Data Layer
 *
 * Tests task CRUD operations with Workers API mocks.
 * Validates filtering, creation, updates, and deletion.
 */

import { describe, expect, it, beforeEach, afterEach } from "bun:test"
import {
    mockTask,
    mockTask2,
    mockTasks,
    mockProperties,
    wrapApiResponse
} from "./mock-helpers"

describe("Tasks Data Layer", () => {
    const originalFetch = globalThis.fetch
    const originalConsoleError = console.error

    beforeEach(() => {
        console.error = () => {}
    })

    afterEach(() => {
        globalThis.fetch = originalFetch
        console.error = originalConsoleError
    })

    describe("getTasks", () => {
        it("fetches all tasks with property enrichment", async () => {
            globalThis.fetch = async (url) => {
                const urlStr = url as string

                if (urlStr.includes("/api/tasks") && !urlStr.includes("?")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse(mockTasks)
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

            const { getTasks } = await import("../tasks")
            const result = await getTasks()

            expect(result).toHaveLength(2)
            expect(result[0].id).toBe("task_001")
            expect(result[0].title).toBe("Replace broken lamp")
            expect(result[0].properties).toBeDefined()
            expect(result[0].properties?.name).toBe("Downtown Loft")
        })

        it("enriches tasks with correct property data", async () => {
            globalThis.fetch = async (url) => {
                const urlStr = url as string

                if (urlStr.includes("/api/tasks")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse([
                            { ...mockTask, property_id: "prop_002" }
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

            const { getTasks } = await import("../tasks")
            const result = await getTasks()

            expect(result[0].properties?.id).toBe("prop_002")
            expect(result[0].properties?.name).toBe("Beach House")
        })

        it("handles tasks without property_id", async () => {
            const taskWithoutProperty = {
                ...mockTask,
                property_id: undefined
            }

            globalThis.fetch = async (url) => {
                const urlStr = url as string

                if (urlStr.includes("/api/tasks")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse([taskWithoutProperty])
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

            const { getTasks } = await import("../tasks")
            const result = await getTasks()

            expect(result[0].properties).toBeUndefined()
        })

        it("returns empty array on API error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 500,
                json: async () => ({ message: "Server error" })
            } as Response)

            const { getTasks } = await import("../tasks")
            const result = await getTasks()

            expect(result).toEqual([])
        })

        it("returns empty array on network error", async () => {
            globalThis.fetch = async () => {
                throw new Error("Network failure")
            }

            const { getTasks } = await import("../tasks")
            const result = await getTasks()

            expect(result).toEqual([])
        })
    })

    describe("getTasksByProperty", () => {
        it("fetches tasks for specific property", async () => {
            let capturedUrl = ""

            globalThis.fetch = async (url) => {
                capturedUrl = url as string
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse([mockTask])
                } as Response
            }

            const { getTasksByProperty } = await import("../tasks")
            const result = await getTasksByProperty("prop_001")

            expect(capturedUrl).toContain("/api/tasks?property_id=prop_001")
            expect(result).toHaveLength(1)
            expect(result[0].property_id).toBe("prop_001")
        })

        it("returns empty array when property has no tasks", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([])
            } as Response)

            const { getTasksByProperty } = await import("../tasks")
            const result = await getTasksByProperty("prop_999")

            expect(result).toEqual([])
        })

        it("returns empty array on error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 404,
                json: async () => ({ message: "Not found" })
            } as Response)

            const { getTasksByProperty } = await import("../tasks")
            const result = await getTasksByProperty("prop_001")

            expect(result).toEqual([])
        })
    })

    describe("getTasksByStatus", () => {
        it("fetches tasks by status", async () => {
            let capturedUrl = ""

            globalThis.fetch = async (url) => {
                capturedUrl = url as string
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse([mockTask])
                } as Response
            }

            const { getTasksByStatus } = await import("../tasks")
            const result = await getTasksByStatus("pending")

            expect(capturedUrl).toContain("/api/tasks?status=pending")
            expect(result).toHaveLength(1)
            expect(result[0].status).toBe("pending")
        })

        it("fetches in_progress tasks", async () => {
            let capturedUrl = ""

            globalThis.fetch = async (url) => {
                capturedUrl = url as string
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse([mockTask2])
                } as Response
            }

            const { getTasksByStatus } = await import("../tasks")
            const result = await getTasksByStatus("in_progress")

            expect(capturedUrl).toContain("/api/tasks?status=in_progress")
            expect(result[0].status).toBe("in_progress")
        })

        it("returns empty array when no tasks with status", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([])
            } as Response)

            const { getTasksByStatus } = await import("../tasks")
            const result = await getTasksByStatus("completed")

            expect(result).toEqual([])
        })

        it("returns empty array on error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 400,
                json: async () => ({ message: "Invalid status" })
            } as Response)

            const { getTasksByStatus } = await import("../tasks")
            const result = await getTasksByStatus("invalid")

            expect(result).toEqual([])
        })
    })

    describe("createTask", () => {
        it("creates new task via POST", async () => {
            let capturedUrl = ""
            let capturedMethod = ""
            let capturedBody = ""

            const newTask = {
                property_id: "prop_001",
                title: "New Task",
                description: "Task description",
                category: "maintenance" as const,
                priority: "high" as const,
                status: "pending" as const
            }

            globalThis.fetch = async (url, init) => {
                capturedUrl = url as string
                capturedMethod = init?.method || "GET"
                capturedBody = init?.body as string || ""
                return {
                    ok: true,
                    status: 201,
                    json: async () => wrapApiResponse({
                        id: "task_new",
                        ...newTask,
                        created_by: "system",
                        created_at: "2026-01-31T10:00:00Z",
                        updated_at: "2026-01-31T10:00:00Z"
                    })
                } as Response
            }

            const { createTask } = await import("../tasks")
            const result = await createTask(newTask)

            expect(capturedUrl).toContain("/api/tasks")
            expect(capturedMethod).toBe("POST")
            expect(JSON.parse(capturedBody)).toEqual(newTask)
            expect(result).not.toBeNull()
            expect(result!.id).toBe("task_new")
            expect(result!.title).toBe("New Task")
        })

        it("returns null on 400 error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 400,
                json: async () => ({ message: "Missing required fields" })
            } as Response)

            const { createTask } = await import("../tasks")
            const result = await createTask({ title: "Incomplete" })

            expect(result).toBeNull()
        })

        it("returns null on network error", async () => {
            globalThis.fetch = async () => {
                throw new Error("Network failure")
            }

            const { createTask } = await import("../tasks")
            const result = await createTask({ title: "Test" })

            expect(result).toBeNull()
        })
    })

    describe("updateTask", () => {
        it("updates task via PATCH", async () => {
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
                        ...mockTask,
                        status: "completed",
                        completed_at: "2026-01-31T15:00:00Z"
                    })
                } as Response
            }

            const { updateTask } = await import("../tasks")
            const result = await updateTask("task_001", { status: "completed" })

            expect(capturedUrl).toContain("/api/tasks/task_001")
            expect(capturedMethod).toBe("PATCH")
            expect(JSON.parse(capturedBody)).toEqual({ status: "completed" })
            expect(result).not.toBeNull()
            expect(result!.status).toBe("completed")
        })

        it("updates multiple fields", async () => {
            let capturedBody = ""

            globalThis.fetch = async (_url, init) => {
                capturedBody = init?.body as string || ""
                return {
                    ok: true,
                    status: 200,
                    json: async () => wrapApiResponse({
                        ...mockTask,
                        title: "Updated Title",
                        priority: "urgent",
                        assigned_to: "Jane Doe"
                    })
                } as Response
            }

            const { updateTask } = await import("../tasks")
            const updates = {
                title: "Updated Title",
                priority: "urgent" as const,
                assigned_to: "Jane Doe"
            }
            const result = await updateTask("task_001", updates)

            expect(JSON.parse(capturedBody)).toEqual(updates)
            expect(result!.title).toBe("Updated Title")
            expect(result!.priority).toBe("urgent")
            expect(result!.assigned_to).toBe("Jane Doe")
        })

        it("returns null on 404 error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 404,
                json: async () => ({ message: "Task not found" })
            } as Response)

            const { updateTask } = await import("../tasks")
            const result = await updateTask("nonexistent", { status: "completed" })

            expect(result).toBeNull()
        })

        it("returns null on network error", async () => {
            globalThis.fetch = async () => {
                throw new Error("Network failure")
            }

            const { updateTask } = await import("../tasks")
            const result = await updateTask("task_001", { status: "completed" })

            expect(result).toBeNull()
        })
    })

    describe("deleteTask", () => {
        it("deletes task via DELETE", async () => {
            let capturedUrl = ""
            let capturedMethod = ""

            globalThis.fetch = async (url, init) => {
                capturedUrl = url as string
                capturedMethod = init?.method || "GET"
                return {
                    ok: true,
                    status: 204,
                    json: async () => ({})
                } as Response
            }

            const { deleteTask } = await import("../tasks")
            const result = await deleteTask("task_001")

            expect(capturedUrl).toContain("/api/tasks/task_001")
            expect(capturedMethod).toBe("DELETE")
            expect(result).toBe(true)
        })

        it("returns false on 404 error", async () => {
            globalThis.fetch = async () => ({
                ok: false,
                status: 404,
                json: async () => ({ message: "Task not found" })
            } as Response)

            const { deleteTask } = await import("../tasks")
            const result = await deleteTask("nonexistent")

            expect(result).toBe(false)
        })

        it("returns false on network error", async () => {
            globalThis.fetch = async () => {
                throw new Error("Network failure")
            }

            const { deleteTask } = await import("../tasks")
            const result = await deleteTask("task_001")

            expect(result).toBe(false)
        })
    })

    describe("Task Categories", () => {
        it("handles maintenance category", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([{
                    ...mockTask,
                    category: "maintenance"
                }])
            } as Response)

            const { getTasksByStatus } = await import("../tasks")
            const result = await getTasksByStatus("pending")

            expect(result[0].category).toBe("maintenance")
        })

        it("handles inspection category", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([{
                    ...mockTask,
                    category: "inspection"
                }])
            } as Response)

            const { getTasksByStatus } = await import("../tasks")
            const result = await getTasksByStatus("pending")

            expect(result[0].category).toBe("inspection")
        })

        it("handles inventory category", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([{
                    ...mockTask,
                    category: "inventory"
                }])
            } as Response)

            const { getTasksByStatus } = await import("../tasks")
            const result = await getTasksByStatus("pending")

            expect(result[0].category).toBe("inventory")
        })

        it("handles general category", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([{
                    ...mockTask,
                    category: "general"
                }])
            } as Response)

            const { getTasksByStatus } = await import("../tasks")
            const result = await getTasksByStatus("pending")

            expect(result[0].category).toBe("general")
        })
    })

    describe("Task Priority", () => {
        it("handles low priority", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([{
                    ...mockTask,
                    priority: "low"
                }])
            } as Response)

            const { getTasksByStatus } = await import("../tasks")
            const result = await getTasksByStatus("pending")

            expect(result[0].priority).toBe("low")
        })

        it("handles medium priority", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([{
                    ...mockTask,
                    priority: "medium"
                }])
            } as Response)

            const { getTasksByStatus } = await import("../tasks")
            const result = await getTasksByStatus("pending")

            expect(result[0].priority).toBe("medium")
        })

        it("handles high priority", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([{
                    ...mockTask,
                    priority: "high"
                }])
            } as Response)

            const { getTasksByStatus } = await import("../tasks")
            const result = await getTasksByStatus("pending")

            expect(result[0].priority).toBe("high")
        })

        it("handles urgent priority", async () => {
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                json: async () => wrapApiResponse([{
                    ...mockTask,
                    priority: "urgent"
                }])
            } as Response)

            const { getTasksByStatus } = await import("../tasks")
            const result = await getTasksByStatus("pending")

            expect(result[0].priority).toBe("urgent")
        })
    })

    describe("Data Preservation", () => {
        it("preserves all task fields", async () => {
            const fullTask = {
                ...mockTask,
                reservation_id: "res_001",
                completed_at: "2026-01-30T16:00:00Z"
            }

            globalThis.fetch = async (url) => {
                const urlStr = url as string

                if (urlStr.includes("/api/tasks")) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => wrapApiResponse([fullTask])
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

            const { getTasks } = await import("../tasks")
            const result = await getTasks()

            expect(result[0].description).toBe("The bedside lamp in the master bedroom is not working")
            expect(result[0].assigned_to).toBe("John Maintenance")
            expect(result[0].due_date).toBe("2026-02-10")
            expect(result[0].created_by).toBe("system")
            expect(result[0].created_at).toBe("2026-01-30T10:00:00Z")
            expect(result[0].updated_at).toBe("2026-01-30T10:00:00Z")
            expect(result[0].reservation_id).toBe("res_001")
            expect(result[0].completed_at).toBe("2026-01-30T16:00:00Z")
        })
    })
})
