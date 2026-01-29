import { Suspense } from "react"
import { getTasks } from "@/lib/data/tasks"
import { getProperties } from "@/lib/data/properties"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"

export default async function TasksPage() {
    const tasks = await getTasks()
    const properties = await getProperties()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                <CreateTaskDialog properties={properties || []} />
            </div>

            <div className="rounded-xl border bg-card shadow">
                <div className="p-6">
                    <Suspense fallback={<div className="h-24 w-full bg-muted/20 animate-pulse rounded" />}>
                        <DataTable columns={columns} data={tasks} />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
