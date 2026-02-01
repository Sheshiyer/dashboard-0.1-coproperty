import { Suspense } from "react"
import { getTasks } from "@/lib/data/tasks"
import { getProperties } from "@/lib/data/properties"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { TasksPageClient } from "@/components/tasks/tasks-page-client"

export default async function TasksPage() {
    const tasks = await getTasks()
    const properties = await getProperties()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage and track all property tasks
                    </p>
                </div>
                <CreateTaskDialog properties={properties || []} />
            </div>

            <Suspense
                fallback={
                    <div className="h-24 w-full bg-muted/20 animate-pulse rounded" />
                }
            >
                <TasksPageClient
                    tasks={tasks}
                    properties={properties || []}
                />
            </Suspense>
        </div>
    )
}
