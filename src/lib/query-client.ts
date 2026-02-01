/**
 * React Query Client Configuration
 *
 * Centralized QueryClient with optimized defaults for edge caching:
 * - 5min stale time reduces redundant fetches across navigations
 * - 10min gc time keeps data available for back-navigation
 * - Exponential backoff prevents thundering herd on transient failures
 * - Window focus refetch disabled (data freshness handled by staleTime)
 * - Reconnect refetch enabled for offline-to-online transitions
 */

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,    // 5 minutes
            gcTime: 10 * 60 * 1000,       // 10 minutes (v5 renamed cacheTime -> gcTime)
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            retry: 3,
            retryDelay: (attemptIndex: number) =>
                Math.min(1000 * 2 ** attemptIndex, 30000),
        },
        mutations: {
            retry: 1,
        },
    },
})

// ---------------------------------------------------------------------------
// Query Key Factory
//
// Structured query keys enable precise cache invalidation. Each domain has
// a hierarchy: all() -> filtered variants -> detail(id). React Query matches
// keys by prefix, so invalidating ["tasks"] also clears ["tasks", "status", "pending"].
// ---------------------------------------------------------------------------

export const queryKeys = {
    properties: {
        all: () => ['properties'] as const,
        detail: (id: string) => ['properties', id] as const,
    },
    reservations: {
        all: () => ['reservations'] as const,
        byProperty: (propertyId: string) =>
            ['reservations', 'property', propertyId] as const,
        byDateRange: (from: string, to: string) =>
            ['reservations', 'dateRange', from, to] as const,
    },
    tasks: {
        all: () => ['tasks'] as const,
        byProperty: (propertyId: string) =>
            ['tasks', 'property', propertyId] as const,
        byStatus: (status: string) =>
            ['tasks', 'status', status] as const,
    },
    cleaning: {
        all: () => ['cleaning'] as const,
        byDate: (date: string) =>
            ['cleaning', 'date', date] as const,
        byProperty: (propertyId: string) =>
            ['cleaning', 'property', propertyId] as const,
    },
    dashboard: {
        stats: () => ['dashboard', 'stats'] as const,
        upcomingCheckIns: () => ['dashboard', 'upcoming-checkins'] as const,
        todayCleaning: () => ['dashboard', 'today-cleaning'] as const,
        recentActivity: () => ['dashboard', 'recent-activity'] as const,
        occupancyTrends: () => ['dashboard', 'occupancy-trends'] as const,
        revenueTrends: () => ['dashboard', 'revenue-trends'] as const,
        bookingSources: () => ['dashboard', 'booking-sources'] as const,
        propertyPerformance: () => ['dashboard', 'property-performance'] as const,
        taskPriority: () => ['dashboard', 'task-priority'] as const,
    },
} as const
