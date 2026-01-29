"use client"

import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    useSensor,
    useSensors,
    PointerSensor,
    TouchSensor,
} from "@dnd-kit/core"
import { useState } from "react"
import { CleaningJob } from "@/lib/data/cleaning"
import { KanbanColumn } from "./kanban-column"
import { updateCleaningJobStatus } from "@/lib/actions/cleaning"
import { JobCard } from "./job-card"

// Fix for dnd-kit console errors?
// https://github.com/clauderic/dnd-kit/issues/1194

interface KanbanBoardProps {
    initialJobs: CleaningJob[]
}

const COLUMNS = [
    { id: "pending", title: "Pending" },
    { id: "assigned", title: "Assigned" },
    { id: "in_progress", title: "In Progress" },
    { id: "verified", title: "Verified" },
]

export function KanbanBoard({ initialJobs }: KanbanBoardProps) {
    const [jobs, setJobs] = useState<CleaningJob[]>(initialJobs)
    const [activeId, setActiveId] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor)
    )

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string)
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        setActiveId(null)

        if (over && active.id !== over.id) {
            const jobId = active.id as string
            const newStatus = over.id as CleaningJob["status"]

            // Optimistic update
            const updatedJobs = jobs.map((job) =>
                job.id === jobId ? { ...job, status: newStatus } : job
            )
            setJobs(updatedJobs)

            try {
                await updateCleaningJobStatus(jobId, newStatus as "pending" | "assigned" | "in_progress" | "verified" | "completed")
            } catch (error) {
                console.error("Failed to update status", error)
                // Revert on error (could be improved)
                setJobs(initialJobs)
            }
        }
    }

    const activeJob = jobs.find((job) => job.id === activeId)

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {COLUMNS.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        jobs={jobs.filter((job) => job.status === col.id)}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeJob ? <JobCard job={activeJob} /> : null}
            </DragOverlay>
        </DndContext>
    )
}
