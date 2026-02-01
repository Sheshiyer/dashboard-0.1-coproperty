"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useTaskStore } from "@/lib/stores/task-store"
import type { Task } from "@/types/api"

interface TaskDataTableProps {
    columns: ColumnDef<Task, unknown>[]
    data: Task[]
}

export function TaskDataTable({ columns, data }: TaskDataTableProps) {
    const { filters, selectTask } = useTaskStore()

    // Build column filters from our store
    const columnFilters: ColumnFiltersState = React.useMemo(() => {
        const cf: ColumnFiltersState = []
        if (filters.status.length) cf.push({ id: "status", value: filters.status })
        if (filters.priority.length) cf.push({ id: "priority", value: filters.priority })
        if (filters.assignee.length) cf.push({ id: "assigned_to", value: filters.assignee })
        if (filters.property.length) cf.push({ id: "properties.name", value: filters.property })
        if (filters.category.length) cf.push({ id: "category", value: filters.category })
        if (filters.search) cf.push({ id: "title", value: filters.search })
        if (filters.dateRange.from || filters.dateRange.to) {
            cf.push({ id: "due_date", value: filters.dateRange })
        }
        return cf
    }, [filters])

    const table = useReactTable({
        data,
        columns,
        state: {
            columnFilters,
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="cursor-pointer hover:bg-property-primary/5 transition-colors"
                                    onClick={() => selectTask(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No tasks match your filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between py-4">
                <p className="text-sm text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} of {data.length} task(s)
                </p>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
