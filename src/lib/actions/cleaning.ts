"use server"

import { apiClient } from "@/lib/api-client"
import { revalidatePath } from "next/cache"
import { revalidateTag } from "next/cache"

export async function updateCleaningJobStatus(
    jobId: string,
    status: "pending" | "assigned" | "in_progress" | "verified" | "completed"
) {
    try {
        await apiClient(`/api/cleaning/${jobId}`, {
            method: 'PATCH',
            body: { status }
        })
        revalidatePath("/cleaning")
        revalidateTag("cleaning-jobs")
        return { success: true }
    } catch (error) {
        console.error("Error updating cleaning status:", error)
        return { success: false, error: "Failed to update cleaning status" }
    }
}
