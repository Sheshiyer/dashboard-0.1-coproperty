export async function fetchTurnoCleaningJobs() {
    const apiKey = process.env.TURNO_API_TOKEN

    if (!apiKey) {
        console.warn("Missing TURNO_API_TOKEN")
        return []
    }

    // Placeholder for actual API call
    console.log("Syncing Turno cleaning jobs...")
    return []
}
