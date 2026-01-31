"use client"

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react"
import { useRouter } from "next/navigation"

// ============================================================================
// Types
// ============================================================================

interface DashboardRefreshContextValue {
    /** Timestamp of the last successful data refresh */
    lastUpdated: Date
    /** Whether a refresh is currently in progress */
    isRefreshing: boolean
    /** Trigger a manual refresh of all dashboard data */
    refresh: () => Promise<void>
}

// ============================================================================
// Constants
// ============================================================================

/** Auto-refresh interval: 5 minutes in milliseconds */
const AUTO_REFRESH_INTERVAL_MS = 300_000

// ============================================================================
// Context
// ============================================================================

const DashboardRefreshContext = createContext<DashboardRefreshContextValue | null>(null)

// ============================================================================
// Hook
// ============================================================================

/**
 * Access the dashboard auto-refresh context.
 *
 * Provides `lastUpdated`, `isRefreshing`, and `refresh()` to any descendant
 * component that needs to display refresh state or trigger a manual refresh.
 *
 * Returns null if used outside a `<DashboardAutoRefresh>` provider.
 */
export function useDashboardRefresh(): DashboardRefreshContextValue | null {
    const context = useContext(DashboardRefreshContext)
    return context
}

// ============================================================================
// Provider Component
// ============================================================================

interface DashboardAutoRefreshProps {
    children: React.ReactNode
}

/**
 * DashboardAutoRefresh - Provides auto-refresh functionality for the dashboard.
 *
 * Features:
 * - Auto-refreshes dashboard data every 5 minutes (300,000 ms)
 * - Pauses auto-refresh when browser tab is hidden (Page Visibility API)
 * - Resumes auto-refresh when browser tab becomes visible again
 * - If stale (more than 5 min since last update) when tab refocuses,
 *   triggers an immediate refresh
 * - Provides manual refresh via context
 * - Tracks last updated timestamp and loading state
 *
 * Uses Next.js `router.refresh()` to re-fetch all server component data
 * without a full page reload.
 */
export function DashboardAutoRefresh({ children }: DashboardAutoRefreshProps) {
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
    const [isRefreshing, setIsRefreshing] = useState(false)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const router = useRouter()

    // -----------------------------------------------------------------------
    // Core refresh function
    // -----------------------------------------------------------------------
    const refresh = useCallback(async () => {
        if (isRefreshing) return

        setIsRefreshing(true)
        try {
            // Next.js router.refresh() triggers a re-fetch of all server
            // components on the current route without losing client state.
            router.refresh()

            // Brief delay so the loading indicator is perceptible
            await new Promise((resolve) => setTimeout(resolve, 800))

            setLastUpdated(new Date())
        } finally {
            setIsRefreshing(false)
        }
    }, [router, isRefreshing])

    // -----------------------------------------------------------------------
    // Auto-refresh interval timer
    // -----------------------------------------------------------------------
    useEffect(() => {
        function startTimer() {
            // Clear any existing timer before starting a new one
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }

            timerRef.current = setInterval(() => {
                // Only auto-refresh when the tab is visible
                if (document.visibilityState === "visible") {
                    refresh()
                }
            }, AUTO_REFRESH_INTERVAL_MS)
        }

        startTimer()

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [refresh])

    // -----------------------------------------------------------------------
    // Page Visibility API - pause/resume on tab focus
    // -----------------------------------------------------------------------
    useEffect(() => {
        function handleVisibilityChange() {
            if (document.visibilityState === "visible") {
                // Check if data is stale (older than the refresh interval)
                const elapsed = Date.now() - lastUpdated.getTime()
                if (elapsed >= AUTO_REFRESH_INTERVAL_MS) {
                    refresh()
                }
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange)
        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            )
        }
    }, [lastUpdated, refresh])

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------
    return (
        <DashboardRefreshContext.Provider
            value={{ lastUpdated, isRefreshing, refresh }}
        >
            {children}
        </DashboardRefreshContext.Provider>
    )
}
