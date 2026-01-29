"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Reservation } from "@/lib/data/reservations"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Users } from "lucide-react"

export const columns: ColumnDef<Reservation>[] = [
    {
        accessorKey: "guest_name",
        header: "Guest",
    },
    {
        accessorKey: "properties.building_name",
        header: "Property",
        cell: ({ row }) => row.original.properties?.building_name || "Unknown"
    },
    {
        accessorKey: "check_in_date",
        header: "Check In",
        cell: ({ row }) => format(new Date(row.original.check_in_date), "MMM d, yyyy")
    },
    {
        accessorKey: "check_out_date",
        header: "Check Out",
        cell: ({ row }) => format(new Date(row.original.check_out_date), "MMM d, yyyy")
    },
    {
        accessorKey: "guest_count",
        header: "Guests",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{row.original.guest_count}</span>
            </div>
        )
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status
            // status comes from Hospitable (accepted, declined, cancelled, etc)
            let variant: "default" | "secondary" | "destructive" | "outline" = "default"

            if (status === 'accepted' || status === 'confirmed') variant = "default"
            else if (status === 'cancelled' || status === 'declined') variant = "destructive"
            else variant = "secondary"

            return <Badge variant={variant} className="capitalize">{status.replace("_", " ")}</Badge>
        }
    },
    {
        accessorKey: "platform",
        header: "Source",
        cell: ({ row }) => <span className="capitalize">{row.original.platform}</span>
    },
]
