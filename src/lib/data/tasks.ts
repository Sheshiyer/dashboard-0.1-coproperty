import { apiClient } from "@/lib/api-client"
import type { Task, ApiResponse, Property } from "@/types/api"
export type { Task }

export async function getTasks(): Promise<Task[]> {
    try {
        const [tasksRes, propertiesRes] = await Promise.all([
            apiClient<ApiResponse<Task[]>>('/api/tasks'),
            apiClient<ApiResponse<Property[]>>('/api/properties')
        ])

        const tasks = tasksRes.data || []
        const properties = propertiesRes.data || []

        return tasks.map(t => ({
            ...t,
            properties: t.property_id ? properties.find(p => p.id === t.property_id) : undefined
        }))
    } catch (error) {
        console.error("Error fetching tasks:", error)
        return []
    }
}

export async function getTasksByProperty(propertyId: string): Promise<Task[]> {
    try {
        const response = await apiClient<ApiResponse<Task[]>>(
            `/api/tasks?property_id=${propertyId}`
        )
        return response.data || []
    } catch (error) {
        console.error("Error fetching tasks for property:", error)
        return []
    }
}

export async function getTasksByStatus(status: string): Promise<Task[]> {
    try {
        const response = await apiClient<ApiResponse<Task[]>>(
            `/api/tasks?status=${status}`
        )
        return response.data || []
    } catch (error) {
        console.error("Error fetching tasks by status:", error)
        return []
    }
}

export async function createTask(task: Partial<Task>): Promise<Task | null> {
    try {
        const response = await apiClient<ApiResponse<Task>>(
            '/api/tasks',
            {
                method: 'POST',
                body: task
            }
        )
        return response.data || null
    } catch (error) {
        console.error("Error creating task:", error)
        return null
    }
}

export async function updateTask(
    id: string,
    updates: Partial<Task>
): Promise<Task | null> {
    try {
        const response = await apiClient<ApiResponse<Task>>(
            `/api/tasks/${id}`,
            {
                method: 'PATCH',
                body: updates
            }
        )
        return response.data || null
    } catch (error) {
        console.error("Error updating task:", error)
        return null
    }
}

export async function deleteTask(id: string): Promise<boolean> {
    try {
        await apiClient<void>(`/api/tasks/${id}`, { method: 'DELETE' })
        return true
    } catch (error) {
        console.error("Error deleting task:", error)
        return false
    }
}
