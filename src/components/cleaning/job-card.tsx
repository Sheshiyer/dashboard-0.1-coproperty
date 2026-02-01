"use client"

import { useDraggable } from "@dnd-kit/core"
import { CleaningJob } from "@/lib/data/cleaning"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { trackEvent } from "@/lib/analytics"
import { format } from "date-fns"

interface JobCardProps {
    job: CleaningJob
}

export function JobCard({ job }: JobCardProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: job.id,
    })

    const style = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
        : undefined

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
        >
            <CardHeader className="p-4 space-y-0 pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-medium leading-none">
                        {job.properties?.building_name || "Unknown Property"}
                    </CardTitle>
                    <Badge variant={job.status === "verified" ? "success" : "outline"} className="text-[10px] px-1 py-0 h-5">
                        {job.status.replace("_", " ")}
                    </Badge>
                </div>

            </CardHeader>
            <CardContent className="p-4 pt-2">
                <p className="text-xs text-muted-foreground mb-2">
                    {format(new Date(job.scheduled_date), "MMM d, h:mm a")}
                </p>
            </CardContent>
        </Card>
    )
}
