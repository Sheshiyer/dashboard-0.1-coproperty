"use client"

/**
 * React Query hooks for Tasks
 *
 * Provides useQuery/useMutation hooks with optimistic updates for task
 * operations. Optimistic updates give instant UI feedback while the server
 * request is in-flight, with automatic rollback on failure.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-client"
import { getTasks } from "@/lib/data/tasks"
import { updateTask as updateTaskAction, deleteTask as deleteTaskAction } from "@/lib/actions/tasks"
import type { Task } from "@/types/api"

/**
 * Fetch all tasks with React Query caching.
 * Data stays fresh for 5 minutes (staleTime default), reducing
 * redundant fetches when navigating between pages.
 */
export function useTasksQuery() {
    return useQuery({
        queryKey: queryKeys.tasks.all(),
        queryFn: getTasks,
    })
}

/**
 * Optimistic task status update.
 *
 * Flow:
 * 1. onMutate: Cancel in-flight queries, snapshot current data, apply optimistic update
 * 2. On success: Let the settled handler refetch authoritative data
 * 3. On error: Roll back to the snapshot from step 1
 * 4. onSettled: Always invalidate to ensure cache matches server truth
 */
export function useUpdateTaskMutation() {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
            return updateTaskAction(taskId, updates)
        },
        onMutate: async ({ taskId, updates }) => {
            // Cancel any outgoing refetches so they don't overwrite our optimistic update
            await qc.cancelQueries({ queryKey: queryKeys.tasks.all() })

            // Snapshot the current value for rollback
            const previousTasks = qc.getQueryData<Task[]>(queryKeys.tasks.all())

            // Optimistically update the cache
            qc.setQueryData<Task[]>(queryKeys.tasks.all(), (old) => {
                if (!old) return old
                return old.map((task) =>
                    task.id === taskId ? { ...task, ...updates } : task
                )
            })

            return { previousTasks }
        },
        onError: (_err, _variables, context) => {
            // Roll back to the previous value on error
            if (context?.previousTasks) {
                qc.setQueryData(queryKeys.tasks.all(), context.previousTasks)
            }
        },
        onSettled: () => {
            // Always refetch after error or success to ensure server truth
            qc.invalidateQueries({ queryKey: queryKeys.tasks.all() })
        },
    })
}

/**
 * Optimistic task deletion.
 * Removes the task from the cache immediately, rolls back if the server rejects.
 */
export function useDeleteTaskMutation() {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: async (taskId: string) => {
            return deleteTaskAction(taskId)
        },
        onMutate: async (taskId) => {
            await qc.cancelQueries({ queryKey: queryKeys.tasks.all() })

            const previousTasks = qc.getQueryData<Task[]>(queryKeys.tasks.all())

            qc.setQueryData<Task[]>(queryKeys.tasks.all(), (old) => {
                if (!old) return old
                return old.filter((task) => task.id !== taskId)
            })

            return { previousTasks }
        },
        onError: (_err, _taskId, context) => {
            if (context?.previousTasks) {
                qc.setQueryData(queryKeys.tasks.all(), context.previousTasks)
            }
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: queryKeys.tasks.all() })
        },
    })
}
