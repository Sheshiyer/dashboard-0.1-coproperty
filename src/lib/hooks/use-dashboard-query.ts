"use client"

/**
 * React Query hooks for Dashboard data
 *
 * Each hook wraps a specific dashboard data fetcher with React Query
 * caching. The queryKey structure enables granular invalidation --
 * e.g., invalidating ["dashboard", "stats"] only refetches stats,
 * not occupancy trends or activity feeds.
 */

import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-client"
import {
    getDashboardStats,
    getUpcomingCheckIns,
    getTodayCleaning,
    getRecentActivity,
    getOccupancyTrends,
    getRevenueTrends,
    getBookingSources,
    getPropertyPerformance,
    getTaskPriorityBreakdown,
} from "@/lib/data/dashboard"

export function useDashboardStats() {
    return useQuery({
        queryKey: queryKeys.dashboard.stats(),
        queryFn: getDashboardStats,
    })
}

export function useUpcomingCheckIns(limit = 50) {
    return useQuery({
        queryKey: queryKeys.dashboard.upcomingCheckIns(),
        queryFn: () => getUpcomingCheckIns(limit),
    })
}

export function useTodayCleaning() {
    return useQuery({
        queryKey: queryKeys.dashboard.todayCleaning(),
        queryFn: getTodayCleaning,
    })
}

export function useRecentActivity(limit = 15) {
    return useQuery({
        queryKey: queryKeys.dashboard.recentActivity(),
        queryFn: () => getRecentActivity(limit),
    })
}

export function useOccupancyTrends(days = 30) {
    return useQuery({
        queryKey: queryKeys.dashboard.occupancyTrends(),
        queryFn: () => getOccupancyTrends(days),
    })
}

export function useRevenueTrends(days = 30) {
    return useQuery({
        queryKey: queryKeys.dashboard.revenueTrends(),
        queryFn: () => getRevenueTrends(days),
    })
}

export function useBookingSources() {
    return useQuery({
        queryKey: queryKeys.dashboard.bookingSources(),
        queryFn: getBookingSources,
    })
}

export function usePropertyPerformance(limit = 5, period = 30) {
    return useQuery({
        queryKey: queryKeys.dashboard.propertyPerformance(),
        queryFn: () => getPropertyPerformance(limit, period),
    })
}

export function useTaskPriorityBreakdown() {
    return useQuery({
        queryKey: queryKeys.dashboard.taskPriority(),
        queryFn: getTaskPriorityBreakdown,
    })
}
