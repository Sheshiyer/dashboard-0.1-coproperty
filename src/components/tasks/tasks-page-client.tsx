"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { LayoutGrid, Table2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTaskStore } from "@/lib/stores/task-store"
import { TaskFilterBar } from "./task-filter-bar"
import { TaskDetailSidebar } from "./task-detail-sidebar"
import { columns } from "@/app/(dashboard)/tasks/columns"
import { TaskTableSkeleton } from "@/components/skeleton/tasks-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import type { Task, Property } from "@/types/api"

// ---------------------------------------------------------------------------
// Dynamic imports - @tanstack/react-table and PriorityMatrixView are heavy
// and only one is active at a time (table or matrix view).
// ---------------------------------------------------------------------------
const TaskDataTable = dynamic(
    () => import("./task-data-table").then(m => ({ default: m.TaskDataTable })),
    {
        loading: () => <TaskTableSkeleton />,
        ssr: false,
    }
)
const PriorityMatrixView = dynamic(
    () => import("./priority-matrix-view").then(m => ({ default: m.PriorityMatrixView })),
    {
        loading: () => <Skeleton className="h-96 w-full rounded-xl" />,
        ssr: false,
    }
)

interface TasksPageClientProps {
    tasks: Task[]
    properties: Property[]
}

export function TasksPageClient({ tasks, properties }: TasksPageClientProps) {
    const { viewMode, setViewMode } = useTaskStore()

    return (
        <>
            {/* Filter Bar */}
            <TaskFilterBar tasks={tasks} properties={properties} />

            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg w-fit">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className={cn(
                        "gap-1.5 h-8",
                        viewMode === "table" &&
                            "bg-background shadow-sm hover:bg-background"
                    )}
                >
                    <Table2 className="h-3.5 w-3.5" />
                    Table
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("matrix")}
                    className={cn(
                        "gap-1.5 h-8",
                        viewMode === "matrix" &&
                            "bg-background shadow-sm hover:bg-background"
                    )}
                >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Matrix
                </Button>
            </div>

            {/* Content */}
            <div className="rounded-xl border bg-card shadow">
                <div className="p-6">
                    {viewMode === "table" ? (
                        <motion.div
                            key="table"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <TaskDataTable columns={columns} data={tasks} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="matrix"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <PriorityMatrixView tasks={tasks} />
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Detail Sidebar */}
            <TaskDetailSidebar />
        </>
    )
}
