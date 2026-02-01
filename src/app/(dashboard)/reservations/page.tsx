import { Suspense } from "react"
import { getReservations } from "@/lib/data/reservations"
import { getProperties } from "@/lib/data/properties"
import { ReservationsContent } from "./reservations-content"
import { ReservationsSkeleton } from "@/components/skeleton/reservations-skeleton"

export default async function ReservationsPage() {
    const [reservations, properties] = await Promise.all([
        getReservations(),
        getProperties()
    ])

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
            </div>

            <Suspense fallback={<ReservationsSkeleton />}>
                <ReservationsContent
                    reservations={reservations}
                    properties={properties}
                />
            </Suspense>
        </div>
    )
}
