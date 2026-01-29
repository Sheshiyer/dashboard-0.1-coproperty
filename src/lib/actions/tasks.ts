"use server"

import { apiClient } from "@/lib/api-client"
import { revalidatePath } from "next/cache"
import type { Task } from "@/lib/data/properties"

export async function createTask(formData: FormData) {
    const task = {
        title: formData.get("title") as string,
        description: formData.get("description") as string | null,
        priority: formData.get("priority") as string,
        status: formData.get("status") as string || "pending",
        due_date: formData.get("due_date") as string | null,
        property_id: formData.get("property_id") as string | null,
        assigned_to: formData.get("assigned_to") as string | null,
    }

    try {
        await apiClient('/api/tasks', {
            method: 'POST',
            body: task
        })
        revalidatePath("/tasks")
        return { success: true }
    } catch (error) {
        console.error("Error creating task:", error)
        return { success: false, error: "Failed to create task" }
    }
}

export async function updateTask(taskId: string, updates: Partial<Task>) {
    try {
        await apiClient(`/api/tasks/${taskId}`, {
            method: 'PATCH',
            body: updates
        })
        revalidatePath("/tasks")
        return { success: true }
    } catch (error) {
        console.error("Error updating task:", error)
        return { success: false, error: "Failed to update task" }
    }
}

export async function deleteTask(taskId: string) {
    try {
        await apiClient(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        })
        revalidatePath("/tasks")
        return { success: true }
    } catch (error) {
        console.error("Error deleting task:", error)
        return { success: false, error: "Failed to delete task" }
    }
}
