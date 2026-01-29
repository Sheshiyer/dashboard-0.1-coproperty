import { Suspense } from "react"
import { getReservations } from "@/lib/data/reservations"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"

export default async function ReservationsPage() {
    const reservations = await getReservations()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
            </div>

            <div className="rounded-xl border bg-card shadow">
                <div className="p-6">
                    <Suspense fallback={<div className="h-24 w-full bg-muted/20 animate-pulse rounded" />}>
                        <DataTable columns={columns} data={reservations} />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
