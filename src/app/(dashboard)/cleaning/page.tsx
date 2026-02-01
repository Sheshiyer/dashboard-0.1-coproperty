import { Suspense } from "react"
import { getCleaningJobs } from "@/lib/data/cleaning"
import { CleaningPageClient } from "./client"
import { CleaningSkeleton } from "@/components/skeleton/cleaning-skeleton"

export default async function CleaningPage() {
    const jobs = await getCleaningJobs()

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
            <Suspense fallback={<CleaningSkeleton />}>
                <CleaningPageClient initialJobs={jobs || []} />
            </Suspense>
        </div>
    )
}
