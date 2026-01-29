"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Property } from "@/lib/data/properties"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import Link from "next/link"

export const columns: ColumnDef<Property>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Property Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const property = row.original
            return (
                <Link
                    href={`/properties/${property.id}`}
                    className="font-medium text-primary hover:underline underline-offset-4"
                >
                    {property.building_name}
                </Link>
            )
        }
    },
    {
        accessorKey: "city",
        header: "City",
    },
    {
        accessorKey: "state",
        header: "State",
    },
    {
        accessorKey: "property_type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("property_type") as string
            return <div className="capitalize">{type?.replace("_", " ") || "N/A"}</div>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const property = row.original

            return (
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/properties/${property.id}`}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                    </Link>
                </Button>
            )
        },
    },
]
