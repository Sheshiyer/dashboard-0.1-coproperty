"use client"

import { useDroppable } from "@dnd-kit/core"
import { CleaningJob } from "@/lib/data/cleaning"
import { JobCard } from "./job-card"

interface KanbanColumnProps {
    id: string
    title: string
    jobs: CleaningJob[]
}

export function KanbanColumn({ id, title, jobs }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: id,
    })

    return (
        <div className="flex flex-col gap-4 min-w-[250px] bg-muted/30 p-4 rounded-xl border">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">{title}</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{jobs.length}</span>
            </div>

            <div ref={setNodeRef} className="flex flex-col gap-3 min-h-[500px]">
                {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                ))}
            </div>
        </div>
    )
}
