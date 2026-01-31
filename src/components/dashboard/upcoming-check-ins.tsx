import { CalendarDays } from "lucide-react"
import { GlassCard } from "@/components/ui/glass"
import { Badge } from "@/components/ui/badge"
import { getUpcomingCheckIns, type UpcomingReservation } from "@/lib/data/dashboard"

// ============================================================================
// Types
// ============================================================================

interface CheckIn {
    property: string
    guest: string
    time: string
}

interface CheckInDay {
    date: string
    checkIns: CheckIn[]
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatDateLabel(dateStr: string): string {
    const date = new Date(dateStr + "T00:00:00") // Ensure proper date parsing
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const dateOnly = new Date(date)
    dateOnly.setHours(0, 0, 0, 0)

    if (dateOnly.getTime() === today.getTime()) return "Today"
    if (dateOnly.getTime() === tomorrow.getTime()) return "Tomorrow"

    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    })
}

function formatCheckInTime(time: string): string {
    // Handle various time formats like "15:00", "3:00 PM", etc.
    if (!time) return "3:00 PM"

    // If already in AM/PM format, return as-is
    if (time.includes("AM") || time.includes("PM")) {
        return time
    }

    // Convert 24h to 12h format
    const [hours, minutes] = time.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const hour12 = hours % 12 || 12
    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`
}

function groupReservationsByDate(reservations: UpcomingReservation[]): CheckInDay[] {
    // Get next 7 days
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const days: CheckInDay[] = []
    const dateMap = new Map<string, CheckIn[]>()

    // Initialize all 7 days
    for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() + i)
        const dateKey = date.toISOString().split("T")[0]
        dateMap.set(dateKey, [])
    }

    // Group reservations by check-in date
    for (const reservation of reservations) {
        const dateKey = reservation.check_in_date
        if (dateMap.has(dateKey)) {
            dateMap.get(dateKey)!.push({
                property: reservation.property_name || "Unknown Property",
                guest: reservation.guest_name,
                time: formatCheckInTime(reservation.check_in_time || "15:00"),
            })
        }
    }

    // Convert to array with formatted date labels
    Array.from(dateMap.entries()).forEach(([dateKey, checkIns]) => {
        // Sort check-ins by time
        checkIns.sort((a: CheckIn, b: CheckIn) => {
            const toMinutes = (t: string) => {
                const [time, period] = t.split(" ")
                const [h, m] = time.split(":").map(Number)
                return ((h % 12) + (period === "PM" ? 12 : 0)) * 60 + m
            }
            return toMinutes(a.time) - toMinutes(b.time)
        })

        days.push({
            date: formatDateLabel(dateKey),
            checkIns,
        })
    })

    return days
}

// ============================================================================
// Component
// ============================================================================

export async function UpcomingCheckIns() {
    const reservations = await getUpcomingCheckIns(50)
    const checkInData = groupReservationsByDate(reservations)
    const hasAnyCheckIns = checkInData.some((day) => day.checkIns.length > 0)

    return (
        <GlassCard id="check-ins">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm leading-none tracking-tight">
                            Upcoming Check-ins
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Next 7 days check-in timeline
                        </p>
                    </div>
                </div>

                {/* Content */}
                {!hasAnyCheckIns ? (
                    <div className="h-[360px] flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-8 w-8 opacity-30" />
                        <p className="text-sm">No upcoming check-ins</p>
                        <p className="text-xs opacity-60">
                            Check-ins for the next 7 days will appear here
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                        {checkInData.map((day, i) => (
                            <div key={i}>
                                {/* Date header with count badge */}
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">
                                        {day.date}
                                    </span>
                                    <Badge
                                        variant={day.checkIns.length > 0 ? "glass" : "outline"}
                                        size="sm"
                                    >
                                        {day.checkIns.length}
                                    </Badge>
                                </div>

                                {/* Check-in items with timeline border */}
                                {day.checkIns.length > 0 ? (
                                    <div className="space-y-2 pl-4 border-l-2 border-primary/20 dark:border-primary/30">
                                        {day.checkIns.map((checkIn, j) => (
                                            <div
                                                key={j}
                                                className="text-sm relative"
                                            >
                                                {/* Timeline dot */}
                                                <div className="absolute -left-[calc(1rem+5px)] top-1.5 h-2 w-2 rounded-full bg-primary/50" />
                                                <p className="font-medium leading-tight">
                                                    {checkIn.property}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    {checkIn.guest} &middot;{" "}
                                                    {checkIn.time}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="pl-4 border-l-2 border-muted/40">
                                        <p className="text-xs text-muted-foreground/50 italic">
                                            No check-ins
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </GlassCard>
    )
}
