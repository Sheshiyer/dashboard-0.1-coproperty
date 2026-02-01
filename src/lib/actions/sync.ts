"use server"

import { fetchHospitableReservations } from "@/lib/services/hospitable"
import { fetchTurnoCleaningJobs } from "@/lib/services/turno"
import { revalidatePath } from "next/cache"
import { revalidateTag } from "next/cache"

import { logger } from "@/lib/logger"

export async function syncData() {
    try {
        await Promise.all([
            fetchHospitableReservations(),
            fetchTurnoCleaningJobs()
        ])
        revalidatePath("/")
        revalidateTag("properties")
        revalidateTag("reservations")
        revalidateTag("cleaning-jobs")
        revalidateTag("tasks")
        return { success: true, message: "Sync complete" }
    } catch (error) {
        logger.error("Sync failed", { error: String(error) })
        return { success: false, message: "Sync failed" }
    }
}
