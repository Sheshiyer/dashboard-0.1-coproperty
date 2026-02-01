import { Suspense } from "react"
import { getCleaningJobs } from "@/lib/data/cleaning"
import { KanbanBoard } from "@/components/cleaning/kanban-board"
import { CleaningSkeleton } from "@/components/skeleton/cleaning-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { SprayCan } from "lucide-react"

export default async function CleaningPage() {
    const jobs = await getCleaningJobs()

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Cleaning Schedule</h1>
            </div>

            <div className="flex-1 overflow-hidden">
                <Suspense fallback={<CleaningSkeleton />}>
                    {jobs && jobs.length > 0 ? (
                        <KanbanBoard initialJobs={jobs} />
                    ) : (
                        <EmptyState
                            icon={SprayCan}
                            title="No cleanings scheduled"
                            description="Schedule cleaning jobs for your properties. Drag and drop cards between columns to track progress from pending to verified."
                            actionLabel="Schedule Cleaning"
                            size="lg"
                        />
                    )}
                </Suspense>
            </div>
        </div>
    )
}
