import { Suspense } from "react"
import { getCleaningJobs } from "@/lib/data/cleaning"
import { KanbanBoard } from "@/components/cleaning/kanban-board"

export default async function CleaningPage() {
    const jobs = await getCleaningJobs()

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Cleaning Schedule</h1>
            </div>

            <div className="flex-1 overflow-hidden">
                <Suspense fallback={<div>Loading board...</div>}>
                    <KanbanBoard initialJobs={jobs} />
                </Suspense>
            </div>
        </div>
    )
}
