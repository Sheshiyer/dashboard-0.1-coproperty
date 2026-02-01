import { Suspense } from "react"
import { getTasks } from "@/lib/data/tasks"
import { getProperties } from "@/lib/data/properties"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { TaskTableSkeleton } from "@/components/skeleton/tasks-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { CheckSquare } from "lucide-react"

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
                    <Suspense fallback={<TaskTableSkeleton />}>
                        {tasks && tasks.length > 0 ? (
                            <DataTable columns={columns} data={tasks} />
                        ) : (
                            <EmptyState
                                icon={CheckSquare}
                                title="No tasks assigned"
                                description="Create your first task to start tracking work across your properties. Tasks help you stay organized and ensure nothing falls through the cracks."
                                actionLabel="Create Task"
                            />
                        )}
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
