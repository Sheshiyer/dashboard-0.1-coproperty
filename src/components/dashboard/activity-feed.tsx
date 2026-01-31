import {
    CalendarCheck,
    LogIn,
    LogOut,
    Sparkles,
    Wrench,
    type LucideIcon,
} from "lucide-react"
import { GlassCard } from "@/components/ui/glass"
import { getRecentActivity, type ActivityType } from "@/lib/data/dashboard"

// ============================================================================
// Activity Type Configuration
// ============================================================================

interface ActivityConfig {
    icon: LucideIcon
    colorClass: string
    bgClass: string
}

const activityConfig: Record<ActivityType, ActivityConfig> = {
    booking: {
        icon: CalendarCheck,
        colorClass: "text-primary-500",
        bgClass: "bg-primary-500/10",
    },
    "check-in": {
        icon: LogIn,
        colorClass: "text-success-500",
        bgClass: "bg-success-500/10",
    },
    "check-out": {
        icon: LogOut,
        colorClass: "text-secondary dark:text-secondary-foreground",
        bgClass: "bg-secondary/10",
    },
    cleaning: {
        icon: Sparkles,
        colorClass: "text-info-500",
        bgClass: "bg-info-500/10",
    },
    maintenance: {
        icon: Wrench,
        colorClass: "text-warning-500",
        bgClass: "bg-warning-500/10",
    },
}

// ============================================================================
// Activity Icon Component
// ============================================================================

function ActivityIcon({ type }: { type: ActivityType }) {
    const config = activityConfig[type]
    const Icon = config.icon

    return (
        <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bgClass}`}
        >
            <Icon className={`h-4 w-4 ${config.colorClass}`} />
        </div>
    )
}

// ============================================================================
// ActivityFeed Component (Server Component)
// ============================================================================

export async function ActivityFeed() {
    const activities = await getRecentActivity(15)

    return (
        <GlassCard id="activity-feed">
            <div className="p-6">
                <h3 className="text-lg font-heading font-semibold mb-4">
                    Recent Activity
                </h3>
                <div className="space-y-1 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
                    {activities.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                            No recent activity
                        </p>
                    ) : (
                        activities.map((activity, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 hover:bg-black/[0.02] transition-colors cursor-default"
                            >
                                <ActivityIcon type={activity.type} />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm leading-tight">
                                        {activity.property}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                        {activity.description}
                                    </p>
                                </div>
                                <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0 pt-0.5">
                                    {activity.timestamp}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </GlassCard>
    )
}
