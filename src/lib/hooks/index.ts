/**
 * React Query Hooks - Barrel Export
 *
 * Import hooks from here for cleaner imports:
 *   import { useTasksQuery, useUpdateTaskMutation } from "@/lib/hooks"
 */

export {
    useTasksQuery,
    useUpdateTaskMutation,
    useDeleteTaskMutation,
} from "./use-tasks-query"

export {
    useDashboardStats,
    useUpcomingCheckIns,
    useTodayCleaning,
    useRecentActivity,
    useOccupancyTrends,
    useRevenueTrends,
    useBookingSources,
    usePropertyPerformance,
    useTaskPriorityBreakdown,
} from "./use-dashboard-query"

export {
    usePropertiesQuery,
    usePropertyQuery,
} from "./use-properties-query"

export {
    useCleaningJobsQuery,
    useUpdateCleaningStatusMutation,
} from "./use-cleaning-query"
