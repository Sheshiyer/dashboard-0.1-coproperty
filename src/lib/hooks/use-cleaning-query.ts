"use client"

/**
 * React Query hooks for Cleaning Jobs
 *
 * Includes optimistic status update for cleaning jobs -- cleaners
 * see immediate feedback when marking a job as started/completed.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-client"
import { getCleaningJobs } from "@/lib/data/cleaning"
import { updateCleaningJobStatus as updateCleaningAction } from "@/lib/actions/cleaning"
import type { CleaningJob } from "@/types/api"

export function useCleaningJobsQuery() {
    return useQuery({
        queryKey: queryKeys.cleaning.all(),
        queryFn: getCleaningJobs,
    })
}

export function useUpdateCleaningStatusMutation() {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: async ({
            jobId,
            status,
        }: {
            jobId: string
            status: CleaningJob["status"]
        }) => {
            return updateCleaningAction(jobId, status)
        },
        onMutate: async ({ jobId, status }) => {
            await qc.cancelQueries({ queryKey: queryKeys.cleaning.all() })

            const previousJobs = qc.getQueryData<CleaningJob[]>(queryKeys.cleaning.all())

            qc.setQueryData<CleaningJob[]>(queryKeys.cleaning.all(), (old) => {
                if (!old) return old
                return old.map((job) =>
                    job.id === jobId ? { ...job, status } : job
                )
            })

            return { previousJobs }
        },
        onError: (_err, _variables, context) => {
            if (context?.previousJobs) {
                qc.setQueryData(queryKeys.cleaning.all(), context.previousJobs)
            }
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: queryKeys.cleaning.all() })
            // Also invalidate dashboard cleaning widget
            qc.invalidateQueries({ queryKey: queryKeys.dashboard.todayCleaning() })
        },
    })
}
