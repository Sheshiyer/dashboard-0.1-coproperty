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
                    {property.name || property.internal_code}
                </Link>
            )
        }
    },
    {
        accessorKey: "address",
        header: "Location",
        cell: ({ row }) => {
            const address = row.getValue("address") as string
            // Extract city from address (usually second part after first comma)
            const parts = address?.split(',') || []
            return <div className="max-w-[300px] truncate">{parts.slice(0, 2).join(',').trim() || "N/A"}</div>
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <div className={`capitalize inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                    {status}
                </div>
            )
        }
    },
    {
        accessorKey: "segment",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("segment") as string
            return <div className="capitalize">{type || "Standard"}</div>
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
