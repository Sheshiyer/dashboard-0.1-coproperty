"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Task } from "@/lib/data/tasks"
import { Badge } from "@/components/ui/badge"
import { CommentCountBadge } from "@/components/tasks/task-comments"
import { format, isPast, isBefore, addDays } from "date-fns"
import { AlertCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export const columns: ColumnDef<Task>[] = [
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <span className="font-medium cursor-pointer hover:text-property-primary transition-colors">
                    {row.original.title}
                </span>
                <CommentCountBadge taskId={row.original.id} />
            </div>
        ),
        filterFn: (row, id, value) => {
            return row.original.title.toLowerCase().includes(value.toLowerCase())
        },
    },
    {
        accessorKey: "properties.name",
        header: "Property",
        cell: ({ row }) =>
            row.original.properties?.name ||
            row.original.properties?.internal_code ||
            "General",
        filterFn: (row, id, value: string[]) => {
            if (!value.length) return true
            return value.includes(row.original.property_id || "")
        },
    },
    {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
            const priority = row.original.priority
            let variant: "default" | "secondary" | "destructive" | "warning" =
                "default"

            switch (priority) {
                case "urgent":
                    variant = "destructive"
                    break
                case "high":
                    variant = "warning"
                    break
                case "medium":
                    variant = "secondary"
                    break
                default:
                    variant = "secondary"
            }

            return (
                <Badge variant={variant} className="capitalize">
                    {priority}
                </Badge>
            )
        },
        filterFn: (row, id, value: string[]) => {
            if (!value.length) return true
            return value.includes(row.original.priority)
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize">
                {row.original.status.replace("_", " ")}
            </Badge>
        ),
        filterFn: (row, id, value: string[]) => {
            if (!value.length) return true
            return value.includes(row.original.status)
        },
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
            <Badge variant="glass" size="sm" className="capitalize">
                {row.original.category}
            </Badge>
        ),
        filterFn: (row, id, value: string[]) => {
            if (!value.length) return true
            return value.includes(row.original.category)
        },
    },
    {
        accessorKey: "assigned_to",
        header: "Assigned To",
        cell: ({ row }) => row.original.assigned_to || "Unassigned",
        filterFn: (row, id, value: string[]) => {
            if (!value.length) return true
            return value.includes(row.original.assigned_to || "")
        },
    },
    {
        accessorKey: "due_date",
        header: "Due Date",
        cell: ({ row }) => {
            const dueDate = row.original.due_date
            if (!dueDate) return <span className="text-muted-foreground text-xs">No due date</span>

            const date = new Date(dueDate)
            const now = new Date()
            const isOverdue = isPast(date) && row.original.status !== "completed"
            const isUpcoming =
                !isOverdue &&
                isBefore(date, addDays(now, 3)) &&
                row.original.status !== "completed"

            return (
                <div className="flex items-center gap-1.5">
                    <span
                        className={cn(
                            "text-sm",
                            isOverdue && "text-error-600 dark:text-error-500 font-medium",
                            isUpcoming && "text-warning-600 dark:text-warning-500 font-medium"
                        )}
                    >
                        {format(date, "MMM d")}
                    </span>
                    {isOverdue && (
                        <Badge variant="error" size="sm" className="gap-0.5 text-[10px]">
                            <AlertCircle className="h-3 w-3" />
                            Overdue
                        </Badge>
                    )}
                    {isUpcoming && (
                        <Badge variant="warning" size="sm" className="gap-0.5 text-[10px]">
                            <Clock className="h-3 w-3" />
                            Soon
                        </Badge>
                    )}
                </div>
            )
        },
        filterFn: (row, id, value: { from?: string; to?: string }) => {
            if (!value?.from && !value?.to) return true
            const dueDate = row.original.due_date
            if (!dueDate) return false
            const date = new Date(dueDate)
            if (value.from && date < new Date(value.from)) return false
            if (value.to && date > new Date(value.to)) return false
            return true
        },
    },
    {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => {
            if (!row.original.created_at) return "N/A"
            return format(new Date(row.original.created_at), "MMM d")
        },
    },
]
