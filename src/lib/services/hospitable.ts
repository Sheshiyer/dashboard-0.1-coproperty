export async function fetchHospitableReservations() {
    const apiKey = process.env.HOSPITABLE_API_KEY

    if (!apiKey) {
        console.warn("Missing HOSPITABLE_API_KEY")
        return []
    }

    // Placeholder for actual API call
    // const response = await fetch("https://api.hospitable.com/v1/reservations", {
    //   headers: { Authorization: `Bearer ${apiKey}` }
    // })

    console.log("Syncing Hospitable reservations...")
    return []
}
