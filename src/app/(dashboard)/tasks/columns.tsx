"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Task } from "@/lib/data/tasks"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export const columns: ColumnDef<Task>[] = [
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => <span className="font-medium">{row.original.title}</span>
    },
    {
        accessorKey: "properties.building_name",
        header: "Property",
        cell: ({ row }) => row.original.properties?.building_name || "General"
    },
    {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
            const priority = row.original.priority
            let variant: "default" | "secondary" | "destructive" | "warning" = "default"

            switch (priority) {
                case "urgent": variant = "destructive"; break;
                case "medium": variant = "secondary"; break;
                case "high": variant = "warning"; break;
                default: variant = "secondary";
            }

            return <Badge variant={variant}>{priority}</Badge>
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <Badge variant="outline" className="capitalize">{row.original.status.replace("_", " ")}</Badge>
    },
    {
        accessorKey: "assigned_to",
        header: "Assigned To",
        cell: ({ row }) => row.original.assigned_to || "Unassigned"
    },
    {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => {
            if (!row.original.created_at) return "N/A"
            return format(new Date(row.original.created_at), "MMM d")
        }
    },
]
