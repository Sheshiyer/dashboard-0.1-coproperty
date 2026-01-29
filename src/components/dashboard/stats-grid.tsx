import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle, AlertCircle, Home } from "lucide-react"
import { DashboardStats } from "@/lib/data/dashboard"

interface StatsGridProps {
    stats: DashboardStats
}

export function StatsGrid({ stats }: StatsGridProps) {
    const items = [
        {
            title: "Active Reservations",
            value: stats.activeReservations,
            icon: Calendar,
            description: "Check-ins/outs today",
        },
        {
            title: "Pending Cleaning",
            value: stats.pendingCleaning,
            icon: CheckCircle,
            description: "Jobs to be completed",
        },
        {
            title: "Task Issues",
            value: stats.taskIssues,
            icon: AlertCircle,
            description: "High priority or urgent",
            alert: stats.taskIssues > 0,
        },
        {
            title: "Total Properties",
            value: stats.totalProperties,
            icon: Home,
            description: "Active listings",
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
                <Card key={item.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {item.title}
                        </CardTitle>
                        <item.icon className={`h-4 w-4 text-muted-foreground ${item.alert ? "text-destructive" : ""}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${item.alert ? "text-destructive" : ""}`}>{item.value}</div>
                        <p className="text-xs text-muted-foreground">
                            {item.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
