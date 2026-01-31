"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass"
import { Info, AlertTriangle, XCircle, CheckCircle, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

// ============================================================================
// Types
// ============================================================================

type AlertType = "info" | "warning" | "error" | "success"

interface Alert {
    id: string
    type: AlertType
    title: string
    message: string
}

// ============================================================================
// Alert Configuration
// ============================================================================

const alertConfig: Record<
    AlertType,
    {
        icon: typeof Info
        borderColor: string
        iconBg: string
        iconColor: string
        titleColor: string
    }
> = {
    info: {
        icon: Info,
        borderColor: "border-l-info-500",
        iconBg: "bg-info-500/10",
        iconColor: "text-info-500",
        titleColor: "text-info-700 dark:text-info-500",
    },
    warning: {
        icon: AlertTriangle,
        borderColor: "border-l-warning-500",
        iconBg: "bg-warning-500/10",
        iconColor: "text-warning-500",
        titleColor: "text-warning-700 dark:text-warning-500",
    },
    error: {
        icon: XCircle,
        borderColor: "border-l-error-500",
        iconBg: "bg-error-500/10",
        iconColor: "text-error-500",
        titleColor: "text-error-700 dark:text-error-500",
    },
    success: {
        icon: CheckCircle,
        borderColor: "border-l-success-500",
        iconBg: "bg-success-500/10",
        iconColor: "text-success-500",
        titleColor: "text-success-700 dark:text-success-500",
    },
}

// ============================================================================
// Sample Alerts Data
// ============================================================================

const alerts: Alert[] = [
    {
        id: "alert-1",
        type: "warning",
        title: "3 Overdue Tasks",
        message: "You have 3 tasks that are past their due date.",
    },
    {
        id: "alert-2",
        type: "info",
        title: "New Booking",
        message: "Sunset Villa has a new booking for next week.",
    },
    {
        id: "alert-3",
        type: "success",
        title: "Sync Complete",
        message: "All property data has been synced successfully.",
    },
]

// ============================================================================
// localStorage Key
// ============================================================================

const STORAGE_KEY = "coproperty-dismissed-alerts"

// ============================================================================
// Single Alert Item Component
// ============================================================================

interface AlertItemProps {
    alert: Alert
    onDismiss: (id: string) => void
}

function AlertItem({ alert, onDismiss }: AlertItemProps) {
    const config = alertConfig[alert.type]
    const Icon = config.icon

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
            <GlassCard
                intensity="light"
                className={`p-4 border-l-4 ${config.borderColor}`}
            >
                <div className="flex items-start gap-3">
                    <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.iconBg} ${config.iconColor}`}
                    >
                        <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${config.titleColor}`}>
                            {alert.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {alert.message}
                        </p>
                    </div>
                    <button
                        onClick={() => onDismiss(alert.id)}
                        className="shrink-0 rounded-md p-1 text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1"
                        aria-label={`Dismiss ${alert.title}`}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </GlassCard>
        </motion.div>
    )
}

// ============================================================================
// Alerts Banner Component
// ============================================================================

export function AlertsBanner() {
    const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(
        new Set()
    )
    const [mounted, setMounted] = useState(false)

    // Load dismissed alerts from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                const parsed: string[] = JSON.parse(stored)
                setDismissedAlerts(new Set(parsed))
            }
        } catch {
            // Silently handle corrupted localStorage data
        }
        setMounted(true)
    }, [])

    const handleDismiss = (id: string) => {
        const newDismissed = new Set(dismissedAlerts)
        newDismissed.add(id)
        setDismissedAlerts(newDismissed)
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(Array.from(newDismissed))
            )
        } catch {
            // Silently handle localStorage write failures
        }
    }

    // Don't render anything until mounted to avoid hydration mismatch
    if (!mounted) return null

    const visibleAlerts = alerts.filter((a) => !dismissedAlerts.has(a.id))

    if (visibleAlerts.length === 0) return null

    return (
        <div className="space-y-3" id="alerts">
            <AnimatePresence mode="popLayout">
                {visibleAlerts.map((alert) => (
                    <AlertItem
                        key={alert.id}
                        alert={alert}
                        onDismiss={handleDismiss}
                    />
                ))}
            </AnimatePresence>
        </div>
    )
}
